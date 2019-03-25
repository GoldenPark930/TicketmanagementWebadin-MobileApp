import React from 'react'
import moment from 'moment-timezone'
import {
    Text,
} from 'react-native'
class DateLabel extends React.Component {
    render() {
        const {value, tz, format} = this.props
        let formatted = moment(value)
        if (tz) { formatted = formatted.tz(tz) }
        formatted = formatted.format(format || 'LLL')
        return (
            <Text style={this.props.className}>{formatted}</Text>
        )
    }
}export default DateLabel
