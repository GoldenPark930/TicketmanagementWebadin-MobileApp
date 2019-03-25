import classNames from 'classnames'
import moment from 'moment-timezone'
import React from 'react'
import Rome from 'rome'

import Field from './Field'

export default class DateTimePicker extends React.Component {
  static propType = {
    label: React.PropTypes.string.isRequired,
    size: React.PropTypes.oneOf(['small', 'normal', 'large']),
    inModal: React.PropTypes.bool,
  }

  constructor(props) {
    super(props)
    this.state = {}
    this.pickerHandler = this.handleSelect.bind(this)
    this.romeDefaults = {
      autoClose: 'time',
      inputFormat: 'D MMM YYYY h:mm a',
      timeFormat: 'h:mm a',
      strictParse: true,
      styles: {
        container: `card rd-container box_shadow_show ${props.inModal ? 'rd-in-modal' : ''}`,
        date: 'card-block',
        time: 'card-block',
        selectedDay: 'rd-day-selected',
        selectedTime: 'btn btn-default btn-block btn-shadow btn-nocapitalize',
        timeList: 'card rd-time-list',
        timeOption: 'rd-time-option'
      }
    }
  }
  componentDidMount() {
    this.attachRome()
    this.updateValueWithSuggestion(this.props)
  }
  componentWillUnmount() {
    if (this.rome) { this.rome.destroy() }
  }
  componentWillReceiveProps(nextProps) {
    if(nextProps.loadingFromFB && this.props.value != nextProps.value && nextProps.value != null){
      this.updateValue(nextProps)
      return
    }
    const current = this.props.suggestion
    const next = nextProps.suggestion
    if (current === next) { return }
    this.updateValueWithSuggestion(nextProps)
  }
  attachRome() {    
    const {initialValue} = this.props
    this.rome = Rome(this.refs.input, {
      ...this.romeDefaults,
      initialValue: initialValue ? moment.utc(initialValue) : null
    })
    this.rome.on('data', this.pickerHandler)
  }
  updateValue(props) {
    const {value, onChange} = props
    if (!value) { return }
    this.rome.options({...this.romeDefaults, initialValue: moment.utc(value)})
    this.attachRome()
  }
  updateValueWithSuggestion(props) {
    const {initialValue, onChange} = props
    const {suggestion} = props
    const {edited} = this.state
    if (edited || initialValue || !suggestion) { return }
    this.rome.options({...this.romeDefaults, initialValue: moment.utc(suggestion)})
    this.attachRome()
    if (onChange) { onChange(suggestion) }
  }
  handleFocus(e) {
    this.setState({focused: true})
  }
  handleBlur(e) {
    this.setState({focused: false})
  }
  handleSelect() {
    const {onChange} = this.props
    this.setState({edited: true})
    if (!this.rome || !onChange) { return }
    const d = this.rome.getDate()
    const m = moment.utc([
      d.getFullYear(), d.getMonth(), d.getDate(),
      d.getHours(), d.getMinutes(), 0, 0
    ])
    onChange(m.toISOString())
  }
  render() {
    const {label, loading, size, hint, children, className, placeholder, id, ...input} = this.props
    const {error, touched} = input
    const hasError = error && touched
    const value = input.value || ''
    const active = this.state.focused || placeholder || value || (this.refs.input && this.refs.input.value)
    const before = []
    const after = []
    const rest = []

    React.Children.forEach(children, (c) => {
      if (!React.isValidElement(c)) {
        rest.push(c)
      } else if (c.type === Field.PrefixButton) {
        before.push(c)
      } else if (c.type === Field.SuffixButton) {
        after.push(c)
      } else {
        rest.push(c)
      }
    })

    const formGroupClass = classNames(
      'form-group',
      size === 'small' ? 'form-group-sm' : '',
      size === 'large' ? 'form-group-lg' : '',
      hasError ? 'has-error' : '',
    )
    const fieldClass = classNames(
      className, 'floating-field-group',
      loading ? 'loading' : '',
      active ? 'active' : ''
    )
    let {loadingFromFB, suggestion, ...props} = input
    let descriptors = []

    let errorNode
    let errorNodeId = id ? `${id}_error` : ''
    if (hasError) {
      errorNodeId && descriptors.push(errorNodeId)
      errorNode = <div id={errorNodeId} className="help-block">{error}</div>
    }

    let hintNode
    let hintNodeId = id ? `${input.id}_hint` : ''
    if (hint) {
      hintNode = <small id={hintNodeId} className="hint">{hint}</small>
    }

    if (descriptors.length) { props['aria-describedby'] = descriptors.join(' ') }

    delete props.defaultValue
    delete props.initialValue
    delete props.onChange

    return (
      <div className={formGroupClass}>
        <div className={fieldClass}>
          {!!before.length && <div className="floating-field-addons">{before}</div>}
          <div className="floating-field">
            <input
              id={id} className="form-control"
              onFocus={::this.handleFocus} onBlur={::this.handleBlur}
              placeholder={placeholder}
              ref="input" />
            <input type="hidden" {...props} />
            <label htmlFor={id} className="control-label">
              {label} <span className="fa fa-fw fa-pencil" /> {hintNode}
            </label>
          </div>
          {!!after.length && <div className="floating-field-addons">{after}</div>}
        </div>
        {errorNode}
        <div className="form-group-addons">{rest}</div>
      </div>
    )
  }
}

