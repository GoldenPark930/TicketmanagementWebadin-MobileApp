import _ from 'lodash'
import React, { Component } from 'react'
import { TextInput, View, StatusBar, Text,ScrollView, TouchableOpacity} from 'react-native'
import {LoginStyle} from 'AppStyles'
import {newevent, newbrand} from 'AppStyles'
import DeviceInfo from 'react-native-device-info'
import {
    MKTextField,
    MKCheckbox,
    MKColor,
    mdl,
} from 'react-native-material-kit'
import Icon from 'react-native-vector-icons/FontAwesome'
import PropTypes from 'prop-types';

const Name = MKTextField.textfieldWithFloatingLabel()
    .withFloatingLabelFont({
        fontSize: 15,
        // fontFamily:'OpenSans-Bold',
        color:'#B6C5CF',
        marginBottom:10})
    .withTextInputStyle(newbrand.formControl)
    .build()

class Field extends Component {
    static propType = {
        label: PropTypes.string.isRequired,
        size: PropTypes.oneOf(['small', 'normal', 'large']),
        onSelected: PropTypes.func,
        onChange: PropTypes.func,
        keyboardType: PropTypes.oneOf(['default', 'numeric', 'email-address', 'phone-pad'])
    }

    constructor(props) {
        super(props)
        this.state = {}
    }
    handleOptionSelected(o) {
        const {onSelected} = this.props
        if (onSelected) { onSelected(o) }
    }
    handleFocus(e) {
        this.setState({focused: true})
        if (this.props.onFocus) { this.props.onFocus(e) }
    }
    handleBlur(e) {
        this.setState({focused: false})
        if (this.props.onBlur) { this.props.onBlur(e) }
    }
    handleClick(e) {
        const {onClick} = this.props
        if (onClick) { onClick(e) }
    }
    render() {
        const {label, loading, size, hint, options, children, className, onChange, isAutoSlug, keyboardType, ...input} = this.props
        const {error, touched} = input
        const hasError = error && touched
        const value = input.value || ''
        const active = this.state.focused || value || (this.refs.input && this.refs.input.value)
        const before = []
        const after = []
        const rest = []

        let props = { ...input}

        let descriptors = []

        let errorNode
        let errorNodeId = input.id ? `${input.id}_error` : ''
        if (hasError) {
            errorNodeId && descriptors.push(errorNodeId)
            errorNode =
                <View id={errorNodeId} style={{position:'absolute',bottom:DeviceInfo.isTablet() ? 18:15, right:10, backgroundColor:'#d9534f', padding:5, borderRadius:2, justifyContent:'flex-end',alignItems:'center', flexDirection:'row'}}>
                    <Icon name='caret-left' size={15} color='white'/>
                    <Text style={{color:'white', fontSize:13, marginLeft:10}}>{error}</Text>
                </View>
        }

        let hintNode
        let hintNodeId = input.id ? `${input.id}_hint` : ''
        if (hint) {
            hintNode = <small id={hintNodeId} className='hint'>{hint}</small>
        }

        if (descriptors.length) { props['aria-describedby'] = descriptors.join(' ') }
        const optionNodes = (options || []).map(o => {
            const {id, label, sub} = o
            return (
                <TouchableOpacity style={{
                    marginLeft:10,
                    justifyContent:'center',
                    height:50,
                    borderBottomColor:'#b6c5cf',
                    borderBottomWidth:1
                }} key={id} onPress={()=>this.handleOptionSelected(o)}>
                    <Text style={{fontSize:14, color:'#b6c5cf'}}>{label}</Text>
                    {sub && <View><Text>{sub}</Text></View>}
                </TouchableOpacity>
            )
        })

        let staticControl
        let containerWidth
        let containerHeight
        let onChangeText = onChange ? onChange : input.onChange
        return(
            <View style={input.type === 'showOnlyError'?{marginBottom:0,flex:1,paddingHorizontal:6,}:{flex:1,paddingHorizontal:6,}}>
                {input.type !== 'showOnlyError' &&
                <View onLayout={(event) => {
                  var {width, height} = event.nativeEvent.layout
                  containerWidth = width
                  containerHeight = height
                }} style={{justifyContent:'center',  paddingBottom:0,}}>
                    {this.state.focused || value ? null :
                        <View style={{position:'absolute',top:0, left:0,alignItems:'flex-end', justifyContent:'center',flexDirection:'row'}}>
                            {hintNode}
                        </View>
                    }
                    <View style={{flexDirection:'row', borderWidth:1, position:'absolute',bottom:10, left:0,alignItems:'flex-end',borderRadius:2, borderColor:hasError? '#d9534f' : '#47516d', backgroundColor: '#2A2F3C'}}>
                        <View style={{flex:6}}></View>
                        <View style={{flex:4,paddingTop:11, paddingBottom:11,paddingLeft:12,}}>
                            <Text style={{color:'#ffffff',fontFamily:'OpenSans-Bold', fontSize:14}}></Text>
                        </View>
                    </View>
                    <Name
                        {...props}
                        ref = 'input'
                        onBlur={(e)=>this.handleBlur(e)}
                        onFocus={(e)=>this.handleFocus(e)}
                        placeholderTextColor = '#B6C5CF'
                        placeholder = {label}
                        tintColor = '#B6C5CF'
                        editable = {!props.readOnly}
                        keyboardType = {keyboardType ? keyboardType : 'default'}
                        maxLength = {50}
                        returnKeyType = {'next'}
                        underlineSize = {0}
                        style = {[newbrand.detailInput,{width:containerWidth,}]}
                        onChangeText={(text)=>{
                            if(onChangeText) {
                                onChange(text)
                            }
                        }}
                    />
                    {optionNodes.length && this.state.focused ?
                        <ScrollView style={{flex:1, height:300, backgroundColor:'#242935'}}>
                            {optionNodes}
                        </ScrollView> : null
                    }
                </View>}
                {errorNode}
            </View>
        )
    }
}export default Field

class FieldButton extends React.Component {
    render() {
        return <TouchableOpacity {...this.props}>{this.props.children}</TouchableOpacity>
    }
}

class FieldPrefixButton extends FieldButton {}
class FieldSuffixButton extends FieldButton {}
Field.PrefixButton = FieldPrefixButton
Field.SuffixButton = FieldSuffixButton

class FieldAddon extends React.Component {
    render() {
        return <View {...this.props}>{this.props.children}</View>
    }
}
class FieldPrefixAddon extends FieldAddon {}
class FieldSuffixAddon extends FieldAddon {}

Field.PrefixAddon = FieldPrefixAddon
Field.SuffixAddon = FieldSuffixAddon
