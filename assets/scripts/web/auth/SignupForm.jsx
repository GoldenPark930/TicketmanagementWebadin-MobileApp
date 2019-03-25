import _ from 'lodash'
import {reduxForm} from 'redux-form'
import React from 'react'
import Button from '../_library/Button'
import Field from '../_library/Field'

function validateSignup(data) {
  const required = [
    'attributes.email',
    'attributes.firstName',
    'attributes.lastName',
    'attributes.password',
    'attributes.confirmPassword',
  ]
  const errors = {}

  if (_.get(data, 'attributes.confirmPassword') !== _.get(data, 'attributes.password')) {
    _.set(errors, 'attributes.confirmPassword', 'The value must match your password')
  }

  required.forEach(function(f) {
    if (!_.get(data, f)) {
      _.set(errors, f, 'Required')
    }
  })

  return errors
}

@reduxForm({
  form: 'signup',
  fields: [
    'attributes.email',
    'attributes.firstName',
    'attributes.lastName',
    'attributes.password',
    'attributes.confirmPassword',
  ],
  validate: validateSignup,
})
export default class SignupForm extends React.Component {
  static propTypes = {
    fields: React.PropTypes.object.isRequired,
    handleSubmit: React.PropTypes.func.isRequired,
  }

  render() {
    const {
      error, submitting, handleSubmit,
      fields: {
        attributes: {
          email, firstName, lastName, password, confirmPassword
        }
      }
    } = this.props

    return (
      <form className="container-fluid" onSubmit={handleSubmit}>
        {!!error && <div className="row">
          <div className="col-xs-12">
            <div className="alert alert-danger">{error}</div>
          </div>
        </div>}
        <div className="row">
          <div className="col-md-6">
            <Field label="First name" {...firstName} type="text" id="firstName" />
          </div>
          <div className="col-md-6">
            <Field label="Last name" {...lastName} type="text" id="lastName" />
          </div>
        </div>
        <Field label="Email" {...email} type="email" id="email" hint="This will be your username" />
        <Field label="Password" {...password} type="password" id="password" hint="Must be at least 8 characters"/>
        <Field label="Confirm Password" {...confirmPassword} type="password" id="confirmPassword" />
        <Button type="submit" className="btn btn-primary btn-block" loading={submitting}>Submit</Button>
      </form>
    )
  }
}

