import _ from 'lodash'
import React from 'react'
import {View, Text, ScrollView, TouchableOpacity, TouchableWithoutFeedback} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import {Panel, Grid, BarChart, DateRangPicker}  from '../../_library'
import {commonStyle} from '../../../native/styles'
import {LoadingBar, EmptyBar} from '../../_library'
export default class PerformanceSales extends React.Component {
  constructor(props) {
    super(props)
    this.unMounted = true
    this.state = {
      selectChat: false
    }
  }
  onDateRangeApply=(start, end) => {
    this.setState({
      startDate: start,
      endDate: end
    })
  }
  onDateRangeClear = () => {
    this.setState({
      startDate: null,
      endDate: null
    })
  }
  render() {
    const {event, loading, performance, currency} = this.props
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
    return (
      <View>
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 20}}>
          <TouchableWithoutFeedback onPress={()=>this.setState({selectChat: false})}>
            <View style={{marginLeft: 20, flexDirection:'row', padding: 15, alignItems: 'center',  borderBottomWidth : this.state.selectChat ? 0: 3, borderBottomColor: '#fbcc8f',}}>
              <Icon name="ticket" size={14} color={this.state.selectChat ? '#E9E9E9' : '#fbcc8f'}/>
              <Text style={{fontSize: 14, fontWeight: '600', fontFamily: 'Open Sans', color: this.state.selectChat ? '#E9E9E9' : '#fbcc8f', marginLeft: 10}}>Quantity</Text>
            </View>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={()=>this.setState({selectChat: true})}>
            <View style={{marginLeft: 20, flexDirection:'row', padding: 15, alignItems: 'center',  borderBottomWidth : this.state.selectChat ? 3: 0, borderBottomColor: '#fbcc8f',}}>
              <Icon name="money" size={14} color={this.state.selectChat ? '#fbcc8f' : '#E9E9E9'}/>
              <Text style={{fontSize: 14, fontWeight: '600', fontFamily: 'Open Sans', color: this.state.selectChat ? '#fbcc8f' : '#E9E9E9', marginLeft: 10}}>Revenue</Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
        {this.state.selectChat ? <BarChart json={sales_quantity} options={{titleY: ' '}}/> : <BarChart json={sales_income} options={{titleY: ' '}}/> }
        <DateRangPicker onApply={this.onDateRangeApply} onClear={this.onDateRangeClear}/>
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
      </View>
    )
  }
}

