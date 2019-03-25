import React from 'react'
import {reduxForm} from 'redux-form'

import Button from '../_library/Button'
import Field from '../_library/Field'
import Select from '../_library/Select'
import Card from '../_library/Card'

const providers = [
  {value: 'stripe', label: 'Stripe'},
  {value: 'spreedly', label: 'Spreedly'}
]

@reduxForm({
  form: 'paymentmethod',
  fields: [
    'attributes.displayName',
    'attributes.type',
    'attributes.key'
  ]
})
export default class PaymentMethodForm extends React.Component {
  render() {
    const {
      fields: {
        attributes: {
          displayName, type, key
        }
      }, submitting, submitLabel, handleSubmit, onCancel
    } = this.props
    return (
      <form onSubmit={handleSubmit}>
        <Card title={' '}>
          <Select
            id="type"
            label="Payment method provider"
            options={providers}
            {...type} />
          <Field id="displayName" label="Name" {...displayName} />
          <Field id="key" label="Key" {...key} />
        </Card>
        <div className="card-block">
          <Button className="btn btn-primary" type="submit" loading={submitting}>{submitLabel || 'Submit'}</Button>
          {onCancel && <Button className="btn btn-link" type="button" loading={submitting} onClick={onCancel}>Cancel</Button>}
        </div>
      </form>
    )
  }
}
