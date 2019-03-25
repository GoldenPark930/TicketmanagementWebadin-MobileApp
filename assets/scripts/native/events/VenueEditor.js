import React, { PropTypes, Component } from 'react'
import _ from 'lodash'
import {reduxForm} from 'redux-form'
import {
    StyleSheet,
    Navigator,
    View,
    Image,
    Platform,
    BackAndroid,
    TouchableOpacity,
    ScrollView,
    Text
} from 'react-native'

import countries from '../../_common/core/countries'
import {Field, Switch,  Button, Panel, GooglePlacesAutocomplete, CountryField, Address} from '../_library'
import {commonStyle, venues, LoginStyle, google_auto_complete} from '../../native/styles'

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
        longitude: res.geometry.location.lng,
        latitude: res.geometry.location.lat
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

class VenueEditor extends Component {
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
    componentWillMount() {
        const geo = _.get(global, 'navigator.geolocation.getCurrentPosition')
        this.userGeo = new Promise((resolve, reject) => {
            if (geo) { geo.bind(navigator.geolocation, resolve, reject)() }
            else { reject(new Error('Geolocation not available')) }
        })
            .catch((err) => {
                // console.error(err)
                return Promise.resolve(null)
            })
            .then((pos) => {
                this.setState({position: pos})
                return pos
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
        console.log('props',this.props)
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
    render(){
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

        return (
            <View>
                <Panel title='Edit Venue Detail' style={{marginBottom:30}}>
                    {error &&
                    <View style={LoginStyle.alert_danger}>
                        <Text style={LoginStyle.alert_title}>
                            {error}
                        </Text>
                    </View>}

                    <View style={{height:50}}/>
                    <Field
                        id='name'
                        label='Venue name'
                        {...displayName} />
                    <Field
                        id='streetNumber'
                        label='Street Number'
                        {...streetNumber} onBlur={this.handleBlur.bind(this, streetNumber)} />
                    <Field
                        id='street'
                        label='Street'
                        {...street} onBlur={this.handleBlur.bind(this, street)} />
                    <Field
                        id='city'
                        label='City'
                        {...city} onBlur={this.handleBlur.bind(this, city)} />
                    <View style={{flexDirection:'row'}}>
                        <View style={{flex:1, marginRight:15}}>
                            <Field
                                id='state'
                                label='State'
                                {...state} onBlur={this.handleBlur.bind(this, state)} />
                        </View>
                        <View style={{flex:1}}>
                            <Field
                                id='postalCode'
                                label='Postal Code'
                                {...postalCode} onBlur={this.handleBlur.bind(this, postalCode)} />
                        </View>
                    </View>
                    <GooglePlacesAutocomplete
                        placeholder='Search'
                        minLength={2} // minimum length of text to search
                        autoFocus={false}
                        listViewDisplayed='auto'    // true/false/undefined
                        fetchDetails={true}
                        renderDescription={(row) => row.description} // custom description render
                        onPress={(data, details = null) => { // 'details' is provided when fetchDetails = true
                            console.log('detail: ',details)
                            console.log('data: ',data)

                            const venue = parsePlaceResult(details)
                            const {fields} = this.props
                            this.setState({venue: {...venue, id: venue.googlePlaceId}})
                            Object.keys(venue).forEach(function(k) {
                              const field = fields[k]
                              if (!field) { return }
                              field.onChange(venue[k])
                            })
                        }}
                        getDefaultValue={() => {
                            return '' // text input default value
                        }}
                        query={{
                            // available options: https://developers.google.com/places/web-service/autocomplete
                            key: 'AIzaSyDTDd9rQrosfWWkfb3h3qIjRwVHrnWJ6VU',
                            language: 'en', // language of the results
                            types: '(cities)', // default: 'geocode'
                        }}

                        styles={google_auto_complete}
                        renderRow={(rowData)=>{
                            if (rowData.structured_formatting){
                                return(
                                    <View>
                                        <Text style={{color:'#b6c5cf', fontSize:13, fontWeight:'600'}}>
                                            {rowData.structured_formatting.main_text}
                                        </Text>
                                        <Text style={{color:'#ffffff', fontSize:11, fontWeight:'700', marginTop:5}}>
                                            {rowData.structured_formatting.secondary_text}
                                        </Text>
                                    </View>
                                )
                            }
                        }}
                        currentLocation={true} // Will add a 'Current location' button at the top of the predefined places list
                        currentLocationLabel='Current location'
                        nearbyPlacesAPI='GooglePlacesSearch' // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
                        GoogleReverseGeocodingQuery={{
                            // available options for GoogleReverseGeocoding API : https://developers.google.com/maps/documentation/geocoding/intro
                        }}
                        GooglePlacesSearchQuery={{
                            // available options for GooglePlacesSearch API : https://developers.google.com/places/web-service/search
                            rankby: 'distance',
                            types: 'food',
                        }}

                        filterReverseGeocodingByTypes={['locality', 'administrative_area_level_3']} // filter the reverse geocoding results by types - ['locality', 'administrative_area_level_3'] if you want to display only cities

                        debounce={200} // debounce the requests in ms. Set to 0 to remove debounce. By default 0ms.
                    />

                    <CountryField
                        id='country'
                        label='Country'
                        {...country}
                        options={countries}
                        onBlur={this.handleBlur.bind(this, country)} />

                    <View style={{flexDirection:'row', alignItems:'center', marginTop:20}}>
                        <View style={{flex:1}}><Text style={[commonStyle.buttonTitleLabelSmall, {fontFamily: 'OpenSans-Bold',}]}>Hide this venue from customers</Text></View>
                        <View style={{flex:1, alignItems:'center'}}><Switch {...flagHidden}/></View>
                    </View>
                    <View style={{flexDirection:'row', alignItems:'center', marginTop:20}}>
                        <View style={{flex:1}}><Text style={[commonStyle.buttonTitleLabelSmall, {fontFamily: 'OpenSans-Bold',}]}>Disabled access</Text></View>
                        <View style={{flex:1, alignItems:'center'}}><Switch {...flagDisabled}/></View>
                    </View>

                    <View style={{flexDirection:'row', justifyContent:'center'}}>
                        <Button
                            style={{backgroundColor:'#45b163', padding:10, marginRight:10}}
                            type='button' title={'Save Changes'}
                            loading={submitting || geocoding}
                            onPress={handleSubmit}>
                        </Button>
                        <Button
                            style={{backgroundColor:'#638a94', padding:10, marginRight:10}} type='button'
                            title={'Cancel'}
                            onPress={() => this.handleCancel()}>
                        </Button>
                    </View>
                </Panel>
            </View>
        )
    }

}export default reduxForm({
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
})(VenueEditor)
