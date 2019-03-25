import React from 'react'

export default class Checkbox2 extends React.Component {
  static propTypes = {
    id: React.PropTypes.string.isRequired,
    label: React.PropTypes.string
  }
  render() {
    const {id, label} = this.props

    return (
      <div className="checkbox2">
        <input type="checkbox" id={id} className="checkbox2-check" />
        <label htmlFor={id} className="checkbox2-tick">
          <span className="checkbox2-tick-circle"></span>
          <span className="checkbox2-tick-label">{label}</span>
        </label>
      </div>
    )
  }
}
