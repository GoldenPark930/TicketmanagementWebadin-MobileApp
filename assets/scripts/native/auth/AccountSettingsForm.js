import _ from 'lodash'
import {reduxForm} from '../router/redux-form'
import React from 'react'
import {connect} from 'react-redux'
import {Text,View} from 'react-native'
import {Button, Field, Panel} from '../../native/_library'

import session from '../../_common/redux/auth/actions'

function validateEmail(email) {
  let re = /^(([^<>()\[\]\\.,;:\s@']+(\.[^<>()\[\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(email)
}

function validate(data) {
  const errors = {}

  const required = [
    'attributes.email',
    'attributes.firstName',
    'attributes.lastName'
  ]
  required.forEach(function(f) {
    if (!_.get(data, f)) {
      _.set(errors, f, 'Required')
    }
  })

  if (!validateEmail(_.get(data, 'attributes.email'))) {
    _.set(errors, 'attributes.email', 'Invalid Email Address')
  }

  if (_.get(data, 'attributes.confirmEmail') !== _.get(data, 'attributes.email')) {
    _.set(errors, 'attributes.confirmEmail', 'Please confirm your email')
  }

  if (_.get(data, 'attributes.password') && _.get(data, 'attributes.password').length < 8) {
    _.set(errors, 'attributes.password', 'Password must be at least 8 characters')
  }

  if (_.get(data, 'attributes.confirmPassword') !== _.get(data, 'attributes.password')) {
    _.set(errors, 'attributes.confirmPassword', 'Please confirm your new password')
  }

  return errors
}

class AccountSettingsForm extends React.Component {

  constructor(props) {
    super(props)
    this.state = {}
  }

  componentDidMount() {
    const {
      user,
      fields: {
        attributes: {
          email, confirmEmail, firstName, lastName, password, confirmPassword
        }
      }
    } = this.props
    email.onChange(user.email)
    confirmEmail.onChange(user.email)
    firstName.onChange(user.firstName)
    lastName.onChange(user.lastName)
    password.onChange('')
    confirmPassword.onChange('')
  }

  render() {
    const {
      user, error, submitting, handleSubmit,
      fields: {
        attributes: {
          email, confirmEmail, firstName, lastName, password, confirmPassword
        }
      }
    } = this.props
    return (
      <View style={{marginTop:15}}>
        <Panel icon={'info'} title={'Account Settings'} >
          <Field label='First name' {...firstName} id='firstName' />
          <Field label='Last name' {...lastName} type='text' id='lastName' />
          <Field label='Email' {...email} type='email' id='email' />
          <Field label='Confirm Email' {...confirmEmail} type='email' id='confirmEmail' />
          <Text style={{marginTop:20, color:'#b6c5cf'}}>Leave password fields empty to keep your existing password.</Text>
          <Field label='Password' {...password} type='password' id='password'/>
          <Field label='Confirm Password' {...confirmPassword} id='confirmPassword' />
          <Button title='Update' loading={submitting} onPress={handleSubmit} style={{backgroundColor:'#396ba9', flexDirection:'row'}}/>
        </Panel>
      </View>
    )
  }
}export default reduxForm({
  form: 'account-settings',
  fields: [
    'attributes.email',
    'attributes.confirmEmail',
    'attributes.firstName',
    'attributes.lastName',
    'attributes.password',
    'attributes.confirmPassword',
  ],
  validate: validate,
})(AccountSettingsForm)
