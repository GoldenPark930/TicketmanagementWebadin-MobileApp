import _ from 'lodash'
import React from 'react'
import {connect} from 'react-redux'
import {View, Text, ScrollView, TouchableOpacity} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import session from '../../_common/redux/performance/actions'
import {Panel, Grid, BarChart, PieChart}  from '../_library'
import {commonStyle} from '../../native/styles'
import {LoadingBar, EmptyBar} from '../_library'

const getSortedJSON = (unsorted) => {
  const sorted = {}
  Object.keys(unsorted).sort().forEach(function (key) {
    sorted[key] = unsorted[key]
  })
  return sorted
}

const STATE_STATUS_INIT = 0
const STATE_STATUS_LOADING = 1
const STATE_STATUS_LOADING_SUCCESSED = 2
const STATE_STATUS_LOADING_FAILED = 3

class EventPerformance extends React.Component {
  constructor(props) {
    super(props)
    this.unMounted = true
    this.state = {
      status: STATE_STATUS_INIT
    }
  }

  componentDidMount() {
    this.unMounted = false
      if (this.state.status == STATE_STATUS_LOADING) {
        return
      }
    const {event, FETCH_EVENT_PERFORMANCE} = this.props

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

  handleReset() {
    let {show} = this.state
    this.setState({show: !show})
  }

  render() {
    const {show, status, chartWidth} = this.state
    const {loading, performance, event} = this.props
    let currency = (event && event.currency && event.currency.symbol) ? event.currency.symbol : '$'
    const getX = function (d, i) {
      return d[0]
    }
    const getY = function (d, i) {
      return d[1]
    }
    const margin = {right: 0, left: 0, top: 0, bottom: 0}
    // Ticket Sales data
    let sales_quantity = {}
    let sales_income = {}
    let total_ticket_sales = 0
    let total_ticket_revenue = 0.0

    if (!!performance && !!performance.sales) {
      _.each(performance.sales, (s, index) => {
        sales_quantity[s.order_date] = parseInt(s.quantity)
        total_ticket_sales += parseInt(s.quantity)
      })
      _.each(performance.sales, (s, index) => {
        sales_income[s.order_date] = s.income ? parseInt(s.income) : 0
        total_ticket_revenue += parseFloat(s.income)
      })
    }

    // Sales by Ticket Type data
    let total_sales = 0
    let total_revenue = 0.0

    let rows_release_breakdown_piechart = null//[['Empty', 1]]
    if (!!performance && !!performance.release_breakdown) {
      let breakdown = {}
      performance.release_breakdown.forEach((t, index) => {
        let revenue = parseInt(t.num_sales) * (t.cost ? parseFloat(t.cost) : 0)
        total_sales += parseInt(t.num_sales)
        total_revenue += revenue
        if (!breakdown[t.release_type])
          breakdown[t.release_type] = 0
        breakdown[t.release_type] += t.num_sales ? parseInt(t.num_sales) : 0
      })
      rows_release_breakdown_piechart = breakdown
    }

    // Sales by Discount Code data
    let total_discount_sales = 0
    let total_discount_revenue = 0.0

    if (!!performance && !!performance.discount_code_breakdown) {
      performance.discount_code_breakdown.forEach((t, index) => {
        let revenue = parseInt(t.numSales) * (t.cost ? parseFloat(t.cost) : 0)
        total_discount_sales += parseInt(t.numSales)
        total_discount_revenue += revenue
      })
    }

    // Sales by Password data
    let total_password_sales = 0
    let total_password_revenue = 0.0

    if (!!performance && !!performance.password_breakdown) {
      performance.password_breakdown.forEach((t, index) => {
        let revenue = parseInt(t.numSales) * (t.cost ? parseFloat(t.cost) : 0)
        total_password_sales += parseInt(t.numSales)
        total_password_revenue += revenue
      })
    }
    // Add ons data
    let total_addons_sales = 0
    let total_addons_revenue = 0.0

    if (!!performance && !!performance.add_on_breakdown) {
      performance.add_on_breakdown.forEach((t, index) => {
        let revenue = parseInt(t.num_sales) * (t.cost ? parseFloat(t.cost) : 0)
        total_addons_sales += parseInt(t.num_sales)
        total_addons_revenue += revenue
      })
    }
    const Loading_performance = <LoadingBar title={'Hold tight! We\'re getting your event\'s statistics...'}/>
    const render =
      <View>
        <Panel title='Ticket Sales' icon='bar-chart'>
            <BarChart json={sales_quantity} options={{titleY: 'Quantity'}}/>
            <BarChart json={sales_income} options={{titleY: 'Revenue'}}/>
          <Grid
            style={{marginTop:10}}
            columns={[{
              name: 'Order Date',
              dataIndex: 'order_date',
              summaryValue: 'Total',
              sort: true
            }, {
              name: 'No. of Tickets Sold',
              dataIndex: 'quantity',
              summaryValue: total_ticket_sales,
              sort:true
            }, {
              name: 'Revenue',
              dataIndex: 'income',
              renderer: (rec, val) => (<Text
                style={[commonStyle.gridBodyCellLabel, {alignSelf:'center'}]}>{val ? currency + ' ' + val.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }) : ''}</Text>),
              summaryValue: `${currency} ${total_ticket_revenue.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}`,
              sort:true
            }]}
            data={performance.sales}
            summary={true}
            paging={true}
          />
        </Panel>
        <Panel title='Sales by Ticket Type' style={{marginTop: 20}} icon='pie-chart'>
          { rows_release_breakdown_piechart &&
          <PieChart json={rows_release_breakdown_piechart} options={{title: 'Ticket Type'}}/>
          }
          <Grid
            style={{marginTop:10}}
            columns={[{
              name: 'Ticket Type',
              dataIndex: 'release_type',
              sort: true,
              summaryValue: 'Total'
            }, {
              name: 'Price (excl. Fees)',
              renderer: (rec, val) => {
                let cost = rec.cost ? parseFloat(rec.cost) : 0
                return (
                  <Text style={commonStyle.gridBodyCellLabel}>
                    {currency}{cost.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </Text>
                )
              },
              sort: true,
              sortFunc: (rec) => (rec.cost ? parseFloat(rec.cost) : 0)
            }, {
              name: 'No of Sales',
              dataIndex: 'num_sales',
              summaryValue: total_sales,
              sort: true
            }, {
              name: 'Revenue',
              renderer: (rec, val) => {
                let revenue = parseInt(rec.num_sales) * (rec.cost ? parseFloat(rec.cost) : 0)
                return (
                  <Text style={commonStyle.gridBodyCellLabel}>
                    {currency}{revenue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </Text>
                )
              },
              sort: true,
              sortFunc: (rec) => (parseInt(rec.num_sales) * (rec.cost ? parseFloat(rec.cost) : 0)),
              summaryValue: `${currency} ${total_revenue.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}`
            }]}
            data={performance.release_breakdown}
            paging={true}
            summary={true}
          />
        </Panel>
        <Panel title='Sales by Discount Code' style={{ marginTop: 20 }} icon='usd'>
          <Grid
            style={{marginTop:10}}
            columns={[{
              name: 'Discount Code',
              dataIndex: 'discountCode',
              sort: true,
              summaryValue: 'Total'
            }, {
              name: 'Ticket Type',
              dataIndex: 'ticketType',
              sort: true
            }, {
              name: 'Price (excl. Fees)',
              sort: true,
              sortFunc: (rec) => (rec.cost ? parseFloat(rec.cost) : 0),
              renderer: (rec, val) => {
                let cost = rec.cost ? parseFloat(rec.cost) : 0
                return (
                  <Text style={commonStyle.gridBodyCellLabel}>
                    {currency}{cost.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </Text>
                )
              }
            }, {
              name: 'No of Sales',
              dataIndex: 'numSales',
              summaryValue: total_discount_sales,
              sort: true
            }, {
              name: 'Revenue',
              renderer: (rec, val) => {
                let revenue = parseInt(rec.numSales) * (rec.cost ? parseFloat(rec.cost) : 0)
                return (
                  <Text style={commonStyle.gridBodyCellLabel}>
                    {currency}{revenue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </Text>
                )
              },
              sort: true,
              sortFunc: (rec) => (parseInt(rec.numSales) * (rec.cost ? parseFloat(rec.cost) : 0)),
              summaryValue: `${currency} ${total_discount_revenue.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}`
            }]}
            data={performance.discount_code_breakdown}
            paging={true}
            summary={true}
          />
        </Panel>
        <Panel title='Additional Charges' style={{marginTop: 20}} icon='usd'>
          <Grid
            style={{marginTop:10}}
            columns={[{
              name: 'Charge Description',
              dataIndex: 'short_description'
            }, {
              name: 'Quantity',
              dataIndex: 'quantity'
            }, {
              name: 'Gross Charge',
              renderer: (rec, val) => {
                let gross_amount = rec.gross_amount ? parseFloat(rec.gross_amount) : 0
                return (
                  <Text style={commonStyle.gridBodyCellLabel}>
                    {currency}{gross_amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </Text>
                )
              }
            }, {
              name: 'Net Charge',
              renderer: (rec, val) => {
                let net_amount = rec.net_amount ? parseFloat(rec.net_amount) : 0
                return (
                  <Text style={commonStyle.gridBodyCellLabel}>
                    {currency}{net_amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </Text>
                )
              }
            }]}
            data={performance.charges}
            paging={true}
          />
        </Panel>
        <Panel title='Sales by Promoter' style={{marginTop: 20}} icon='bullhorn'>
          {
            _.map(performance.promoter_sales, (record, index) => {
              const link = `https://www.theticketfairy.com/r/1086/${record.user_id}`

              return (
                <View key={`promoter-${index}`}>
                  <View style={{flexDirection:'row',alignItems:'center'}}>
                    <View style={commonStyle.userInfoAvatar}></View>
                    <Text style={commonStyle.userInfoFullname}>{record.first_name} {record.last_name}</Text>
                  </View>
                  <View style={{padding:5,flexDirection:'row'}}><Text style={commonStyle.userInfoDesc}><Icon name='envelope'/>&nbsp;{record.email}</Text></View>
                  <View style={{padding:5,flexDirection:'row'}}><Text style={commonStyle.userInfoDesc}><Icon name='link'/>&nbsp;Promoter Link: {link}&nbsp;</Text><TouchableOpacity style={{justifyContent:'center'}}><Icon color='#b6c5cf' name='copy'/></TouchableOpacity></View>
                  <Grid
                    style={{marginTop:10}}
                    columns={[{
                      name: 'Date',
                      dataIndex: 'date',
                      summaryValue: 'Total Tickets Sold'
                    }, {
                      name: 'Number of Tickets Sold',
                      dataIndex: 'total_sales',
                      summaryType: 'sum'
                    }]}
                    data={Object.keys(record.sales).map(key=>({date:key,total_sales:record.sales[key].total_sales}))}
                    summary={true}
                    paging={true}
                  />
                </View>
              )
            })
          }

        </Panel>
        <Panel title='Sales by Password' style={{marginTop: 20}} icon='key'>
          <Grid
            style={{marginTop:10}}
            columns={[{
              name: 'Ticket Type',
              dataIndex: 'ticketType',
              sort: true,
              summaryValue: 'Total'
            }, {
              name: 'Password',
              dataIndex: 'password',
              sort: true
            }, {
              name: 'Price (excl. Fees)',
              sort: true,
              sortFunc: (rec) => (rec.cost ? parseFloat(rec.cost) : 0),
              renderer: (rec, val) => {
                let cost = rec.cost ? parseFloat(rec.cost) : 0
                return (
                  <Text style={commonStyle.gridBodyCellLabel}>
                    {currency}{cost.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </Text>
                )
              }
            }, {
              name: 'No of Sales',
              dataIndex: 'numSales',
              sort: true,
              summaryValue: total_password_sales
            }, {
              name: 'Revenue',
              sort: true,
              sortFunc: (rec) => (parseInt(rec.numSales) * (rec.cost ? parseFloat(rec.cost) : 0)),
              renderer: (rec, val) => {
                let revenue = parseInt(rec.numSales) * (rec.cost ? parseFloat(rec.cost) : 0)
                return (
                  <Text style={commonStyle.gridBodyCellLabel}>
                    {currency}{revenue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </Text>
                )
              },
              summaryValue: `${currency} ${total_password_revenue.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}`
            }]}
            data={performance.password_breakdown}
            summary={true}
            paging={true}
          />
        </Panel>
        <Panel title='Add ons' style={{marginTop: 20}} icon='plus'>
          <Grid
            style={{marginTop:10}}
            columns={[{
              name: 'Name',
              dataIndex: 'name',
              sort: true,
              summaryValue: 'Total'
            }, {
              name: 'Price (excl. Fees)',
              sort: true,
              sortFunc: (rec) => (rec.cost ? parseFloat(rec.cost) : 0),
              renderer: (rec, val) => {
                let cost = rec.cost ? parseFloat(rec.cost) : 0
                return (
                  <Text style={commonStyle.gridBodyCellLabel}>
                    {currency}{cost.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </Text>
                )
              }
            }, {
              name: 'No of Sales',
              dataIndex: 'num_sales',
              sort: true,
              summaryValue: total_addons_sales
            }, {
              name: 'Revenue',
              sort: true,
              sortFunc: (rec) => (parseInt(rec.num_sales) * (rec.cost ? parseFloat(rec.cost) : 0)),
              renderer: (rec, val) => {
                let revenue = parseInt(rec.num_sales) * (rec.cost ? parseFloat(rec.cost) : 0)
                return (
                  <Text style={commonStyle.gridBodyCellLabel}>
                    {currency}{revenue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </Text>
                )
              },
              summaryValue: `${currency} ${total_addons_revenue.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}`
            }]}
            data={performance.add_on_breakdown}
            summary={true}
            paging={true}
          />
        </Panel>
        <Panel title='Waiting List' style={{marginTop: 20}} icon='hourglass-half'>
          <Grid
            style={{marginTop:10}}
            columns={[{
              name: 'Name',
              renderer: (rec, val) => (
                <Text style={commonStyle.gridBodyCellLabel}>
                  {rec.first_name} {rec.last_name}
                </Text>
              ),
              sort: true,
              sortFunc: rec => `${rec.first_name} ${rec.last_name}`
            }, {
              name: 'Email Address',
              dataIndex: 'email',
              sort: true
            }, {
              name: 'Status',
              dataIndex: 'status',
              sort: true
            }]}
            data={performance.waiting_list}
            searchable={true}
            paging={true}
            matchText='Number of Matching Orders'
          />
        </Panel>
        <Panel title='Ticket Resale' style={{marginTop: 20}} icon='hourglass-half'>
          <Grid
            style={{marginTop:10}}
            columns={[{
              name: 'Name',
              renderer: (rec, val) => (
                <Text style={commonStyle.gridBodyCellLabel}>
                  {rec.first_name} {rec.last_name}
                </Text>
              ),
              sort: true,
              sortFunc: rec => `${rec.first_name} ${rec.last_name}`
            }, {
              name: 'Ticket ID',
              dataIndex: 'ticket_hash',
              sort: true,
              renderer: (rec, val) => (
                <Text style={commonStyle.gridBodyCellLabel}>
                  {val.toUpperCase()}
                </Text>
              )
            }, {
              name: 'Status',
              dataIndex: 'status',
              sort: true
            }]}
            data={performance.resale}
            searchable={true}
            matchText='Number of Matching Tickets'
            paging={true}
          />
        </Panel>
      </View>
    return (
      <View>
        {loading ? Loading_performance : render}
      </View>
    )
  }
}

export default connect(
  (state) => {
    const event = state.events.get('selected').toJS()
    const performance = state.performance.get('performance').toJS()
    const loading = state.loading.has('FETCH_EVENT_PERFORMANCE')
    return {
      event,
      performance,
      loading
    }
  },
  { FETCH_EVENT_PERFORMANCE: session.FETCH_EVENT_PERFORMANCE }
)(EventPerformance)
