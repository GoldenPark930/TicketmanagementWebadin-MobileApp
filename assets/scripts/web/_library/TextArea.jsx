import classNames from 'classnames'
import React from 'react'

export default class TextArea extends React.Component {
  static propType = {
    field: React.PropTypes.object.isRequired,
    label: React.PropTypes.string.isRequired,
  }

  constructor(props) {
    super(props)
    this.state = {}
  }
  handleFocus(e) {
    this.setState({focused: true})
    if (this.props.onFocus) { this.props.onFocus(e) }
  }
  handleBlur(e) {
    this.setState({focused: false})
    if (this.props.onBlur) { this.props.onBlur(e) }
  }
  render() {
    const {field, label, hint, className, ...input} = this.props
    const hasValue = this.refs.input && this.refs.input.value
    //const hasError = field.error && field.touched
    const {error, touched} = input
    const hasError = error && touched
    const groupClass = classNames(
      className,
      'form-group',
      hasError ? 'has-error' : ''
    )
    const labelClass = classNames(
      'control-label',
      this.state.focused || hasValue ? 'active' : ''
    )
    let props = {
      className: 'form-control',
      ...input,
      ...field
    }
    let descriptors = []

    let errorNode
    let errorNodeId = input.id ? `${input.id}_error` : ''
    if (hasError) {
      errorNodeId && descriptors.push(errorNodeId)
      errorNode = <span id={errorNodeId} className="help-block">{error}</span>
    }

    let hintNode
    let hintNodeId = input.id ? `${input.id}_hint` : ''
    if (hint) {
      hintNode = <small id={hintNodeId} className="hint">{hint}</small>
    }

    if (descriptors.length) { props['aria-describedby'] = descriptors.join(' ') }

    return (
      <div className={groupClass}>
        <label htmlFor={props.id} className={labelClass}>{label} <span className="fa fa-fw fa-pencil" /> {hintNode}</label>
        <textarea {...props} onFocus={::this.handleFocus} onBlur={::this.handleBlur} ref="input" />
        {errorNode}
      </div>
    )
  }
}

