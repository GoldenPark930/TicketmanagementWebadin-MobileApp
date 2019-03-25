import url from 'url'

import _ from 'lodash'
import {connect} from 'react-redux'
import {Link} from 'react-router'
import moment from 'moment-timezone'
import {reduxForm} from 'redux-form'
import React from 'react'
import Modal from 'react-modal'
import Scroll from 'react-scroll'
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger'
import Tooltip from 'react-bootstrap/lib/Tooltip'

import modalStyle from '../../_common/core/modalStyle'
import Button from '../_library/Button'
import Checkbox from '../_library/Checkbox'
import DateTimePicker from '../_library/DateTimePicker'
import Radios from '../_library/Radios'
import Select from '../_library/Select'
import Field from '../_library/Field'
import FileUploader from '../_library/FileUploader'
import RichTextArea from '../_library/RichTextArea'
import AutoSlugField from '../_library/AutoSlugField'
import TagsField from '../_library/TagsField'
import LazyLoad from 'react-lazy-load'
import Address from '../_library/Address'
import DateLabel from '../_library/DateLabel'
import Card from '../_library/Card'

import * as fb from '../../_common/core/fb'

const slugRE = /^[\w-]*$/

function validateEvent(data) {
  const errors = {}

  if (!_.get(data, 'attributes.displayName')){
    _.set(errors, 'attributes.displayName', 'Required')
  }
  
  if (!_.get(data, 'attributes.slug')){
    _.set(errors, 'attributes.slug', 'Required')
  }

  const slug = _.get(data, 'attributes.slug', '')
  if (!slugRE.test(slug)) {
    _.set(errors, 'attributes.slug', 'Link may only contain alphanumeric characters (a-z, 0-9), underscores (_) and hyphens (-)')
  }
 
  return errors
}

const tourBase = url.parse('https://www.theticketfairy.com/tour/')

@reduxForm({
  form: 'edittour',
  fields: [
    'attributes.displayName',
    'attributes.slug',
    'attributes.description',
    'attributes.bannerURL',
    'attributes.backgroundURL'
  ],
  validate: validateEvent
})
export default class TourForm extends React.Component {
  static propTypes = {
    user: React.PropTypes.object
  }

  constructor(props) {
    super(props)
    this.state = {
      submitPressed: false,
      eventSelected: {}
    }
  }

  componentDidMount() {
    const {fields: {attributes: {backgroundURL}}} = this.props
    this.setState({
      autoBackground: !(backgroundURL.value || backgroundURL.initialValue)
    })
    if (typeof this.props.getExposedMethod === 'function') {
      this.props.getExposedMethod(this.exposedMethod.bind(this))
    }
  }

  componentWillReceiveProps(nextProps){
    const {submitPressed} = this.state
    if(!_.isEmpty(nextProps.errors) && submitPressed){
      this.setState({submitPressed: false}, function(){
        var scroll = Scroll.animateScroll
        scroll.scrollToTop()
      })
    }
  }

  processSubmit(){
    const {handleSubmit} = this.props
    this.setState({submitPressed: true}, function() {
      handleSubmit()
    })
  }

  exposedMethod(){
    const {handleSubmit, fields:{attributes:{description}}} = this.props
    let filtered = this.refs.description.editor.serialize().description.value
    if(filtered == '<p><br></p>' || filtered == '<p class="medium-insert-active"><br></p>'){
      return ''
    }      
    return filtered
  }

  copyTourUrl(e) {
    let url = 'https://www.theticketfairy.com/tour/'+this.props.fields.attributes.slug.value
    let temp = $('<input>')
    $('body').append(temp)
    temp.val(url).select()
    document.execCommand('copy')
    temp.remove()
    this.setState({
      tourUrlCopied: true
    })
  }

  copyTourUrlOut(e) {
    if(this.state.tourUrlCopied) {
      setTimeout(() => {
        this.setState({
          tourUrlCopied: false
        })  
      }, 500)
    }
  }

  onAutoBackgroundChange(e) {
    const {fields: {attributes: {backgroundURL}}} = this.props
    if (e.target.checked) {
      backgroundURL.onChange(null)
      this.setState({
        autoBackground: true
      })
    } else {
      backgroundURL.onChange(backgroundURL.initialValue)
      this.setState({
        autoBackground: false
      })
    }
  }

  importImagesFromFB() {
    console.log('facebook import')
  }

  selectEvent(e, event) {
    let {eventSelected} = this.state
    eventSelected[event.id] = !!!eventSelected[event.id]
    this.setState({
      eventSelected: eventSelected
    })
  }

