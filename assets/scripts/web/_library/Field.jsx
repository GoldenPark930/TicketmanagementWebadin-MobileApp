import classNames from 'classnames'
import React from 'react'

import Button from './Button'

export default class Field extends React.Component {
  static propType = {
    label: React.PropTypes.string.isRequired,
    size: React.PropTypes.oneOf(['small', 'normal', 'large']),
    onSelected: React.PropTypes.func
  }

  constructor(props) {
    super(props)
    this.state = {}
  }
  handleOptionSelected(o) {
    const {onSelected} = this.props
    if (onSelected) { onSelected(o) }
  }
  handleFocus(e) {
    this.setState({focused: true})
    if (this.props.onFocus) { this.props.onFocus(e) }
  }
  handleBlur(e) {
    this.setState({focused: false})
    if (this.props.onBlur) { this.props.onBlur(e) }
  }
  handleClick(e) {
    const {onClick} = this.props
    if (onClick) { onClick(e) }
  }
  render() {
    const {label, loading, size, hint, options, children, className, isAutoSlug, autoFocus, separator, suggestion, ...input} = this.props
    const {error, touched} = input
    const hasError = error && touched
    const value = input.value || ''
    const active = this.state.focused || value || (this.refs.input && this.refs.input.value)
    const before = []
    const after = []
    const rest = []

    React.Children.forEach(children, (c) => {
      if (!React.isValidElement(c)) {
        rest.push(c)
      } else if (c.type === FieldPrefixButton || c.type === FieldPrefixAddon) {
        before.push(c)
      } else if (c.type === FieldSuffixButton || c.type === FieldPrefixAddon) {
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
      input.type === 'showOnlyError' ? 'showOnlyError' : ''
    )
    const fieldClass = classNames(
      className, 'floating-field-group',
      loading ? 'loading' : '',
      active ? 'active' : '',
      !!isAutoSlug? 'form-inAutoSlug' : '',
    )
    let props = {className: 'form-control', ...input}
    let descriptors = []

    let errorNode
    let errorNodeId = input.id ? `${input.id}_error` : ''
    if (hasError) {
      errorNodeId && descriptors.push(errorNodeId)
      errorNode = <div id={errorNodeId} className="help-block">{error}</div>
    }

    let hintNode
    let hintNodeId = input.id ? `${input.id}_hint` : ''
    if (hint) {
      hintNode = <small id={hintNodeId} className="hint">{hint}</small>
    }

    if (descriptors.length) { props['aria-describedby'] = descriptors.join(' ') }

    const optionNodes = (options || []).map(o => {
      const {id, label, sub} = o
      return (
        <li className="card-block control-option" key={id} onMouseDown={this.handleOptionSelected.bind(this, o)}>
          <div>{label}</div>
          {sub && <div className="text-muted"><small>{sub}</small></div>}
        </li>
      )
    })

    let staticControl
    if (input.type === 'hidden') {
      staticControl = <div className="form-control form-control-static" onClick={::this.handleClick}>{value}</div>
    }

    return (
      <div className={formGroupClass}>
        {input.type !== 'showOnlyError' &&
        <div className={fieldClass}>
          {!!before.length && <div className="floating-field-addons">{before}</div>}
          <div className="floating-field">
            <input {...props} onFocus={::this.handleFocus} onBlur={::this.handleBlur} ref="input" autoFocus={autoFocus}/>
            {staticControl}
            {optionNodes.length ? <div className="control-options"><ul className="card card-list list-unstyled">{optionNodes}</ul></div> : null}
            <label htmlFor={props.id} className="control-label" onClick={::this.handleClick}>
              {label} <span className="fa fa-fw fa-pencil" /> {hintNode}
            </label>
          </div>
          {!!after.length && <div className="floating-field-addons">{after}</div>}
        </div>
        }
        {errorNode}
        {input.type !== 'showOnlyError' &&
          <div className="form-group-addons">{rest}</div>
        }
      </div>
    )
  }
}

class FieldButton extends React.Component {
  render() {
    return <Button {...this.props}>{this.props.children}</Button>
  }
}

class FieldPrefixButton extends FieldButton {}
class FieldSuffixButton extends FieldButton {}

Field.PrefixButton = FieldPrefixButton
Field.SuffixButton = FieldSuffixButton

class FieldAddon extends React.Component {
  render() {
    const cs = classNames(this.props.className, 'input-group-addon')
    return <div {...this.props} className={cs}>{this.props.children}</div>
  }
}
class FieldPrefixAddon extends FieldAddon {}
class FieldSuffixAddon extends FieldAddon {}

Field.PrefixAddon = FieldPrefixAddon
Field.SuffixAddon = FieldSuffixAddon
