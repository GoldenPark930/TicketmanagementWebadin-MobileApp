import _ from 'lodash'
import {connect} from 'react-redux'
import {routeActions} from 'react-router-redux'
import React from 'react'
import {withRouter} from 'react-router'
import Modal from 'react-modal'
import modalStyle from '../../_common/core/modalStyle'
import Button from '../_library/Button'

import Notifications from '../_library/notifications/Notifications'
import {CREATE_EVENT} from '../../_common/redux/events/actions'
import EventForm from './EventForm'
import {CREATE_BRAND} from '../../_common/redux/brands/actions'
import BrandForm from '../brands/BrandForm'
import {FETCH_SESSION} from '../../_common/redux/auth/actions'

import classNames from 'classnames'

const noop = () => {}

@withRouter
@connect(
  (state) => {    
    const u = state.auth.get('user')
    const loading = state.loading.has('FETCH_SESSION')
    return {
      user: u ? u.toJS() : null
    }
  },
  {CREATE_EVENT, CREATE_BRAND, FETCH_SESSION, push: routeActions.push}
)
export default class NewEventPage extends React.Component {
  constructor(props) {
    super(props)
    this.createdBrand = null
    document.title = `New Event - The Ticket Fairy Dashboard`
    form_helper_reset()
    this.state = {
      hasEdittedFields: false,
      nextLocation: null,
      showNewBrand: false
    }
  }
  componentDidMount(){
    this.props.router.setRouteLeaveHook(this.props.route, this.routerWillLeave.bind(this))
  }
  componentWillUnmount(){
    form_helper_reset()
  }
  routerWillLeave(nextLocation){
    if(form_helper_isEditted()){
      this.setState({
        hasEdittedFields: true,
        nextLocation: nextLocation.pathname
      })
      return false
    }
  }
  onClickOk(){
    form_helper_reset()
    const{nextLocation} = this.state
    const{push} = this.props
    push(nextLocation)
  }

  onClickCancel() {
    this.setState({hasEdittedFields: false})
  } 

  onClickNewBrand() {
    this.setState({showNewBrand: true})
  }

  onCancelNewBrand() {
    this.setState({showNewBrand: false})
  }

  receiveExposedMethod(exposedMethod) {
    this.exposedMethod = exposedMethod
  }
  exposedMethod(){}
  handleSubmit(form) {
    const {push, CREATE_EVENT} = this.props
    const description = this.exposedMethod()
    form.attributes.description = description

    // fix default anti-scalping settings error
    form.attributes.flagNameChecks = (form.attributes.flagNameChecks == null) ? true : form.attributes.flagNameChecks
    form.attributes.flagIDRequired = (form.attributes.flagIDRequired == null) ? true : form.attributes.flagIDRequired
    form.attributes.flagResaleEnabled = (form.attributes.flagResaleEnabled == null) ? true : form.attributes.flagResaleEnabled
    form.attributes.flagCollectNames = (form.attributes.flagCollectNames == null) ? true : form.attributes.flagCollectNames

    return Promise.resolve(CREATE_EVENT(form))
      .catch(err => {
        return Promise.reject(_.result(err, 'toFieldErrors', err))
      })
      .then(res => {
        const id = _.get(res, 'data.id')
        const next = id ? `/event/${id}/venues` : '/events'
        form_helper_reset()
        push(next)
        return res
      })
  }

  handleBrandSubmit(form) {
    const {CREATE_BRAND, FETCH_SESSION} = this.props
    return Promise.resolve(CREATE_BRAND({...form}))
      .catch(err => {
        return Promise.reject(_.result(err, 'toFieldErrors', err))
      })
      .then(() => {
        FETCH_SESSION()
        this.createdBrand = form.attributes.displayName
        this.setState({showNewBrand: false})
      })
  }