  render() {
    const {autoBackground, eventSelected} = this.state

    const {
      fields: {
        attributes: {
          displayName, slug, description, bannerURL, backgroundURL
        }
      },
      formKey, submitting, handleSubmit, submitFailed, submitLabel, user, events, initialValues, isNew} = this.props
    
    let slugSuggestion = displayName.value

    return (
      <div>
        {!!isNew&&
          <div>
            <div className='body-panel-header'>
              <div className='left'>
                <div className='title'>Add New Tour</div>
              </div>
              <div className='right'>
              </div>
            </div>
            <div className='body-panel-spacing'/>
          </div>
        }
        <div className={!!isNew ? 'body-panel-content tour-form' : 'tour-form'}>
          <form ref="form" method="POST" onSubmit={handleSubmit}>
            <Card icon={'fa-info'} title={'Tour Details'}>
              <div className="row">
                <div className="col-sm-12">
                  <Field id="name" label="Tour Name" size="large" {...displayName} />
                </div>    
              </div>
              <div className="row">
                <div className="col-xs-12">
                  <label className="autoslugfield-label" onMouseLeave={::this.copyTourUrlOut}>
                    Tour URL
                    <OverlayTrigger placement="right" overlay={this.state.tourUrlCopied?<Tooltip id="tourUrlCopied">Copied</Tooltip>:<Tooltip id="tourUrlCopied">Copy Tour URL</Tooltip>} trigger={['hover']}>
                      <i className="fa fa-copy event-url-copy" onClick={::this.copyTourUrl}/>
                    </OverlayTrigger>
                  </label>
                  <AutoSlugField id="slug" label="Link URL" {...slug} separator="-"
                    hint="Letters, numbers and hyphens only"
                    suggestion={slugSuggestion}>
                    <Field.PrefixAddon className="link-prefix hidden-xs">
                      <img className="link-prefix-img" src={asset('/assets/resources/images/event-url.png')}/>
                      <div className="link-prefix-url">https://www.theticketfairy.com/tour/</div>
                    </Field.PrefixAddon>
                  </AutoSlugField>
                </div>
              </div>
            </Card>
            <Card icon={'fa-pencil-square'} title={'Tour Description'}>
              <div className="row">
                <div className="col-xs-12">
                  <RichTextArea ref="description" id="description" label="" {...description} baseurl={process.env.ADMIN_CDN_URL}/>
                </div>
              </div>
            </Card>
            <Card icon={'fa-camera'} title={'Tour Images'}>
              <div className="row">
                <div className="col-xs-8">
                  <FileUploader label="Add Tour Banner" filetype="image" {...bannerURL} />
                </div>
                <div className="col-xs-4">
                  {!autoBackground && <FileUploader label="Add Tour Background" filetype="image" {...backgroundURL} />}
                </div>
              </div>
              <div className="row">
                <div className="col-xs-8">
                  <div className="btn btn-blue btn-shadow" onClick={::this.importImagesFromFB}>Import From FB</div>
                </div>
                <div className="col-xs-4">
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
            <Card icon={'fa-calendar-o'} title={'Events'}>
                <div className="tour-events-table">
                { events && events.map((event, index) => (
                  <div className="tour-events-table-event" key={index}>
                    <div className="tour-events-table-event-selected">
                      <div className="checkbox-group-square">
                        <div className="checkbox-square">
                          <input id={'selectEvent'+index} type="checkbox" checked={!!eventSelected[event.id]} onChange={e => this.selectEvent(e, event)} />
                          <label htmlFor={'selectEvent'+index}></label>
                        </div>
                      </div>
                    </div>
                    <div className="tour-events-table-event-image">
                      <LazyLoad >{!!event.imageURL ? <img className="LazyLoadImg thumb" src={event.imageURL} /> : <div>Not set</div>}</LazyLoad>
                    </div>
                    <div className="tour-events-table-event-details">
                      <div className="tour-event-brand">
                        {event.$relationships.owner.displayName}
                      </div>
                      <div className="tour-event-name">
                        <Link to={'/event/' + event.id + '/details'}>{event.displayName}</Link>
                      </div>
                      <div className="tour-event-time">
                        <i className="fa fa-clock-o" aria-hidden="true"></i>
                        <DateLabel className="starttime" value={moment.utc(new Date(event.startDate))} format="LLL" />
                      </div>
                      <div className="tour-event-address">
                        <i className="fa fa-map-marker" aria-hidden="true"></i>
                        {!!event.venue && <Address className="address-form" type="simple" {...event.venue} />}
                        {!event.venue && <div className="address-notdefined">Not Defined</div>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            <div className="row">
              <div className="col-xs-12 text-center">
                <Button className="btn btn-success btn-lg btn-shadow" type="button" loading={submitting} onClick={::this.processSubmit}>{submitLabel || 'Create Tour'}</Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    )
  }
}

