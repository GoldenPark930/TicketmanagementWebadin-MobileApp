import _ from 'lodash'
import {reduxForm} from 'redux-form'
import React from 'react'
import Papa from 'papaparse'
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger'
import Tooltip from 'react-bootstrap/lib/Tooltip'

import Button from '../../_library/Button'
import Field from '../../_library/Field'
import Select from '../../_library/Select'

function validateEmail(email) {
    let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return re.test(email)
}

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
  if(!ticketTypeName) return null
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

class RecipientField extends React.Component {
  render() {
    const {field} = this.props

    return (
      <div>
        { field.value }
        &nbsp;
        { field.invalid && 
          <OverlayTrigger placement="right" overlay={<Tooltip>{ field.error }</Tooltip>} trigger={['hover', 'click']} id="tooltip">
            <i className="fa fa-exclamation-circle icon-invalid" aria-hidden="true"></i>
          </OverlayTrigger>
        }
      </div>
    )
  }
}

@reduxForm({
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
})
export default class ImportGuestsForm extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      csvParsing: false,
      csvParseCountAll: 0,
      csvParseCount: 0
    }
  }

  componentDidMount(){

  }

  openCSV() {
    $(this.refs.fileCSV).click()
  }

  importCSV(e) {
    let that = this
    const { fields: {recipients}, tickets } = this.props

    let len = recipients.length
    for(let i=0; i<len; i++) {
      recipients.removeField(0)
    }

    if(e.target.files[0].type!='application/vnd.ms-excel' && e.target.files[0].type!='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      this.setState({
        csvParsing: true,
        csvParseCountAll: 0,
        csvParseCount: 0
      })

      Papa.parse(e.target.files[0], {
        complete: function(results) {
          let i = 0
          that.setState({csvParseCountAll: results.data.length})
          let addGuestTicketInterval = setInterval(() => {
            let r = results.data[i]
            let tt = getTicketType(r[4] && r[4].trim(), tickets)
            recipients.addField({
              first_name: r[0] && r[0].trim(),
              last_name: r[1] && r[1].trim(),
              email: r[2] && r[2].trim(),
              quantity: parseInt(r[3] && r[3].trim()),
              ticketTypeName: tt ? tt.displayName : r[4] && r[4].trim(),
              notes: r[5] && r[5].trim()
            })
            i++
            that.setState({csvParseCount: i})
            if(i==results.data.length) {
              clearInterval(addGuestTicketInterval)
              that.touchRecipientFields()
              that.setState({csvParsing: false})
            }
          }, 50)
        }
      })
    } else {
      Messenger().post({
        type: 'error',
        message: 'Please upload a CSV file instead of an Excel format file',
        hideAfter: 5,
        showCloseButton: true
      })
    }
    $(this.refs.fileCSV).val('')
  }

  touchRecipientFields() {
    let { fields: {recipients}, touch } = this.props
    recipients.forEach((r, index) => {
      touch('recipients['+index+'].first_name',
        'recipients['+index+'].last_name',
        'recipients['+index+'].email',
        'recipients['+index+'].quantity',
        'recipients['+index+'].ticketTypeName',
        'recipients['+index+'].notes')
      recipients[index].first_name.onChange(recipients[index].first_name.value)
      recipients[index].last_name.onChange(recipients[index].last_name.value)
      recipients[index].email.onChange(recipients[index].email.value)
      recipients[index].quantity.onChange(recipients[index].quantity.value)
      recipients[index].ticketTypeName.onChange(recipients[index].ticketTypeName.value)
      recipients[index].notes.onChange(recipients[index].notes.value)
    })
  }

  deleteRecipient(index) {
    let recipients = this.props.fields.recipients
    recipients.removeField(index)
  }

  render() {
    const {fields: {
      recipients
    }, submitting, handleSubmit, submitLabel, tickets} = this.props

    const {csvParsing, csvParseCountAll, csvParseCount} = this.state

    let optionsTicketTypeNames = _.map(tickets, (ticket)=> ({value: ticket.displayName, label: ticket.displayName}))
    optionsTicketTypeNames.unshift({value:'', label:'- Select -'})

    return (
      <div>
        <div className="recipients-table-container">
          <table className="table recipients-table">
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email Address (optional)</th>
                <th>Number of Tickets in Total</th>
                <th>Type of Ticket (Crew, Performer, Artist, Media, Guest)</th>
                <th>Notes (optional)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="6">
                  <p className="show_title">Example:</p>
                </td>
              </tr>
              <tr>
                <td>Jane</td>
                <td>Smith</td>
                <td></td>
                <td>2</td>
                <td>Crew</td>
                <td>Stage Manager</td>
              </tr>
              <tr>
                <td>Calvin</td>
                <td>Francis</td>
                <td>dj.calvin.francis@gmail.com</td>
                <td>3</td>
                <td>Performer</td>
                <td></td>
              </tr>
              <tr>
                <td>Clark</td>
                <td>Kent</td>
                <td>superman@yahoo.com</td>
                <td>1</td>
                <td>Media</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="upload-button-container">
          <input type="file" accept=".csv" onChange={this.importCSV.bind(this)} ref="fileCSV" className="file-csv" />
          <div className="btn btn-success btn-shadow btn-importcsv" onClick={this.openCSV.bind(this)}>
            <i className="fa fa-upload" aria-hidden="true"></i> Add from CSV
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="recipients-table-container">
            <table className="table recipients-table">
              <thead>
                <tr>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Email</th>
                  <th>Number of Tickets</th>
                  <th>Type of Ticket</th>
                  <th colSpan="2">Notes</th>
                </tr>
              </thead>
              <tbody>
                { csvParsing &&
                  <tr>
                    <td colSpan="7" className="text-center">
                      <i className="fa fa-circle-o-notch fa-fw fa-spin" />&nbsp;&nbsp;Loaded {csvParseCount} of {csvParseCountAll}
                    </td>
                  </tr>
                }
                { !csvParsing && recipients && recipients.map((recipient, index) => (
                  <tr key={index} className={isRecipientValid(recipient)?'':'row-error'}>
                    <td><Field {...recipient.first_name} type="text" id="firstName" /></td>
                    <td><Field {...recipient.last_name} type="text" id="lastName" /></td>
                    <td><Field {...recipient.email} type="email" id="email" /></td>
                    <td><Field {...recipient.quantity} type="number" id="quantity" /></td>
                    <td>
                      <Select
                        id="ticketTypeName"
                        options={optionsTicketTypeNames}
                        {...recipient.ticketTypeName} />
                    </td>
                    <td><Field {...recipient.notes} type="text" id="notes" /></td>
                    <td>
                      <div className="delete-recipient" onClick={this.deleteRecipient.bind(this, index)}><i className="fa fa-trash" aria-hidden="true"></i></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {
            recipients && recipients.length > 0 && isRecipientsValid(recipients) &&
            <div className="issue-button-container">
              <Button className="btn btn-primary btn-shadow" type="submit" loading={submitting}>{submitLabel || 'Issue Tickets'}</Button>
            </div>
          }          
        </form>
      </div>
    )
  }
}

