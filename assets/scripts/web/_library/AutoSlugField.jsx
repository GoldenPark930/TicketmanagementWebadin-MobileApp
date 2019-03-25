import getSlug from 'speakingurl'
import React from 'react'
import Field from './Field'

export default class AutoSlugField extends React.Component {
  constructor(props) {
    super(props)
    this.state = {editing: false}
  }

  onChange(e) {
    const {suggestion, onChange} = this.props
    if (onChange) { onChange(e) }
  }

  edit() { this.setState({editing: true}) }
  cancel() { this.setState({editing: false}) }

  componentWillUpdate(nextProps, nextState) {
    const {onChange, suggestion} = nextProps
    const {editing} = nextState
    const changed = editing !== this.state.editing || suggestion !== this.props.suggestion

    if (editing) { return }

    if (changed && onChange) {
      onChange(getSlug(suggestion || '', nextProps.separator || ''))
    }
  }

  componentWillMount() {
    const {initialValue, defaultValue} = this.props

    const v = defaultValue || initialValue

    this.setState({editing: !!v})
  }

  render() {
    const {props} = this
    const {value} = props
    const {children} = props
    if (this.state.editing) {
      return <Field {...props} isAutoSlug={true} type="text">
        {children}
        {!value && <Field.SuffixButton
          className="btn btn-default"
          type="button" title="Use an automatically generated link"
          onClick={::this.cancel}><i className="fa fa-undo" /></Field.SuffixButton>}
      </Field>
    } else {
      return <Field {...props} isAutoSlug={true} type="hidden" onChange={::this.onChange} onClick={::this.edit} />
    }
  }
}
