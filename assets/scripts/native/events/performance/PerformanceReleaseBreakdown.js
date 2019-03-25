import _ from 'lodash'
import React from 'react'
import {View, Text, ScrollView, TouchableOpacity} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import {Panel, Grid, BarChart, PieChart}  from '../../_library'
import {commonStyle} from '../../../native/styles'
import {getScroll} from "../../../_common/core/utils";
import {LoadingBar, EmptyBar} from '../../_library'
export default class PerformanceReleaseBreakdown extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showLoading : false
    }
    this.loading = null
  }
  componentWillMount(){
    const {loading, performance, currency} = this.props
    this.loading = setInterval(() => {
      if (getScroll() < 900) {
        this.setState({showLoading : true})
      }else {
        this.setState({showLoading: false})
        clearInterval(this.loading)
      }
    }, 500);
  }
  componentWillUnmount() {
    clearInterval(this.loading)
  }
  render() {
    const {loading, performance, currency} = this.props
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
    return (
      <View>
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
      </View>
    )
  }
}
