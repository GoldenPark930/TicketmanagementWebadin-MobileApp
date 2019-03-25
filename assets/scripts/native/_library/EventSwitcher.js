import _ from 'lodash'
import moment from 'moment-timezone'
import React from 'react'
import {commonStyle, eventpage} from '../../native/styles'
import Icon from 'react-native-vector-icons/FontAwesome';
import {
  View,
  Text,
  Image,
  ScrollView,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
  TextInput
} from 'react-native'
import PropTypes from 'prop-types';

var window = Dimensions.get('window');
let  expandPosition_x = 0
let  expandPosition_y = 300

export const IS_FOUND = (value, keyword) => {
  if(!value)
    return 0
  return value.toLowerCase().indexOf(keyword) != -1 ? 1 : 0
}
class EventSwitcher extends React.Component {

  static propType = {
    currentEvent: PropTypes.object,
    events: PropTypes.arrayOf(PropTypes.object),
    onClickEvent: PropTypes.func,
    active: PropTypes.bool,
  }

  constructor(props) {
    super(props)
    this.state = {
      expanded: false,
      search: '',
    }
  }
  onClickEvent(event) {
    if (this.props.onClickEvent) {
      this.props.onClickEvent(event)
    }
    this.setState({
      expanded: false
    })
  }
  onShow = () => {
    this.myComponent.measure( (fx, fy, width, height, px, py) => {
      expandPosition_x = fx
      expandPosition_y = py+height+10
      this.setState({expanded: !this.state.expanded})
    })
  }

  render() {
    const {events, currentEvent, active} = this.props
    const {expanded, search} = this.state
    let events_filtered = events
    if(search.length > 0){
      events_filtered = _.filter(events, (event, index)=>{
        let addr = !!event ? event.venue : null
        let displayName = event.displayName
        let found = 0, keyword = search.toLowerCase()
        found += IS_FOUND(displayName, keyword)
        if(addr){
          found += IS_FOUND(addr.displayName, keyword)
          found += IS_FOUND(addr.city, keyword)
        }
        return found
      })
    }

    // current event
    let addr = !!currentEvent ? currentEvent.venue : null
    let startDate_utc = moment.utc(new Date(currentEvent.startDate))
    let label = [addr.displayName, addr.city].filter(Boolean).join(', ')
    let content_currentEvent =
      (<TouchableWithoutFeedback onPress={this.onShow}>
        <View ref={view => { this.myComponent = view }} style={eventpage.select2}>
        <View style={eventpage.select_title}>
          <Text style={eventpage.select_titile_text}>{currentEvent.displayName}</Text>
          <Icon name="exchange" size={15} color="#fff" />
        </View>
        {addr &&
          <View style={{flexDirection: 'row', marginTop: 5, alignItems: 'center'}}>
            <Image style={eventpage.event_address_img} source={require('@nativeRes/images/icon-location.png')}/>
            <Text style={eventpage.event_address_text}>{label}</Text>
          </View>
        }
        <View style={{flexDirection: 'row', marginTop: 5, alignItems: 'center'}}>
          <Image style={eventpage.event_time_img} source={require('@nativeRes/images/icon-clock.png')}/>
          <Text style={eventpage.event_address_text}>{moment(startDate_utc).format('LLL')}</Text>
        </View>
      </View>
      </TouchableWithoutFeedback>
      )

    let content_events = _.map(events_filtered, (event, index) => {
      let scrollElement = event.id == currentEvent.id ? 'scroll-to-element' : 'child' + index
      let addr = !!event ? event.venue : null
      let startDate_utc = moment.utc(new Date(event.startDate))
      let label = [addr.displayName, addr.city].filter(Boolean).join(', ')
      return(
        <TouchableWithoutFeedback key={index} onPress={()=>this.onClickEvent(event)}>
          <View style={{flexDirection : 'row', padding: 10, backgroundColor: index%2 != 0 ? '#4a4f56' : '#00000000'}}>
            {event.imageURL &&
                <Image style={eventpage.event_potion_img} source={{uri: event.imageURL}} />
            }
            <View style={{marginLeft: 10}}>
              <View style={eventpage.select_title}>
                <Text style={[eventpage.select_titile_text, {fontSize: 12}]}>{event.displayName}</Text>
                {(event.id == currentEvent.id) && <Image style={eventpage.event_content_tick} source={require('@nativeRes/images/green_tick.png')}/>}
              </View>
              {addr &&
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Image style={eventpage.event_address_option_img} source={require('@nativeRes/images/icon-location.png')}/>
                  <Text style={[eventpage.event_address_text, {fontSize: 10}]}>{label}</Text>
                </View>
              }
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Image style={eventpage.event_time_option_img} source={require('@nativeRes/images/icon-clock.png')}/>
                <Text style={[eventpage.event_address_text, {fontSize: 10}]}>{moment(startDate_utc).format('LLL')}</Text>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
        )
    })
    return (
      <View>
        {content_currentEvent}
        <Modal
          animationType="none"
          transparent={true}
          visible={expanded}
          swipeArea={0}
          swipeToClose={false}
          onRequestClose={() => {
            alert('Modal has been closed.');
          }}>
          <TouchableWithoutFeedback onPress={()=>this.setState({expanded: false})}>
            <View style={{position: 'absolute', left: 0, right: 0, bottom:0, top: 0}}>
              <View style={[eventpage.optionView, {right: expandPosition_x,top: expandPosition_y,}]}>
                <View style={{backgroundColor: '#232732', padding:5}}>
                  <TextInput style={eventpage.optionText}
                   onChangeText={(search) => this.setState({search})}
                   value={this.state.search}
                  />
                </View>
                <ScrollView>
                  {content_events}
                </ScrollView>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    )
  }
}
export default EventSwitcher
