
import React, { Component } from 'react'
import { TextInput,
    View,
    StatusBar,
    Text,
    TouchableOpacity,
    Modal,
    DatePickerIOS,
    Dimensions,
    TouchableWithoutFeedback,
    StyleSheet} from 'react-native'
import PropTypes from 'prop-types';
import {LoginStyle} from 'AppStyles'
import {newevent, newbrand} from 'AppStyles'
import moment from 'moment'
import {Menu, MenuOptions, MenuOption, MenuTrigger} from 'react-native-popup-menu'

import {
    MKTextField,
    MKCheckbox,
    MKColor,
    mdl,
} from 'react-native-material-kit'

import Icon from 'react-native-vector-icons/FontAwesome'

const Timepickerstyles = StyleSheet.create({
    actionSheetContainer: {
        height: 250,
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    container:{
        top: 60,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'transparent',
        position: 'absolute'
    },
})

class DateTimePickera extends Component {

    static propType = {
        label: PropTypes.string.isRequired,
        size: PropTypes.oneOf(['small', 'normal', 'large']),
    }

    constructor(props) {
        super(props)
        this._button = null
        this._buttonFrame = null
        this.state = {
            focused:false,
            date: new Date(),
            valueString:'',
        }
    }

    componentDidMount() {
        this.updateValueWithSuggestion(this.props)
        if (this.props.defaultValue != undefined) {
            this.setState({ valueString: moment(this.props.defaultValue).format('D MMM YYYY hh:mm A')})
        }
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.loadingFromFB && this.props.value != nextProps.value && nextProps.value != null){
            this.updateValue(nextProps)
            return
        }
        const current = this.props.suggestion
        const next = nextProps.suggestion
        if (current === next) { return }
        this.updateValueWithSuggestion(nextProps)
    }

    updateValueWithSuggestion(props) {
        const {initialValue, onChange} = props
        const {suggestion} = props
        const {edited} = this.state
        if (edited || initialValue || !suggestion) { return }
        if (onChange) { onChange(suggestion) }
        this.setState({ valueString: moment(suggestion).format('D MMM YYYY hh:mm A')})
    }


    handleBlur(e) {
        // this.setState({focused: false})
    }

    handleSelect(date) {
        this.setState({date})
        const {onChange,value} = this.props
        this.setState({edited: true})
        const m = moment.utc(date)
        onChange(m.toISOString())
        this.setState({ valueString: moment(date).format('D MMM YYYY hh:mm A')})
    }


    handleFocus(e) {
        this._updatePosition(() => {
            this.setState({
                focused: true
            })
        })
    }
    _updatePosition(callback) {
        if (this._button && this._button.measure) {
            this._button.measure((fx, fy, width, height, px, py) => {
                this._buttonFrame = {x: px, y: py, w: width, h: height}
                callback && callback()
            })
        }
    }
    _calcPosition() {
        let dimensions = Dimensions.get('window')
        let windowWidth = dimensions.width
        let windowHeight = dimensions.height

        let dropdownHeight = 250
        let dropdownWidth = 450
        let bottomSpace = windowHeight - this._buttonFrame.y - this._buttonFrame.h
        let rightSpace = windowWidth - this._buttonFrame.x
        let showInBottom = bottomSpace >= dropdownHeight || bottomSpace >= this._buttonFrame.y
        let showInLeft = rightSpace >= this._buttonFrame.x

        var style = {
            position:'absolute',
            height: dropdownHeight,
            top: showInBottom ? this._buttonFrame.y + this._buttonFrame.h : Math.max(0, this._buttonFrame.y - dropdownHeight),
        }

        if (showInLeft) {
            style.left = this._buttonFrame.x
            style.width = dropdownWidth
        } else {
            style.width = dropdownWidth
            style.right = rightSpace - this._buttonFrame.w
        }
        return style
    }
    _renderModal(){
        if (this.state.focused) {
            let frameStyle = this._calcPosition()
            return (
              <Modal
                animationType={"fade"}
                transparent={true}
                visible={this.state.focused}
                onRequestClose={() => this.setState({focused: false})}
              >
                <TouchableWithoutFeedback onPress={() => this.setState({focused: false})}>
                  <View style={{flex: 1}}>
                    <TouchableWithoutFeedback onPress={() => this.setState({focused: true})}>
                      <View style={frameStyle}>
                      {/*<View style={{position:'absolute', bottom:0, left:0, height:250, width:450}}>*/}
                        <DatePickerIOS
                          date={this.state.date}
                          mode='datetime'
                          onDateChange={(date) => this.handleSelect(date)}
                          style={{backgroundColor: 'white'}}
                          // timeZoneOffsetInHours={(-1) * (new Date()).getTimezoneOffset() / 60}
                        />
                      </View>
                    </TouchableWithoutFeedback>
                  </View>
                </TouchableWithoutFeedback>
              </Modal>            )
        }
    }
    showDateTimePicker(){
        this._button.measure((fx, fy, width, height, px, py) => {
          this._buttonFrame = {x: px, y: py, w: width, h: height}
          this.setState({focused:true})
        })
    }
    render() {
        const {label, loading, size, hint, children, className, placeholder, id, ...input} = this.props
        const {error, touched} = input
        const hasError = error && touched
        const value = input.value || ''
        const active = this.state.focused || placeholder || value || (this._button && this._button.value)
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
                <View style={{flexDirection:'row'}}>
                    <View id={errorNodeId} style={{flex:4, backgroundColor:'#d9534f', paddingTop:6, paddingBottom:6,paddingLeft:12}}>
                        <Text style={{color:'#ffffff',fontFamily:'OpenSans-Bold', fontSize:12}}>{error}</Text>
                    </View>
                    <View style={{flex:6}}></View>
                </View>
        }

        let hintNode
        let hintNodeId = input.id ? `${input.id}_hint` : ''
        if (hint) {
            hintNode = <small id={hintNodeId} className='hint'>{hint}</small>
        }
        if (descriptors.length) { props['aria-describedby'] = descriptors.join(' ') }
        return(
            <View style={input.type === 'showOnlyError'?{marginBottom:0,flex:1,padding:6,}:{flex:1,padding:6,}}>
                <View style={{flex:1,}}>
                    <Text style={newevent.eventUrlTxt}>{label}</Text>
                    <TouchableWithoutFeedback onPress={()=>this.showDateTimePicker()}>
                      <View
                        ref={button => this._button = button}
                        style={[newevent.eventDate,{borderBottomColor:hasError? '#d9534f':'#47516d'}]} onPress={()=>this.showDateTimePicker()}>
                          <Text
                              style={newevent.eventDateText} >{this.state.valueString}</Text>
                      </View>
                    </TouchableWithoutFeedback>
                </View>
                {errorNode}
                {this._renderModal()}
            </View>
        )
    }
}export default DateTimePickera
