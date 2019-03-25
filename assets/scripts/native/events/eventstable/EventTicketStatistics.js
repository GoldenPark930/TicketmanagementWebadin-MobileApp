import _ from 'lodash'
import React from 'react'
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ListView,
  ActivityIndicator
} from 'react-native'
import moment from 'moment-timezone'
import PropTypes from 'prop-types';
import {connect} from 'react-redux'
import {makeURL} from '../../../_common/core/http'
import {HTTP_INIT, HTTP_LOADING, HTTP_LOADING_SUCCESSED, HTTP_LOADING_FAILED, CACHE_SIZE} from '../../../_common/core/http'
import {Counter}  from '../../_library'
import session from '../../../_common/redux/events/actions'
import Icon from 'react-native-vector-icons/FontAwesome'

import styles from '../../styles/events_list'

class EventTicketStatistics extends React.Component {
  static propType = {
    event: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props)

    this.tmp = []
    this.refreshFlag = false
    this.refreshTimer = null
    this.unMounted = true

    this.state = {
      http_status: HTTP_INIT,
      http_error: null,
      rows: [],
    }
  }

  componentDidMount() {
    this.handleScroll()
    const {autoRefresh} = this.props
    this.unMounted = false
    this.init()
    let self = this
    // if (autoRefresh && autoRefresh > 1000) {
    //   self.refreshTimer = setInterval(() => {
    //     if ((self.state.http_status == HTTP_LOADING_SUCCESSED || self.state.http_status == HTTP_LOADING_FAILED) && !self.refreshFlag) {
    //       self.refreshFlag = true
    //       self.init(true)
    //       // self.setState({http_status: self.state.http_status})
    //     }
    //   }, autoRefresh)
    // }
  }
  handleScroll(){
    if(this.unMounted)
      return
    let isVisible = this.isInVisibleArea()
    if(isVisible && !this.everLoaded){
      this.init(true)
    }
  }
  componentWillUnmount() {
    this.unMounted = true
    this.refreshFlag = false
    if (this.refreshTimer)
      clearInterval(this.refreshTimer)
  }

  init(isInitial) {
    const self = this
    const {event, ticketStats} = this.props

    this.tmp = []

    const url = `/api/events/${event.id}/relationships/performance/`
    const param = {'section': 'sales'}
    const node = 'data.sales.*'
    let isFoundFromRedux = false
    if(isInitial){
      _.map(ticketStats, (ts) => {
        if(ts.id == event.id){
          this.setState({
            ysold: ts.ysold,
            sold: ts.sold,
            total: ts.total,
            revenue: ts.revenue,
            http_status: HTTP_LOADING_SUCCESSED
          })
          isFoundFromRedux = true
        }
      })
    }
    fetch(makeURL(url, param),{
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json'
      },
      withCredentials: true
    }).then((response) => response.json())
      .then((responseJson) => {
        if(!self.unMounted)
          self.addToRow(responseJson.data.sales, HTTP_LOADING_SUCCESSED, null)
    })
  }

  addToRow(cached, http_status, http_error) {
    let rows = this.refreshFlag ? [] : this.state.rows

    let tmp = cached
    let start = rows.length
    _.map(tmp, (o, index) => {
      // newRow.id = index
      let newRow = Object.assign({}, o)
      if (newRow) {
        rows.push(newRow)
      }
    })
    if (this.refreshFlag) {
      this.refreshFlag = false
    }
    this.tmp = []
    const {event} = this.props

    if(http_status > HTTP_LOADING && !this.refreshFlag){
      let currentDate = !!event.timezone ? moment().tz(event.timezone).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD')
      let yesterday = !!event.timezone ? moment().add(-1, 'days').tz(event.timezone).format('YYYY-MM-DD') : moment().add(-1, 'days').format('YYYY-MM-DD')
      let sold=0, revenue=0, total=0, ysold = 0
      _.each(rows, (s, index) => {
        if(s.order_date == yesterday){
          ysold = !s.quantity || isNaN(s.quantity) ? 0 : parseInt(s.quantity)
        }
        if(s.order_date == currentDate){
          sold = !s.quantity || isNaN(s.quantity) ? 0 : parseInt(s.quantity)
        }
        total += !s.quantity || isNaN(s.quantity) ? 0 : parseInt(s.quantity)
        revenue += !s.income || isNaN(s.income) ? 0 : parseFloat(s.income)
      })
      this.props.UPDATE_EVENT_TICKET_STATISTICS({
        id: this.props.event.id,
        ysold: ysold,
        sold: sold,
        total: total,
        revenue: revenue
      })
    }
    this.setState({
      http_status: http_status,
      http_error: http_error,
      rows: rows,
    })
  }

  render() {
    const {http_status} = this.state
    const {event, ticketStats} = this.props
    const isLimitedStats = !!event ? (event.$relationships.self.role == 'limited_stats' ? true : false) : false
    let currency = (event && event.currency && event.currency.symbol) ? event.currency.symbol : '$'

    let sold = 0, revenue = 0, total = 0, ysold = 0
    const isLoading = http_status <= HTTP_LOADING && !this.refreshFlag
    _.map(ticketStats, (ts) => {
      if(ts.id == event.id){
        ysold = ts.ysold
        sold = ts.sold
        total = ts.total
        revenue = ts.revenue
      }
    })
    return (
      <View style={styles.eventItemFlexDirection}>
        <View style={styles.eventStatisticsItemWrapper}>
            <View style={{flexDirection:'row', alignItems:'center'}}>
                <Icon name='ticket' size={18} color='#b6c5cf' />
                <Text style={styles.eventStatisticsDescription}>Tickets Sold</Text>
            </View>
        </View>
        <View style={styles.eventStatisticsItemWrapper}>
          <Counter
            end={sold}
            start={0}
            time={2500}
            digits={0}
            easing='linear'
            style={styles.sold}
          />
          <Text style={styles.legEnd}>Today</Text>
        </View>
        <View style={styles.eventStatisticsItemWrapper}>
          <Counter
            end={ysold}
            start={0}
            time={2500}
            digits={0}
            easing='linear'
            style={styles.sold}
          />
          <Text style={styles.legEnd}>Yesterday</Text>
        </View>
        <View style={styles.eventStatisticsItemWrapper}>
          <Counter
            end={total}
            start={0}
            time={2500}
            digits={0}
            easing='linear'
            style={styles.sold}
          />
          <Text style={styles.legEnd}>Total</Text>
        </View>
        <View style={styles.eventStatisticsItemWrapper}>
          <View style={{flexDirection:'row', alignItems:'center'}}>
            <Icon name='money' size={18} color='#b6c5cf' />
            <Text style={styles.eventStatisticsDescription}>Revenue</Text>
          </View>
        </View>
        {!isLimitedStats &&
          <View style={styles.eventStatisticsItemWrapper}>
            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.eventStatisticsDescription}>US$ </Text>
            <Counter
              end={revenue}
              start={0}
              time={2500}
              digits={0}
              easing='linear'
              style={styles.eventStatisticsDescription}
            />
            </View>
            <Text style={styles.legEnd}>Total</Text>
          </View>
        }
      </View>

    )
  }

}export default connect(
  (store) => ({
    ticketStats: store.events.get('ticketStats').toList().toJS()
  }),
  {UPDATE_EVENT_TICKET_STATISTICS: session.UPDATE_EVENT_TICKET_STATISTICS}
)(EventTicketStatistics)
