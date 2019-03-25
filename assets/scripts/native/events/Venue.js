import React, { PropTypes, Component } from 'react'
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
import Icon from 'react-native-vector-icons/FontAwesome'
import {Field, Switch, Button, Panel} from '../_library'

class Venue extends Component {
    render(){
        const {children, onSelect, flagDisabled, flagHidden, ...address} = this.props
        const streetLabel = [address.streetNumber, address.street].filter(Boolean).join(' ')
        const cityLabel = [address.city, address.state, address.postalCode].filter(Boolean).join(' ')
        let fullAddress = [address.displayName, streetLabel, cityLabel, address.country].filter(Boolean).join(', ')
        let visibility = flagHidden ? 'Hidden' : 'Visible'
        let access = flagDisabled ? 'No' : 'Yes'
        return(
            <Panel icon='envelope-open' title='Venue Detail' style={{marginBottom:30}}>
                <Field label='Venue Name' size='small' value={address.displayName} readOnly = {true}/>
                <Field label='Location' size='small' value = {fullAddress} readOnly = {true}/>
                <Field label='Visibility' size='small' value = {visibility} readOnly = {true}/>
                <Field label='Disabled Access' size='small' value = {access} readOnly = {true}/>
                <View style={{marginTop:20, marginLeft:5}}>
                {flagDisabled && <View
                    style={{flexDirection:'row', alignItems:'center',}}><Icon name='wheelchair' color='#3c763d' />
                    <Text style={{color:'#3c763d', fontSize:12, marginLeft:5}}>Disabled access available</Text></View>}
                {flagHidden && <View style={{flexDirection:'row', alignItems:'center'}}><Icon name='circle-o' color='#3c763d' />
                    <Text style={{color:'#3c763d', fontSize:12, marginLeft:5}}>Customers cannot see the venue</Text></View>}
                {!flagHidden && <View style={{flexDirection:'row', alignItems:'center'}}><Icon name='circle' color='#3c763d' />
                    <Text style={{color:'#3c763d', fontSize:12, marginLeft:5}}>Customers can see the venue</Text></View>}
                <View style={{marginTop:15}}>{children}</View>
                </View>
            </Panel>
        )
    }
}export default Venue
