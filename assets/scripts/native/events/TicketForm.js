import _ from 'lodash'
import {reduxForm} from '../router/redux-form'
import React from 'react'
import {View, TextInput} from 'react-native'
import {commonStyle, menu} from '../../native/styles'
import {TextField, NumberField, CurrencyField, Switch, Button, Select, TextArea} from '../_library'

const intRE = /\d+/

const options_quantity = _.map(new Array(10), (e, i) => {
    return {value: i + 1, label: i + 1}
})
let isInventoryMode = false
function validateTicket(data) {
    const required = [
        'attributes.displayName',
    ]
    const errors = {}

    if (!_.get(data, 'attributes.displayName')) {
        _.set(errors, 'attributes.displayName', 'Required')
    }

    const rawstock = _.get(data, 'attributes.stock')
    const stock = parseInt(rawstock, 10)
    if (!intRE.test(rawstock) || _.isNaN(stock) || stock < 0) {
        _.set(errors, 'attributes.stock', 'Value must be greater than or equal to 0')
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

    return errors
}


class TicketForm extends React.Component {
    componentDidMount() {
        if (typeof this.props.getExposedMethod === 'function') {
            this.props.getExposedMethod(this.exposedMethod.bind(this))
        }
    }

    exposedMethod() {return ''
        const {handleSubmit, fields: {attributes: {description}}} = this.props
        let filtered = this.refs.description.editor.serialize().description.value
        if (filtered == '<p><br></p>' || filtered == '<p class="medium-insert-active"><br></p>') {
            return ''
        }
        return filtered
    }

    handleStockChange(f, event) {
      const {value} = event.target
      const {attributes: {stock}} = this.props.fields
      stock[f](parseInt(value, 10))
    }
    handleMaxInventoryChange(f, event) {
      const {value} = event.target
      const {attributes: {maxInventory}} = this.props.fields
      maxInventory[f](parseInt(value, 10))
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
    render() {
        const {
            fields: {
                attributes: {
                    displayName, stock, price, active, flagAlwaysAvailable, maxInventory,
                    flagHidden, quantityIncrement, description,
                }
            }, submitting, handleSubmit, submitLabel, onCancel, inModal, isEditing, event
        } = this.props
        return (
            <View>
                <View style={commonStyle.rowContainer}>
                    <TextField label="Ticket Name" {...displayName} onChange={e => this.handleTypeChange('onChange', e)}/>
                    <NumberField label="Stock" {...stock}/>
                </View>
                <View style={commonStyle.rowContainer}>
                    <CurrencyField label="Price" disabled = {!!isEditing} {...price}/>
                    <Select label="Must be bought in multiples of" options={options_quantity} {...quantityIncrement} />
                </View>
                <View style={commonStyle.rowContainer}>
                    <TextArea ref="description" label="Description" placeholder="Enter some text and select it for styling options" {...description}/>
                </View>
                <View style={commonStyle.rowContainer}>
                    <Switch label="Hidden" {...flagHidden}/>
                </View>
                <View style={commonStyle.rowContainer}><Switch label="Enabled" {...active}/></View>
                <View style={commonStyle.rowContainer}>
                    <Switch label="Always available"
                            description="This will ensure the ticket is always shown on the event page. Turning this on ignores the stock levels of preceding tickets" {...flagAlwaysAvailable}/>
                    <View style={{flex: 1}}/>
                </View>
                <View style={[commonStyle.rowContainer,{justifyContent:'center'}]}>
                    <Button title="Save" loading={submitting} onPress={handleSubmit}/>
                    {onCancel && <Button style={commonStyle.buttonSecondary} title="Cancel" disabled={submitting} onPress={onCancel}/>}
                </View>
            </View>
        )
    }
}

export default reduxForm({
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
})(TicketForm)
