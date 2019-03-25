
import _ from 'lodash'
import React from 'react'
import {connect} from 'react-redux'
import {get} from 'lodash'

import Button from '../_library/Button'
import Map from '../_library/Map'
import Card from '../_library/Card'
import Venue from './Venue'
import VenueEditor from './VenueEditor'
import Address from '../_library/Address'
import {UPDATE_EVENT} from '../../_common/redux/events/actions'

import {withRouter} from 'react-router'
import Modal from 'react-modal'
import modalStyle from '../../_common/core/modalStyle'
import {routeActions} from 'react-router-redux'

@withRouter
@connect(
  (state) => ({event: state.events.get('selected').toJS()}),
  {UPDATE_EVENT, push: routeActions.push}
)
export default class Venues extends React.Component {
  constructor(props) {
    super(props)
    form_helper_reset()
    this.state = {
      hasEdittedFields: false,
      nextLocation: null
    }
  }
  componentDidMount() {
    const {event} = this.props
    document.title = `Venue - ${event.displayName} - The Ticket Fairy Dashboard`
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

  handleHighlight(venue) {
    const {highlighted} = this.state
    const {id} = venue
    this.setState({highlighted: highlighted === id ? null : id})
  }
  handleEdit(venue) {
    this.setState({editing: true, selected: venue})
  }
  handleSubmit(form) {
    const isSaveAndCreateTicket = this.exposedMethod()
    const {event, UPDATE_EVENT} = this.props    
    Promise.resolve(UPDATE_EVENT(event.id, {attributes: {venue: form}}))
      .then((res) => {
        this.setState({editing: false})
        if(isSaveAndCreateTicket){
          const {push} = this.props
          const next = `/event/${event.id}/tickets`
          push(next)
        }
        return res
      })
  }
  handleCancel() {
    const {event} = this.props
    const {venue} = event
    if(venue) {
      this.setState({editing: false, selected: null})
    } else {
      const {push} = this.props
      const next = `/event/${event.id}/details`
      push(next)
    }
  }
  handleDeleteVenue(venue) {
    const {event, UPDATE_EVENT} = this.props
    const {id} = venue
    const unsetRemoving = () => this.setState({removing: null})
    if (this.state.removing) {
      Promise.resolve(UPDATE_EVENT(event.id, {venue: null}))
        .then(unsetRemoving, unsetRemoving)
    } else {
      this.setState({removing: true})
    }
  }
  receiveExposedMethod(exposedMethod) {
    this.exposedMethod = exposedMethod
  }
  exposedMethod(){}
  render() {
    const {editing, highlighted, selected, removing} = this.state
    const {event} = this.props
    const {venue} = event

    const {hasEdittedFields} = this.state
    let contentEdittedFields = null
    if(hasEdittedFields){
      contentEdittedFields = _.map(form_helper_get(), (field, index)=>{
        let field_title = ''
        switch(field){
          case 'displayName': 
            field_title = 'Venue Name' 
            break
          case 'streetNumber':
            field_title = 'Street Number'
            break
          case 'street':
            field_title = 'Street'
            break
          case 'city':
            field_title = 'City'
            break
          case 'state':
            field_title = 'State'
            break
          case 'country':
            field_title = 'Country'
            break
          case 'postalCode':
            field_title = 'Postal Code'
            break
          case 'flagDisabled':
            field_title = 'Disabled Access'
            break
          case 'flagHidden':
            field_title = 'Hide this venue from customers'
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

    const address = !!event ? event.venue : null

    const editorOpen = editing || !venue
    return (
      <div className = "venues">
        {!!venue && !editorOpen && <div className="venues-panel">
          <div className="row">
            <div className="col-md-5 venues-left">
              <Venue {...venue}>
                <div className="btn-toolbar">
                  <Button className="btn btn-primary btn-shadow" type="button" onClick={() => this.handleEdit(venue)}>
                    <i className="fa fa-fw fa-pencil-square-o" /> Edit Venue
                  </Button>
                  <Button className={'btn ' + (removing ? 'btn-danger' : 'btn-default')} type="button" onClick={() => this.handleDeleteVenue(venue)} onBlur={() => this.setState({removing: false})}>
                    {removing ? <span><i className="fa fa-fw fa-exclamation" /> Are you sure?</span> : <span><i className="fa fa-fw fa-trash-o" /> Remove</span>}
                  </Button>
                </div>
              </Venue>
            </div>
            <div className="col-md-7 venues-right">
              <Card icon={'fa-thumb-tack'} title={'Venue Location'}>
                <div className="venue-map">
                  <Map locations={[venue]} />
                </div>
              </Card>
            </div>
          </div>
        </div>}
        {editorOpen && <div className="row venues-panel">
          <div className="col-xs-12">
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
            <VenueEditor 
              getExposedMethod={this.receiveExposedMethod.bind(this)}
              event={event} 
              venue={venue} 
              initialValues={selected} 
              onSubmit={::this.handleSubmit} 
              onCancel={::this.handleCancel} />
          </div>
        </div>}        
      </div>
    )
  }
}
