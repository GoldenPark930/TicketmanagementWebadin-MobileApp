import _ from 'lodash'
import React from 'react'
import {View, Text, ScrollView, TouchableOpacity, Dimensions} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import {Panel, Grid, BarChart, PieChart}  from '../../_library'
import {commonStyle} from '../../../native/styles'
import {LoadingBar, EmptyBar} from '../../_library'
import {getScroll} from "../../../_common/core/utils";
var getwindowhieht = Dimensions.get('window').height;
export default class PerformanceCharges extends React.Component {
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
  onClickTab(type){
    this.setState({filter_type: type})
  }
  onLayout = (e) => {
    this.setState({eltop: e.nativeEvent.layout.y})
  }
  render() {
    const {event, loading, performance, currency} = this.props
    return (
      <Grid
        style={{marginTop: 10}}
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
                {currency}{gross_amount.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
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
    )
  }
}
