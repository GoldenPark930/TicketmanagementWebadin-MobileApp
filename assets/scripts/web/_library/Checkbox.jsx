import React from 'react'

export default class Checkbox extends React.Component {
  static propTypes = {
    id: React.PropTypes.string.isRequired,
    onText: React.PropTypes.string,
    offText: React.PropTypes.string
  }
  render() {
    const {id, children, offText, onText, ...attr} = this.props
    const off = offText || 'off'
    const on = onText || 'on'

    return (
      <div className="toggle-group">
        <small className="toggle-label">{off}</small>
        <input id={id} type="checkbox" className="toggle-input" {...attr} />
        <div className="toggle-control"></div>
        <small className="toggle-label">{on}</small>
      </div>
    )
  }
}
