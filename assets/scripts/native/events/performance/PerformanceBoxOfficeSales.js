import _ from 'lodash'
import React from 'react'
import {View, Text, ScrollView, TouchableOpacity, TouchableWithoutFeedback, Image, Dimensions} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import {Panel, Grid}  from '../../_library'
import {commonStyle} from '../../../native/styles'
import {LoadingBar, EmptyBar} from '../../_library'
import {getScroll} from "../../../_common/core/utils";
const FILTER_TYPE_NAME = 'Name'
const FILTER_TYPE_DATE = 'Date'
var getwindowhieht = Dimensions.get('window').height;
export default class PerformanceBoxOfficeSales extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filter_type: FILTER_TYPE_NAME,
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
    let cardkey = 0
    let performencekey = 0
      return (
        <View>
          <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
            <Text style={{fontFamily: 'Open Sans', color: '#E9E9E9', fontSize: 14, fontWeight: '600', fontFamily: 'Open Sans'}}>Group by:</Text>
            <TouchableWithoutFeedback onPress={()=>this.onClickTab(FILTER_TYPE_NAME)}>
              <View style={{marginLeft: 20, paddingVertical: 12, paddingHorizontal: 15, borderBottomWidth: 2, borderBottomColor: this.state.filter_type == FILTER_TYPE_NAME ? '#ffa46b' : '#E9E9E900'}}>
                <Text style={{fontWeight: '600', color: this.state.filter_type == FILTER_TYPE_NAME ? '#ffa46b' : '#E9E9E9',
                  fontSize: 14, fontFamily: 'Open Sans' }}>Name</Text>
              </View>
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback onPress={()=>this.onClickTab(FILTER_TYPE_DATE)}>
              <View style={{marginLeft: 20, paddingVertical: 12, paddingHorizontal: 15, borderBottomWidth: 2, borderBottomColor: this.state.filter_type == FILTER_TYPE_DATE ? '#ffa46b' : '#E9E9E900'}}>
                <Text style={{fontWeight: '600', color: this.state.filter_type == FILTER_TYPE_DATE ? '#ffa46b' : '#E9E9E9', fontFamily: 'Open Sans',
                  fontSize: 14, fontFamily: 'Open Sans', borderBottomWidth: 2, borderBottomColor: this.state.filter_type == FILTER_TYPE_NAME ? '#ffa46b' : '#E9E9E9', }}>Date</Text>
              </View>
            </TouchableWithoutFeedback>
          </View>

          <View>
            {performance.box_office_sales && _.map(performance.box_office_sales.users, (data, key)=>{
              performencekey += 1
              return (
                <View key={performencekey}>
                  <View>
                    {this.state.filter_type == FILTER_TYPE_NAME &&
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Image style={{width: 16, height: 19.13,}}
                             source={require('@nativeRes/images/system_icons/user-ico.png')}/>
                      <Text style={{
                        margin: 10,
                        fontSize: 16,
                        fontFamily: 'Open Sans',
                        fontWeight: '600',
                        color: '#E9E9E9'
                      }}>{key}</Text>
                    </View>
                    }
                    <View>
                      {_.map(data, (data, dates)=> {
                        cardkey += 1
                        let cards = data.cash
                        let card_total_sales = 0, card_total_revenue = 0.0, card_total_revenue_incl = 0.0
                        _.map(cards, (card, cardIndex)=>{
                          let revenue = parseInt(card.num_sales) * (card.cost ? parseFloat(card.cost) : 0)
                          let revenue2 = parseInt(card.num_sales) * (card.price ? parseFloat(card.price) : 0)
                          card_total_sales += parseInt(card.num_sales)
                          card_total_revenue += revenue
                          card_total_revenue_incl += revenue2
                        })
                        return(
                          <View key={cardkey}>
                            {this.state.filter_type == FILTER_TYPE_DATE &&<View style={{flexDirection: 'row', alignItems: 'center'}}>
                              <Image style={{width: 16, height: 17.13, }} source={require('@nativeRes/images/system_icons/cal.png')} />
                              <Text style={{margin:10, fontSize: 16, fontFamily: 'Open Sans', fontWeight: '600', color: '#E9E9E9'}}>{dates}</Text>
                            </View>}
                            <View style={{backgroundColor: '#2d3138', paddingHorizontal: 15, marginBottom: 20, marginHorizontal:10}}>
                            <View style={{padding:10, flexDirection: 'row',  alignItems: 'center', justifyContent: 'center',}}>
                              {this.state.filter_type == FILTER_TYPE_DATE  ?
                              <Image style={{width: 18, height: 21.52, marginRight: 10}} source={require('@nativeRes/images/system_icons/user-ico.png')} /> :
                              <Image style={{width:18, height: 19.27, marginRight: 10}} source={require('@nativeRes/images/system_icons/cal.png')}/>}
                              <Text style={{fontSize : 22, fontWeight: '700', fontFamily: 'Open Sans', color: '#fff'}}>{ this.state.filter_type == FILTER_TYPE_NAME ? dates : key}</Text>
                            </View>
                            <View style={{paddingVertical: 10, flexDirection: 'row', alignItems: 'center'}}>
                              <Image style={{width:20.95, height: 15, marginRight: 10}} source={require('@nativeRes/images/system_icons/credit-card.png')}/>
                              <Text style={{fontSize: 18, fontWeight: '700', color: '#fff', fontFamily: 'Open Sans'}}>Card</Text>
                            </View>
                            <View>
                              <Grid
                                style={{marginTop:10}}
                                columns={[{
                                  name: 'Ticket Type',
                                  dataIndex: 'release_type',
                                  summaryValue: 'Total',
                                  sort: true
                                }, {
                                  name: 'No of Sales',
                                  dataIndex: 'num_sales',
                                  summaryValue: `${card_total_sales}`,
                                  sort:true
                                }, {
                                  name: 'Price (incl. Fees)',
                                  renderer: (card, cardIndex) => (
                                    <Text
                                      style={[commonStyle.gridBodyCellLabel, {alignSelf:'center'}]}>{currency}{parseFloat(card.price).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</Text>),
                                  sort:true
                                }, {
                                  name: 'Revenue (incl. Fees)',
                                  renderer: (card, cardIndex) => (<Text
                                    style={[commonStyle.gridBodyCellLabel, {alignSelf:'center'}]}>{currency}{parseFloat(parseInt(card.num_sales) * (card.price ? parseFloat(card.price) : 0)).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</Text>),
                                  summaryValue: `${currency}${card_total_revenue_incl.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
                                  sort:true
                                }, {
                                  name: 'Price (excl. Fees)',
                                  renderer: (card, cardIndex) => (<Text
                                    style={[commonStyle.gridBodyCellLabel, {alignSelf:'center'}]}>{currency}{parseFloat(card.cost).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</Text>),
                                  sort:true
                                }, {
                                  name: 'Revenue (excl. Fees)',
                                  renderer: (card, cardIndex) => (<Text
                                    style={[commonStyle.gridBodyCellLabel, {alignSelf:'center'}]}>{currency}{parseFloat(parseInt(card.num_sales) * (card.cost ? parseFloat(card.cost) : 0)).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</Text>),
                                  summaryValue: `${currency}${card_total_revenue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
                                  sort:true
                                }]}
                                data={data.card}
                                summary={true}
                              />
                            </View>
                            <View style={{paddingVertical: 10, flexDirection: 'row', alignItems: 'center'}}>
                              <Image style={{width:24.22, height: 15, marginRight: 10}} source={require('@nativeRes/images/system_icons/cash-money.png')}/>
                              <Text style={{fontSize: 18, fontWeight: '700', color: '#fff', fontFamily: 'Open Sans'}}>Cash</Text>
                            </View>
                            <View>
                              <Grid
                                style={{marginTop:10}}
                                columns={[{
                                  name: 'Ticket Type',
                                  dataIndex: 'release_type',
                                  summaryValue: 'Total',
                                  sort: true
                                }, {
                                  name: 'No of Sales',
                                  dataIndex: 'num_sales',
                                  summaryValue: `${card_total_sales}`,
                                  sort:true
                                }, {
                                  name: 'Price (incl. Fees)',
                                  renderer: (card, cardIndex) => (
                                    <Text
                                      style={[commonStyle.gridBodyCellLabel, {alignSelf:'center'}]}>{currency}{parseFloat(card.price).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</Text>),
                                  sort:true
                                }, {
                                  name: 'Revenue (incl. Fees)',
                                  renderer: (card, cardIndex) => (<Text
                                    style={[commonStyle.gridBodyCellLabel, {alignSelf:'center'}]}>{currency}{parseFloat(parseInt(card.num_sales) * (card.price ? parseFloat(card.price) : 0)).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</Text>),
                                  summaryValue: `${currency}${card_total_revenue_incl.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
                                  sort:true
                                }, {
                                  name: 'Price (excl. Fees)',
                                  renderer: (card, cardIndex) => (<Text
                                    style={[commonStyle.gridBodyCellLabel, {alignSelf:'center'}]}>{currency}{parseFloat(card.cost).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</Text>),
                                  sort:true
                                }, {
                                  name: 'Revenue (excl. Fees)',
                                  renderer: (card, cardIndex) => (<Text
                                    style={[commonStyle.gridBodyCellLabel, {alignSelf:'center'}]}>{currency}{parseFloat(parseInt(card.num_sales) * (card.cost ? parseFloat(card.cost) : 0)).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</Text>),
                                  summaryValue: `${currency}${card_total_revenue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
                                  sort:true
                                }]}
                                data={data.cash}
                                summary={true}
                              />
                            </View>
                          </View>
                          </View>
                        )
                      })}
                    </View>
                  </View>
                </View>
              )
            })}
          </View>
        </View>
      )
  }
}
