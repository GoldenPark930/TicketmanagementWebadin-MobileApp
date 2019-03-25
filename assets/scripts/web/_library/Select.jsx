import _ from 'lodash'
import React from 'react'

export default class Select extends React.Component {
  static propType = {
    label: React.PropTypes.string.isRequired,
    options: React.PropTypes.arrayOf(React.PropTypes.shape({
      value: React.PropTypes.any,
      label: React.PropTypes.string
    }))
  }

  render() {
    const {id, label, error, options, ...field} = this.props
    return (
      <div className={'form-group ' + (error ? 'has-error' : '')}>
        <div className="floating-field-group active">
          <div className="floating-field">
            <label className="control-label" htmlFor={id}>{label}</label>
            <select id={id} className="form-control" {...field}>
              {_.map(options, o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
        {!!error && field.touched && <div className="help-block">{error}</div>}
      </div>
    )
  }
}
