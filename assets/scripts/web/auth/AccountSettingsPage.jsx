import _ from 'lodash'
import {reduxForm} from 'redux-form'
import React from 'react'
import {connect} from 'react-redux'
import Button from '../_library/Button'
import Field from '../_library/Field'
import Card from '../_library/Card'
import {UPDATE} from '../../_common/redux/auth/actions'

function validateEmail(email) {
  let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
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

@reduxForm({
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
})
class AccountSettingsForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
    document.title = 'Account Settings - The Ticket Fairy Dashboard'
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
      <form onSubmit={handleSubmit}>
        <Card icon={'fa-info'} title={'Account Settings'}>
          {!!error && <div className="row">
            <div className="col-xs-12">
              <div className="alert alert-danger">{error}</div>
            </div>
          </div>}
          <div className="row">
            <div className="col-sm-6 col-xs-12">
              <Field label="First name" {...firstName} type="text" id="firstName" />
            </div>
            <div className="col-sm-6 col-xs-12">
              <Field label="Last name" {...lastName} type="text" id="lastName" />
            </div>
          </div>
          <div className="row">
            <div className="col-sm-6 col-xs-12">
              <Field label="Email" {...email} type="email" id="email" hint="This will be your username" />
            </div>
            <div className="col-sm-6 col-xs-12">
              <Field label="Confirm Email" {...confirmEmail} type="email" id="confirmEmail" hint="This will be your username" />
            </div>
          </div>
          <p>Leave password fields empty to keep your existing password.</p>
          <div className="row">
            <div className="col-sm-6 col-xs-12">
              <Field label="Password" {...password} type="password" id="password" hint="Must be at least 8 characters"/>
            </div>
            <div className="col-sm-6 col-xs-12">
              <Field label="Confirm Password" {...confirmPassword} type="password" id="confirmPassword" />
            </div>
          </div>
          <div className="row">
            <div className="col-xs-12">
              <Button type="submit" className="btn btn-primary btn-shadow" loading={submitting}>Update</Button>
            </div>
          </div>
        </Card>
      </form>
    )
  }
}

@connect(
  (state) => {
    const u = state.auth.get('user')
    return {
      user: u ? u.toJS() : null
    }
  },
  {UPDATE}
)
export default class AccountSettingsPage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
    document.title = 'Account Settings - The Ticket Fairy Dashboard'
  }

  componentDidMount() {
    Messenger.options = {
      extraClasses: 'messenger-fixed messenger-on-bottom messenger-on-right',
      theme: 'future'
    }
  }

  handleSubmit(form) {
    if(!form.attributes.password || form.attributes.password=='') {
      delete form.attributes.password
      delete form.attributes.confirmPassword
    }
    delete form.attributes.confirmEmail

    const {UPDATE} = this.props
    return UPDATE(form)
      .catch((err) => {
        Messenger().post({
          type: 'error',
          message: err,
          hideAfter: 3,
          showCloseButton: true
        })
        return Promise.reject(_.result(err, 'toFieldErrors', err))
      })
      .then((v) => {
        Messenger().post({
          type: 'success',
          message: 'Successfully updated!',
          hideAfter: 3,
          showCloseButton: true
        })
        return v
      })
  }

  render() {
    const {user} = this.props

    return (
      <div className='body-main'>
        <div className='body-panel-header'>
          <div className='left'>
            <div className='title'>Account Settings</div>
          </div>
          <div className='right'>
          </div>
        </div>
        <div className='body-panel-spacing'/>
        <div className='body-panel-content'>
          <AccountSettingsForm user={user} onSubmit={::this.handleSubmit} />
        </div>
      </div>
    )
  }
}