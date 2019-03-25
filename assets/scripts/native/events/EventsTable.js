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
  Linking
} from 'react-native'
import PropTypes from 'prop-types';
import {events, commonStyle} from '../../native/styles'
import moment from 'moment-timezone'
import {Link} from 'react-router-native'
import {DateLabel, Address, Button, Grid} from '../_library'
import Icon from 'react-native-vector-icons/FontAwesome'
import TagInput from 'react-native-tag-input'
import DeviceInfo from 'react-native-device-info'

import EventTicketStatistics from './eventstable/EventTicketStatistics'
const eventStyle = events

class EventRow extends React.Component {

  static propTypes = {
    event: PropTypes.object.isRequired
  }
  state = {
    height:0
  }
  componentWillMount(){
    if(this.props.event.imageURL) {
      Image.getSize(this.props.event.imageURL, (width, height) => {
        if(height > 0) {
          this.setState({
            height: 300 * height / width
          })
        }
      })
    }
  }
  render() {
    const {event} = this.props
    const address = !!event ? event.venue : null
    const organization = !!event? event.$relationships.owner.displayName : null
    const redirectPath = !!event? (event.$relationships.self.role == 'onsite' ? '/details' : '/performance') : '/performance'

    let startDate = moment(new Date(event.startDate))
    let startDate_utc = moment.utc(new Date(event.startDate))
    const now = new Date()
    const cs = [
      startDate.isBefore(now) ? 'row-stale eventslist-row ' : 'eventslist-row'
    ].join(' ')

    return (
      <View style={eventStyle.eventslist_details}>
        <View style={!DeviceInfo.isTablet() && {alignItems:'center'}}>
          {event.imageURL ?
            <View style={[eventStyle.LazyLoad,{height: this.state.height}]}>
              <Image style={[eventStyle.thumb,{height: this.state.height}]} source={{uri: event.imageURL}}/>
            </View>:
            <Text style={eventStyle.eventStartTime}>Not Set</Text>
          }
        </View>
        <View style={eventStyle.event_details}>
          <Text style={eventStyle.event_brand}>{organization.toUpperCase()}</Text>

          <Link to={'/event/' + event.id + redirectPath} >
            <Text ellipsizeMode='middle' style={eventStyle.event_name}>{event.displayName}</Text>
          </Link>

          <View style={eventStyle.event_time}>
            <Image style={eventStyle.eventTimeImg} source={require('@nativeRes/images/icon-clock.png')}/>
            <DateLabel className={eventStyle.eventStartTime} value={startDate_utc} format='LLL'></DateLabel>
          </View>
          <View style={eventStyle.event_address}>
            <Image style={eventStyle.eventTimeImg} source={require('@nativeRes/images/icon-location.png')}/>
            {address && <Address className={[eventStyle.eventStartTime, {color:'#b6c5cf'}]} type='simple' {...address} />}
            {!address && <Text style={eventStyle.eventStartTime}>Not Defined</Text>}
          </View>
        </View>
      </View>
    )
  }
}

class EventsTable extends Component {
  static propTypes = {
    events: PropTypes.arrayOf(PropTypes.object).isRequired,
    onPublish: PropTypes.func.isRequired,
    onUnpublish: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props)

