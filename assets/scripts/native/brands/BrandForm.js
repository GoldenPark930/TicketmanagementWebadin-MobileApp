import _ from 'lodash'
import React, {
    Component, PropTypes
} from 'react'
import {reduxForm} from '../router/redux-form'

import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Image,
    TextInput,
    ListView,
    Picker,
    TouchableWithoutFeedback
} from 'react-native'

import {AutoSlugField, DateTimePickera, RichTextArea, FileUploader, Field, Switch, Button, Panel, Select, TagsField, Dialog} from '../_library'
import {newbrand} from '../styles'

const countries = [
  {'id':'', 'value':'Select Country'},
  {'id':'us', 'value':'United States'},
  {'id':'uk', 'value':'United Kingdom'},
  {'id':'au', 'value':'Australia'},
  {'id':'nz', 'value':'New Zealand'},
]
function validateBrand(data) {
  const required = [
    'attributes.displayName',
    'attributes.slug',
    'attributes.legalEntity',
    'attributes.addressLine1',
    'attributes.city',
    'attributes.state',
    'attributes.zip',
    'attributes.country',
    'attributes.accountName',
    'attributes.accountNumber',
  ]
  const errors = {}

  required.forEach(function(f) {
    if (!_.get(data, f)) {
      _.set(errors, f, 'Required')
    }
  })
  return errors
}

class BrandForm extends Component {

     render() {
         const {submitting, onCancel, handleSubmit,
           fields: {attributes: {displayName, slug,legalEntity, addressLine1, addressLine2, city, state, zip, country, taxID,
             accountName, accountNumber, routingNumber, bsb, sortCode}},
           submitLabel, initialValues} = this.props
         const state1 = this.props.fields.attributes.state
        return (
            <View>
                <Panel title='Brand Details' icon='info' style={{marginBottom:30}}>
                  <Field id='displayName' label='Name' {...displayName} />
                  <AutoSlugField id='slug' label='Link URL' {...slug} separator='-'
                                 hint='Letters, numbers and hyphens only'
                                 suggestion={displayName.value}/>
                </Panel>

                <Panel title='Business Details' icon='briefcase' style={{marginBottom:30}}>
                  <Field id='legalEntity' label='Legal Entity Name' {...legalEntity} />
                  <Field id='addressLine1' label='Address (Line 1)' {...addressLine1} />
                  <Field id='addressLine2' label='Address (Line 2)' {...addressLine2} />
                  <Field id='city' label='City' {...city} />
                  <Field id='state' label='State' {...state1} />
                  <Field id='zip' label='Zip/Postcode' {...zip} />
                  <Field id='taxID' label='GST/VAT Number' {...taxID} />
                  <Select
                    label='Brand'
                    options={countries.map((o)=>({value:o.id,label:o.value}))}
                    {...country}
                    defaultValue = 'Select Country'
                  />
                </Panel>

                <Panel title='Payout Details' icon='money'>
                  <Field id='accountName' label='Account Name' {...accountName} />
                  <Field id='accountNumber' label='Account Number' {...accountNumber} />
                  {!!country && country.value == 'us' &&
                    <Field id='routingNumber' label='Routing Number' {...routingNumber} />
                  }
                  {!!country && country.value == 'au' &&
                    <Field id='BSB' label='BSB' {...bsb} />}
                  {!!country && country.value == 'uk' &&
                    <Field id='sortCode' label='Sort Code' {...sortCode} />}
                  </Panel>
                  <View style={{alignItems:'center', paddingVertical:30}}>
                    {onCancel && <Button loading={submitting} title={'Cancel'} onPress={onCancel}/>}
                    <Button loading={submitting} title={submitLabel} onPress={handleSubmit} style={{backgroundColor:'#396ba9'}}/>
                  </View>
            </View>
        )
    }
}export default reduxForm({
  form: 'brand',
  fields: [
    'attributes.displayName',
    'attributes.slug',
    'attributes.legalEntity',
    'attributes.addressLine1',
    'attributes.addressLine2',
    'attributes.city',
    'attributes.state',
    'attributes.zip',
    'attributes.country',
    'attributes.taxID',
    'attributes.accountName',
    'attributes.accountNumber',
    'attributes.routingNumber',
    'attributes.bsb',
    'attributes.sortCode',
  ],
  validate: validateBrand
})(BrandForm)
