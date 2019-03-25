import React from 'react'

import Button from '../_library/Button'
import * as fb from '../../_common/core/fb'

export default class FacebookAuthButton extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  handleFacebookAuth() {
    const handleError = this.props.onError || function(){}
    this.setState({loading: true})
    const onerror = (err) => {
      this.setState({loading: false})
      handleError(err)
    }
    fb.fetchSDK()
      .catch(onerror)
      .then(FB => {
        return new Promise((resolve) => {
          FB.getLoginStatus(function(auth) {
            resolve(auth)
          })
        })
        .catch(onerror)
        .then(auth => {
          if (auth.status !== 'connected') {
            return new Promise(resolve => FB.login(resolve))
          }
          return auth
        })
      })
      .catch(onerror)
      .then(auth => {
        if (auth.status === 'connected') {
          this.props.onTokenResponse(auth.authResponse)
        } else if (auth.status === 'not_authorized') {
          throw new Error('You have not authorized The Ticket Fairy to use your Facebook details.')
        } else {
          throw new Error('You did not successfully sign in to Facebook.')
        }
      })
      .catch(onerror)
  }
  render() {
    const {loading} = this.state
    const {children, ...props} = this.props
    return (
      <Button id='facebook-btn' lg bsStyle='darkblue' {...props} type="button" disabled={loading} onClick={::this.handleFacebookAuth}>
        {children}
      </Button>
    )
  }
}
