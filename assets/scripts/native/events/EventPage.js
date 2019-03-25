import _ from 'lodash'
import {connect} from 'react-redux'
import React from 'react'
import {
  View,
  Text,
  Image,
  ScrollView
} from 'react-native'
import {routeActions} from 'react-router-redux'
import {commonStyle, eventpage} from '../../native/styles'
import {setScroll} from "../../_common/core/utils";

import sessionEventPage from '../../_common/redux/events/actions'

import {LoadingBar, Address, Notifications, EventSwitcher} from '../_library'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

class EventPage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
    this.fetchEvents = false
    this.scrollTimeout = null
  }
  componentDidMount() {
    const {FETCH_EVENT, CLEAR_SELECTED_EVENT, params: {id}} = this.props
    if(this.props.events.length == 0){
      this.fetchEvents = true
      this.props.FETCH_EVENTS()
    }else{
      this.fetchEvents = false
    }
    if (_.get(this.props.event, 'id', '') !== id) {
      CLEAR_SELECTED_EVENT()
      FETCH_EVENT(id)
    }
  }

  componentWillReceiveProps(props) {
    const {FETCH_EVENT, CLEAR_SELECTED_EVENT} = this.props
    if(!props.event)
      return
    if ((props.event && props.event.id) != (props.params && props.params.id)) {
      FETCH_EVENT(props.params && props.params.id)
    }
  }
  switchEvent(event) {
    var res = this.props.location.pathname.split('/')
    var url = `/${res[1]}/${event.id}/${res[3]}`
    this.props.replace(url)
  }

  handleScroll = (eventdata) => {
    setScroll(eventdata.nativeEvent.contentOffset.y)
  }

  render() {
    const {event, error, loading, loadingEvents, routes} = this.props
    let showLoading = loading
    if(!event){
      showLoading = true
    }
    let isVenue = false
    if(this.props.location.pathname.indexOf('venues') > -1) {
      isVenue = true
    }
    const address = event ? event.venue : null
    let events = this.props.events || []
    if (this.fetchEvents && this.props.events.length > 0) {
      this.fetchEvents = false
    }
    return (
      <KeyboardAwareScrollView
        onScroll={this.handleScroll}
        enableResetScrollToCoords = {false}
        innerRef = {(scrollView) => {_scrollView = scrollView }}
        style={commonStyle.pageContainer} name='lazyload-event'>
        <Notifications />
        {!showLoading &&
          <View style={eventpage.event}>
            {event.imageURL &&
            <View style={eventpage.event_img}>
              <Image style={eventpage.event_img} source={{uri: event.imageURL}} />
            </View>
            }
            {!event.imageURL && <Image style={eventpage.event_img} source={require('@nativeRes/images/no_img.png')} />}
            <EventSwitcher
              currentEvent={event}
              events={events}
              active={!this.fetchEvents}
              onClickEvent={(event) => {this.switchEvent(event)}}
            />
          </View>
        }
        <View style={{height:20}}/>
        <View style={{flex:1}}>
          {!showLoading && this.props.children}
          {showLoading && <LoadingBar title={'Hold tight! We\'re getting your event\'s details...'}/>}
        </View>
        <View style={{height:40}}/>
      </KeyboardAwareScrollView>
    )
  }
}
export default connect(
  (state) => {
    const event = state.events.get('selected')
    return {
      loading: state.loading.has('FETCH_EVENT'),
      error: state.events.get('errors').get('FETCH_EVENT'),
      loadingEvents: state.loading.has('FETCH_EVENTS'),
      events: state.events.get('events').toList().toJS(),
      event: event ? event.toJS() : null
    }
  },
  {
    FETCH_EVENTS: sessionEventPage.FETCH_EVENTS,
    CLEAR_SELECTED_EVENT:sessionEventPage.CLEAR_SELECTED_EVENT,
    FETCH_EVENT:sessionEventPage.FETCH_EVENT,
    push: routeActions.push, replace: routeActions.replace,
  }
)(EventPage)
