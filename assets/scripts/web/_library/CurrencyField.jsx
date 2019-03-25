import _ from 'lodash'
import React from 'react'
import Field from './Field'

const noop = () => {}

export default class CurrencyField extends React.Component {
  constructor(props) {
    super(props)
    this.state = {price: (props.value || 0) / 100}
  }
  componentWillMount() {
    const initialCents = this.props.initialValue
    const dollars = (initialCents / 100).toFixed(2)
    this.setState({price: _.isNumber(initialCents) ? dollars : initialCents})
  }
  parse(value) {
    this.setState({price: value})
    const parsed = parseInt(parseFloat(value) * 100, 10)
    if (!_.isNaN(parsed) && _.isFinite(parsed)) {
      return parsed
    } else {
      return value
    }
  }
  handleChange(event) {
    const next = this.parse(event.target.value)
    const {onChange} = this.props
    if (onChange) { return onChange(next) }
  }
  handleBlur(event) {
    const next = this.parse(event.target.value)
    const {onBlur} = this.props
    if (onBlur) { return onBlur(next) }
  }
  render() {
    const {id, ...input} = this.props
    return (
      <Field {...this.props} value={this.state.price}
        onChange={::this.handleChange}
        onBlur={::this.handleBlur} />
    )
  }
}
