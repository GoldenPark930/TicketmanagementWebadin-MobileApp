import _ from 'lodash'
import {connect} from 'react-redux'
import React, { PropTypes, Component } from 'react'
import {View, Text, TouchableOpacity} from 'react-native'
import {LoginStyle} from 'AppStyles'

export default function Notification(props) {
        const {onClose, level, message} = props

        return(
            <View style={LoginStyle.alert_danger}>
                {message.title && <Text style={LoginStyle.alert_title}>
                    {message.title}
                </Text>}
                {message.details && <Text style={LoginStyle.alert_detail}>{message.details}</Text>}
                <TouchableOpacity
                    style={LoginStyle.alert_button}
                    onPress={onClose}>
                    <Text style={LoginStyle.alert_buttonText}>x</Text>
                </TouchableOpacity>
            </View>
        )
}