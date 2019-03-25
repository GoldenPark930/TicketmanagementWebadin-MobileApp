import url from 'url'

import _ from 'lodash'
import {connect} from 'react-redux'
import {Link} from 'react-router'
import moment from 'moment-timezone'
import {reduxForm} from 'redux-form'
import React from 'react'
import Modal from 'react-modal'
import { Element , Events, animateScroll as scroll, scrollSpy, scroller } from 'react-scroll'
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger'
import Tooltip from 'react-bootstrap/lib/Tooltip'
import ClipboardButton from 'react-clipboard.js'

import modalStyle from '../../_common/core/modalStyle'
import Button from '../_library/Button'
import Checkbox from '../_library/Checkbox'
import DateTimePicker from '../_library/DateTimePicker'
import Radios from '../_library/Radios'
import Select from '../_library/Select'
import Field from '../_library/Field'
import Card from '../_library/Card'
import FileUploader from '../_library/FileUploader'
import RichTextArea from '../_library/RichTextArea'
import AutoSlugField from '../_library/AutoSlugField'
import TagsField from '../_library/TagsField'

import * as fb from '../../_common/core/fb'

const slugRE = /^[\w-]*$/
const shortNameRE = /[<>'\"]+/
const dateFormat = 'YYYY-MM-DDTHH:mm:ss.SSSZ'
const range30 = new Array(30)

function arrayToObject(arr){
  let rv = {}
  if(!arr)
    return rv
  if( Object.prototype.toString.call( arr ) === '[object Array]' ) {
    for (let i = 0; i < arr.length; ++i)
      rv[i] = arr[i]
  }else{
    for (let attr in arr) {
        rv[attr] = arr[attr]
    }
  }  
  return rv
}
function isDateRangeInvalid(start, end) {  
  const sm = moment.utc(start)//moment(start, dateFormat, true)
  const em = moment.utc(end)//moment(end, dateFormat, true)
  if (!sm.isValid()) { return }
  if (!em.isValid()) { return }
  return em.isSame(sm) || em.isBefore(sm)
}
function isDateRangeInvalid2(start, end) {  
  if(!start)
    return false
  const sm = moment.utc(start)//moment(start, dateFormat, true)
  const em = moment.utc(end)//moment(end, dateFormat, true)
  if (!sm.isValid()) { return }
  if (!em.isValid()) { return }
  return em.isSame(sm) || em.isBefore(sm)
}

function validateEvent(data) {
  const required = [
    'attributes.displayName',
    'attributes.shortName',
    'attributes.slug',
    'relationships.owner.data',
  ]
  const errors = {}

  if (!_.get(data, 'attributes.displayName')){
    _.set(errors, 'attributes.displayName', 'Required')
  }

  if (!_.get(data, 'attributes.shortName')){
    _.set(errors, 'attributes.shortName', 'Required')
  }
  
  if (!_.get(data, 'attributes.slug')){
    _.set(errors, 'attributes.slug', 'Required')
  }

  if (!_.get(data, 'relationships.owner.data')){
    _.set(errors, 'relationships.owner.data', 'Required')
  }

  if (_.get(data, 'attributes.displayName', '').length > 65) {
    _.set(errors, 'attributes.displayName', '65 characters maximum')
  }

  if (_.get(data, 'attributes.eventType')){
    let eventType = _.get(data, 'attributes.eventType')
    eventType = arrayToObject(eventType)    
    let strEventType = JSON.stringify(eventType)
    if(strEventType.indexOf('true') === -1){
      _.set(errors, 'attributes.eventType', 'Please select at least one event type.')
    }
  }else{
    _.set(errors, 'attributes.eventType', 'Please select at least one event type')
  }

  if (_.get(data, 'attributes.shortName')){
    let shortName = _.get(data, 'attributes.shortName', '')
    if(shortName && shortName.length > 17){
      _.set(errors, 'attributes.shortName', 'Maximum 17 characters')  
    }else{
      if(shortNameRE.test(shortName))
        _.set(errors, 'attributes.shortName', 'Short Event Name are not allowed to use the symbols (>, <, \', ")')
    }    
  }

  if (_.get(data, 'attributes.facebookEvent')){
    let fbURL = _.get(data, 'attributes.facebookEvent', '')
    if(!(/^(https?:\/\/)?((w{3}\.)?)facebook.com\/events\/[0-9]+/i.test(fbURL)))
      _.set(errors, 'attributes.facebookEvent', 'Invalid Facebook URL')
  }

  const slug = _.get(data, 'attributes.slug', '')
  if (!slugRE.test(slug)) {
    _.set(errors, 'attributes.slug',
          'Link may only contain alphanumeric characters (a-z, 0-9), underscores (_) and hyphens (-)')
  }

  const startDate = _.get(data, 'attributes.startDate')
  const endDate = _.get(data, 'attributes.endDate')
  const checkInEnd = _.get(data, 'attributes.checkInEnd')
  if (isDateRangeInvalid(startDate, endDate)) {
    _.set(errors, 'attributes.endDate', 'End date must be after start date')
  }

	if (_.get(data, 'attributes.checkInStart') && !_.get(data, 'attributes.checkInEnd')){
		_.set(errors, 'attributes.checkInEnd', 'Required')
	}

	if (!_.get(data, 'attributes.checkInStart') && _.get(data, 'attributes.checkInEnd')){
		_.set(errors, 'attributes.checkInStart', 'Required')
  }
  
  if (isDateRangeInvalid(startDate, checkInEnd)) {
    _.set(errors, 'attributes.checkInEnd', 'Last entry time must be after start date')
  }
 
  return errors
}

const eventBase = url.parse('https://www.theticketfairy.com/event/')

@reduxForm({
  form: 'editevent',
  fields: [
    'relationships.owner.data',
    'attributes.description',
    'attributes.displayName',
    'attributes.shortName',
    'attributes.slug',
    'attributes.bannerURL',
    'attributes.imageURL',
    'attributes.backgroundURL',
    'attributes.startDate',
    'attributes.endDate',
		'attributes.checkInStart',
		'attributes.checkInEnd',
    'attributes.flagCarer',
    'attributes.flagInvitationsOnly',
    'attributes.flagRefunds',
    'attributes.facebookEvent',
    'attributes.twitterHashtag',
    'attributes.venue',
    'attributes.eventType',
    'attributes.tags',
  ],
  validate: validateEvent
})
export default class EventForm extends React.Component {
  static propTypes = {
    user: React.PropTypes.object,
    organizations: React.PropTypes.arrayOf(React.PropTypes.object),
  }
  constructor(props) {
    super(props)
    this.state = {fbURL:'', descriptionUpdate: false, importFacebook:false, submitPressed:false}
  }
  componentDidMount() {
    const {fields: {attributes: {backgroundURL}}} = this.props
    const v = backgroundURL.value || backgroundURL.initialValue
    this.setState({autoBackground: !v})
    if (typeof this.props.getExposedMethod === 'function') {
      this.props.getExposedMethod(this.exposedMethod.bind(this))
    }
  }
  componentWillReceiveProps(nextProps){
    const {submitPressed} = this.state
    if(!_.isEmpty(nextProps.errors) && submitPressed){
      console.log('submit failed due to the errors, now scroll to top', nextProps.errors)      
      this.setState({submitPressed: false}, function(){
        // var scroll = Scroll.animateScroll
        // scroll.scrollToTop()
        Events.scrollEvent.register('end', () => {
          Events.scrollEvent.remove('end')
        })
        let {attributes, relationships} = nextProps.errors
        let scrollTo = ''
        if(attributes && (attributes.displayName || attributes.shortName || attributes.slug))
          scrollTo = 'scroll-to-top'
        else if(attributes && (attributes.startDate || attributes.endDate))
          scrollTo = 'scroll-to-date'        
        else if(attributes && attributes.eventType)
          scrollTo = 'scroll-to-eventType'
        else
          scrollTo = 'scroll-to-top'
        if(relationships && relationships.owner)
          scrollTo = 'scroll-to-top'
        scroller.scrollTo(scrollTo, {
          duration: 800,
          delay: 0,
          smooth: 'easeInOutQuart',
        })
      })
    }
    
    if(nextProps.selectedBrand !== this.props.selectedBrand){      
      const {organizations, selectedBrand, fields: {relationships: {
        owner: {data: owner}
      }}} = nextProps
      if(selectedBrand){
        owner.onChange(_.find(organizations, {id: selectedBrand}))
      }
    }
  }

  onDisableReferral(e){
    const {fields: {attributes: {flagDisableReferral}}} = this.props

    if (e.target.checked) {
      flagDisableReferral.onChange(true)
      this.setState({showReferral: false})
    } else {
      flagDisableReferral.onChange(false)
      this.setState({showReferral: true})
    }
  }
  onAutoBackgroundChange(e) {
    const {fields: {attributes: {backgroundURL}}} = this.props

    if (e.target.checked) {
      backgroundURL.onChange(null)
      this.setState({autoBackground: true})
    } else {
      backgroundURL.onChange(backgroundURL.initialValue)
      this.setState({autoBackground: false})
    }
  }
  onEventType(e){
    const {fields: {attributes: {eventType}}} = this.props
    var id = e.target.id
    id = id.replace('eventType_', '')

    let objEventType = arrayToObject(eventType.value)    
    objEventType[id] = e.target.checked
    eventType.onChange(objEventType)
  }
  
  autoShortName(e){
    const {fields: {attributes: {displayName, shortName}}} = this.props
    const str = e.target.value    
    displayName.onChange(str)
    if(!str || str.length > 17 || shortNameRE.test(str))
      return    
    shortName.onChange(str)
  }
  onShortName(e){
    const {fields: {attributes: {shortName}}} = this.props
    const str = e.target.value
    if(!str || str.length > 17 || shortNameRE.test(str))
      return    
    shortName.onChange(str)
  }
  openFBDialog(){
    const {fields: {attributes: {displayName}}} = this.props
    this.setState({importFacebook: true})
  }
  closeFBDialog() {
    this.setState({importFacebook: false})
  }
  onFbEvent(e){
    this.setState({fbURL: e.target.value})    
  }
  onClickNewBrand(){
    if(this.props.onClickNewBrand)
      this.props.onClickNewBrand()
  }
  processSubmit(){
    const {handleSubmit} = this.props
    this.setState({submitPressed: true}, function() {
      handleSubmit()
    })
  }
  handleFBChange(f, event){
    const {fields: {attributes: {facebookEvent}}} = this.props
    const {value} = event.target
    let fbURL = value.replace('business.facebook.com', 'www.facebook.com')
    facebookEvent.onChange(fbURL)
  }
  handleFBImport(){
    const {fbURL} = this.state
    const parent = this
    let url = fbURL
    url = url.replace('business.facebook.com', 'www.facebook.com')
    if (/^(https?:\/\/)?((w{3}\.)?)facebook.com\/events\/[0-9]+/i.test(url)){
      url = url.replace(/\/$/, '')
      let id = url.substring(url.lastIndexOf('/') + 1)
      //console.log('url = ', url, 'id=', id)
      
      const {fields: {attributes: {displayName}}} = this.props
      const {fields: {attributes: {description}}} = this.props
      const {fields: {attributes: {startDate}}} = this.props
      const {fields: {attributes: {endDate}}} = this.props
      const {fields: {attributes: {imageURL}}} = this.props
      const {fields: {attributes: {venue}}} = this.props
      const {fields: {attributes: {facebookEvent}}} = this.props
      facebookEvent.onChange(fbURL)

      let convertToHTML = (pureText) => {
        if(!pureText)
          return ''
        pureText = pureText.replace(/\n/g, '<br>\n')
        return '<div>' + pureText + '</div>'
        //return pureText
      }
      let removeTimeOffset = (dateStr) => {
        if(!dateStr)
          return null
        return dateStr.substring(0, dateStr.length - 5) + '.000Z'
      }

      fb.fetchSDK()
      .catch(onerror)
      .then(FB => {
        return new Promise((resolve) => {
          // Note: The call will only work if you accept the permission request
          //FB.api('/me/events', {id: '1747328815524686'}, function(response){console.log(response)});
          FB.login(function(){          
            FB.api('/' + id +'?fields=description,timezone,cover,start_time,end_time,name,place', function(response){
              if(response.error){
                console.log('Fetch failed', response.error)
              }else{
                console.log('Fetch successful!!!', JSON.stringify(response))
                parent.refs.description.editor.setContent(convertToHTML(response.description))
                displayName.onChange(response.name)
                startDate.onChange(removeTimeOffset(response.start_time))
                endDate.onChange(removeTimeOffset(response.end_time))
                imageURL.onChange(response.cover.source)
                let venueObj = {
                  'displayName':response.place.name,
                  'street':response.place.location.street,
                  'city':response.place.location.city,
                  'state':response.place.location.state,
                  'country':response.place.location.country,
                  'postalCode':response.place.location.zip,
                  'longitude':response.place.location.longitude,
                  'latitude':response.place.location.latitude
                }
                venue.onChange(venueObj)
                parent.setState({importFacebook: false})
              }
            })
          }, {scope: 'public_profile'})
        })
        .catch(onerror)
      })
      .catch(onerror)
      .then(auth => {
        if (auth.status === 'connected') {
          this.props.onTokenResponse(auth.authResponse)
        } else if (auth.status === 'not_authorized') {
          throw new Error('You have not authorized The Ticket Fairy to use your Facebook details.')
        } else {
          throw new Error('You did not successfully sign in to Facebook.')
        }
      })
      .catch(onerror)     
    } else {
      console.log('URL is invalid:', url)
    }
  }
  tagsChange(tags) {
    this.props.fields.attributes.tags.onChange(tags)
  }
  exposedMethod(){
    const {handleSubmit, fields:{attributes:{description}}} = this.props
    let filtered = this.refs.description.editor.serialize().description.value
    if(filtered == '<p><br></p>' || filtered == '<p class="medium-insert-active"><br></p>'){
      return ''
    }      
    return filtered
  }
  copyEventUrlAfter() {
    this.setState({
      eventUrlCopied: true
    })
  }
  copyEventUrlOut(e) {
    if(this.state.eventUrlCopied) {
      setTimeout(() => {
        this.setState({
          eventUrlCopied: false
        })  
      }, 500)
    }
  }

  removeWarnings(obj, keepInitial){
    if(obj.initialValue == null)
      obj.initialValue = ''
    if(obj.value == null)
      obj.value = ''
    if(obj.defaultValue == null)
      obj.defaultValue = ''
    if(!keepInitial)
      delete obj.initialValue
    delete obj.onUpdate
    delete obj.valid
    delete obj.invalid
    delete obj.dirty
    delete obj.pristine
    delete obj.active
    delete obj.touched
    delete obj.visited
    delete obj.error    
  }
  render() {
    const {importFacebook, editingDate, autoBackground, showReferral, descriptionUpdate} = this.state
    const {
      fields: {
        attributes: {
          displayName, shortName, slug, description, bannerURL, imageURL, backgroundURL, twitterHashtag, facebookEvent, 
          startDate, endDate,
          checkInStart, checkInEnd,
          flagCarer, flagRefunds, flagInvitationsOnly,
          venue,
          eventType,
          tags
        },
        relationships: {
          owner: {data: owner}
        }
      },
      formKey, submitting, handleSubmit, submitFailed, submitLabel, user, organizations, initialValues, isNew} = this.props

    let objEventType = arrayToObject(eventType.value)
    //const userName = [user.firstName, user.lastName, '(you)'].filter(Boolean).join(' ')

    let date = _.get(this.props.fields, editingDate, {}).value
    if (!_.isDate(date)) {
      date = null
    }

    const eventURL = url.format({...eventBase, pathname: eventBase.pathname + slug.value})
    const findBrand = (id) => _.find(organizations, {id: id})
    let filteredOrg = _.uniqBy(organizations, 'id')

    let slugSuggestion = !startDate.value ? displayName.value : displayName.value + '-' + moment.utc(startDate.value).format('DMMMYYYY')

    let fetchFromFacebook = descriptionUpdate

    // this.removeWarnings(imageURL)
    // this.removeWarnings(bannerURL)
    // this.removeWarnings(owner)
    // this.removeWarnings(displayName)
    // this.removeWarnings(shortName)
    // this.removeWarnings(slug)
    // this.removeWarnings(startDate, true)
    // this.removeWarnings(endDate, true)
    // this.removeWarnings(description)
    // this.removeWarnings(backgroundURL)
    // this.removeWarnings(eventType)
    // this.removeWarnings(flagCarer)
    // this.removeWarnings(flagRefunds)
    // this.removeWarnings(flagInvitationsOnly)
    // this.removeWarnings(facebookEvent)
    // this.removeWarnings(twitterHashtag)

    // delete imageURL.value
    // delete imageURL.onChange
    // delete bannerURL.value
    // delete bannerURL.onChange

    return (
      <div className="event-form">
        {!!isNew&&
          <div>
            <div className='body-panel-header'>
              <div className='left'>
                <div className='title'>Add New Event</div>
              </div>
              <div className='right'>
                <Button className="btn btn-primary btn-shadow" type="button" onClick={::this.openFBDialog}>
                  <i className="fa fa-facebook-official" aria-hidden="true"></i> Import Event from Facebook
                </Button>
              </div>
            </div>
            <div className='body-panel-spacing'/>
          </div>
        }
        <div className={!!isNew ? 'body-panel-content' : ''}>          
          {!!isNew&&
          <Modal
            className="modal-dialog modal-trans"
            style={modalStyle}
            isOpen={!!importFacebook}
            contentLabel="Modal"
            onRequestClose={::this.closeFBDialog}
            closeTimeoutMS={150}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div>
                  <div className="modal-header">
                    <p className="h4 text-compact">Import from Facebook Event</p>
                  </div>
                  <div className="modal-body">
                    <Field ref="fbevent" id="fbevent" label="Event URL" size="large" onChange={::this.onFbEvent}/>
                  </div>
                  <div className="modal-footer">
                    <div className="btn-toolbar btn-toolbar-right">
                      <Button
                        className="btn btn-danger btn-shadow"
                        type="button"
                        onClick={::this.handleFBImport}>Import</Button>
                      <Button
                        className="btn btn-default btn-shadow" type="button"
                        onClick={::this.closeFBDialog}>Cancel</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Modal> 
          }
          <form ref="form" method="POST" onSubmit={handleSubmit}>
            <input type="hidden" ref="image" {...imageURL} />
            <input type="hidden" ref="banner" {...bannerURL} />
            <Element name="scroll-to-top"/>
            <Card icon={'fa-info'} title={'Event Details'} className="create-event">              
              <div className="row">
                <div className="row-brand col-xs-12">
                  <div className={'form-group dropdown-brand ' + (owner.error ? 'has-error' : '')}>
                    <div className="floating-field-group active">
                      <div className="floating-field">
                        <label className="control-label" htmlFor="brand">Brand</label>
                        <select className="form-control" {...owner}
                          value={_.get(owner, 'value.id')}
                          defaultValue={_.get(owner, 'initialValue.id')}
                          onChange={e => owner.onChange(findBrand(e.target.value))}
                          onBlur={e => owner.onBlur(findBrand(e.target.value))}>
                          <option value="">Select the brand running this event</option>
                          {                            
                            _.map(filteredOrg, (o, index) => <option key={o.id} value={o.id}>{o.displayName}</option>)
                          }
                        </select>
                      </div>
                    </div>
                    {!!owner.error && owner.touched && <div className="help-block">{owner.error}</div>}
                  </div>
                  <div className="btn-create-brand">
                    <Button className="btn btn-default btn-shadow" type="button" onClick={::this.onClickNewBrand}>Create Brand</Button>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-xs-6 col-12 text-holders">
                  <Field id="name" label="Event Name" size="large" {...displayName} onChange={::this.autoShortName}/>
                </div>
                <div className="col-xs-6 col-12 text-holders">
                  <Field id="shortName" label="Short Event Name" size="large" {...shortName} onChange={::this.onShortName}/>
                </div>                  
              </div>              
              <div className="row">
                <div className="col-xs-12">
                  <label className="autoslugfield-label" onMouseLeave={::this.copyEventUrlOut}>
                    Event URL
                    <ClipboardButton component="span" data-clipboard-text={'https://www.theticketfairy.com/event/'+slug.value} onSuccess={::this.copyEventUrlAfter}>
                      <OverlayTrigger placement="right" overlay={this.state.eventUrlCopied?<Tooltip id="eventUrlCopied">Copied</Tooltip>:<Tooltip id="eventUrlCopied">Copy Event URL</Tooltip>} trigger={['hover']}>
                        <i className="fa fa-clipboard event-url-copy" />
                      </OverlayTrigger>
                    </ClipboardButton>
                  </label>
                  <AutoSlugField id="slug" label="Link URL" {...slug} separator="-"
                    hint="Letters, numbers and hyphens only"
                    suggestion={slugSuggestion}>
                    <Field.PrefixAddon className="link-prefix hidden-xs">
                      <img className="link-prefix-img" src={asset('/assets/resources/images/event-url.png')}/>
                      <div className="link-prefix-url">https://www.theticketfairy.com/event/</div>
                    </Field.PrefixAddon>
                  </AutoSlugField>
                </div>
              </div>
              <Element name="scroll-to-date"/>
              <div className="div-spacing-20"/>
              <div className="row">
                <div className="col-xs-6 col-12">
                  <DateTimePicker id="startDate" label="Start date" loadingFromFB={importFacebook} placeholder="D MMM YYYY H:M AM" {...startDate}/>
                </div>
                <div className="col-xs-6 col-12">
                  <DateTimePicker id="endDate" label="End date" loadingFromFB={importFacebook} placeholder="D MMM YYYY H:M AM" {...endDate} suggestion={startDate.value} />
                </div>
              </div>
              <div className="row">
                <div className="col-sm-6 col-12">
                  <DateTimePicker id="checkInStart" label="Doors open time (optional)" placeholder="D MMM YYYY H:M AM" {...checkInStart} />
                </div>
                <div className="col-sm-6 col-12 pad-top-3">
                  <DateTimePicker id="checkInEnd" label="Last entry time (optional)" placeholder="D MMM YYYY H:M AM" {...checkInEnd} />
                </div>
              </div>
            </Card>
            <Card icon={'fa-pencil-square'} title={'Event Description'}>
              <div className="row">
                <div className="col-xs-12">
                  <RichTextArea ref="description" id="description" label="" {...description} baseurl={process.env.ADMIN_CDN_URL}/>
                </div>
              </div>
            </Card>
            <Card icon={'fa-camera'} title={'Event Images'}>
              <div className="row">
                <div className="col-xs-4 col-12">
                  <FileUploader label="Add Flyer/Poster" filetype="image" {...imageURL} />
                </div>
                <div className="col-xs-8 col-12">
                  {!autoBackground && <FileUploader label="Add Background Image (optional)" filetype="image" {...backgroundURL} />}
                  <div className="line">
                    <div className="line-cell">
                      <label htmlFor="autoBackground">Use automatically-generated background</label>
                    </div>
                    <div className="line-cell">
                      <div className="checkbox-switch">
                        <input type="checkbox" id="autoBackground" checked={!!autoBackground} onChange={::this.onAutoBackgroundChange} />
                        <label htmlFor="autoBackground"></label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            <Element name="scroll-to-eventType"/>
            <Card icon={'fa-toggle-on'} title={'Event Type'}>
              <Field id="eventType" type="showOnlyError" {...eventType} />
              <div className="row">
                <div className="col-xs-6 col-12">
                  <div className="line">
                    <div className="line-cell">
                      <div className="checkbox-switch">
                        <input type="checkbox" id="eventType_festival" checked={objEventType.festival} onChange={::this.onEventType}/>
                        <label htmlFor="eventType_festival"></label>
                      </div>
                    </div>
                    <div className="line-cell">
                      <label htmlFor="eventType_festival">Festival</label>
                    </div>
                  </div>
                  <div className="line">
                    <div className="line-cell">
                      <div className="checkbox-switch">
                        <input type="checkbox" id="eventType_concert" checked={objEventType.concert} onChange={::this.onEventType}/>
                        <label htmlFor="eventType_concert"></label>
                      </div>
                    </div>
                    <div className="line-cell">
                      <label htmlFor="eventType_concert">Concert</label>
                    </div>
                  </div>
                  <div className="line">
                    <div className="line-cell">
                      <div className="checkbox-switch">
                        <input type="checkbox" id="eventType_esportsTournament" checked={objEventType.esportsTournament} onChange={::this.onEventType}/>
                        <label htmlFor="eventType_esportsTournament"></label>
                      </div>
                    </div>
                    <div className="line-cell">
                      <label htmlFor="eventType_esportsTournament">Esports Tournament</label>
                    </div>
                  </div>
                  <div className="line">
                    <div className="line-cell">
                      <div className="checkbox-switch">
                        <input type="checkbox" id="eventType_clubShow" checked={objEventType.clubShow} onChange={::this.onEventType}/>
                        <label htmlFor="eventType_clubShow"></label>
                      </div>
                    </div>
                    <div className="line-cell">
                      <label htmlFor="eventType_clubShow">Club Show</label>
                    </div>
                  </div>
                  <div className="line">
                    <div className="line-cell">
                      <div className="checkbox-switch">
                        <input type="checkbox" id="eventType_stadiumShow" checked={objEventType.stadiumShow} onChange={::this.onEventType}/>
                        <label htmlFor="eventType_stadiumShow"></label>
                      </div>
                    </div>
                    <div className="line-cell">
                      <label htmlFor="eventType_stadiumShow">Stadium Show</label>
                    </div>
                  </div>
                  <div className="line">
                    <div className="line-cell">
                      <div className="checkbox-switch">
                        <input type="checkbox" id="eventType_convention" checked={objEventType.convention} onChange={::this.onEventType}/>
                        <label htmlFor="eventType_convention"></label>
                      </div>
                    </div>
                    <div className="line-cell">
                      <label htmlFor="eventType_convention">Convention</label>
                    </div>
                  </div>
                  <div className="line">
                    <div className="line-cell">
                      <div className="checkbox-switch">
                        <input type="checkbox" id="eventType_conference" checked={objEventType.conference} onChange={::this.onEventType}/>
                        <label htmlFor="eventType_conference"></label>
                      </div>
                    </div>
                    <div className="line-cell">
                      <label htmlFor="eventType_conference">Conference</label>
                    </div>
                  </div>
                </div>
                <div className="col-xs-6">
                  <div className="line">
                    <div className="line-cell">
                      <div className="checkbox-switch">
                        <input type="checkbox" id="eventType_communityEvent" checked={objEventType.communityEvent} onChange={::this.onEventType}/>
                        <label htmlFor="eventType_communityEvent"></label>
                      </div>
                    </div>
                    <div className="line-cell">
                      <label htmlFor="eventType_communityEvent">Community Event</label>
                    </div>
                  </div>
                  <div className="line">
                    <div className="line-cell">
                      <div className="checkbox-switch">
                        <input type="checkbox" id="eventType_technologyEvent" checked={objEventType.technologyEvent} onChange={::this.onEventType}/>
                        <label htmlFor="eventType_technologyEvent"></label>
                      </div>
                    </div>
                    <div className="line-cell">
                      <label htmlFor="eventType_technologyEvent">Technology Event</label>
                    </div>
                  </div>
                  <div className="line">
                    <div className="line-cell">
                      <div className="checkbox-switch">
                        <input type="checkbox" id="eventType_gamingEvent" checked={objEventType.gamingEvent} onChange={::this.onEventType}/>
                        <label htmlFor="eventType_gamingEvent"></label>
                      </div>
                    </div>
                    <div className="line-cell">
                      <label htmlFor="eventType_gamingEvent">Gaming Event</label>
                    </div>
                  </div>
                  <div className="line">
                    <div className="line-cell">
                      <div className="checkbox-switch">
                        <input type="checkbox" id="eventType_corporateEvent" checked={objEventType.corporateEvent} onChange={::this.onEventType}/>
                        <label htmlFor="eventType_corporateEvent"></label>
                      </div>
                    </div>
                    <div className="line-cell">
                      <label htmlFor="eventType_corporateEvent">Corporate Event</label>
                    </div>
                  </div>
                  <div className="line">
                    <div className="line-cell">
                      <div className="checkbox-switch">
                        <input type="checkbox" id="eventType_businessEvent" checked={objEventType.businessEvent} onChange={::this.onEventType}/>
                        <label htmlFor="eventType_businessEvent"></label>
                      </div>
                    </div>
                    <div className="line-cell">
                      <label htmlFor="eventType_businessEvent">Business Event</label>
                    </div>
                  </div>
                  <div className="line">
                    <div className="line-cell">
                      <div className="checkbox-switch">
                        <input type="checkbox" id="eventType_privateEvent" checked={objEventType.privateEvent} onChange={::this.onEventType}/>
                        <label htmlFor="eventType_privateEvent"></label>
                      </div>
                    </div>
                    <div className="line-cell">
                      <label htmlFor="eventType_privateEvent">Private Event/Party</label>
                    </div>
                  </div>
                  <div className="line">
                    <div className="line-cell">
                      <div className="checkbox-switch">
                        <input type="checkbox" id="eventType_sportsEvent" checked={objEventType.sportsEvent} onChange={::this.onEventType}/>
                        <label htmlFor="eventType_sportsEvent"></label>
                      </div>
                    </div>
                    <div className="line-cell">
                      <label htmlFor="eventType_sportsEvent">Sports Event</label>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            <Card icon={'fa-toggle-on'} title={'Event Settings'}>
              <div className="row">
                <div className="col-xs-4 col-12">
                  <div className="line">
                    <div className="line-cell">
                      <div className="checkbox-switch">
                        <input type="checkbox" id="flagInvitationsOnly" {...flagInvitationsOnly}/>
                        <label htmlFor="flagInvitationsOnly"></label>
                      </div>
                    </div>
                    <div className="line-cell">
                      <label htmlFor="flagInvitationsOnly">Invitation required to attend</label>
                    </div>
                  </div>                    
                </div>
                <div className="col-xs-4 col-12">
                  <div className="line">
                    <div className="line-cell">
                      <div className="checkbox-switch">
                        <input type="checkbox" id="flagCarer" {...flagCarer}/>
                        <label htmlFor="flagCarer"></label>
                      </div>
                    </div>
                    <div className="line-cell">
                      <label htmlFor="flagCarer">Free carer ticket for disabled guests</label>
                    </div>
                  </div>
                </div>
                <div className="col-xs-4 col-12">
                  <div className="line">
                    <div className="line-cell">
                      <div className="checkbox-switch">
                        <input type="checkbox" id="flagRefunds" {...flagRefunds}/>
                        <label htmlFor="flagRefunds"></label>
                      </div>
                    </div>
                    <div className="line-cell">
                      <label htmlFor="flagRefunds">Refunds allowed</label>
                    </div>
                  </div>                    
                </div>
              </div>
            </Card>
            <Card icon={'fa-share-square'} title={'Social Media'}>
              <div className="social-media">
                <img src={asset('/assets/resources/images/event-facebook-link.png')}/>
                <div className='social-media-link'>
                  <Field ref="facebookEvent" id="facebookEvent" label="Facebook Event URL" size="large" {...facebookEvent} onChange={e => this.handleFBChange('onChange', e)}/>
                </div>
              </div>
              <div className="social-media">
                <img src={asset('/assets/resources/images/event-hashtag-link.png')}/>
                <div className='social-media-link'>
                  <Field ref="twitterHashtag" id="twitterHashtag" label="Official Event Hashtag" size="large" {...twitterHashtag}/>
                </div>
              </div>
            </Card>            
            <Card icon={'fa-tags'} title={'Tags'}>
              <TagsField value={tags.value} onChange={::this.tagsChange} />
            </Card>
            <div className="card-block text-center">
              <Button className="btn btn-success btn-lg btn-shadow" type="button" loading={submitting} onClick={::this.processSubmit}>{submitLabel || 'Create event and select Venue'}</Button>
            </div>
          </form>
        </div>
      </div>
    )
  }
}

