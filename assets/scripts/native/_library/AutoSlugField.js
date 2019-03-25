import React, {
    Component
} from 'react'
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Image,
    ListView,
    Picker,
    TextInput,
    Switch
} from 'react-native'
import PropTypes from 'prop-types';
import {newevent, newbrand} from 'AppStyles'
import Icon from 'react-native-vector-icons/FontAwesome'
import getSlug from 'speakingurl'
import DeviceInfo from 'react-native-device-info'

class AutoSlugField extends React.Component {
    constructor(props) {
        super(props)
        this.state = {editing: false}
    }

    onChange(e) {
        const {suggestion, onChange} = this.props
        if (onChange) { onChange(e) }
    }

    edit() { this.setState({editing: true}) }
    cancel() { this.setState({editing: false}) }

    componentWillUpdate(nextProps, nextState) {
        const {onChange, suggestion} = nextProps
        const {editing} = nextState
        const changed = editing !== this.state.editing || suggestion !== this.props.suggestion
        if (editing) { return }

        if (changed && onChange) {
            onChange(getSlug(suggestion || '', nextProps.separator || ''))
        }
    }

    componentWillMount() {
        const {initialValue, defaultValue} = this.props

        const v = defaultValue || initialValue

        this.setState({editing: !!v})
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
        const {label, loading, size, hint, options, children, className, isAutoSlug, ...input} = this.props
        const {error, touched} = input
        const hasError = error && touched
        const value = input.value || ''
        let props = { ...input}
        let descriptors = []

        let hintNode
        let hintNodeId = input.id ? `${input.id}_hint` : ''
        if (hint) {
            hintNode = <Text style={{color:'#B6C5CF',fontSize:10,marginLeft:5}}>{hint}</Text>
        }
        let errorNode
        let errorNodeId = input.id ? `${input.id}_error` : ''
        if (hasError) {
            errorNodeId && descriptors.push(errorNodeId)
            errorNode =
              <View style={{position:'absolute',bottom:4, right:9, backgroundColor:'#d9534f', padding:5, borderRadius:2, justifyContent:'flex-end', alignItems:'center', flexDirection:'row'}}>
                <Icon name='caret-left' size={15} color='white'/>
                <Text style={{color:'white', fontSize:13, marginLeft:10}}>{error}</Text>
              </View>
        }
        if (this.state.editing) {
            return (
                <View style={newevent.eventUrl}>
                    <Text style={newevent.eventUrlTxt}>Event URL</Text>
                    <View style={[newevent.eventUrlView, {borderColor: hasError ? '#d9534f' : '#47516d'}]}>
                        {DeviceInfo.isTablet() &&
                            <View
                                style={[newbrand.form_inAutoSlug_Left, {backgroundColor: hasError ? '#f2dede' : '#424858'}]}>
                                <Image style={newbrand.link_prefix_img} source={require('@nativeRes/images/event-url.png')}/>
                                <Text style={newbrand.link_prefix_url}>https://www.theticketfairy.com/events/</Text>
                            </View>
                          }
                        <View>
                            {this.state.focused || value ? null :
                                <View style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    height: 33,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexDirection: 'row'
                                }}>
                                    <Text style={{
                                        color: '#B6C5CF',
                                        fontSize: 12,
                                        marginLeft: 5,
                                        marginRight: 5
                                    }}>{label}</Text>
                                    <Icon name='pencil' size={12} color='#B6C5CF'/>
                                    {hintNode}
                                </View>
                            }
                            <TextInput
                                {...props}
                                onFocus={(e) => this.handleFocus(e)}
                                onBlur={(e) => this.handleBlur(e)}
                                onChange={(e) => this.onChange(e)}
                                style={newbrand.form_inAutoSlug_Right}
                            />
                        </View>
                        {!value && !hasError &&
                        <TouchableOpacity
                            onPress={() => this.cancel()}
                            style={{
                                position: 'absolute', top: 0, right: 0, width: 34,
                                height: 34, backgroundColor: '#638a94', alignItems: 'center', justifyContent: 'center'
                            }}>
                            <Icon name='undo' size={12} color='#B6C5CF'/>
                        </TouchableOpacity>}
                    </View>
                    {errorNode}
                </View>
            )
        }else{
            return(
                <View style={newevent.eventUrl}>
                    <Text style={newevent.eventUrlTxt}>Event URL</Text>
                    <View style={[newevent.eventUrlView, {borderColor: hasError ? '#d9534f' : '#47516d'}]}>
                        {DeviceInfo.isTablet() &&
                            <View
                              style={[newbrand.form_inAutoSlug_Left, {backgroundColor: hasError ? '#f2dede' : '#424858'}]}>
                              <Image style={newbrand.link_prefix_img}
                                     source={require('@nativeRes/images/event-url.png')}/>
                              <Text style={newbrand.link_prefix_url}>https://www.theticketfairy.com/events/</Text>
                            </View>
                        }
                        <TouchableOpacity style={{flex:1,justifyContent:'center',height:35}} onPress={()=>this.edit()}>
                            <Text style={{fontSize:14, color:'#B6C5CF',marginLeft: 10,}}>{value}</Text>
                            {value && !hasError ? null :
                                <View style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    height: 33,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexDirection: 'row'
                                }}>
                                    <Text style={{
                                        color: '#B6C5CF',
                                        fontSize: 12,
                                        marginLeft: 5,
                                        marginRight: 5
                                    }}>{label}</Text>
                                    <Icon name='pencil' size={12} color='#B6C5CF'/>
                                    {hintNode}
                                </View>
                            }
                        </TouchableOpacity>
                    </View>
                  {errorNode}
                </View>
            )
        }
    }
}export default AutoSlugField
