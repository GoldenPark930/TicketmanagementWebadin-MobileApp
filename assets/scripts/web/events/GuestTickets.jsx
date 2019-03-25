import _ from 'lodash'
import Immutable from 'immutable'
import React from 'react'
import {connect} from 'react-redux'
import Dropdown from 'react-bootstrap/lib/Dropdown'
import MenuItem from 'react-bootstrap/lib/MenuItem'
import Modal from 'react-modal'
import {withRouter} from 'react-router'
import {routeActions} from 'react-router-redux'

import modalStyle from '../../_common/core/modalStyle'
import Button from '../_library/Button'
import Card from '../_library/Card'
import DateLabel from '../_library/DateLabel'
import TicketGuestForm from './TicketGuestForm'
import ImportGuestsForm from './guesttickets/ImportGuestsForm'
import GuestTicketDelegations from './guesttickets/GuestTicketDelegations'
import GuestTicketsIssued from './guesttickets/GuestTicketsIssued'
import {FETCH_EVENT_TICKETS} from '../../_common/redux/tickets/actions'
import {UPLOAD_GUESTTICKETS} from '../../_common/redux/guesttickets/actions'
import {FETCH_EVENT_ADDONS} from '../../_common/redux/addons/actions'

function getTicketTypeID(ticketTypeName, tickets) {
  let ticketType = _.find(tickets, ticket => ticket.displayName.toLowerCase() == ticketTypeName.toLowerCase())
  return ticketType.id
}

@withRouter
@connect(
  (state) => {
    const col = state.tickets.get('collection')
    const event = state.events.get('selected').toJS()
    const tickets = state.tickets
      .getIn(['byEvent', event.id], Immutable.List())
      .map(tid => col.get(tid))
      .toJS()
    const col1 = state.addons.get('collection')
    const addons = state.addons
      .getIn(['byEvent', event.id], Immutable.List())
      .map(tid => col1.get(tid))
      .toJS()
    return {
      event,
      tickets,
      addons
    }
  },
  {FETCH_EVENT_TICKETS, UPLOAD_GUESTTICKETS, FETCH_EVENT_ADDONS, push: routeActions.push}
)
export default class GuestTickets extends React.Component {
  constructor(props) {
    super(props)
    form_helper_reset()
    this.state = {
      loadingTickets: false, 
      loadingAddOns: false,
      hasEdittedFields: false,
      nextLocation: null
    }
    this.mounted = false
  }
  componentDidMount() {
    Messenger.options = {
      extraClasses: 'messenger-fixed messenger-on-bottom messenger-on-right',
      theme: 'future'
    }

    const {event, FETCH_EVENT_TICKETS, FETCH_EVENT_ADDONS} = this.props
    document.title = `Guest Tickets - ${event.displayName} - The Ticket Fairy Dashboard`
    
    const loadingSetter = (val) => () => this.setState({loadingTickets: val})
    Promise.resolve(FETCH_EVENT_TICKETS(event.id))
      .catch(loadingSetter(false))
      .then(loadingSetter(false))
    loadingSetter(true)()

    const loadingSetter1 = (val) => () => this.setState({loadingAddOns: val})
    Promise.resolve(FETCH_EVENT_ADDONS(event.id))
      .catch(loadingSetter1(false))
      .then(loadingSetter1(false))
    loadingSetter1(true)()

    this.props.router.setRouteLeaveHook(this.props.route, this.routerWillLeave.bind(this))
    this.mounted = true
  }

