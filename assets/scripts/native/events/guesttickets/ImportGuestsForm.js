import _ from 'lodash'
import {reduxForm} from '../../router/redux-form'
import {View, Text, TouchableOpacity, Modal, ScrollView} from 'react-native'
import React from 'react'
import DeviceInfo from 'react-native-device-info'
import {Button, Field, Select, Grid,} from '../../_library/'
import styles from '../../styles/guesttickets'
class ImportGuestsForm extends React.Component {
  componentDidMount(){

  }
  deleteRecipient(index) {
    let recipients = this.props.fields.recipients
    recipients.removeField(index)
  }
  render() {
    const {fields: {
      recipients
    }, submitting, handleSubmit, submitLabel, tickets} = this.props
    return (
      <ScrollView horizontal={DeviceInfo.isTablet() ? false:true}>
      <View style={!DeviceInfo.isTablet() && {width:800}}>
        <View style={styles.recipients_table}>
          <Text style={[styles.recipients_element_title,{flex:1}]}>First Name</Text>
          <Text style={[styles.recipients_element_title,{flex:1}]}>Last Name</Text>
          <Text style={[styles.recipients_element_title,{flex:2}]}>Email Address (optional)</Text>
          <Text style={[styles.recipients_element_title,{flex:1}]}>Number of Guests in Total</Text>
          <Text style={[styles.recipients_element_title,{flex:2}]}>Type of Ticket (Crew, Performer, Artist, Media, Guest)</Text>
          <Text style={[styles.recipients_element_title,{flex:1}]}>Notes (optional)</Text>
        </View>

        <View style={styles.recipients_element_View}>
          <Text style={{color:'#ffbe96', fontStyle:'italic',marginTop:20,fontSize:14, fontWeight:'700'}}>Example:</Text>
        </View>

        <View style={styles.recipients_element_View}>
          <Text style={styles.recipients_element}>Jane</Text>
          <Text style={[styles.recipients_element,{flex:1}]}>Smith</Text>
          <Text style={[styles.recipients_element,{flex:2}]}></Text>
          <Text style={[styles.recipients_element,{flex:1}]}>2</Text>
          <Text style={[styles.recipients_element,{flex:2}]}>Crew</Text>
          <Text style={[styles.recipients_element,{flex:1}]}>Stage Manager</Text>
        </View>

        <View style={styles.recipients_element_View}>
          <Text style={[styles.recipients_element,{flex:1}]}>Calvin</Text>
          <Text style={[styles.recipients_element,{flex:1}]}>Francis</Text>
          <Text style={[styles.recipients_element,{flex:2}]}>dj.calvin.francis@gmail.com</Text>
          <Text style={[styles.recipients_element,{flex:1}]}>3</Text>
          <Text style={[styles.recipients_element,{flex:2}]}>Performer</Text>
          <Text style={[styles.recipients_element,{flex:1}]}></Text>
        </View>

        <View style={styles.recipients_element_View}>
          <Text style={[styles.recipients_element,{flex:1}]}>Clark</Text>
          <Text style={[styles.recipients_element,{flex:1}]}>Kent</Text>
          <Text style={[styles.recipients_element,{flex:2}]}>superman@yahoo.com</Text>
          <Text style={[styles.recipients_element,{flex:1}]}>1</Text>
          <Text style={[styles.recipients_element,{flex:2}]}>Media</Text>
          <Text style={[styles.recipients_element,{flex:1}]}></Text>
        </View>

        <View style={[styles.recipients_element_View,{borderBottomWidth:0, flexDirection:'row'}]}>
          <View style={{flex:1}}></View>
          <Button title='Add from CSV' icon='upload'/>
        </View>

        {recipients && recipients.length >0 &&
        <Grid
          columns={[{
            name:'First Name',
            renderer: (record) => {
              return(
                <Field {...record.first_name} type='text' id='firstName' />
              )
            }
          },{
            name:'Last Name',
            renderer: (record) => {
              return(
                <Field {...record.last_name} type='text' id='lastName' />
              )
            }
          },{
            name:'Email',
            renderer: (record) => {
              return(
                <Field {...record.email} type='text' id='email' />
              )
            }
          },{
            name:'Number of Guests',
            renderer: (record) => {
              return(
                <Field {...record.quantity} type='text' id='quantity' />
              )
            }
          },{
            name:'Type of Ticket',
            renderer: (record) => {
              return(
                <Select
                  id='ticketTypeName'
                  options={optionsTicketTypeNames}
                  {...record.ticketTypeName} />
              )
            }
          },{
            name:'Notes',
            renderer: (record) => {
              return(
                <Field {...record.notes} type='text' id='notes' />
              )
            }
          },{
            name:'',
            renderer:(record) => {
              return(
                <Button icon='trash' onPress={this.deleteRecipient.bind(this, index)} />
              )
            }
          }]}
          data={recipients}
        />}
        {recipients && recipients.length > 0 && isRecipientsValid(recipients) &&
          <View style={{flexDirection: 'row', alignItems: 'center', paddingVertical: 20}}>
            <Button title={submitLabel || 'Issue Tickets'} loading={submitting} onPress={handleSubmit}/>
          </View>
        }
      </View>
      </ScrollView>
    )
  }
}export default reduxForm({
  form: 'importGuests',
  fields: [
    'recipients[].first_name',
    'recipients[].last_name',
    'recipients[].email',
    'recipients[].quantity',
    'recipients[].ticketTypeName',
    'recipients[].notes',
  ],
  validate: validateForm,
  initialValues: {
    recipients: []
  }
})(ImportGuestsForm)

function validateForm(data, props) {
  let errors = {}

  let recipients = _.get(data, 'recipients')
  let recipientsError = []
  recipients.forEach((r, index) => {
    if(!r.first_name) {
      _.set(errors, 'recipients['+index+'].first_name', 'Required')
    }
    if(r.email && !validateEmail(r.email)) {
      _.set(errors, 'recipients['+index+'].email', 'Invalid')
    }
    if(!r.ticketTypeName) {
      _.set(errors, 'recipients['+index+'].ticketTypeName', 'Required')
    } else if(!validateTicketTypeName(r.ticketTypeName, props.tickets)) {
      _.set(errors, 'recipients['+index+'].ticketTypeName', 'Invalid')
    }
    if(!r.quantity) {
      _.set(errors, 'recipients['+index+'].quantity', 'Required')
    } else if(isNaN(r.quantity) || r.quantity<0) {
      _.set(errors, 'recipients['+index+'].quantity', 'Invalid')
    } else if(r.quantity>50) {
      _.set(errors, 'recipients['+index+'].quantity', '>50')
    }
  })

  return errors
}

function validateTicketTypeName(ticketTypeName, tickets) {
  let ticketType = _.find(tickets, ticket => ticket.displayName.toLowerCase() == ticketTypeName.toLowerCase())
  return ticketType != null
}

function getTicketType(ticketTypeName, tickets) {
  let ticketType = _.find(tickets, ticket => ticket.displayName.toLowerCase() == ticketTypeName.toLowerCase())
  return ticketType
}

function isRecipientValid(recipient) {
  return recipient.first_name.valid
    && recipient.last_name.valid
    && recipient.email.valid
    && recipient.quantity.valid
    && recipient.ticketTypeName.valid
    && recipient.notes.valid
}

function isRecipientsValid(recipients) {
  let valid = true
  recipients.forEach((recipient) => {
    valid = valid && isRecipientValid(recipient)
  })
  return valid
}

function validateEmail(email) {
  let re = /^(([^<>()\[\]\\.,;:\s@']+(\.[^<>()\[\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(email)
}
