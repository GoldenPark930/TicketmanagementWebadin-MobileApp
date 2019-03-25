import _ from 'lodash'
import {reduxForm} from '../router/redux-form'
import React from 'react'
import DeviceInfo from 'react-native-device-info'
import {View, Text, TouchableOpacity, Modal} from 'react-native'
import {Button, Field, Select} from '../_library'

const options_quantity = _.map(new Array(13), (e, i) => {
  return {value: i+1, label: i+1}
})

function validateTicket(data) {
  let errors = {}

  const required = [
    'email',
    'confirmEmail',
    'ticketTypeID',
  ]
  required.forEach(function(f) {
    if (!_.get(data, f)) {
      _.set(errors, f, 'Required')
    }
  })

  const quantity = _.get(data, 'quantity')
  if (quantity < 1) {
    _.set(errors, 'quantity', 'Quantity must be greater than 0')
  }

  const email = _.get(data, 'email')
  const confirmEmail = _.get(data, 'confirmEmail')
  if(email != confirmEmail)
    _.set(errors, 'confirmEmail', 'Please confirm the email address for this ticket')

  const ticketHolders = _.get(data, 'ticketHolders')
  _.map(ticketHolders, (holder, index) => {
    if(!holder.first_name)
      _.set(errors, 'ticketHolders['+index+'].first_name', 'Required')
    if(!holder.last_name)
      _.set(errors, 'ticketHolders['+index+'].last_name', 'Required')
  })
  return errors
}

class GuestTicketsForm extends React.Component {

  componentDidMount(){
    this.processQuantity(1)
  }

  processQuantity(count){
    const {fields: {ticketHolders}} = this.props
    for (let childIndex = 0; childIndex < ticketHolders.length; childIndex++)
      ticketHolders.removeField(0)
    for (let childIndex = 0; childIndex < count; childIndex++)
      ticketHolders.addField()
  }

  handleQuantityBlur(field, e) {
    field.onBlur(_.parseInt(e))
  }

  handleQuantityChange(field, e) {
    this.processQuantity(e)
    field.onChange(_.parseInt(e))
  }

  render() {
    const {fields: {
      first_name, last_name, email, confirmEmail, ticketTypeID, quantity, ticketHolders, notes
    }, submitting, handleSubmit, submitLabel, tickets} = this.props

    let optionsTickets = [{value:'', label:'Ticket Type'}]
    _.map(tickets, (ticket)=> {
      optionsTickets.push({value: ticket.id, label: ticket.displayName})
    })

    return (
      <View>
        <View style={{flexDirection:DeviceInfo.isTablet() ? 'row': 'column'}}>
          <Select
            id='ticketType'
            label='Ticket Type'
            options={optionsTickets}
            {...ticketTypeID} />
          <Select
            id='quantity'
            label='Quantity'
            options={options_quantity}
            {...quantity}
            onChange={this.handleQuantityChange.bind(this, quantity)}
            onBlur={this.handleQuantityBlur.bind(this, quantity)} />
        </View>
        <View style={{flexDirection:DeviceInfo.isTablet() ? 'row': 'column'}}>
          <Field label='Email Address' {...email} type='email' id='email' />
          <Field label='Confirm Email Address' {...confirmEmail} type='confirmEmail' id='confirmEmail' />
        </View>
        {_.map(ticketHolders, (holder, index) =>
          <View key={index}>
            <Text style={{color:'#ffffff'}}>Ticket Holder #{index + 1}</Text>
            <View style={{flexDirection:DeviceInfo.isTablet() ? 'row': 'column'}}>
              <Field id={'firstName' + index} label='First Name' {...holder.first_name}/>
              <Field id={'lastName' + index} label='Last Name' {...holder.last_name}/>
            </View>
          </View>
        )}
        <View>
          <Field id='notes' label='Notes' {...notes}/>
        </View>
        <View style={{flexDirection:'row',}}>
          <Button type='submit' loading={submitting} title={submitLabel || 'Issue Tickets'} size='small' style={{backgroundColor: '#396ba9'}}/>
        </View>
      </View>
    )
  }
}
export default reduxForm({
  form: 'guestTickets',
  fields: [
    'first_name',
    'last_name',
    'email',
    'confirmEmail',
    'ticketTypeID',
    'quantity',
    'ticketHolders[].first_name',
    'ticketHolders[].last_name',
    'notes'
  ],
  validate: validateTicket,
  initialValues: {
    quantity: 1
  }
})(GuestTicketsForm)