  componentWillUnmount(){
    form_helper_reset()
    this.mounted = false
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

  routerWillLeave(nextLocation){    
    if(this.mounted && form_helper_isEditted()){
      this.setState({
        hasEdittedFields: true,
        nextLocation: nextLocation.pathname
      })
      return false
    }
  }

  uploadGuestsFromForm(form) {
    const {event, UPLOAD_GUESTTICKETS} = this.props
    let recipients = [{
      first_name: form.ticketHolders[0].first_name,
      last_name: form.ticketHolders[0].last_name,
      email: form.email,
      ticketTypeID: form.ticketTypeID,
      quantity: form.quantity,
      ticketHolders: form.ticketHolders,
      notes: form.notes
    }]
    return Promise.resolve(UPLOAD_GUESTTICKETS(event.id, recipients))
      .catch((err) => {
        Messenger().post({
          type: 'error',
          message: err,
          hideAfter: 5,
          showCloseButton: true
        })
        return Promise.reject(_.result(err, 'toFieldErrors', err))
      })
      .then((v)=>{
        Messenger().post({
          type: 'success',
          message: 'Successfully Uploaded!',
          hideAfter: 10,
          showCloseButton: true
        })
        return v
      })
  }

  uploadGuestsFromCSV(data) {
    const {event, UPLOAD_GUESTTICKETS, tickets} = this.props
    let recipients = _.map(data.recipients, recipient => ({
      first_name: recipient.first_name,
      last_name: recipient.last_name,
      email: recipient.email,
      ticketTypeID: getTicketTypeID(recipient.ticketTypeName, tickets),
      quantity: parseInt(recipient.quantity),
      notes: recipient.notes,
      ticketHolders: [{
        first_name: recipient.first_name,
        last_name: recipient.last_name,
        email: recipient.email
      }]
    }))
    return Promise.resolve(UPLOAD_GUESTTICKETS(event.id, recipients))
      .catch((err) => {
        Messenger().post({
          type: 'error',
          message: err,
          hideAfter: 5,
          showCloseButton: true
        })
        return Promise.reject(_.result(err, 'toFieldErrors', err))
      })
      .then((v)=>{
        Messenger().post({
          type: 'success',
          message: 'Successfully Uploaded!',
          hideAfter: 10,
          showCloseButton: true
        })
        return v
      })
  }

  render() {
    const {loadingTickets, loadingAddOns} = this.state
    const {event, tickets, addons} = this.props

    const {hasEdittedFields} = this.state
    let contentEdittedFields = []
    if(hasEdittedFields){
      let ticketHolders = false, recipients = false
      Object.keys(form_helper_get()).forEach((field, index)=>{
        if(field=='ticketTypeID') {
          contentEdittedFields.push(<div key={field}><i className="fa fa-info-circle" aria-hidden="true"></i> Ticket Type</div>)
        } else if(field=='quantity') {
          contentEdittedFields.push(<div key={field}><i className="fa fa-info-circle" aria-hidden="true"></i> Quantity</div>)
        } else if(field=='email') {
          contentEdittedFields.push(<div key={field}><i className="fa fa-info-circle" aria-hidden="true"></i> Email</div>)
        } else if(field=='first_name') {
          contentEdittedFields.push(<div key={field}><i className="fa fa-info-circle" aria-hidden="true"></i> First Name</div>)
        } else if(field=='last_name') {
          contentEdittedFields.push(<div key={field}><i className="fa fa-info-circle" aria-hidden="true"></i> Last Name</div>)
        } else if(field=='notes') {
          contentEdittedFields.push(<div key={field}><i className="fa fa-info-circle" aria-hidden="true"></i> Notes</div>)
        } else if(field.startsWith('ticketHolders[')) {
          // let fieldS = field.split('[')[1].split('].')
          // contentEdittedFields.push(<div key={field}> - Ticket Holder #{parseInt(fieldS[0])+1} {fieldS[1]=='first_name' ? 'First Name':'Last Name'}</div>)
          if(!ticketHolders) {
            contentEdittedFields.push(<div key={field}><i className="fa fa-info-circle" aria-hidden="true"></i> Ticket Holders</div>)
            ticketHolders = true
          }
        } else if(field.startsWith('recipients[')) {
          if(!recipients) {
            contentEdittedFields.push(<div key={field}><i className="fa fa-info-circle" aria-hidden="true"></i> Recipients from CSV</div>)
            recipients = true
          }
        } else {
          contentEdittedFields.push(<div key={field}><i className="fa fa-info-circle" aria-hidden="true"></i> {field}</div>)
        }
      })
    }

    return (
      <div className="EventGuestTickets">    
        <Card title={'Send Guest Tickets'}>
          <TicketGuestForm tickets={tickets} onSubmit={::this.uploadGuestsFromForm} />
        </Card>
        <Card title={'Upload Guest Tickets'}>
          <p>
            Format guidelines &nbsp;&nbsp;&nbsp;
            <i className="fa fa-caret-right" aria-hidden="true"></i>
            Please do <strong>not</strong> include a header row in the file. Each row should include the following:
          </p>  
          <ImportGuestsForm tickets={tickets} onSubmit={::this.uploadGuestsFromCSV} />
        </Card>
        <Card title={'Issued Guest Tickets'}>
          <GuestTicketsIssued event={event} />
        </Card>
        {/*<h3 className="heading_style">Guest Ticket Delegations</h3>
        <GuestTicketDelegations tickets={tickets} />*/}
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
      </div>
    )
  }
}