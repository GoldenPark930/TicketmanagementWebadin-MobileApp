import React, { PropTypes, Component } from 'react'
import {connect} from 'react-redux'
import {routeActions} from 'react-router-redux'
import {ActivityIndicator,Image, Alert, TextInput, View, StatusBar, Text, TouchableOpacity} from 'react-native'
import {LoginStyle} from '../../native/styles'
import session from '../../_common/redux/auth/actions'
import {Notifications} from '../_library'

import _ from 'lodash'
import Video from 'react-native-video'

import LoginForm from './LoginForm'
import KeyboardSpacer from 'react-native-keyboard-spacer'
class LoginPage extends Component {
    static propTypes = {
        // pushScene: PropTypes.func.isRequired,
    };
    constructor(props, context) {
        super(props, context)

        this.state = {
            isLoading: false,
        }

        StatusBar.setHidden(true)
    }
    handleSubmit = (form) => {
      this.setState({isLoading:true})
      const {LOGIN, push, nextLocation} = this.props
      return Promise.resolve(LOGIN(form))
          .catch((err) => {
              this.setState({isLoading:false})
              return Promise.reject(_.result(err, 'toFieldErrors'))
          })
          .then((v) => {
              this.setState({isLoading:false})
              push(nextLocation)
              return v
          })
    }
    render() {
        return (
            <View style={LoginStyle.container}>
                <Video
                    source={require('@nativeRes/images/login/bg.mp4')}   // Can be a URL or a local file.
                    ref={(ref) => {
                       this.player = ref
                    }}                                      // Store reference
                    rate={1.0}                              // 0 is paused, 1 is normal.
                    volume={1.0}                            // 0 is muted, 1 is normal.
                    muted={false}                           // Mutes the audio entirely.
                    paused={false}                          // Pauses playback entirely.
                    resizeMode='cover'                      // Fill the whole screen at aspect ratio.*
                    repeat={true}                           // Repeat forever.
                    playInBackground={false}                 // Audio continues to play when app entering background.
                    playWhenInactive={false}                // [iOS] Video continues to play when control or notification center are shown.
                    progressUpdateInterval={250.0}          // [iOS] Interval to fire onProgress (default to ~250ms)
                    style={LoginStyle.video} />

                <View style={LoginStyle.loginContainer}>
                    <LoginForm
                        onSubmit = {(form)=>this.handleSubmit(form)}
                        onLoading = {this.state.isLoading}
                    />
                    <KeyboardSpacer/>
                </View>
                <Notifications/>
            </View>
        )
    }
}

export default connect((state) => {return {nextLocation: _.get(state, 'routing.location.query.next', '/events')}},{LOGIN:session.LOGIN, FACEBOOK_LOGIN:session.FACEBOOK_LOGIN,push: routeActions.push, replace: routeActions.replace})(LoginPage)
