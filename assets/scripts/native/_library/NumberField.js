import _ from 'lodash'
import React from 'react'
import TextField from './TextField'
import PropTypes from 'prop-types';

export default class NumberField extends React.Component {
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
        const initialValue = this.props.initialValue
        this.setState({value: _.isNumber(initialValue) ? initialValue.toString() : null})
    }

    handleChange = (text) => {
        const val = parseInt(text, 10)

        const {onChange} = this.props
        if(onChange) onChange(val)

        this.setState({value:text})
    }

    handleBlur = (e) => {
        const text = e.nativeEvent.text
        const val = parseInt(text, 10)

        const {onBlur} = this.props
        if(onBlur) onBlur(val)

        this.setState({value:text})
    }
    render() {
        return (
            <TextField keyboardType='numeric' {...this.props} value={this.state.value} onChange={this.handleChange} onBlur={this.handleBlur}/>
        )
    }
}
