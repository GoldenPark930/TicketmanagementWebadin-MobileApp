import React from 'react'
import moment from 'moment-timezone'

export default class DateLabel extends React.Component {
  render() {
    const {value, tz, format} = this.props
    let formatted = moment(value)
    if (tz) { formatted = formatted.tz(tz) }
    formatted = formatted.format(format || 'LLL')
    return (
      <div className={this.props.className}>{formatted}</div>
    )
  }
}
