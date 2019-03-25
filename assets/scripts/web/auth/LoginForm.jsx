import _ from 'lodash'
import {reduxForm} from 'redux-form'
import React from 'react'
import Button from '../_library/Button'
import Field from '../_library/Field'

import {LOGIN, FACEBOOK_LOGIN} from '../../_common/redux/auth/actions'
import FacebookAuthButton from './FacebookAuthButton'

function validateLogin(data) {
  const required = [
    'attributes.username',
    'attributes.password',
  ]
  const errors = {}

  required.forEach(function(f) {
    if (!_.get(data, f)) {
      _.set(errors, f, 'Required')
    }
  })

  return errors
}

@reduxForm({
  form: 'login',
  fields: [
    'attributes.username',
    'attributes.password'
  ],
  validate: validateLogin,
})
export default class LoginForm extends React.Component {
  render() {
    const {submitting, error, fields: {attributes: {username, password}}, handleSubmit} = this.props
    return (
      <form onSubmit={handleSubmit}>
        <div className="login_holder">
          <div className="login_content clearfix">
            <div className="login_card">
              <div className="login_data">
                <div align="center" className="login_logo">
                  <img src={asset('/assets/resources/images/ttf-logo.png')} style={{width:80}}/>
                </div>
                <h2 className="heading">Log In</h2>
                <div className="form_holder">
                  {!!error && <div className="alert alert-danger">{error.details || error.title}</div>}
                  <Field label="Email" {...username} type="email" id="username" />
                  <Field label="Password" {...password} type="password" id="password" />                  
                  <div className="short_links clearfix">
                    { /* <input type="checkbox" className="remember_me" value="" />&nbsp;&nbsp;Remember Me */ }
                    { /* <a href="#" className="forgot_pass">Forgot Password? </a> */ }
                  </div>
                  <div className="text-center">
                    <Button type="submit" className="login_btn" loading={this.props.submitting}>Login</Button>
                  </div>
                  { /*<div className="social_login">
                    <a href="#" className="fb_hover"><i className="fa fa-facebook" aria-hidden="true"></i>Login with Facebook</a>
                  </div> */ }
                  <div className="copy_right">
                    Copyright &copy; 2018 THE<strong>TICKET</strong>FAIRY, Inc.
                  </div>
                </div>
              </div>
            </div>            
          </div>
        </div>
      </form>
    )
  }
}
