import _ from 'lodash'
import countries from 'world-countries'
import React from 'react'

const currencies = _.chain(countries)
  .flatMap('currency')
  .uniq()
  .sortBy()
  .value()

export default class Currency extends React.Component {
  static propTypes = {
    value: React.PropTypes.number.isRequired,
    code: React.PropTypes.oneOf(currencies)
  }
  render() {
    const {value, code} = this.props
    return (
      <span>{!!code && <small>{code}</small>} <span>{(value/100).toFixed(2)}</span></span>
    )
  }
}
