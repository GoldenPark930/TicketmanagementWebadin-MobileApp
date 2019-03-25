import React from 'react'

export default class Radios extends React.Component {
  static propTypes = {
    options: React.PropTypes.arrayOf(React.PropTypes.shape({
      label1: React.PropTypes.string.isRequired,
      label2: React.PropTypes.string.isRequired,
      label3: React.PropTypes.string.isRequired,
      value: React.PropTypes.string.isRequired
    })).isRequired
  }
  render() {
    const {children, label, label1, id, options, ...field} = this.props
    return (
      <div className="form-group">
        {!!label && 
          <div className="ticket-radio-title">
            <div className="label1">{label}</div>
            <div className="label2"><i className="fa fa-info-circle"/>{label1}</div>
          </div>
        }
        <div className="radios">
          {(options || []).map((o, i) => <RadiosOption key={i} field={field} id={`${id}_${i}`} label1={o.label1} label2={o.label2} label3={o.label3} value={o.value} />)}
        </div>
        <div className="form-group-addons">
          {children}
        </div>
      </div>
    )
  }
}

class RadiosOption extends React.Component {
  render() {
    const {id, label1, label2, label3, value, field} = this.props
    const checked = field.value && (value === field.value)
    return (
      <div className="radio">
        <input id={id} type="radio" {...field} value={value} checked={checked}/>
        <label htmlFor={id}>
          <div className="ticket-radio-icon"><i className="fa fa-fw fa-check-circle"/></div>
          <div className="ticket-radio-label1">{label1}</div>
          <div className="ticket-radio-label2">{label2}</div>
          <div className="ticket-radio-label3">{label3}</div>
        </label>
      </div>
    )
  }
}
