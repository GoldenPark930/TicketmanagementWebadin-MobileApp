import React from 'react'
import {View, TextInput, Text} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import {commonStyle} from '../../native/styles'
import PropTypes from 'prop-types';
export default class TextField extends React.Component {
    static propTypes = {
        label: PropTypes.string,
        keyboardType: PropTypes.oneOf(['default', 'numeric', 'email-address', 'phone-pad'])
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
        const {id, label, error, value, onChange, touched, keyboardType} = this.props

        const showError = error && touched
        return (
            <View style={{flex:1, padding:10}}>
                <View style={!showError ? commonStyle.fieldContainer : commonStyle.fieldContainerWithError}>
                    <Text style={commonStyle.fieldLabel}>{label}&nbsp;<Icon name='pencil'/></Text>
                    <TextInput
                        style={[commonStyle.fieldValue, {borderColor: '#63666d', backgroundColor: '#494d54'}]}
                        keyboardType={keyboardType||'default'}
                        value={value}
                        onChangeText={onChange}
                        onBlur={(e)=>this.handleBlur(e)}
                        onFocus={(e)=>this.handleFocus(e)}
                    />
                </View>
                {showError &&
                (<View style={{flexDirection: 'row'}}>
                    <View>
                        <Text style={[commonStyle.errorLabel, commonStyle.shadow]}>{error}</Text>
                    </View>
                    <View style={{flex: 1}}/>
                </View>)}
                <View style={{flex:2}}/>
            </View>
        )
    }
}
