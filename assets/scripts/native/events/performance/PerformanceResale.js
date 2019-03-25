import _ from 'lodash'
import React from 'react'
import {View, Text, ScrollView, TouchableOpacity, Dimensions} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import {Panel, Grid, BarChart, PieChart}  from '../../_library'
import {commonStyle} from '../../../native/styles'
import {LoadingBar, EmptyBar} from '../../_library'
import {getScroll} from "../../../_common/core/utils";
var getwindowhieht = Dimensions.get('window').height;
export default class PerformanceResale extends React.Component {
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
    const {event, loading, performance} = this.props
    return (
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
    )
  }
}

