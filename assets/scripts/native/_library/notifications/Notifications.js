import _ from 'lodash'
import {connect} from 'react-redux'
import React, { PropTypes, Component } from 'react'
import {View, Text} from 'react-native'

import {DISMISS} from '../../../_common/redux/notification/actions'
import Notification from './Notification'
import {LoginStyle} from 'AppStyles'

class Notifications extends Component {
    render() {
        const {notifications, DISMISS} = this.props
        const nodes = _.map(notifications, ({id, level, message}) => {
            return <Notification key={id} level={level} message={message} onClose={() => DISMISS(id)} />
        })
        return (
            <View style={LoginStyle.alert}>
                {nodes}
            </View>
        )
    }
}
export default connect(({notifications}) => ({notifications: notifications.toList().toJS()}),{DISMISS})(Notifications)
