import _ from 'lodash'
import React from 'react'
import {View, Text, ScrollView, TouchableOpacity, Image, Dimensions} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import {commonStyle} from '../../../native/styles'
import {LoadingBar, Panel, Grid} from '../../_library'
import {getScroll} from "../../../_common/core/utils";
var getwindowhieht = Dimensions.get('window').height;
export default class PerformancePromoterSales extends React.Component {
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
    const {event, loading, performance, currency} = this.props
    return (
      <View>
        {performance &&
          _.map(performance.promoter_sales, (record, index) => {
            const link = `https://www.theticketfairy.com/r/1086/${record.user_id}`

            return (
              <View key={`promoter-${index}`} style={{paddingHorizontal:25}}>
                <View style={{flexDirection:'row',alignItems:'center', marginVertical:5}}>
                  <Image style={{height: 19.13, width: 16}} source={require('@nativeRes/images/system_icons/user-ico.png')}/>
                  <Text style={[commonStyle.userInfoFullname, {fontSize: 18, marginLeft: 10, fontFamily: 'Open Sans'}]}>{record.first_name} {record.last_name}</Text>
                </View>
                <View style={{paddingVertical:5,flexDirection:'row', alignItems: 'center'}}>
                  <Image style={{height: 11.72, width: 18, marginRight: 5 }} source={require('@nativeRes/images/system_icons/messaging.png')}/>
                  <Text style={{fontSize:14, fontFamily: 'Open Sans', color: '#b6c5cf'}}>&nbsp;{record.email}</Text>
                </View>
                <View style={{padding:5,flexDirection:'row', backgroundColor: '#4e525c', marginVertical: 5}}>
                  <Image style={{height: 16, width: 15.81, marginRight: 5 }} source={require('@nativeRes/images/system_icons/links.png')}/>
                  <Text style={commonStyle.userInfoDesc}>&nbsp;Promoter Link: {'\n'} {link}&nbsp;</Text>
                </View>
                <View style={{marginTop: 87, flexDirection: 'row', marginBottom: 0, alignItems:'center', justifyContent: 'flex-end'}}>
                  <Text style={{fontSize: 18, color: '#fff', textAlign: 'right', fontFamily: 'Open Sans'}}>{record.total_sales}</Text>
                  <Text style={{fontSize: 14, color: '#fff', textAlign: 'right', fontFamily: 'Open Sans', marginLeft:5}}>Total Tickets Sold</Text>
                </View>
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
                />
              </View>
            )
          })
        }
      </View>
    )
  }
}

