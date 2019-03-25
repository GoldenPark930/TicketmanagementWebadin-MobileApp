import {connect} from 'react-redux'
import React from 'react'
import {routeActions} from 'react-router-redux'
import {Link} from 'react-router'
import classNames from 'classnames'

import Notifications from '../_library/notifications/Notifications'
import {REGISTER, FACEBOOK_LOGIN} from '../../_common/redux/auth/actions'
import FacebookAuthButton from './FacebookAuthButton'
import SignupForm from './SignupForm'

@connect(
  (state) => {return {nextLocation: _.get(state, 'routing.location.query.next', '/')}},
  {REGISTER, FACEBOOK_LOGIN, push: routeActions.push}
)
export default class SignupPage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
    document.title = 'Signup - The Ticket Fairy Dashboard'
  }
  componentDidMount() {
    $('html').addClass('authentication')
  }
  componentWillUnmount() {
    $('html').removeClass('authentication')
  }
  handleSubmit(form) {
    const {REGISTER, push} = this.props
    return REGISTER(form)
      .catch((err) => {
        return Promise.reject(_.result(err, 'toFieldErrors', err))
      })
      .then(() => {
        push('/brands/new')
      })
  }

  handleFacebookToken(auth) {
    const {FACEBOOK_LOGIN, push, nextLocation} = this.props
    return FACEBOOK_LOGIN({attributes: auth})
      .then(res => {
        push(nextLocation)
        return res
      })
  }

  render() {
    const {fbLoading} = this.state
    const {loading} = this.props
    return (
      <Container id='auth-container' className='signup'>
        <Container id='auth-row'>
          <Container id='auth-cell'>
            <Grid>
              <Row>
                <Col sm={12}>
                  <Notifications />
                  <PanelContainer noControls>
                    <Panel>
                      <PanelBody style={{padding: 0}}>
                        <div className='text-center bg-darkblue fg-white'>
                          <h3 style={{margin: 0, padding: 25}}>Sign up</h3>
                        </div>
                        <div>
                          <div style={{padding: 25, paddingTop: 0, paddingBottom: 0, margin: 'auto', marginBottom: 25, marginTop: 25}}>
                            <SignupForm onSubmit={::this.handleSubmit} loading={loading} />
                          </div>
                          <div className='bg-hoverblue fg-black50 text-center' style={{padding: 25, paddingTop: 12.5}}>
                            <FacebookAuthButton onTokenResponse={::this.handleFacebookToken}>Sign in with Facebook</FacebookAuthButton>
                            <div style={{marginTop: 25}}>
                              Already have an account? <Link to='/signin'>Click here to sign in</Link>
                            </div>
                          </div>
                        </div>
                      </PanelBody>
                    </Panel>
                  </PanelContainer>
                </Col>
              </Row>
            </Grid>
          </Container>
        </Container>
      </Container>
    )
  }
}