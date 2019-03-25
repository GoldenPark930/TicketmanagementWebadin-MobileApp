import _ from 'lodash'
import {connect} from 'react-redux'
import {Link} from 'react-router'
import React from 'react'

import Notifications from '../_library/notifications/Notifications'
import LoadingBar from '../_library/LoadingBar'
import {CLEAR_SELECTED_EVENT, FETCH_EVENT, FETCH_EVENTS} from '../../_common/redux/events/actions'
import classNames from 'classnames'
import EventSwitcher from './_library/EventSwitcher'

@connect(
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
  {FETCH_EVENTS, CLEAR_SELECTED_EVENT, FETCH_EVENT}
)
export default class EventPage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
    this.fetchEvents = false
  }
  componentDidMount() {
    const {FETCH_EVENT, CLEAR_SELECTED_EVENT, FETCH_EVENTS, params: {id}} = this.props
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
  componentDidUpdate(prevProps) {
    const {FETCH_EVENT, params: {id: newid}} = this.props
    const {params: {id: oldid}} = prevProps
    if (newid && newid !== oldid && !this.props.event) {
      FETCH_EVENT(newid)
    }
  }
  switchEvent(event) {
    this.props.history.push(this.props.location.pathname.replace(this.props.params.id, event.id))
  }
  componentWillReceiveProps(props) {
    const {FETCH_EVENT, CLEAR_SELECTED_EVENT} = this.props
    if(!props.event)
      return
    if ((props.event && props.event.id) != (props.params && props.params.id)) {
      FETCH_EVENT(props.params && props.params.id)
    }
  }
  render() {
    const {event, error, loading, loadingEvents, routes} = this.props
    let showLoading = loading
    if(!event) {
      showLoading = true
    }
    let isVenue = false
    if(!!routes && routes.length > 0){
      if(routes[routes.length - 1].path == 'venues'){
        isVenue = true
      }
    }
    const address = !!event ? event.venue : null
    const events = this.props.events || []
    if(this.fetchEvents && this.props.events.length > 0){
      this.fetchEvents = false
    }

    return (
      <div className='body-main'>
        <Notifications />
        <div>
          <div className='body-panel-header'>
            <div className='left'>
              <div className='description'>
              {!showLoading &&
                <div className='event'>
                  {!!event.imageURL && <img src={event.imageURL} />}
                  {!event.imageURL && <img src={asset('/assets/resources/images/no_img.png')} />}
                  <EventSwitcher
                    currentEvent={event}
                    events={events}
                    active={!this.fetchEvents}
                    onClickEvent={(event) => {this.switchEvent(event)}}
                  />
                </div>
              }
              </div>
            </div>
          </div>
          <div className='body-panel-spacing'/>
          <div className='body-panel-content'>
            {!showLoading && this.props.children}
            {!!showLoading && <LoadingBar title={'Hold tight! We\'re getting your event\'s details...'}/>}
          </div>
        </div>
      </div>
    )
  }
}