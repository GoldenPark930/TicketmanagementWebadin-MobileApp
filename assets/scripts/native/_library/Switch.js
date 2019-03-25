import React from 'react'
import PropTypes from 'prop-types'
import {View, Text} from 'react-native'
import {MKSwitch} from 'react-native-material-kit'
import {commonStyle} from '../../native/styles'

export default class Switch extends React.Component {
    static propTypes = {
        label: PropTypes.string,
        description: PropTypes.string,
        checked: PropTypes.bool,
        onChange: PropTypes.func,
    }

    constructor(props) {
        super(props)
    }

    render() {
        const {label, style, description, onChange, ...field} = this.props

        let checked = field&&field.value?field.value:this.props.checked
        let onCheckedChange = field&&field.onChange?field.onChange:onChange
        return (
            <View style={style}>
                <View style={{flexDirection: 'row', alignItems:'center'}}>
                    <MKSwitch
                        checked={checked}
                        trackLength={36}
                        trackSize={20}
                        thumbRadius={11}
                        onColor='#00C7AD'
                        offColor='#565D6E'
                        thumbOnColor='white'
                        rippleColor='transparent'
                        onCheckedChange={(e) => setTimeout(() => {if(onCheckedChange) onCheckedChange(e.checked)}, 300)}/>
                        <Text style={commonStyle.switchTitleLabel}>{label}</Text>
                </View>

                {description &&
                <Text style={commonStyle.switchDescriptionLabel}>{description}</Text>}
            </View>
        )
    }
}
