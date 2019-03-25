import _ from 'lodash'
import Immutable from 'immutable'
import React from 'react'
import {connect} from 'react-redux'

import {View, Text, TouchableOpacity, Modal} from 'react-native'

import GuestTicketsForm from './GuestTicketsForm'
import ImportGuestsForm from './guesttickets/ImportGuestsForm'
import GuestTicketsIssued from './guesttickets/GuestTicketsIssued'

import {commonStyle} from '../styles'
import Icon from 'react-native-vector-icons/FontAwesome'
import session_ticket from '../../_common/redux/tickets/actions'
import session_guesttickts from '../../_common/redux/guesttickets/actions'
import {LoadingBar, EmptyBar, Panel} from '../_library'

function getTicketTypeID(ticketTypeName, tickets) {
  let ticketType = _.find(tickets, ticket => ticket.displayName.toLowerCase() == ticketTypeName.toLowerCase())
  return ticketType.id
}

class GuestTickets extends React.Component {
  constructor(props) {
    super(props)
    this.state = {loadingTickets: false}
  }

  componentDidMount() {
    const {event, FETCH_EVENT_TICKETS} = this.props
    const loadingSetter = (val) => () => this.setState({loadingTickets: val})
    Promise.resolve(FETCH_EVENT_TICKETS(event.id))
      .catch(loadingSetter(false))
      .then(loadingSetter(false))
    loadingSetter(true)()
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
        // Messenger().post({
        //   type: 'error',
        //   message: err,
        //   hideAfter: 5,
        //   showCloseButton: true
        // })
        return Promise.reject(_.result(err, 'toFieldErrors', err))
      })
      .then((v)=>{
        // Messenger().post({
        //   type: 'success',
        //   message: 'Successfully Uploaded!',
        //   hideAfter: 10,
        //   showCloseButton: true
        // })
        return v
      })
  }

  uploadGuestsFromCSV(data) {
    const {event, UPLOAD_GUESTTICKETS, tickets} = this.props
    // let recipients = _.map(data.recipients, recipient => ({
    //   first_name: recipient.first_name,
    //   last_name: recipient.last_name,
    //   email: recipient.email,
    //   ticketTypeID: getTicketTypeID(recipient.ticketTypeName, tickets),
    //   quantity: parseInt(recipient.quantity),
    //   notes: recipient.notes,
    //   ticketHolders: [{
    //     first_name: recipient.first_name,
    //     last_name: recipient.last_name,
    //     email: recipient.email
    //   }]
    // }))
    // return Promise.resolve(UPLOAD_GUESTTICKETS(event.id, recipients))
    //   .catch((err) => {
    //     Messenger().post({
    //       type: 'error',
    //       message: err,
    //       hideAfter: 5,
    //       showCloseButton: true
    //     })
    //     return Promise.reject(_.result(err, 'toFieldErrors', err))
    //   })
    //   .then((v)=>{
    //     Messenger().post({
    //       type: 'success',
    //       message: 'Successfully Uploaded!',
    //       hideAfter: 10,
    //       showCloseButton: true
    //     })
    //     return v
    //   })
  }

  render() {
    console.warn('GUEST TICKETS')
    const {event, tickets} = this.props
    const Loading = <LoadingBar title={'Hold tight! We\'re getting your event\'s statistics...'} />
    const GuestTicket =
      <View>

        <Panel title='Send Guest Tickets'>
          <GuestTicketsForm tickets={tickets} onSubmit={(form)=>this.uploadGuestsFromForm(form)} />
        </Panel>

        <Panel title='Upload Guest Tickets' style={{marginTop: 20}}>
          <Text style={{color:'#ffffff', fontFamily: 'Open Sans', fontSize: 13}}>Format guidelines   <Icon name="caret-right" size={13} color="#c6cbd0" /> Please do not include a header row in the file. Each row should include the following:</Text>
          <ImportGuestsForm tickets={tickets} onSubmit={(data)=>this.uploadGuestsFromCSV(data)} />
        </Panel>

        <Panel title='Issued Guest Tickets' style={{marginTop: 20}}>
          <GuestTicketsIssued event={event} />
        </Panel>

      </View>
    return (
      <View>{this.state.loadingTickets ? Loading: GuestTicket}</View>
    )
  }
}export default connect(
  (state) => {
    const col = state.tickets.get('collection')
    const event = state.events.get('selected').toJS()
    const tickets = state.tickets
      .getIn(['byEvent', event.id], Immutable.List())
      .map(tid => col.get(tid))
      .toJS()
    return {
      event,
      tickets
    }
  },
  {FETCH_EVENT_TICKETS: session_ticket.FETCH_EVENT_TICKETS, UPLOAD_GUESTTICKETS: session_guesttickts.UPLOAD_GUESTTICKETS}
)(GuestTickets)
