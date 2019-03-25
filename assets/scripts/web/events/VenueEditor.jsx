import _ from 'lodash'
import React from 'react'
import {reduxForm} from 'redux-form'

import countries from '../../_common/core/countries'
import Button from '../_library/Button'
import Checkbox from '../_library/Checkbox'
import CountryField from '../_library/CountryField'
import Field from '../_library/Field'
import Address from '../_library/Address'
import Map from '../_library/Map'
import Card from '../_library/Card'

const countriesByName = _.keyBy(countries, c => _.get(c, 'name.common'))

class Job {
  constructor(callback) {
    this.callback = callback
  }
  cancel() { this.cancelled = true }
  callback() {
    if (this.cancelled) { return }
    this.callback.call(null, arguments)
  }
}

function validateVenue(data) {
  const required = [
    'displayName',
    'country',
  ]
  const errors = {}

  required.forEach(function(f) {
    if (!data[f]) {
      errors[f] = 'Required'
    }
  })

  if (!errors.country && !_.has(countriesByName, data.country)) {
    errors.country = 'This country is not supported'
  }
  return errors
}

const parsePlaceResult = (res) => {
  const componentForm = {
    street_number: 'streetNumber',
    route: 'street',
    locality: 'city',
    administrative_area_level_1: 'state',
    country: 'country',
    postal_code: 'postalCode'
  }
  const venue = {
    displayName: res.name,
    googlePlaceId: res.place_id,
    longitude: res.geometry.location.lng(),
    latitude: res.geometry.location.lat()
  }

  const components = res.address_components || []
  _.each(components, c => {
    const type = c.types[0]
    const prop = componentForm[type]

    if (!type || !prop) { return }

    venue[prop] = c.long_name
  })
  _.each(componentForm, (v) => {
    venue[v] = venue[v] || ''
  })

  return venue
}

