import _ from 'lodash'
import {reduxForm} from 'redux-form'
import React from 'react'

import Button from '../../_library/Button'
import Checkbox from '../../_library/Checkbox'
import CurrencyField from '../../_library/CurrencyField'
import Field from '../../_library/Field'
import RichTextArea from '../../_library/RichTextArea'

const intRE = /\d+/
const range10 = new Array(10)

let isInventoryMode = false

function validateAddon(data) {
  const errors = {}

  if (!_.get(data, 'attributes.name')){
    _.set(errors, 'attributes.name', 'Required')
  }

  if(!_.get(data, 'attributes.stockUnlimited')) {
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
  
  return errors
}

@reduxForm({
  form: 'editaddon',
  fields: [
    'attributes.name',
    'attributes.stock',
    'attributes.stockUnlimited',
    'attributes.price',
    'attributes.description',
    'attributes.active',
    'attributes.ticketTypeNeeded',
    'attributes.prerequisiteTicketTypeIds'
  ],
  validate: validateAddon,
  initialValues: {
    attributes: {
      active: true,
      prerequisiteTicketTypeIds: [],
      ticketTypeNeeded: true,
      stockUnlimited: true
    }
  }
})
export default class AddOnForm extends React.Component {
  componentDidMount(){
    if (typeof this.props.getExposedMethod === 'function') {
      this.props.getExposedMethod(this.exposedMethod.bind(this))
    }
  }
  exposedMethod(){
    let filtered = this.refs.description.editor.serialize().description_ao.value
    if(filtered == '<p><br></p>' || filtered == '<p class="medium-insert-active"><br></p>'){
      return ''
    }
    return filtered
  }
  handleStockChange(f, event) {
    const {value} = event.target
    const {attributes: {stock}} = this.props.fields
    stock[f](parseInt(value, 10))
  }
  isTicketTypePreRequired(tid) {
    let prtt = this.props.fields.attributes.prerequisiteTicketTypeIds.value || []
    return _.indexOf(prtt, tid) > -1
  }
  setTicketTypePreRequired(event, tid) {
    const {checked} = event.target
    const {attributes: {prerequisiteTicketTypeIds}} = this.props.fields
    let prtt = _.clone(prerequisiteTicketTypeIds.value) || []
    if(checked) {
      prtt.push(tid)
    } else {
      prtt.splice(prtt.indexOf(tid), 1)
    }
    prerequisiteTicketTypeIds['onChange'](prtt)
  }
  render() {
    const {fields: {
      attributes: {
        name, stock, price, description, active, prerequisiteTicketTypeIds, ticketTypeNeeded, stockUnlimited
      }
    }, submitting, handleSubmit, submitLabel, onCancel, isEditing, event, tickets} = this.props
    return (
        <form ref="form" method="POST" onSubmit={handleSubmit}>
          <div className="addon-form">
            <div className="card-block">
              <div className="row">
                <div className="col-xs-12 col-sm-6">
                  <Field id="name_ao" label="Name" {...name} />
                </div>
                <div className="col-xs-12 col-sm-6">
                  <CurrencyField id="price_ao" type="text" label="Price" disabled = {!!isEditing} {...price} />
                </div>
                <div className="col-xs-12 col-sm-6 form-group">
                  <div className="line-cell">
                    <div className="checkbox-switch">
                      <input type="checkbox" id="stock_unlimited_ao" {...stockUnlimited}/>
                      <label htmlFor="stock_unlimited_ao"></label>
                    </div>
                  </div>
                  <div className="line-cell line-cell1">                          
                    <label htmlFor="stock_unlimited_ao">Unlimited</label>
                  </div>
                </div>
                <div className="col-xs-12 col-sm-6">
                  { stockUnlimited && stockUnlimited.value===false &&
                    <Field id="stock_ao" type="number" label="Stock" {...stock}
                      onBlur={e => this.handleStockChange('onBlur', e)}
                      onChange={e => this.handleStockChange('onChange', e)} 
                    />
                  }
                </div>
              </div>
              <div className="row">
                <div className="col-xs-12">
                  Description
                </div>
                <div className="col-xs-12">
                  <RichTextArea ref="description" id="description_ao" label="" {...description} baseurl={process.env.ADMIN_CDN_URL}/>
                </div>
              </div>
              <div className="row">
                <div className="col-xs-6 form-group">
                  <div className="line-cell">
                    <div className="checkbox-switch">
                      <input type="checkbox" id="active_ao" {...active}/>
                      <label htmlFor="active_ao"></label>
                    </div>
                  </div>
                  <div className="line-cell line-cell1">                          
                    <label htmlFor="active_ao">Enabled</label>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-xs-12 form-group">
                  <div className="line-cell">
                    <div className="checkbox-switch">
                      <input type="checkbox" id="tickettype_ao" {...ticketTypeNeeded}/>
                      <label htmlFor="tickettype_ao"></label>
                    </div>
                  </div>
                  <div className="line-cell line-cell1">
                    <label htmlFor="tickettype_ao">Limit to Certain Ticket Types Only</label>
                  </div>
                </div>
                {ticketTypeNeeded.value && _.map(tickets, (t,idx) => (
                  <div key={idx} className="col-xs-6 col-sm-4 col-md-3 line">
                    <div className="line-cell">
                      <input
                        type="checkbox"
                        id={t.id}
                        name={t.id}
                        checked={prerequisiteTicketTypeIds && prerequisiteTicketTypeIds.value ? prerequisiteTicketTypeIds.value.includes(t.id) : false}
                        onChange={e=> this.setTicketTypePreRequired(e, t.id)}
                      />
                      <label htmlFor={t.id}></label>
                    </div>
                    <div className="line-cell" style={{paddingLeft: 10}}>
                      <label htmlFor={t.id}>{t.name}</label>
                    </div>
                  </div>
                ))}
              </div>
              <div className="row">
                <div className="col-xs-12 text-center btn-toolbar">
                  <Button className="btn btn-success btn-lg btn-shadow" type="submit" loading={submitting}>Save</Button>
                  {onCancel && <Button className="btn btn-cancel btn-lg btn-shadow" type="button" disabled={submitting} onClick={onCancel}>Cancel</Button>}                    
                </div>
              </div>
            </div>
          </div>
        </form>
    )
  }
}

