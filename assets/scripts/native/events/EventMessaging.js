import _ from 'lodash'
import React from 'react'
import {View, Text, TouchableOpacity, Modal, Image} from 'react-native'
import {connect} from 'react-redux'
import styles from '../styles/common'
import EmailToTicketHolders from './messaging/EmailToTicketHolders'
import Mailchimp from './messaging/Mailchimp'
import EmailTemplates from './messaging/EmailTemplates'
import SentEmails from './messaging/SentEmails'
import sessionMessage from '../../_common/redux/mailchimp/actions'
import DeviceInfo from 'react-native-device-info'
import {LoadingBar, EmptyBar} from '../_library'

class EventMessaging extends React.Component{
  constructor(props) {
    super(props)

    this.state = {
      renderShow:false
    }
  }

  componentDidMount() {
    const { event } = this.props
    setTimeout(
      () => this.setState({renderShow: true}),
      500
    )
  }

  sendEmailToTicketHolders(form) {
    const {event, EMAIL_TICKET_HOLDERS} = this.props
    let filteredBody = this.filterMediumEditor()
    let filteredToSelected = form.toSelected.replace(/,\s*$/, '')

    form.toSelected = form.toAll ? [] : filteredToSelected.split(',')
    form.body = filteredBody

    return Promise.resolve(EMAIL_TICKET_HOLDERS(event.id, form))
      .catch((err) => {
        return Promise.reject(_.result(err, 'toFieldErrors', err))
      })
      .then((v)=>{
        return v
      })
  }

  filterMediumEditor(){}
  receiveMediumEditor(func) {
    this.filterMediumEditor = func
  }

  render(){
    const {event} = this.props
    const Loading = <LoadingBar title={'Hold tight! We\'re getting your event\'s statistics...'} />
    const EventMessaging =
      <View>
        <EmailToTicketHolders filterMediumEditor={this.receiveMediumEditor.bind(this)} onSubmit={(form)=>this.sendEmailToTicketHolders(form)}/>
        <SentEmails event={event} />
        <EmailTemplates />
        <Mailchimp/>
      </View>
    return(
      <View>
        {this.state.renderShow ? EventMessaging : Loading}
      </View>
    )

  }
}export default connect(
  (state) => {
    const event = state.events.get('selected').toJS()
    return {
      event
    }
  },
  {EMAIL_TICKET_HOLDERS:sessionMessage.EMAIL_TICKET_HOLDERS}
)(EventMessaging)