  render() {
    const {user} = this.props
    const brands = _.get(user, '$relationships.organizations', [])
    let selectedBrand = null
    if(this.createdBrand){
      let found = _.find(brands, {displayName: this.createdBrand})
      if(!!found){
        this.createdBrand = null
        selectedBrand = found.id
      }            
    }
    
    const initialValues = {}
    // const initialValues = {
    //   relationships: {owner: {data: _.head(brands) || user}}
    // }
    const {hasEdittedFields, showNewBrand} = this.state
    let contentEdittedFields = null
    if(hasEdittedFields){
      contentEdittedFields = _.map(form_helper_get(), (field, index)=>{
        let field_title = ''
        switch(field){
          case 'relationships.owner.data': 
            field_title = 'Brand' 
            break
          case 'attributes.description':
            field_title = 'Event Description'
            break
          case 'attributes.displayName':
            field_title = 'Event Name'
            break
          case 'attributes.shortName':
            field_title = 'Short Event Name'
            break
          case 'attributes.slug':
            field_title = 'Event URL'
            break
          case 'attributes.backgroundURL':
            field_title = 'Event Background Image'
            break
          case 'attributes.startDate':
            field_title = 'Start Date'
            break
          case 'attributes.endDate':
            field_title = 'End Date'
            break
          case 'attributes.checkInStart':
            field_title = 'Doors open time'
            break
          case 'attributes.checkInEnd':
            field_title = 'Last entry time'
            break
          case 'attributes.flagCarer':
            field_title = 'Free carer ticket for disabled guests'
            break
          case 'attributes.flagInvitationsOnly':
            field_title = 'Invitation required to attend'
            break
          case 'attributes.flagRefunds':
            field_title = 'Refunds allowed'
            break
          case 'attributes.facebookEvent':
            field_title = 'Social Media Facebook'
            break
          case 'attributes.twitterHashtag':
            field_title = 'Social Media Twitter'
            break
          case 'attributes.venue':
            field_title = 'Event Venue'
            break
          case 'attributes.eventType':
            field_title = 'Event Type'
            break
          case 'attributes.tags':
            field_title = 'Tags'
            break
          default:
            field_title = field
            break
        }
        return (
          <div key={index}><i className="fa fa-info-circle" aria-hidden="true"></i> {field_title}</div>
        )
      })
    }
    return (
      <div className='body-main'>
        <Notifications />
        <div>
          <div>
            <Modal
              className="modal-dialog modal-trans"
              style={modalStyle}
              isOpen={hasEdittedFields}
              contentLabel="Modal"
              onRequestClose={::this.onClickCancel}
              closeTimeoutMS={150}>
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-confirm-switch">
                    <div className="modal-header">
                      Confirm Switch
                    </div>
                    <div className="modal-body">
                      <div className="msg-confirm">Are you sure you want to switch to a new section without saving your changes?</div>
                      <div className="msg-desc">You’ve made changes to the following settings:</div>
                      <div className="edited-fields">
                        {contentEdittedFields}
                      </div>
                    </div>
                    <div className="modal-footer">
                      <div className="btn-toolbar btn-toolbar-right">
                        <Button
                          className="btn btn-success btn-shadow"
                          type="button"
                          onClick={::this.onClickOk}>Ok</Button>
                        <Button
                          className="btn btn-default btn-shadow" type="button"
                          onClick={::this.onClickCancel}>Cancel</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Modal>
            <Modal
              className="event-details modal-trans"
              style={modalStyle}
              isOpen={showNewBrand}
              contentLabel="Modal"
              onRequestClose={::this.onCancelNewBrand}
              closeTimeoutMS={150}>
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    Create Brand
                  </div>
                  <div className="modal-body">
                    <BrandForm onSubmit={::this.handleBrandSubmit} onCancel={::this.onCancelNewBrand} submitLabel="Create Brand" initialValues={null}/>
                  </div>
                </div>
              </div>
            </Modal>
            <EventForm 
              onSubmit={::this.handleSubmit} 
              initialValues={initialValues} 
              user={user} 
              organizations={brands}
              selectedBrand={selectedBrand}
              getExposedMethod={this.receiveExposedMethod.bind(this)}
              onClickNewBrand={::this.onClickNewBrand}
              isNew={true}/>
          </div>
        </div>
      </div>
    )
  }
}