import _ from 'lodash'
import Levenshtein from 'levenshtein'
import React, { Component } from 'react'
import {
    StyleSheet,
    Navigator,
    View,
    Image,
    Platform,
    BackAndroid,
    TouchableOpacity,
    ScrollView,
    Text
} from 'react-native'
import PropTypes from 'prop-types';

import countries from '../../_common/core/countries'
import Field from './Field'

const countryOptions = _.map(countries, 'name.common').map((c) => {
    return {id: c, label: c}
})

class CountryField extends Component {
    constructor(props) {
        super(props)
        this.state = {
            countries: countryOptions,
        }
    }
    handleCountryChanged(value) {
        const {onChange} = this.props
        if (onChange) { onChange(value) }
        // const {value} = e
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
                onChange={(e)=>this.handleCountryChanged(e)}
                onSelected={(o) => onChange(o.id)} />
        )
    }
}export default CountryField
