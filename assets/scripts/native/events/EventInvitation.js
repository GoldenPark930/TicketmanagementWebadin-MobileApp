import _ from 'lodash'
import React from 'react'
import {View, Text, TouchableOpacity} from 'react-native'
import {connect} from 'react-redux'
import Icon from 'react-native-vector-icons/FontAwesome'
import EventInvitationForm from './EventInvitationForm'
import LoadingBar from '../_library/LoadingBar'
import session_tickets from '../../_common/redux/tickets/actions'
import session_invitation from '../../_common/redux/invitation/actions'
import session_email from '../../_common/redux/emailtemplates/actions'

import styles from '../styles/invitation'
import {Field, RichTextArea, Switch, Button, Panel, Select, Grid} from '../_library'
import {TabView,Tab} from '../_library/TabView'

class EventInvitation extends React.Component{
  constructor(props) {
    super(props)

    this.state = {
      loadingInvitations: false
    }
  }

  componentDidMount() {
    const {event} = this.props

    this.fetchInvitations()
  }

  fetchInvitations() {
    const {event, FETCH_INVITATIONS} = this.props
    const loadingSetter = (val) => () => this.setState({loadingInvitations: val})
    Promise.resolve(FETCH_INVITATIONS(event.id))
      .catch(loadingSetter(false))
      .then(loadingSetter(false))
    loadingSetter(true)()
  }

  sendNotification(form) {
    const {event, SEND_INVITATIONS} = this.props

    if (form.recipients_mode == 'form') {
      form.recipients = []
      form.recipients.push(form.recipient)
      delete form.recipient
    } else if (form.recipients_mode == 'csv') {
      delete form.recipient
    }
    delete form.recipients_mode

    return Promise.resolve(SEND_INVITATIONS(event.id, form))
      .catch((err) => {
        return Promise.reject(_.result(err, 'toFieldErrors', err))
      })
      .then((v)=>{
        this.fetchInvitations()
        return v
      })
  }

  render() {
    const {loadingInvitations} = this.state
    const {invitations} = this.props

    return (
      <View>
        <View style={styles.heading_style}><Text style={styles.heading_text}>Send New Invitation</Text></View>
        <EventInvitationForm onSubmit={(form)=>this.sendNotification(form)} />
        <Panel icon='users' title='Existing Invitations' style={{backgroundColor:'#232732',}}>
          {!loadingInvitations ?
          <Grid
            columns={[{
              name:'Name',
              dataIndex:'first_name',
              renderer: (record) => {
                return(
                  <Text style={{color:'white', fontSize:12}}>{record.first_name} {record.last_name}</Text>
                )
              }
            },{
              name:'Email',
              dataIndex:'email',
            },{
              name:'Invited By',
              dataIndex:'invited_by_first_name',
              renderer: (record) => {
                return(
                  <Text style={{color:'white', fontSize:12}}>{record.invited_by_first_name} {record.invited_by_last_name}</Text>
                )
              }
            },{
              name:'Status',
              dataIndex:'status'
            }]}
            data={invitations}
            paging={true}
          />:<LoadingBar/>}
        </Panel>
      </View>
    )
  }
}
export default connect(
  (state) => {
    const event = state.events.get('selected').toJS()
    const invitations = state.invitations.get('invitations').toJS().invitations
    return {
      event,
      invitations
    }
  },
  {SEND_INVITATIONS:session_invitation.SEND_INVITATIONS, FETCH_INVITATIONS:session_invitation.FETCH_INVITATIONS}
)(EventInvitation)

