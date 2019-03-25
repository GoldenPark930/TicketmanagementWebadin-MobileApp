import _ from 'lodash'
import {reduxForm} from 'redux-form'
import React from 'react'

import Button from '../_library/Button'
import Checkbox from '../_library/Checkbox'
import CurrencyField from '../_library/CurrencyField'
import Field from '../_library/Field'
import RichTextArea from '../_library/RichTextArea'
import TagsField from '../_library/TagsField'
import DateTimePicker from '../_library/DateTimePicker'

const intRE = /\d+/
const range10 = new Array(10)

let isInventoryMode = false

function validateTicket(data) {
  const required = [
    'attributes.displayName',
  ]
  const errors = {}

  if (!_.get(data, 'attributes.displayName')){
    _.set(errors, 'attributes.displayName', 'Required')
  }

  if(isInventoryMode){
    const rawMaxInventory = _.get(data, 'attributes.maxInventory')
    const maxInventory = parseInt(rawMaxInventory, 10)
    if (!intRE.test(rawMaxInventory) || _.isNaN(maxInventory) || maxInventory < 0) {
      _.set(errors, 'attributes.maxInventory', 'Value must be greater than or equal to 0')
    }
  }else{
    const rawstock = _.get(data, 'attributes.stock')
    const stock = parseInt(rawstock, 10)
    if (!intRE.test(rawstock) || _.isNaN(stock) || stock < 0) {
      _.set(errors, 'attributes.stock', 'Value must be greater than or equal to 0')
    }
  }

  const rawprice = _.get(data, 'attributes.price')
  const price = parseInt(rawprice, 10)
  if (!intRE.test(rawprice) || _.isNaN(price) || price < 0) {
    _.set(errors, 'attributes.price', 'Value must be greater than or equal to 0')
  }

  const mul = _.get(data, 'attributes.quantityIncrement')
  if (mul && mul < 1) {
    _.set(errors, 'attributes.quantityIncrement', 'Value must be greater than 0')
  }

  if (_.get(data, 'attributes.checkInStart') && !_.get(data, 'attributes.checkInEnd')){
		_.set(errors, 'attributes.checkInEnd', 'Required')
  }
  
  if (!_.get(data, 'attributes.checkInStart') && _.get(data, 'attributes.checkInEnd')){
		_.set(errors, 'attributes.checkInStart', 'Required')
	}

  return errors
}

