/* eslint-disable quotes */
import _ from 'lodash'
import {connect} from 'react-redux'
import moment from 'moment'

import React from 'react'
import Icon from 'react-native-vector-icons/FontAwesome'
import DeviceInfo from 'react-native-device-info'
import {ScrollView, StyleSheet, Text, TouchableOpacity, View, Image, ListView} from 'react-native'
import actions from '../../_common/redux/orders/actions'
import {STATE_STATUS} from '../../_common/redux/actions'

import {Switch, Panel, Grid, LoadingBar, Select} from '../_library'
import {commonStyle, Orders as styles} from '../styles'

export const IS_FOUND = (value, keyword) => {
  if(!value)
    return 0
  return value.toLowerCase().indexOf(keyword) != -1 ? 1 : 0
}


const ORDER_STATUS_ALL = 0
const ORDER_STATUS_PAID = 1
const ORDER_STATUS_REFUNDED = 2
const ORDER_STATUS_PENDING = 3

class Orders extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      order_status: ORDER_STATUS_ALL,
      csvData: null,
      csvFileName: '',
      filter_type: '',
      filter_types: [],
      filter_addon: '',
      filter_addons: [],
      filter_compOrder: false,
      showResend: false,
      resendEmail: '',
      orderID: null,
      expandedRows: []
    }
  }

  fetchCallback = (rows) => {
    const {event} = this.props
    let fileName = 'tickets_' + event.id + '_' + moment().format('YYYYMMDDHHmmss') + '.csv'
    let data = [], newRow = {}, filter_types = [], filter_addons = []
    // add body
    _.map(rows, (t, index)=>{
      if(t.tickets){
        _.map(t.tickets, (ticket, tid)=>{
          filter_types.push(ticket.ticketType)
        })
      }
      if(t.addOns){
        _.map(t.addOns, (addon, aid)=>{
          filter_addons.push(addon.name)
        })
      }
      if(t.tickets && t.order.status == 'Paid'){
        _.map(t.tickets, (ticket, tid)=>{
          newRow = {}
          newRow.qr_data = ''
          newRow.ticket_first_name = ticket.firstName
          newRow.ticket_last_name = ticket.lastName
          newRow.ticket_email = ticket.email
          newRow.buyer_email = t.order.billingEmail
          newRow.phone = t.order.billingPhone
          newRow.street_address = ''
          newRow.city = t.order.billingCity
          newRow.state = ''
          newRow.zip_postcode = ''
          newRow.country = t.order.billingCountry
          newRow.ticket_type = ticket.ticketType
          newRow.ticket_price = ''
          newRow.status = ticket.status
          newRow.order_id = t.order.id
          newRow.ticket_id = ticket.ticketHash
          newRow.ordered_by_first_name = t.order.billingFirstName
          newRow.ordered_by_last_name = t.order.billingLastName
          newRow.order_date = t.order.orderDate
          newRow.order_datetime = t.order.orderDateTime
          newRow.checked_in_at = ''
          newRow.discount_code = t.order.discountCode
          newRow.twitch_display_name = ''
          newRow.twitch_partnered = ''
          newRow.upgrades = ''
          newRow.data_capture = ''
          if(ticket.status != 'cancelled' && ticket.status != 'refunded')
            data.push(newRow)
        })
      }
    })

    filter_types = _.orderBy(_.uniq(filter_types))
    filter_addons = _.orderBy(_.uniq(filter_addons))
    this.setState({csvData: data, csvFileName: fileName, filter_types: filter_types, filter_addons: filter_addons})
  }

  expandRow = (rec) => {
    const {expandedRows} = this.state

    expandedRows.push(rec)
    this.setState({expandedRows})
  }
  collapseRow = (rec) => {
    const {expandedRows} = this.state

    const index = _.findIndex(expandedRows, {...rec})
    expandedRows.splice(index, 1)
    this.setState({expandedRows})
  }

  currency() {
    const {event} = this.props
    return (event && event.currency && event.currency.symbol) ? event.currency.symbol : '$'
  }

  onClickTab(order_status) {
    this.setState({order_status: order_status})
  }
  onFilterType = (e) =>{
    this.setState({filter_type: e})
  }
  onFilterAddon = (e) =>{
    this.setState({filter_addon: e})
  }
  onFilterCompOrder = (e) => {
    this.setState({filter_compOrder: e})
  }
  renderExpandedRow(rec) {
    const ticket_rows = _.map(rec.tickets, (ticket, tid) => {
      let row_color = styles.ticket_red
      if (ticket.status == 'valid')
        row_color = styles.ticket_green
      if (ticket.status == 'checked in')
        row_color = styles.ticket_yellow
      return (
        <View key={tid} style={row_color}>
          <View style={{flex: 1}}>
            <Text style={{color: '#ffffff',}}>
              {ticket.ticketHash.toUpperCase()}
            </Text>
          </View>
          <View style={{flex: 1}}>
            <Text style={{color: '#ffffff',}}>
              {ticket.firstName} {ticket.lastName}
            </Text>
          </View>
          <View style={{flex: 1}}>
            <Text style={{color: '#ffffff',}}>
              {ticket.ticketType}
            </Text>
          </View>
          <View style={{flex: 1}}>
            <Text style={{color: '#ffffff',}}>
              {ticket.status}
            </Text>
          </View>
        </View>
      )
    })

    const addons_rows = _.map(rec.addOns, (addons, aid) => {
      return (
        <View key={aid} className={'row-content row'}>
          <View style={{flex: 1}}>
            <Text style={{color: '#ffffff',}}>
              {addons.name}
            </Text>
          </View>
          <View style={{flex: 1}}>
            <Text style={{color: '#ffffff',}}>
              {this.currency()}{addons.cost.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </Text>
          </View>
        </View>
      )
    })

    return (
      <View style={styles.row_detail}>
        <View style={{flexDirection: 'row'}}>
          <View style={styles.low_title}><Text style={styles.low_title_text}>Contact Information</Text></View>
          <View style={styles.low_title}><Text style={styles.low_title_text}>Location</Text></View>
        </View>
        <View style={styles.row_content}>
          <View style={{flex: 1}}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Icon name="envelope" size={14} color="#b6c5cf"/>
              <Text style={styles.detail_item_text}>Email Address</Text>
            </View>
            <Text style={{color: '#ffffff'}}>{rec.order.billingEmail}</Text>
          </View>
          <View style={{flex: 1}}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Icon name="phone-square" size={14} color="#b6c5cf"/>
              <Text style={styles.detail_item_text}> Phone Number</Text>
            </View>
            <Text style={{color: '#ffffff'}}>{rec.order.billingPhone}</Text>
          </View>
          <View style={{flex: 1}}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Icon name="map-marker" size={14} color="#b6c5cf"/>
              <Text style={styles.detail_item_text}> City</Text>
            </View>
            <Text style={{color: '#ffffff'}}>{rec.order.billingCity}</Text>
          </View>
          <View style={{flex: 1}}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Icon name="globe" size={14} color="#b6c5cf"/>
              <Text style={styles.detail_item_text}> Country</Text>
            </View>
            <Text style={{color: '#ffffff'}}>{rec.order.billingCountry}</Text>
          </View>
        </View>

        <View style={[styles.low_title, {marginTop: 20}]}><Text style={styles.low_title_text}>Tickets</Text></View>
        <View style={[styles.row_content, {flexDirection: 'column'}]}>
          <View style={{flexDirection: 'row'}}>
            <View style={{flex: 1, padding: 4}}>
              <Text style={styles.ticket_title}>Ticket ID</Text>
            </View>
            <View style={{flex: 1, padding: 4}}>
              <Text style={styles.ticket_title}>Ticket Holder</Text>
            </View>
            <View style={{flex: 1, padding: 4}}>
              <Text style={styles.ticket_title}>Ticket Type</Text>
            </View>
            <View style={{flex: 1, padding: 4}}>
              <Text style={styles.ticket_title}>Status</Text>
            </View>
          </View>
          {ticket_rows}
        </View>
        <View style={[styles.low_title, {marginTop: 20}]}><Text style={styles.low_title_text}>Add-ons / Upgrades</Text></View>
        {rec.addOns.length > 0 ?
          <View style={[styles.row_content, {borderBottomWidth: 0}]}>
            <View style={{flex: 1}}>
              <Text style={styles.ticket_title}>
                Add-on / Upgrade
              </Text>
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.ticket_title}>
                Quantity
              </Text>
            </View>
          </View> :
          <View style={[styles.row_content, {borderBottomWidth: 0}]}>
            <Text style={styles.ticket_title}>
              Not purchased
            </Text>
          </View>
        }
        {rec.addOns.length > 0 &&
        <View>
          {addons_rows}
        </View>
        }
      </View>
    )
  }

  render() {
    //if (this.props.loading) return <LoadingBar title={'Hold tight! We\'re getting your event\'s statistics...'}/>
    const {order_status, csvData, csvFileName, filter_types, filter_type, filter_addons, filter_addon, filter_compOrder, expandedRows} = this.state
    const {event, orders} = this.props
    let select_filter_types = [{value: '', label: 'All'}]
    _.map(filter_types, (e, i) => {
      select_filter_types.push({value: e, label: e})
    })
    let select_filter_addons = [{value: '', label: 'All'}]
    _.map(filter_addons, (e, i) => {
      select_filter_addons.push({value: e, label: e})
    })
    let tab_header = _.map([ORDER_STATUS_ALL, ORDER_STATUS_PAID, ORDER_STATUS_REFUNDED, ORDER_STATUS_PENDING], (s) => {
      let title = ''
      switch (s) {
        case ORDER_STATUS_ALL:
          title = 'All Orders'
          break
        case ORDER_STATUS_PAID:
          title = 'Paid Orders'
          break
        case ORDER_STATUS_REFUNDED:
          title = 'Refunded Orders'
          break
        case ORDER_STATUS_PENDING:
          title = 'Pending Orders'
          break
        default:
          break
      }
      return (
        <TouchableOpacity key={s} style={s == order_status ? styles.tab_title_selected : styles.tab_title}
                          onPress={() => this.onClickTab(s)}>
          <Text style={s == order_status ? styles.tab_title_text_selected : styles.tab_title_text}>{title}</Text>
        </TouchableOpacity>
      )
    })

    return (
      <View>
        <Grid
        ref="grid"
        //data={Object.keys(orders).map(id => ({id, ...orders[id]}))}
        store={{url: `/api/events/${event.id}/relationships/orders/`, node: 'data.*'}}
        loadingTitle= "Hold tight! We\'re getting your event\'s orders..."

        columns={[{
          name: '',
          width: 58,
          style: {paddingLeft:0,paddingRight:0, paddingTop:0, paddingBottom:0},
          renderer: (rec) => {
            const expanded = _.findIndex(this.state.expandedRows, {...rec})>-1
            return (
              <TouchableOpacity style={expanded ? styles.expandIcon_expanded : styles.expandIcon} onPress={() => {expanded ? this.collapseRow(rec) : this.expandRow(rec)}}>
                <Icon name={expanded ? "minus-square-o" : "plus-square-o"} size={18} color="#b6c5cf"/>
              </TouchableOpacity>
            )
          }
        }, {
          name: 'Order ID',
          renderer: (rec, val) => {
            return (
              <Text style={commonStyle.gridBodyCellLabel}>
                {rec.order.id}
              </Text>
            )
          },
          sort: true,
          sortFunc: (rec) => (rec.order.id)
        }, {
          name: 'Date',
          renderer: (rec, val) => {
            return (
              <Text style={commonStyle.gridBodyCellLabel}>
                {rec.order.orderDate}
              </Text>
            )
          },
          sort: true,
          sortFunc: (rec) => (rec.order.orderDate)
        }, {
          name: 'Status',
          renderer: (rec, val) => (
            <Text style={commonStyle.gridBodyCellLabel}>
              {rec.order.status}
            </Text>
          ),
          sort: true,
          sortFunc: rec => rec.order.status
        }, {
          name: 'Name',
          renderer: (rec, val) => (
            <Text style={commonStyle.gridBodyCellLabel}>
              {`${rec.order.billingFirstName} ${rec.order.billingLastName}`}
            </Text>
          ),
          sort: true,
          sortFunc: rec => `${rec.order.billingFirstName} ${rec.order.billingLastName}`
        }, {
          name: 'Email',
          flex: 2,
          renderer: (rec, val) => {
            return (
              <Text style={commonStyle.gridBodyCellLabel}>
                {rec.order.billingEmail}
              </Text>
            )
          },
          sort: true,
          sortFunc: (rec) => (rec.order.billingEmail)
        }, {
          name: 'Total',
          renderer: (rec, val) => {
            return (
              <Text style={commonStyle.gridBodyCellLabel}>
                {this.currency()}{parseFloat(rec.order.total).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
              </Text>
            )
          },
          sort: true,
          sortFunc: (rec) => (parseFloat(rec.order.total))
        }]}
        filterFunc={(rows, search) => {
          const {order_status, filter_type, filter_addon, filter_compOrder} = this.state
          let rows_filtered = rows
          // filter by orders status
          switch(order_status){
            case ORDER_STATUS_ALL:
              rows_filtered = rows
              break
            case ORDER_STATUS_PAID:
              rows_filtered = _.filter(rows, {'order': {'status':'Paid'}})
              break
            case ORDER_STATUS_PENDING:
              rows_filtered = _.filter(rows, {'order': {'status':'Pending'}})
              break
            case ORDER_STATUS_REFUNDED:
              rows_filtered = _.filter(rows, {'order': {'status':'Refunded'}})
              break
            default:
              rows_filtered = rows
              break
          }

          // filter by ticket type
          if(filter_type != ''){
            rows_filtered = _.filter(rows_filtered, (item) => {
              let found = 0
              _.map(item.tickets, (t) => {
                found += t.ticketType == filter_type ? 1 : 0
              })
              return found > 0
            })
          }

          // filter by addon
          if(filter_addon != ''){
            rows_filtered = _.filter(rows_filtered, (item) => {
              let found = 0
              _.map(item.addOns, (a) => {
                found += a.name == filter_addon ? 1 : 0
              })
              return found > 0
            })
          }

          // filter by compOrder
          if(filter_compOrder){
            rows_filtered = _.filter(rows_filtered, (item) => {
              return item.order.compOrder
            })
          }
          // filter by search
          // let keyword = search.join('').trim().toLowerCase()
          let keyword = search
          if(keyword != ''){
            rows_filtered = _.filter(rows_filtered, (item) => {
              let found = 0
              found += IS_FOUND(item.order.id, keyword)
              found += IS_FOUND(item.order.billingFirstName + ' ' + item.order.billingLastName, keyword)
              found += IS_FOUND(item.order.billingEmail, keyword)

              if (item.order.twitchChannel) {
                found += IS_FOUND(item.order.twitchChannel.display_name, keyword)
              }
              _.map(item.tickets, (t) => {
                found += IS_FOUND(t.firstName + ' ' + t.lastName, keyword)
                found += IS_FOUND(t.email, keyword)
                found += IS_FOUND(t.ticketHash, keyword)
              })
              return found > 0
            })
          }
          return rows_filtered
        }}
        paging
        stripe
        searchable
        taginput
        expandedRows={expandedRows}
        fetchCallback = {this.fetchCallback}
        detailViewRender={(rec) => this.renderExpandedRow(rec)}
        filterComponent = {(
          <View style={[commonStyle.rowContainer,{flexDirection:DeviceInfo.isTablet() ? 'row':'column', backgroundColor: '#2429355A', marginTop: 10, marginBottom: 20, padding:20, }]}>
            <Select
              label='Filter by Ticket Type'
              options={select_filter_types}
              value={filter_type}
              onChange={this.onFilterType}
            />
            <Select
              label='Filter by Add On'
              options={select_filter_addons}
              value={filter_addon}
              onChange={this.onFilterAddon}
            />
            <Switch label='Only Show Guest Ticket Orders' value={filter_compOrder} onChange={this.onFilterCompOrder}/>
          </View>
        )}
      />
      </View>
    )
  }
}

export default connect(
  (state) => {
    const event = state.events.get('selected').toJS()
    const orders = state.orders.get('orders').toJS()
    const loading = state.loading.has('FETCH_EVENT_ORDERS')
    return {
      event,
      orders,
      loading
    }
  },
  {FETCH_EVENT_ORDERS: actions.FETCH_EVENT_ORDERS}
)(Orders)