    let rows = []
    props.events.map((event, index)=>{
      let newEvent = Object.assign({}, event)
      rows.push(newEvent)
    })
    this.state = {
      loading: {},
      search: [],
      rows: rows,
      rows_filtered: rows,
      widthlayout:0
    }
  }
  componentWillReceiveProps(nextProps){
    let rows = []
      nextProps.events.map((event, index)=>{
      let newEvent = Object.assign({}, event)
      rows.push(newEvent)
    })
    this.refreshState(rows, this.state.search)
  }
  componentDidMount() {
    // this.refs.tag.focus()
  }
  refreshState(rows, search){
    // filter by search
    const isFound = (value, keyword) => {
      if(!value)
        return 0
      return value.toLowerCase().indexOf(keyword) != -1 ? 1 : 0
    }
    let rows_filtered = rows
    let keyword = search.join('').trim().toLowerCase()
    if(keyword != ''){
      rows_filtered = rows_filtered.filter((item) => {
        let found = 0
        found += isFound(item.displayName, keyword)
        if(item.venue){
          found += isFound(item.venue.displayName, keyword)
          found += isFound(item.venue.city, keyword)
        }
        return found > 0
      })
    }
    this.setState({rows: rows, rows_filtered: rows_filtered, search: search})
  }
  onSearchChange(value){
    this.refreshState(this.state.rows, value)
  }
  handlePublish(event) {
    const loadingSetter = (val) => () => this.setState({loading: {...this.state.loading, [event.id]: val}})
    loadingSetter(true)()
    Promise.resolve(this.props.onPublish(event))
      .catch(loadingSetter(false))
      .then(loadingSetter(false))
  }
  handleUnpublish(event) {
    const loadingSetter = (val) => () => this.setState({loading: {...this.state.loading, [event.id]: val}})
    loadingSetter(true)()
    Promise.resolve(this.props.onUnpublish(event))
      .catch(loadingSetter(false))
      .then(loadingSetter(false))
  }
  saveTag() {
    this.refs.tag.parseTags()
    this.refs.tag.focus()
  }
  render() {
    const {onPublish, onUnpublish} = this.props
    const {rows_filtered, search} = this.state
    const rows = rows_filtered.map(event => {
      const {id, status, slug} = event
      const published = status === 'published'
      const loading = this.state.loading[id]
      const redirectPath = !!event? (event.$relationships.self.role == 'onsite' ? '/details' : '/performance') : '/performance'
      const isAdmin = !!event ? (event.$relationships.self.role == 'admin' ? true : false) : false
      return (
        <View key={id} style={[eventStyle.row_stale]}>
          <EventRow key={id} event={event}/>
          <View style={{alignItems:DeviceInfo.isTablet()?'flex-end':null}}>
            <View style={{marginBottom:10}}>
              <EventTicketStatistics event={event} autoRefresh={30 * 100}/>
            </View>
            <View style={eventStyle.eventItemFlexDirection}>
              <Button href={'/event/' + event.id + redirectPath} title='Manage Event' icon='cog' style={commonStyle.buttonPrimary}/>
              {published && <Button title='View Page' loading={loading} icon='ticket' style={commonStyle.buttonSecondary} onPress={()=>Linking.openURL(`https://www.theticketfairy.com/event/${event.slug}/`)}/>}
              {!published && isAdmin && <Button title='Publish' loading={loading} icon='check-circle-o' onPress={()=>this.handlePublish(event)}/>}
              {published && isAdmin && <Button title='Unpublish' loading={loading} icon='dot-circle-o' style={commonStyle.buttonDanger} onPress={()=>this.handleUnpublish(event)}/>}
            </View>
          </View>
        </View>
      )
    })
    return (
      <View style={eventStyle.events_mainView}>
        <Grid
          columns={
            [{
              name:'Event Details',
              style:{marginHorizontal:-20,marginVertical:-9},
              renderer: (event, val) => {
                const {id, status, slug} = event
                const published = status === 'published'
                const loading = this.state.loading[id]
                const redirectPath = !!event? (event.$relationships.self.role == 'onsite' ? '/details' : '/performance') : '/performance'
                const isAdmin = !!event ? (event.$relationships.self.role == 'admin' ? true : false) : false
                return (
                  <View key={id} style={[eventStyle.row_stale]}>
                    <EventRow key={id} event={event}/>
                    <View style={{alignItems:DeviceInfo.isTablet()?'flex-end':null}}>
                      <View style={{marginBottom:10}}>
                        <EventTicketStatistics event={event} autoRefresh={30 * 100}/>
                      </View>
                      <View style={eventStyle.eventItemFlexDirection}>
                        <Button href={'/event/' + event.id + redirectPath} size='small' title='Manage Event' icon='cog' style={[commonStyle.buttonPrimary,{width: 300,}]}/>
                        {published && <Button title='View Page' loading={loading} size='small' icon='ticket' style={[commonStyle.buttonSecondary, {width: 300,}]} onPress={()=>Linking.openURL(`https://www.theticketfairy.com/event/${event.slug}/`)}/>}
                        {!published && isAdmin && <Button title='Publish' size='small' loading={loading} icon='check-circle-o' style={{width: 300}} onPress={()=>this.handlePublish(event)}/>}
                        {published && isAdmin && <Button title='Unpublish' size='small' loading={loading} icon='dot-circle-o' style={[commonStyle.buttonDanger, {width: 300,}]} onPress={()=>this.handleUnpublish(event)}/>}
                      </View>
                    </View>
                  </View>
                )
              }
            }]
          }
          data={rows_filtered}
          paging={true}
          searchable={true}
          headerStyle = {{backgroundColor: '#2f3138', padding:10}}
          style={{flex:1}}
        />

      </View>

    )
  }
}export default EventsTable
