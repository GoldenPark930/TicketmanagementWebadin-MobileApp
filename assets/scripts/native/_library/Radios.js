import React from 'react'
import {View, Text, TouchableOpacity} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import {commonStyle, eventTicketStyle, styleConstant} from '../../native/styles'
import LinearGradient from 'react-native-linear-gradient'
import DeviceInfo from 'react-native-device-info'
import PropTypes from 'prop-types'
export default class Radios extends React.Component {
    static propTypes = {
        options: PropTypes.arrayOf(PropTypes.shape({
            label1: PropTypes.string.isRequired,
            label2: PropTypes.string.isRequired,
            label3: PropTypes.string.isRequired,
            value: PropTypes.string.isRequired
        })).isRequired
    }

    render() {
        const {children, label, label1, id, options, ...field} = this.props

        return (
            <View style={commonStyle.formGroup}>
                {!!label &&
                <View style={eventTicketStyle.title}>
                    <Text style={eventTicketStyle.titleLabel1}>{label}</Text>
                    <Text style={eventTicketStyle.titleLabel2}><Icon name='info-circle' size={20}/>&nbsp;&nbsp;{label1}</Text>
                </View>
                }
                <View style={{flexDirection: DeviceInfo.isTablet() ?'row':'column', flex: 1,  marginTop: 15}}>
                    {(options || []).map((o, i) => <RadiosOption key={i} field={field} id={`${id}_${i}`}
                                                                 label1={o.label1} label2={o.label2} label3={o.label3}
                                                                 value={o.value}/>)}
                </View>
                <View>
                    {children}
                </View>
            </View>
        )
    }
}

class RadiosOption extends React.Component {
    render() {
        const {id, label1, label2, label3, value, field} = this.props
        const checked = field.value && (value === field.value)

        return (
            <TouchableOpacity style={eventTicketStyle.radioContainer} onPress={()=>{field.onChange(value)}} shadow>
                {checked &&
                <LinearGradient
                    colors={[styleConstant.colors.backgroundTicketRadioGradient1, styleConstant.colors.backgroundTicketRadioGradient2]}
                    style={eventTicketStyle.radioSelected}>
                    <View style={[eventTicketStyle.radio]}>
                        <Text style={eventTicketStyle.radioIcon}><Icon name='check-circle' size={30}/></Text>
                        <Text style={eventTicketStyle.radioLabel1}>{label1}</Text>
                        <Text style={eventTicketStyle.radioLabel2}>{label2}</Text>
                        <Text style={eventTicketStyle.radioLabel3}>{label3}</Text>
                    </View>
                </LinearGradient>}
                {!checked &&
                <View style={[eventTicketStyle.radio, {backgroundColor: styleConstant.colors.background1}]}>
                    <Text style={eventTicketStyle.radioIcon}><Icon name='check-circle' size={30}/></Text>
                    <Text style={eventTicketStyle.radioLabel1}>{label1}</Text>
                    <Text style={eventTicketStyle.radioLabel2}>{label2}</Text>
                    <Text style={eventTicketStyle.radioLabel3}>{label3}</Text>
                </View>}
            </TouchableOpacity>
        )
    }
}
