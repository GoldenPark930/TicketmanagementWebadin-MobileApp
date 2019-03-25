import _ from 'lodash'
import React from 'react'
import {connect} from 'react-redux'
import Immutable from 'immutable'
import {View, Dimensions} from 'react-native'
import session from '../../_common/redux/performance/actions'
import ticketSession from '../../_common/redux/tickets/actions'
import {TabView,Tab} from '../_library/TabView'
import {
  PerformanceSales,
  PerformanceReleaseBreakdown,
  PerformanceCharges,
  PerformanceDiscountCodeBreakdown,
  PerformancePromoterSales,
  PerformancePasswordBreakdown,
  PerformanceAddOnBreakdown,
  PerformanceWaitingList,
  PerformanceResale,
  PerformanceBoxOfficeSales,
  PerformancePreRegistration
} from '../pages'

const STATE_STATUS_INIT = 0
const STATE_STATUS_LOADING = 1
const STATE_STATUS_LOADING_SUCCESSED = 2
const STATE_STATUS_LOADING_FAILED = 3

class EventPerformance extends React.Component {
  constructor(props) {
    super(props)
    this.unMounted = true
    this.state = {
      status: STATE_STATUS_INIT,
    }
  }
  componentDidMount() {
    if (_scrollView) { _scrollView.scrollTo({x: 0, y: 0, animated: false}) }
    const {event, FETCH_EVENT_TICKETS, FETCH_EVENT_PERFORMANCE} = this.props

    Promise.resolve(FETCH_EVENT_TICKETS(event.id))

    const loadingSetter = (val) => () => {
      if(!this.unMounted)
        this.setState({status: val})
    }
    Promise.resolve(FETCH_EVENT_PERFORMANCE(event.id))
      .catch(loadingSetter(STATE_STATUS_LOADING_FAILED))
      .then(loadingSetter(STATE_STATUS_LOADING_SUCCESSED))
    loadingSetter(STATE_STATUS_LOADING)()
  }
  componentWillUnmount() {
    this.unMounted = true
  }
  render() {
    const {user, event, tickets, performance, loading} = this.props
    const isLimitedStats = !!event ? (event.$relationships.self.role == 'limited_stats' ? true : false) : false
    let currency = (event && event.currency && event.currency.symbol) ? event.currency.symbol : '$'
    return isLimitedStats ? (
      <View>
        <PerformanceSales event={event} isLimited={isLimitedStats} currency = {currency}/>
      </View>
    ):(
      <View>
        <TabView
          style={{paddingHorizontal:2, backgroundColor: '#393e46',marginTop: -10}}
          tabBarActiveBackgroundColor={{backgroundColor: '#393e46', paddingTop: 25, justifyContent: 'center'}}
          tabBarActiveTextStyle = {{color:'#ffa46b', fontSize:12}}
          tabBarTextStyle={{fontSize:12,}}
          tabBarActiveViewColor = '#ffffff00'
          tabBarStyle = {{backgroundColor: '#2f3138', marginTop: 10}}
        >
          <Tab  title='Ticket Sales' icon='bar-chart'>
            <PerformanceSales event={event} loading={loading} performance={performance} currency = {currency}/>
          </Tab>

          <Tab  title='Sales by Ticket Type' icon='pie-chart'>
            <PerformanceReleaseBreakdown event={event} tickets={tickets} loading={loading} performance={performance} currency = {currency} />
          </Tab>
          <Tab  title='Add ons' icon='plus'>
            <PerformanceAddOnBreakdown event={event} loading={loading} performance={performance} currency = {currency} />
          </Tab>
          <Tab  title='Pre-Registration' icon='signing'>
            <PerformancePreRegistration event={event} loading={loading} performance={performance} currency = {currency} />
          </Tab>
          <Tab  title='Waiting List' icon='hourglass-half'>
            <PerformanceWaitingList event={event} loading={loading} performance={performance} currency = {currency} />
          </Tab>
          <Tab  title='Ticket Resale' icon='usd'>
            <PerformanceResale event={event} performance={performance} currency = {currency}/>
          </Tab>
          <Tab  title='Sales by Discount Code' icon='money'>
            <PerformanceDiscountCodeBreakdown event={event} loading={loading} performance={performance} currency = {currency}/>
          </Tab>
          <Tab  title='Sales by Promoter' icon='bullhorn'>
            <PerformancePromoterSales event={event} loading={loading} performance={performance} currency = {currency}/>
          </Tab>
          <Tab  title='Box Office Sales' icon='ticket'>
            <PerformanceBoxOfficeSales event={event} loading={loading} performance={performance} currency = {currency}/>
          </Tab>
          <Tab  title='Additional Charges' icon='usd'>
            <PerformanceCharges event={event} loading={loading} performance={performance} currency = {currency}/>
          </Tab>
          <Tab  title='Sales by Password' icon='key'>
            <PerformancePasswordBreakdown event={event} loading={loading} performance={performance} currency = {currency}/>
          </Tab>
        </TabView>
      </View>
    )
  }
}

export default connect(
  (state) => {
    const event = state.events.get('selected').toJS()
    const performance = state.performance.get('performance').toJS()
    const loading = state.loading.has('FETCH_EVENT_PERFORMANCE')
    const col = state.tickets.get('collection')
    const tickets = state.tickets
      .getIn(['byEvent', event.id], Immutable.List())
      .map(tid => col.get(tid))
      .toJS()
    return {
      event,
      performance,
      loading,
      tickets
    }
  },
  {FETCH_EVENT_PERFORMANCE: session.FETCH_EVENT_PERFORMANCE, FETCH_EVENT_TICKETS: ticketSession.FETCH_EVENT_TICKETS}
)(EventPerformance)
