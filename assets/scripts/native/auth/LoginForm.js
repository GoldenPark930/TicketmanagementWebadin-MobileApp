import React, { PropTypes, Component } from 'react'
import { ActivityIndicator,Image, Alert, TextInput, View, StatusBar, Text, TouchableOpacity} from 'react-native'
import {LoginStyle} from '../../native/styles'
import _, { isEqual } from 'lodash'
import LinearGradient from 'react-native-linear-gradient'
import {Field, reduxForm} from '../router/redux-form'
import {LOGIN, FACEBOOK_LOGIN} from '../../_common/redux/auth/actions'

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
class LoginForm extends Component {
    constructor(props, context) {
        super(props, context)

        this.state = {
            isLoading: false,
        }

        StatusBar.setHidden(false)

        this.grant_type = 'password'
        this.email = ''
        this.Password = ''
    }
    onEmail(email){
        this.setState({email:email.toLowerCase()})
    }
    render(){
        const {submitting, error, fields: {attributes: {username, password}}, handleSubmit, onLoading} = this.props
        return(
            <View style={LoginStyle.login}>
                <Image style={LoginStyle.login_logo} source={require('@nativeRes/images/ttf-logo.png')}/>
                <Text style={LoginStyle.login_text}>Log in</Text>
                <View style={{marginBottom:15}}>
                    <View style={LoginStyle.floating_field}>
                        <TextInput
                            ref='username'
                            {...username}
                            style={LoginStyle.floating_text}
                            onChangeText={(email) => this.onEmail(email)}
                            value={this.state.email}
                            placeholder='Email'
                            placeholderTextColor='#B6C5CF'
                            keyboardType={'email-address'}
                            returnKeyType='next'
                            onSubmitEditing={() => this.refs.password.focus()}
                            autoCorrect={false}
                        />
                    </View>
                    {username.error && username.touched? <View style={LoginStyle.error_field}><Text style={LoginStyle.error_text}>{username.error}</Text></View>:null}
                </View>
                <View style={{marginBottom:15}}>
                    <View style={LoginStyle.floating_field}>
                        <TextInput
                            ref='password'
                            {...password}
                            style={LoginStyle.floating_text}
                            onChangeText={(password) => this.setState({password})}
                            value={this.state.password}
                            secureTextEntry={true}
                            placeholder='Password'
                            placeholderTextColor='#B6C5CF'
                            keyboardType={'email-address'}
                            onSubmitEditing={handleSubmit}
                        />
                    </View>
                    {password.error && password.touched? <View style={LoginStyle.error_field}><Text style={LoginStyle.error_text}>{password.error}</Text></View>:null}
                </View>
                <View style={{height:144, alignItems:'center'}}>
                    <TouchableOpacity onPress={handleSubmit}>
                        <LinearGradient colors={['#fcbc45', '#f7565e']} style={LoginStyle.linearGradient}>
                          {onLoading ?
                                <ActivityIndicator
                                  animating={true}
                                  size='small'
                                  color='white'
                                />:<Text style={LoginStyle.login_button_text}>LOGIN</Text>
                          }
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
                <Text style={LoginStyle.footer_bar}>Copyright © 2018 THE<Text style={[LoginStyle.footer_bar,{fontWeight:'500'}]}>TICKET</Text>FAIRY.com</Text>
            </View>
        )
    }
}
export default reduxForm({
    form: 'login',
    fields: [
        'attributes.username',
        'attributes.password'
    ],
    validate: validateLogin,
})(LoginForm)
