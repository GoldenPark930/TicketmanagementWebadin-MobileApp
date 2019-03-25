import React from 'react'
import {View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback} from 'react-native'
import moment from 'moment-timezone'
import Icon from 'react-native-vector-icons/FontAwesome'
import Calendar from './DateRang/calendar'
import Button from './Button'
import modalStyle from '../../_common/core/modalStyle'
export const FORMAT = 'D MMM YYYY'
export default class DateRangePicker extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      display: false,
      isSet: false,
      isWorking: false,
      startDate: moment(),
      endDate: moment(),
      workingStartDate: moment(),
      workingEndDate: moment()
    }
  }

  handleChange(current, previous) {
    this.setState({
      isWorking: true,
      workingStartDate : previous,
      workingEndDate : current
    })
  }

  onClickTitle() {
    this.setState({
      display: !this.state.display
    })
  }

  onClickApply() {
    if(!this.state.isWorking){
      this.setState({
        isSet: false,
        isWorking: false,
        display: false,
        startDate: moment(),
        endDate: moment(),
        workingStartDate: moment(),
        workingEndDate: moment()
      })
      if(this.props.onCancel)
        this.props.onCancel()
    }else{
      this.setState({
        isSet: true,
        isWorking: false,
        display: false,
        startDate: this.state.workingStartDate,
        endDate: this.state.workingEndDate
      })
      if(this.props.onApply)
        this.props.onApply(this.state.workingStartDate, this.state.workingEndDate)
    }
  }

  onClickCancel() {
    if(this.state.isWorking){
      this.setState({
        display: false,
        isWorking: false,
        workingStartDate: this.state.startDate,
        workingEndDate: this.state.endDate
      })
    }else{
      this.setState({
        display: false,
        isWorking: false,
      })
    }
  }

  onClickClear() {
    this.setState({
      isSet: false,
      isWorking: false,
      display: false,
      workingStartDate: moment(),
      workingEndDate: moment()
    })
    if(this.props.onClear)
      this.props.onClear()
  }
  render() {
    const {display, isSet, isWorking, startDate, endDate, workingStartDate, workingEndDate} = this.state
    let range = ''
    if((isSet || isWorking) && workingStartDate && workingEndDate)
      range = (workingStartDate && moment(workingStartDate).format(FORMAT).toString()) + ' ~ ' + (workingEndDate && moment(workingEndDate).format(FORMAT).toString())
    else
      range = 'N/A'
    return(
      <View>
        <TouchableWithoutFeedback onPress={()=>this.setState({display: true})}>
          <View style={{flexDirection: 'row'}}>
            <View style={{flexDirection: 'row', borderRadius: 3, padding:6, backgroundColor: '#414650', marginBottom: 15}}>
              <Icon name="calendar" size={14} color="#c6cbd0" style={{marginLeft: 5}}/>
              <Text style={{marginLeft:10, fontSize: 14, fontFamily: 'Open Sans', color: '#c6cbd0', textAlign: 'center'}}>Filter by date range</Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
        <Modal
          animationType="none"
          transparent={true}
          visible={display}
          swipeArea={0}
          swipeToClose={false}
          onRequestClose={() => {
            alert('Modal has been closed.');
          }}>
          <TouchableWithoutFeedback onPress={()=>this.setState({display: false})}>
            <View style={{position: 'absolute', left: 0, right: 0, bottom:0, top: 0}}>
              <TouchableWithoutFeedback onPress={()=>this.setState({display: true})}>
              <View style={{marginHorizontal: 20, marginTop: 50, backgroundColor: '#2f3138', alignItems: 'center', justifyContent: 'center'}}>
                <View style={{backgroundColor: '#2f3138',padding: 10}}>
                  <Text style={{fontSize: 18, fontFamily: 'Open Sans', color: '#fff'}}>Range: {range}</Text>
                </View>
                <Calendar
                  bodyBackColor={'#2f3138'}
                  dayDisabledBackColor="#2f3138"
                  dayDisabledTextColor="grey"
                  dayCommonBackColor="#2f3138"
                  dayCommonTextColor="#fff"
                  monthTextColor="#fff"
                  bodyTextColor="rgb(198, 203, 208)"
                  style={{
                    height: 450,
                    width: 220,
                    padding:10,
                    backgroundColor: '#2f3138'
                  }}
                  onSelectionChange={(current, previous) => {
                    this.handleChange(current, previous)
                  }}
                />
                <View style={{borderTopWidth: 1, borderTopColor: '#4e5465', flexDirection: 'row', padding: 15}}>
                  <View style={{flex:1, }}/>
                  <Button style={{backgroundColor: '#25b998', marginRight: 10}} title='Apply' onPress={()=>this.onClickApply()}/>
                  <Button style={{backgroundColor: '#798284'}} title='Cancel' onPress={()=>this.onClickCancel()}/>
                </View>
              </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    )
  }
}
