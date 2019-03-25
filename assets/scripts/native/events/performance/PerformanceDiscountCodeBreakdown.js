import _ from 'lodash'
import React from 'react'
import {View, Text, ScrollView, TouchableOpacity, Dimensions} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import {Panel, Grid, BarChart, PieChart}  from '../../_library'
import {commonStyle} from '../../../native/styles'
import {LoadingBar, EmptyBar} from '../../_library'
import {getScroll} from "../../../_common/core/utils";
var getwindowhieht = Dimensions.get('window').height;
export default class PerformanceDiscountCodeBreakdown extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showLoading : false,
      eltop: 0
    }
    this.loading = null
  }
  componentWillMount(){
    this.loading = setInterval(() => {
      if (this.state.eltop > 0) {
        if ((getScroll() + getwindowhieht - 500) < this.state.eltop) {
          this.setState({showLoading : true})
        }else {
          this.setState({showLoading: false})
          clearInterval(this.loading)
        }
      }
    }, 500);
  }
  componentWillUnmount() {
    clearInterval(this.loading)
  }
  onLayout = (e) => {
    this.setState({eltop: e.nativeEvent.layout.y})
  }
  render() {
    const {loading, performance, currency} = this.props
    let total_discount_sales = 0
    let total_discount_revenue = 0.0

    if (!!performance && !!performance.discount_code_breakdown) {
      performance.discount_code_breakdown.forEach((t, index) => {
        let revenue = parseInt(t.numSales) * (t.cost ? parseFloat(t.cost) : 0)
        total_discount_sales += parseInt(t.numSales)
        total_discount_revenue += revenue
      })
    }
    return (
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

    )
  }
}

