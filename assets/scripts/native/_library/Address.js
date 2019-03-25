import React from 'react'
import {
    Text,
} from 'react-native'
export default (props) => {
    const type = props.type ? props.type : 'simple'
    let label = null
    switch(type){
        case 'full':
            const streetLabel = [props.streetNumber, props.street].filter(Boolean).join(' ')
            const cityLabel = [props.city, props.state, props.postalCode].filter(Boolean).join(' ')
            label = [props.displayName, streetLabel, cityLabel, props.country].filter(Boolean).join(', ')
            break
        case 'medium':
            label = [props.displayName, props.streetNumber, props.postalCode, props.city].filter(Boolean).join(', ')
            break
        default:
            label = [props.displayName, props.city].filter(Boolean).join(', ')
            break
    }

    return (
        <Text style={props.className}>
            {label}
        </Text>
    )
}
