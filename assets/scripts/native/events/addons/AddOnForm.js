import _ from 'lodash'
import {reduxForm} from 'redux-form'
import React from 'react'
import {View, Text} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import {TextField, RichTextArea, Button, CurrencyField, Switch} from '../../_library'

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

class AddOnForm extends React.Component {
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
    console.warn(description)
    return (
      <View>
        <View style={{width: '100%', padding: 10}}>
            <View style={{width: '100%'}}>
                <View style={{height: 70}}>
                  <TextField id="name_ao" label="Name" {...name} />
                </View>
                <View style={{height: 70}}>
                  <CurrencyField id="price_ao" type="text" label="Price" disabled = {!!isEditing} {...price} />
                </View>
                <View style={{height: 35}}>
                  <Switch
                    label = 'Unlimited'
                    {...stockUnlimited} />
                </View>
            </View>
            <View style={{height: '40%'}}>
              <Text style={{color: '#B6C5CF', fontSize: 14, }}>Description</Text>
              <RichTextArea ref="description" id="description_ao" disableEmbeds={true} {...description} aseurl={process.env.ADMIN_CDN_URL} />
            </View>
            <View style={{height: 35, justifyContent: 'center'}}>
              <Switch
                label = 'Enabled'
                {...active} />
            </View>
            <View style={{height: 50}}>
              <Switch
                label = 'Limit to Certain Ticket Types Only'
                {...ticketTypeNeeded} />
            </View>

              {/*{ticketTypeNeeded.value && _.map(tickets, (t,idx) => (*/}
                {/*<div key={idx} className="col-xs-6 col-sm-4 col-md-3 line">*/}
                  {/*<div className="line-cell">*/}
                    {/*<input*/}
                      {/*type="checkbox"*/}
                      {/*id={t.id}*/}
                      {/*name={t.id}*/}
                      {/*checked={prerequisiteTicketTypeIds && prerequisiteTicketTypeIds.value ? prerequisiteTicketTypeIds.value.includes(t.id) : false}*/}
                      {/*onChange={e=> this.setTicketTypePreRequired(e, t.id)}*/}
                    {/*/>*/}
                    {/*<label htmlFor={t.id}></label>*/}
                  {/*</div>*/}
                  {/*<div className="line-cell" style={{paddingLeft: 10}}>*/}
                    {/*<label htmlFor={t.id}>{t.name}</label>*/}
                  {/*</div>*/}
                {/*</div>*/}
              {/*))}*/}
            {/*</div>*/}
            <View style={{flexDirection:'row', justifyContent: 'center'}}>
                <Button style={{backgroundColor: '#25b998'}} loading={submitting} title='Save' onPress={handleSubmit}/>
                {onCancel && <Button type="button" style={{backgroundColor: '#798284'}} disabled={submitting} onPress={onCancel} title='Cancel' />}
            </View>
        </View>
      </View>
    )
  }
}export default reduxForm({
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
})(AddOnForm)

