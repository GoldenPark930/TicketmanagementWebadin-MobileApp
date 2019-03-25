import React from 'react'
import {View, Text, TextInput} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import {commonStyle, styleConstant} from '../../native/styles'
import PropTypes from 'prop-types';
export default class TextArea extends React.Component {
    static propTypes = {
        label: PropTypes.string,
        value: PropTypes.string,
        placeholder: PropTypes.string,
        onChange: PropTypes.func
    }

    render() {
        const {label, value, placeholder, onChange} = this.props

        return (
            <View style={{flex: 1, margin: 10}}>
                <View>
                    <Text style={commonStyle.fieldLabel}>{label}&nbsp;<Icon name='pencil'/></Text>
                    <TextInput
                        style={[commonStyle.fieldValue, {height:150,borderWidth:1,borderColor:styleConstant.colors.border3}]}
                        multiline={true}
                        onChangeText={(text) => {
                            if (onChange) onChange(text)
                        }}
                        value={value}
                        placeholder={placeholder}
                        placeholderTextColor={styleConstant.colors.text2}
                    />
                </View>
            </View>
        )
    }
}
