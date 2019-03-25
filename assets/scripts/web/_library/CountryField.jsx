import _ from 'lodash'
import Levenshtein from 'levenshtein'
import React from 'react'

import countries from '../../_common/core/countries'
import Field from './Field'

const countryOptions = _.map(countries, 'name.common').map((c) => {
  return {id: c, label: c}
})

export default class CountryField extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      countries: countryOptions,
    }
  }
  handleCountryChanged(e) {
    const {onChange} = this.props
    if (onChange) { onChange(e) }
    const {value} = e.target
    if (!_.get(value, 'length', 0)) {
      this.setState({countries: countryOptions})
      return
    }

    const n = value.toLowerCase()
    this.setState({countries: _.chain(countryOptions)
      .map((o) => {
        const {label} = o
        const m = label.toLowerCase()
        const d = m.slice(0, value.length) === n ? 0 : new Levenshtein(m, n).distance
        return [d, o]
      })
      .filter((x) => x[0] < 3)
      .sortBy(_.head)
      .map(_.last)
      .value()})
  }
  render() {
    const {countries} = this.state
    const onChange = this.props.onChange || (() => {})
    return (
      <Field
        {...this.props}
        options={countries}
        onChange={::this.handleCountryChanged}
        onSelected={(o) => onChange(o.id)} />
    )
  }
}


