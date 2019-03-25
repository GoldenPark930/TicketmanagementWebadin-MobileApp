import _ from 'lodash'
import {reduxForm} from '../router/redux-form'
import React from 'react'
import {connect} from 'react-redux'
import Immutable from 'immutable'

import DeviceInfo from 'react-native-device-info'

import {View, Text, TouchableOpacity, ScrollView} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import {Field, RichTextArea, Switch, Button, Panel, Select, Grid, Dialog, LoadingBar} from '../_library'
import styles from '../styles/invitation'
import {commonStyle} from '../styles'
import {TabView,Tab} from '../_library/TabView'

import session_tickets from '../../_common/redux/tickets/actions'
import session_email from '../../_common/redux/emailtemplates/actions'

function validateEmail(email) {
  let re = /^(([^<>()\[\]\\.,;:\s@']+(\.[^<>()\[\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(email)
}

function validateForm(data) {
  const errors = {}

  if (!_.get(data, 'subject')){
    _.set(errors, 'subject', 'Required')
  }

  if (!_.get(data, 'body')){
    _.set(errors, 'body', 'Required')
  }

  let recipients_mode = _.get(data, 'recipients_mode')

  if (recipients_mode == 'csv') {
    let recipients = _.get(data, 'recipients')
    if (!recipients || recipients.length==0){
      _.set(errors, 'recipients', 'You must import at least one recipient.')
    } else {
      recipients.forEach((r, index) => {
        if(!r.first_name) {
          _.set(errors, 'recipients['+index+'].first_name', 'Required')
        }
        if(!r.last_name) {
          _.set(errors, 'recipients['+index+'].last_name', 'Required')
        }
        if(!r.email) {
          _.set(errors, 'recipients['+index+'].email', 'Required')
        } else if(!validateEmail(r.email)) {
          _.set(errors, 'recipients['+index+'].email', 'Invalid')
        }
      })
    }
  }

  if (recipients_mode == 'form') {
    let recipient = _.get(data, 'recipient')
    if (!recipient.first_name){
      _.set(errors, 'recipient.first_name', 'Required')
    }
    if (!recipient.last_name){
      _.set(errors, 'recipient.last_name', 'Required')
    }
    if (!recipient.email){
      _.set(errors, 'recipient.email', 'Required')
    } else if(!validateEmail(recipient.email)) {
      _.set(errors, 'recipient.email', 'Invalid Email Address')
    }
  }

  return errors
}

class EventInvitationForm extends React.Component{

  constructor(props) {
    super(props)

    this.state = {
      loadingEmailTemplates: false,
      emailTemplatesModalOpen: false
    }
  }

  componentDidMount() {
    const {event, FETCH_EVENT_TICKETS} = this.props
    Promise.resolve(FETCH_EVENT_TICKETS(event.id))

    this.fetchEmailTemplates()
  }

  fetchEmailTemplates() {
    const {event, FETCH_EMAIL_TEMPLATES} = this.props
    const loadingSetter = (val) => () => this.setState({loadingEmailTemplates: val})

    Promise.resolve(FETCH_EMAIL_TEMPLATES(event.id))
      .catch(loadingSetter(false))
      .then(loadingSetter(false))
    loadingSetter(true)()
  }

  openCSV() {
    $(this.refs.fileCSV).click()
  }

  importRecipientsCSV(e) {
    let that = this
    const recipients = this.props.fields.recipients

    let len = recipients.length
    for(let i=0; i<len; i++) {
      recipients.removeField(0)
    }

    Papa.parse(e.target.files[0], {
      complete: function(results) {
        results.data.forEach((r, i) => {
          recipients.addField({
            first_name: r[0],
            last_name: r[1],
            email: r[2]
          })
        })
        that.touchRecipientFields()
      }
    })
    $(this.refs.fileCSV).val('')
  }

  touchRecipientFields() {
    let { fields: {recipients}, touch } = this.props
    recipients.forEach((r, index) => {
      touch('recipients['+index+'].first_name',
        'recipients['+index+'].last_name',
        'recipients['+index+'].email')
    })
  }

  deleteRecipient(index) {
    let recipients = this.props.fields.recipients
    recipients.removeField(index)
  }

  openEmailTemplatesModal() {
    this.setState({
      emailTemplatesModalOpen: true
    })
  }

  processSubmit(){
    const {handleSubmit} = this.props
    this.setState({submitPressed: true}, function() {
      handleSubmit()
    })
  }

  closeEmailTemplatesModal() {
    this.setState({
      emailTemplatesModalOpen: false
    })
  }

  selectEmailTemplate(template) {
    this.props.fields.subject.onChange(template.subject)
    if(template.body) {
      this.refs.body.setContent(template.body)
    } else if(template.preview_url) {
      $.get(template.preview_url, result => {
        this.refs.body.setContent(result)
      })
    }
    this.setState({
      emailTemplatesModalOpen: false
    })
  }

  selectRecipientsMode(index) {
    this.props.fields.recipients_mode.onChange(index==1 ? 'form' : 'csv')
  }

  render() {
    const {
      fields: {
        subject, body, ticketTypeID,  recipient, recipients,
      }, submitting, handleSubmit, submitLabel, submitFailed, event, tickets, emailTemplates} = this.props
    const {emailTemplatesModalOpen, loadingEmailTemplates} = this.state
    let ticketsHidden = tickets.filter((ticket) => ticket.flagHidden)
    return (
      <View>
        <Panel title='Message' icon='envelope' style={{marginBottom:30}}>
          <View style={{flexDirection:'row'}}>
            <View style={{flex:1}}/>
            <Button title='Select from Email Templates' loading = {loadingEmailTemplates} onPress={()=>this.openEmailTemplatesModal()} size='small'/>
          </View>

          <Field id='subject' label='Subject' size='large' {...subject}/>
          <View style={{marginHorizontal:5}}>
            <Text style={{color:'#ffffff', marginBottom:7}}>Invitation Content</Text>
            <RichTextArea ref='body' id='description' label="" {...body} baseurl={process.env.ADMIN_CDN_URL}/>
          </View>
        </Panel>

        {/*<Panel title='Unlock Registration for Hidden Ticket Type (optional)' icon='unlock-alt' style={{marginBottom:30}}>*/}
          {/*<Select*/}
            {/*label=""*/}
            {/*options={_.map(ticketsHidden,(o)=>({value:o.id,label:o.displayName}))}*/}
            {/*{...ticketTypeID}*/}
            {/*onChange={(value)=>ticketTypeID.onChange(_.find(ticketsHidden, {id:value}))}*/}
            {/*value={_.get(ticketTypeID, 'value.id')}*/}
            {/*defaultValue = 'Select the brand running this event'*/}
          {/*/>*/}
        {/*</Panel>*/}

        <Panel title='Recipients' icon='users' style={{marginBottom:30}}>
          <TabView all={false} shape>
            <Tab title = 'Enter Recipient'>
              <View style={{flexDirection: DeviceInfo.isTablet() ? 'row' : 'column'}}>
                <Field label='First name' id='firstName' size='large' {...recipient.first_name}/>
                <Field label='Last name' id='lastName' size='large' {...recipient.last_name}/>
              </View>
              <Field label='Email' id='email' size='large' {...recipient.email}/>
            </Tab>
            <Tab title='Upload Recipents'>
              { submitFailed && recipients.length == 0 &&
                <Text>You must import at least one recipient.</Text>
              }
              <View style={{flexDirection:DeviceInfo.isTablet() ? 'row': 'column', alignItems:'center', marginVertical:10}}>
                <Text style={{flex:1,color:'#B6C5CF',fontSize:12}}>Recipients (CSV file with first name, last name, email address columns and no header row)</Text>
                <Button title='Add From CSV' icon='upload' size='small' style={{paddingVertical:15, marginVertical:10}}/>
              </View>
              { recipients ?
                <Grid
                  columns={[{
                    name:'First Name',
                    renderer:(record)=>{
                      return(
                        <Field {...record.first_name} type='text' id='firstName' />
                      )
                    }
                  },{
                    name:'Last Name',
                    renderer:(record)=>{
                      <Field {...record.last_name} type='text' id='lastName' />
                    }
                  },{
                    name:'Email',
                    renderer:(record)=>{
                      <Field {...record.email} type='text' id='email' />
                    }
                  }]}
                  data={recipients}
                />:
                <Grid
                  columns={[{
                    name:'First Name'
                  },{
                    name:'Last Name'
                  },{
                    name:'Email'
                  }]}
                />
              }
              { (!recipients || recipients.length == 0) &&
                <Text style={styles.addnew_msg}>Please Add New Recipients</Text>
              }
            </Tab>
          </TabView>
        </Panel>

        <View style={{alignItems:'center'}}>
          <Button
            style={styles.emailButton}
            type='submit' icon='paper-plane'
            title={submitLabel || 'Send'}
            size='large'
            disabled={submitting}
            loading={submitting}
            onPress={handleSubmit}
          />
        </View>
        <Dialog
          title='Select Email Template'
          isOpen={!!emailTemplatesModalOpen}
          onClose={()=>this.closeEmailTemplatesModal()}
          footer={
            <Button title='Cancel' style={commonStyle.buttonSecondary} size='small' onPress={()=>this.closeEmailTemplatesModal()}/>
          }
        >
          <ScrollView style={{margin:10, height:500}}>
              <Grid
                headerStyle={{backgroundColor: '#232732'}}
                columns={[{
                  name : 'name',
                  dataIndex : 'name'
                },{
                  name : 'Description',
                  dataIndex : 'description'
                },{
                  name : 'Subject',
                  dataIndex : 'subject'
                },{
                  name : 'Action',
                  renderer : (record)=>{
                    return(
                      <TouchableOpacity style={{backgroundColor:'#396ba9',paddingVertical:6, paddingHorizontal:12, borderRadius:3}}
                                        onPress={(template)=> this.selectEmailTemplate(template)}>
                        <Text style={{color:'#ffffff'}}>Selct</Text>
                      </TouchableOpacity>
                    )
                  }
                },
                ]}
                data={emailTemplates}
              />
          </ScrollView>
        </Dialog>
      </View>
    )
  }
}
EventInvitationForm = reduxForm({
  form: 'EventInvitationForm',
  fields: [
    'subject',
    'body',
    'ticketTypeID',
    'recipients_mode',
    'recipient.first_name',
    'recipient.last_name',
    'recipient.email',
    'recipients[].first_name',
    'recipients[].last_name',
    'recipients[].email'
  ],
  validate: validateForm,
  initialValues: {
    subject: '',
    body: '',
    ticketTypeID: null,
    recipients_mode: 'form',
    recipient: {
      first_name: '',
      last_name: '',
      email: ''
    },
    recipients: []
  }
})(EventInvitationForm)
EventInvitationForm = connect(
  (state) => {
    const col = state.tickets.get('collection')
    const event = state.events.get('selected').toJS()
    const tickets = state.tickets
      .getIn(['byEvent', event.id], Immutable.List())
      .map(tid => col.get(tid))
      .toJS()
    const emailTemplates = state.emailtemplates.get('emailtemplates').toJS().email_templates
    return {
      event,
      tickets,
      emailTemplates
    }
  },
  {
    FETCH_EVENT_TICKETS: session_tickets.FETCH_EVENT_TICKETS,
    FETCH_EMAIL_TEMPLATES: session_email.FETCH_EMAIL_TEMPLATES
  }
)(EventInvitationForm)
export default EventInvitationForm