@reduxForm({
  form: 'editticket',
  fields: [
    'attributes.displayName',
    'attributes.stock',
    'attributes.maxInventory',
    'attributes.price',
    'attributes.description',
    'attributes.tags',
    'attributes.flagAlwaysAvailable',
    'attributes.active',
    'attributes.flagHidden',
    'attributes.checkInStart',
    'attributes.checkInEnd',
    'attributes.quantityIncrement'
  ],
  validate: validateTicket,
  initialValues: {
    attributes: {
      quantityIncrement: 1,
      active: true
    }
  }
})
export default class TicketForm extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      flagDifferentTime: false,
    }
  }
  componentDidMount(){
    if (typeof this.props.getExposedMethod === 'function') {
      this.props.getExposedMethod(this.exposedMethod.bind(this))
    }
  }
  componentWillReceiveProps(nextProps){
    const {attributes: {checkInStart, checkInEnd}} = nextProps.fields
    this.setState({
      flagDifferentTime: !!checkInStart.value || !!checkInEnd.value
    })
  }
  exposedMethod(){
    let ret = {}
    const {handleSubmit, fields:{attributes:{description}}} = this.props
    let filtered = this.refs.description.editor.serialize().description.value
    if(filtered == '<p><br></p>' || filtered == '<p class="medium-insert-active"><br></p>'){
      ret.description = ''
    }else{
      ret.description = filtered
    }
    ret.tags = this.refs.tag.completeWriting()
    return ret
  }
  handleTypeChange(f, event) {
    const {value} = event.target
    const {attributes: {displayName}} = this.props.fields
    let convertString = (str) => {
      return str.toLowerCase().replace(/([^()\[\]\s-]+)/g, (m, m1, p)=>{
        if(m1 == 'ga' || m1 == 'rsvp' || m1 == 'vip' || m1 == 'bf')
          return m1.toUpperCase()
        else
          return m1.charAt(0).toUpperCase() + m1.slice(1)
      })
    }
    displayName[f](convertString(value))
  }
  handleMaxInventoryChange(f, event) {
    const {value} = event.target
    const {attributes: {maxInventory}} = this.props.fields
    maxInventory[f](parseInt(value, 10))
  }
  handleStockChange(f, event) {
    const {value} = event.target
    const {attributes: {stock}} = this.props.fields
    stock[f](parseInt(value, 10))
  }
  tagsChange(tags) {
    this.props.fields.attributes.tags.onChange(tags)
  }
  handleSubmit(f){    
    this.props.handleSubmit()
  }
  handleDifferentTime(e){
    this.setState({flagDifferentTime: e.target.checked})
  }
  render() {
    const {fields: {
      attributes: {
        displayName, stock, price, active, flagAlwaysAvailable, maxInventory,
        checkInStart, checkInEnd,
        flagHidden, quantityIncrement, description, tags
      }
    }, submitting, handleSubmit, submitLabel, onCancel, inModal, isEditing, event} = this.props
    const {flagDifferentTime} = this.state
    isInventoryMode = event.$original.inventoryMode == 'maximum'
    return (
        <form ref="form" method="POST">
          <div className="ticket-form">
            <div className="card-block">
              <div className="row">
                <div className="col-xs-12 col-sm-6">
                  <Field id="name" label="Ticket Name" {...displayName} onChange={e => this.handleTypeChange('onChange', e)}/>
                </div>
                <div className="col-xs-12 col-sm-6">
                  {isInventoryMode ? 
                    (<Field id="maxInventory" type="number" label="Maximum Number of Sales" {...maxInventory}
                    onBlur={e => this.handleMaxInventoryChange('onBlur', e)}
                    onChange={e => this.handleMaxInventoryChange('onChange', e)} />
                    )
                  :
                    (<Field id="stock" type="number" label="Stock" {...stock}
                    onBlur={e => this.handleStockChange('onBlur', e)}
                    onChange={e => this.handleStockChange('onChange', e)} />)
                  }
                </div>
                <div className="col-xs-12 col-sm-6">
                  <CurrencyField id="price" type="text" label="Price" disabled = {!!isEditing} {...price} />
                </div>
                <div className="col-xs-12 col-sm-6">
                  <div className={'form-group ' + (quantityIncrement.error ? 'has-error' : '')}>
                    <div className="floating-field-group active">
                      <div className="floating-field">
                        <label className="control-label" htmlFor="quantityIncrement">Must be bought in multiples of</label>
                        <select id="quantityIncrement" className="form-control" {...quantityIncrement}>
                          {_.map(range10, (e, i) => <option key={i} value={i + 1}>{i + 1}</option>)}
                        </select>
                      </div>
                    </div>
                    {!!quantityIncrement.error && <div className="help-block">{quantityIncrement.error}</div>}
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-xs-12" style={{paddingBottom:'5px'}}>
                  Description
                </div>
                <div className="col-xs-12">
                  <RichTextArea ref="description" id="description" label="" {...description} baseurl={process.env.ADMIN_CDN_URL}/>
                </div>
              </div>
              <div className="row">
                <div className="col-xs-6">
                  <div className="line-cell">
                    <div className="checkbox-switch">
                      <input type="checkbox" id="active" {...active}/>
                      <label htmlFor="active"></label>
                    </div>
                  </div>
                  <div className="line-cell">                          
                    <label htmlFor="active">Enabled</label>
                  </div>
                </div>
                <div className="col-xs-6">
                  <div className="line-cell">
                    <div className="checkbox-switch">
                      <input type="checkbox" id="flagHidden" {...flagHidden}/>
                      <label htmlFor="flagHidden"></label>
                    </div>
                  </div>
                  <div className="line-cell">
                    <label htmlFor="flagHidden">Hidden</label>                          
                  </div>
                </div>
                <div className="col-xs-12 col-sm-6">
                  <div className="line-cell">
                    <div className="checkbox-switch">
                      <input type="checkbox" id="flagAlwaysAvailable" {...flagAlwaysAvailable}/>
                      <label htmlFor="flagAlwaysAvailable"></label>
                    </div>
                  </div>
                  <div className="line-cell">
                    <label htmlFor="flagAlwaysAvailable">Always available</label>
                    <div className="checkbox-description-small">
                      This will ensure the ticket is always shown on the event page. Turning this on ignores the stock levels of preceding tickets
                    </div>
                  </div>
                </div>                
              </div>
              <div className="div-spacing-20"/>
              <div className="row">
                <div className="col-xs-6">
                  <div className="line-cell">
                    <div className="checkbox-switch">
                      <input type="checkbox" id="flagDifferentTime" defaultChecked={flagDifferentTime} checked={flagDifferentTime} onChange={::this.handleDifferentTime}/>
                      <label htmlFor="flagDifferentTime"></label>
                    </div>
                  </div>
                  <div className="line-cell">
                    <label htmlFor="flagDifferentTime">This ticket has different door times</label>  
                  </div>
                </div>
              </div>
              <div className="div-spacing-10"/>
              {flagDifferentTime &&
              <div className="row">              
                <div className="col-sm-6">
                  <DateTimePicker inModal={inModal} id="checkInStart" label="Doors open time (optional)" placeholder="D MMM YYYY H:M AM" {...checkInStart} />
                </div>
                <div className="col-sm-6">
                  <DateTimePicker inModal={inModal} id="checkInEnd" label="Last entry time (optional)" placeholder="D MMM YYYY H:M AM" {...checkInEnd} />
                </div>
              </div>
              }              
              <div className="row">
                <div className="col-xs-12" style={{paddingBottom:'5px'}}>
                  Enter tags that describe this ticket type and others like it e.g. 1-day, early bird, vip, comp
                </div>
                <div className="col-xs-12">
                  <TagsField ref='tag' value={tags.value} onChange={::this.tagsChange} />
                </div>
              </div>
              <div className="row">
                <div className="col-xs-12 text-center btn-toolbar">
                  <Button className="btn btn-success btn-lg btn-shadow" type="button" loading={submitting} onClick={::this.handleSubmit}>Save</Button>
                  {onCancel && <Button className="btn btn-cancel btn-lg btn-shadow" type="button" disabled={submitting} onClick={onCancel}>Cancel</Button>}                    
                </div>
              </div>
            </div>
          </div>
        </form>
    )
  }
}

