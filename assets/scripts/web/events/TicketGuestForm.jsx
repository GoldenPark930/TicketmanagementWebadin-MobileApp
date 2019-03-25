import _ from 'lodash'
import {reduxForm} from 'redux-form'
import React from 'react'

import Button from '../_library/Button'
import Field from '../_library/Field'
import Select from '../_library/Select'

const options_quantity = _.map(new Array(40), (e, i) => {
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

@reduxForm({
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
})
export default class GuestTicketsForm extends React.Component {
  componentDidMount(){
    this.processQuantity(1)
  }

  processQuantity(count){
    const {fields: {ticketHolders}} = this.props
    let count_pre = ticketHolders.length
    if(count<count_pre) {
      for(let i=0; i<count_pre-count; i++) {
        ticketHolders.removeField(count)
      }
    }
    if(count>count_pre) {
      for(let i=0; i<count-count_pre; i++) {
        ticketHolders.addField()
      }
    }
  }

  handleQuantityBlur(field, e) {    
    field.onBlur(_.parseInt(e.target.value))    
  }

  handleQuantityChange(field, e) {
    this.processQuantity(e.target.value)
    field.onChange(_.parseInt(e.target.value))
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

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-xs-6 col-12">
            <Select
              id="ticketType"
              label="Ticket Type"
              options={optionsTickets}
              {...ticketTypeID} />
          </div>
          <div className="col-xs-6 col-12">
            <Select
              id="quantity"
              label="Quantity"
              options={options_quantity}
              {...quantity} 
              onChange={this.handleQuantityChange.bind(this, quantity)}
              onBlur={this.handleQuantityBlur.bind(this, quantity)}
              />
          </div>
        </div>
        <div className="row">
          <div className="col-xs-6 col-12">
            <Field label="Email Address" {...email} type="email" id="email" />
          </div>
          <div className="col-xs-6 col-12">
            <Field label="Confirm Email Address" {...confirmEmail} type="confirmEmail" id="confirmEmail" />
          </div>
        </div>
        {_.map(ticketHolders, (holder, index) =>
          <div key={index} className="row">
            <div className="col-xs-12">
              <div className="sub_heading">
                <label>Ticket Holder #{index + 1}</label>
              </div>
            </div>
            <div className="col-xs-6 col-12">
              <Field id={'firstName' + index} label="First Name" {...holder.first_name}/>
            </div>
            <div className="col-xs-6 col-12">
              <Field id={'lastName' + index} label="Last Name" {...holder.last_name}/>
            </div>
          </div>
        )}
        <div className="row">
          <div className="col-xs-12 col-12">
            <br/>
            <Field id="notes" label="Notes (optional)" {...notes}/>
          </div>
        </div>
        <div className="row">
          <div className="col-xs-12 col-12">
          <br />
            <Button className="btn btn-primary btn-shadow" type="submit" loading={submitting}>{submitLabel || 'Issue Tickets'}
            </Button>
          </div>
        </div>
      </form>
    )
  }
}