@reduxForm({
  form: 'venue',
  fields: [
    'displayName',
    'streetNumber',
    'street',
    'city',
    'state',
    'country',
    'postalCode',
    'googlePlaceId',
    'longitude',
    'latitude',
    'flagDisabled',
    'flagHidden',
  ],
  validate: validateVenue
})
export default class VenueEditor extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      autocomplete: global.google ? new google.maps.places.AutocompleteService() : null,
      geocoder: global.google ? new google.maps.Geocoder() : null,
      suggestions: [],
      venue: props.venue,
      searching: false,
      error: null
    }
  }
  componentDidMount() {
    if (typeof this.props.getExposedMethod === 'function') {
      this.props.getExposedMethod(this.exposedMethod.bind(this))
    }
  }
  componentWillMount() {
    this.lookupAddress = _.debounce(this.lookupAddress, 300)
    const geo = _.get(global, 'navigator.geolocation.getCurrentPosition')
    this.userGeo = new Promise((resolve, reject) => {
      if (geo) { geo.bind(navigator.geolocation, resolve, reject)() }
      else { reject(new Error('Geolocation not available')) }
    })
    .catch((err) => {
      console.error(err)
      return Promise.resolve(null)
    })
    .then((pos) => {
      this.setState({position: pos})
      return pos
    })
  }
  handleAddressQueryChange(e) {
    this.lookupAddress(e.target.value)
  }
  lookupAddress(value) {
    const {google, navigator} = global
    if (!google || value.length < 3) {
      this.setState({suggestions: []})
      return
    }

    this.setState({searching: true})

    Promise.resolve(this.userGeo)
      .then(() => {
        const {position} = this.state
        const bounds = position ? new google.maps.Circle({
          center: {lat: position.coords.latitude, lng: position.coords.longitude},
          radius: position.coords.accuracy
        }).getBounds() : null
        if (this.predictionJob) { this.predictionJob.cancel() }
        this.predictionJob = new Job((suggestions, status) => {
          this.setState({searching: false})
          this.handleSuggestions(suggestions, status)
        })

        this.state.autocomplete.getPlacePredictions({
          bounds: bounds,
          input: value
        }, this.predictionJob.callback)
      })
  }
  handleSuggestions(suggestions, status) {
    const statuses = google.maps.places.PlacesServiceStatus
    if (status !== statuses.OK && status !== statuses.ZERO_RESULTS) {
      this.setState({error: 'Unexpected error occurred while searching for venue'})
      return
    }
    this.setState({searching: false})
    const cleaned = (suggestions || []).map(s => {
      return {
        id: s.place_id,
        label: s.terms[0].value,
        sub: s.terms.slice(1).map(t => t.value).join(', '),
        details: s
      }
    })
    this.setState({suggestions: cleaned || []})
  }
  handleAddressSelected(loc) {
    const {fields} = this.props
    const statuses = google.maps.places.PlacesServiceStatus

    this.setState({error: null})
    const service = new google.maps.places.PlacesService(this.refs.gattr)

    service.getDetails({placeId: loc.id}, (res, status) => {
      let err
      if (status === statuses.ZERO_RESULTS) {
        err = 'No address found for venue'
      } else if (status !== statuses.OK) {
        err = 'Unexpected error occurred while looking up venue address'
      }
      if (err) { return this.setState({error: err}) }

      const venue = parsePlaceResult(res)

      this.setState({venue: {...venue, id: venue.googlePlaceId}})
      Object.keys(venue).forEach(function(k) {
        const field = fields[k]
        if (!field) { return }
        field.onChange(venue[k])
      })
    })
  }
  handleCancel() {
    const {onCancel, resetForm} = this.props
    resetForm()
    if (onCancel) { onCancel() }
  }
  handleBlur(field, e) {
    field.onBlur(e)
    const {geocoder} = this.state
    if (!geocoder) { return }
    const {fields: {
      googlePlaceId, longitude, latitude, streetNumber, street, city, state, country, postalCode
    }} = this.props

    const streetLine = street.value ? [streetNumber.value, street.value].filter(Boolean).join(' ') : ''
    const cityLine = [city.value, state.value].filter(Boolean).join(' ')
    const countryLine = [country.value, postalCode.value].filter(Boolean).join(' ')
    const address = [streetLine, cityLine, countryLine].filter(Boolean).join(', ')
    if (this.state.address === address) { return }
    _.invokeMap([googlePlaceId, longitude, latitude], 'onChange', undefined)
    this.setState({address})
    if (!address) { return }

    this.setState({geocoding: true})
    const p = new Promise((resolve, reject) => {
      geocoder.geocode({'address': address}, (results, status) => {
        const {OK, ZERO_RESULTS} = google.maps.GeocoderStatus
        this.setState({geocoding: false})
        if (status === ZERO_RESULTS) {
          resolve({query: address, venue: null})
        }
        if (status !== OK) {
          reject(status)
        }
        resolve({query: address, venue: parsePlaceResult(results[0])})
      })
    })

    p
      .then((res) => {
        const {query, venue} = res
        if (!venue) { return }
        if (query === address) {
          googlePlaceId.onChange(venue.googlePlaceId)
          longitude.onChange(venue.longitude)
          latitude.onChange(venue.latitude)
          this.setState({venue: {...venue, id: venue.googlePlaceId}})
        }
        return venue
      })
      .catch((err) => {
        console.error('Geocoder error', err)
        throw err
      })
  }
  exposedMethod(){
    return this.isSaveAndCreateTicket
  }
  handleSave() {
    this.isSaveAndCreateTicket = false
    const {handleSubmit} = this.props
    handleSubmit()
  }
  handleSaveAndCreateTicket() {
    this.isSaveAndCreateTicket = true
    const {handleSubmit} = this.props
    handleSubmit()
  }
  render() {
    const {
      onCancel,
      handleSubmit,
      submitting,
      fields: {
        displayName,
        streetNumber,
        street,
        city,
        state,
        country,
        postalCode,
        googlePlaceId,
        longitude,
        latitude,
        flagDisabled,
        flagHidden,
      },
      event
    } = this.props
    const {error, geocoding, searching, countries, suggestions} = this.state
    const form = _.chain(this.props.fields).map(f => [f.name, f.value]).zipObject().value()
    const venue = this.state.venue ? {...this.state.venue} : form
    venue.id = venue.id || venue.googlePlaceId

    const address = this.state.venue
    let event_description = 
      <div className='description'>
        <div className='event'>
          {!!event.imageURL && <img src={event.imageURL} />}
          <div>
            <div>{event.displayName}</div>
            {!!address && <div className="event-address">
              <img src={asset('/assets/resources/images/icon-location.png')}/>
              <Address type="medium" className="address-form" {...address}  />
            </div>}
            {!address && <div className="address-notset">You have not set a venue yet. Let us begin.</div>}
          </div>
        </div>
      </div>

    return (
      <div className="venues-panel">
        <div className="row">
          <div className="col-xs-12">
            {event_description}
          </div>
        </div>
        <div className="row">
          <div className="col-md-5 venues-left">
            <Card icon={'fa-envelope-open'} title={'Edit Venue Detail'} className={'venue-editor'}>
              <form className="form" onSubmit={handleSubmit}>
                <Field id="location"
                  label="Search for location"
                  className={searching ? 'searchbox venue-search loading' : 'searchbox'}
                  onChange={::this.handleAddressQueryChange}
                  options={suggestions}
                  onSelected={::this.handleAddressSelected} />
                {error && <div className="alert alert-danger">{error}</div>}
                <br />
                <input type="hidden" {...googlePlaceId} />
                <input type="hidden" {...latitude} />
                <input type="hidden" {...longitude} />
                <Field
                  id="name"
                  label="Venue name"
                  {...displayName} />
                <Field
                  id="streetNumber"
                  label="Street Number"
                  {...streetNumber} onBlur={this.handleBlur.bind(this, streetNumber)} />
                <Field
                  id="street"
                  label="Street"
                  {...street} onBlur={this.handleBlur.bind(this, street)} />
                <Field
                  id="city"
                  label="City"
                  {...city} onBlur={this.handleBlur.bind(this, city)} />
                <div className="row">
                  <div className="col-xs-6">
                    <Field
                    id="state"
                    label="State"
                    {...state} onBlur={this.handleBlur.bind(this, state)} />
                  </div>
                  <div className="col-xs-6">
                    <Field
                    id="postalCode"
                    label="Postal Code"
                    {...postalCode} onBlur={this.handleBlur.bind(this, postalCode)} />
                  </div>
                </div>
                <CountryField
                  id="country"
                  label="Country"
                  {...country}
                  options={countries}
                  onBlur={this.handleBlur.bind(this, country)} />
                
                <div className="form-group">
                  <div className="line">
                    <div className="line-cell switch-label">
                      <label htmlFor="flagHidden">Hide this venue from customers</label>
                    </div>
                    <div className="line-cell">
                      <div className="checkbox-switch">
                        <input type="checkbox" id="flagHidden" {...flagHidden}/>
                        <label htmlFor="flagHidden"></label>
                      </div>
                    </div>
                  </div>
                  <div className="line">
                    <div className="line-cell switch-label">
                      <label htmlFor="flagDisabled">Disabled access</label>
                    </div>
                    <div className="line-cell">
                      <div className="checkbox-switch">
                        <input type="checkbox" id="flagDisabled" {...flagDisabled}/>
                        <label htmlFor="flagDisabled"></label>
                      </div>
                    </div>
                  </div>
                </div>
                <div ref="gattr" />
                <div className="venue-buttons">
                  <div className="btn-toolbar">
                    <Button className="btn btn-danger btn-shadow" type="button" disabled={submitting} onClick={::this.handleCancel}>Cancel</Button>
                    <Button className="btn btn-success btn-shadow" type="button" onClick={::this.handleSave} loading={submitting || geocoding}>Save Venue</Button> 
                    <Button className="btn btn-default btn-shadow" type="button" onClick={::this.handleSaveAndCreateTicket} loading={submitting || geocoding}>Save Venue and Create Tickets</Button>                   
                  </div>
                </div>
              </form>
            </Card>
          </div>
          <div className="col-md-7 venues-right">
            <Card icon={'fa-thumb-tack'} title={'Venue Location'}>
              <div className="venue-map">
                <Map locations={[venue].filter(Boolean)} />
              </div>
            </Card>          
          </div>
        </div>
      </div>
    )
  }
}

