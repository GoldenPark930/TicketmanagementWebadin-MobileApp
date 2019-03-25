import _ from 'lodash'
import React from 'react'
import {View,Text} from 'react-native'
import TextField from './TextField'
import PropTypes from 'prop-types';
import {commonStyle} from "../styles";

export default class CurrencyField extends React.Component {
    static propTypes = {
        label: PropTypes.string
    }

    constructor(props) {
        super(props)
        this.state = {
            value: props.value&&_.isNumber(props.value) ? props.value.toString() : null
        }
    }

    componentWillMount() {
        const initialCents = this.props.initialValue
        const dollars = (initialCents / 100).toFixed(2)
        this.setState({value: _.isNumber(initialCents) ? dollars : initialCents})
    }

    parse(text) {
        const parsed = parseInt(parseFloat(text) * 100, 10)
        if (!_.isNaN(parsed) && _.isFinite(parsed)) {
            return parsed
        } else {
            return text
        }
    }

    handleChange = (text) => {
        const val = this.parse(text)

        const {onChange} = this.props
        if(onChange) onChange(val)

        this.setState({value:text})
    }

    handleBlur = (e) => {
        const text = e.nativeEvent.text
        const val = this.parse(text)

        const {onBlur} = this.props
        if(onBlur) onBlur(val)

        this.setState({value:text})
    }

    render() {
        const {label} = this.props
        return (
            <TextField label={label} keyboardType='numeric' {...this.props} value={this.state.value} onChange={this.handleChange} onBlur={this.handleBlur}/>
        )
    }
}
