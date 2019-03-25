import _ from 'lodash'
import React from 'react'
import {connect} from 'react-redux'
import Immutable from 'immutable'
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    Linking,
    ScrollView,
    ImageBackground
} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import {commonStyle, event_influencers, Orders as styles} from '../../native/styles'
import {HTTP_INIT, HTTP_LOADING, HTTP_LOADING_SUCCESSED, HTTP_LOADING_FAILED} from '../../_common/core/http'
import {Panel, Button, Grid, BarChart, Counter, LoadingBar}  from '../_library'

import DeviceInfo from 'react-native-device-info'

import session from '../../_common/redux/influencers/actions'

class Influencers extends React.Component {
    constructor(props) {
        super(props)
        this.unMounted = true
        this.state = {
          status: HTTP_INIT,
          expandedRows:[]
        }
    }

    componentDidMount() {
      this.unMounted = false
      if (this.state.status == HTTP_LOADING) {
        return
      }
      const {event, FETCH_EVENT_INFLUENCERS} = this.props
      const loadingSetter_influencers = (val) => () =>{
        if(!this.unMounted) this.setState({status: val})
      }
      Promise.resolve(FETCH_EVENT_INFLUENCERS(event.id))
        .catch(loadingSetter_influencers(HTTP_LOADING_SUCCESSED))
        .then(loadingSetter_influencers(HTTP_LOADING_SUCCESSED))
      loadingSetter_influencers(HTTP_LOADING)()
    }
    componentWillUnmount(){
      this.unMounted=true
    }
    renderExpandedRow(rec) {
      return (
        <View style={styles.row_detail}>
          <View style={{flexDirection: 'row'}}>
            <View style={[styles.low_title,{flex:1.5}]}><Text style={styles.low_title_text}>Contact Information</Text></View>
            <View style={styles.low_title}><Text style={styles.low_title_text}>Location</Text></View>
          </View>
          <View style={styles.row_content}>
            <View style={{flex: 1.5}}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Icon name='envelope' size={14} color='#b6c5cf'/>
                <Text style={styles.detail_item_text}>Email Address</Text>
              </View>
              <Text style={{color: '#ffffff'}}>{rec.email}</Text>
            </View>
            <View style={{flex: 1.5}}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Icon name='phone-square' size={14} color='#b6c5cf'/>
                <Text style={styles.detail_item_text}> Phone Number</Text>
              </View>
              <Text style={{color: '#ffffff'}}>{rec.phone}</Text>
            </View>
            <View style={{flex: 1}}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Icon name='map-marker' size={14} color='#b6c5cf'/>
                <Text style={styles.detail_item_text}> City</Text>
              </View>
              <Text style={{color: '#ffffff'}}>{rec.city}</Text>
            </View>
            <View style={{flex: 1}}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Icon name='globe' size={14} color='#b6c5cf'/>
                <Text style={styles.detail_item_text}> Country</Text>
              </View>
              <Text style={{color: '#ffffff'}}>{rec.country}</Text>
            </View>
          </View>
        </View>
      )
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

    render() {
          const {status, width, height, expandedRows} = this.state

          const {influencers, event} = this.props
          let currency = (event && event.currency && event.currency.symbol) ? event.currency.symbol : '$'
          let content
          let content_sharerate_res
          switch (status) {
              case HTTP_INIT:
                  content = null
                  break
              case HTTP_LOADING:
                  content = <LoadingBar title={'Hold tight! We\'re getting your influencers ...'}/>
                  break
              case HTTP_LOADING_SUCCESSED:
                  // --- sales ---
                  content = null
                  let data = influencers
                  let content_tiers = null
                  let content_performance = null
                  let content_sharerate = null
                  let content_referrers = null
                  let number = 0
                  if(data.statistics || data.statistics.share_rate){
                      let rate = parseInt(data.statistics.share_rate)
                      if (!rate) {rate = 0}
                      let imgUser = require('@nativeRes/images/influencer_share_stat_user_cooler.png')
                      let imgColor = {color: '#50B7F9'}
                      let iconColor = '#50B7F9'
                      if(rate < 20){
                          imgUser = require('@nativeRes/images/influencer_share_stat_user_cooler.png')
                          imgColor = {color: '#50B7F9'}
                          iconColor = '#50B7F9'}
                      else if(rate < 40){
                          imgUser = require('@nativeRes/images/influencer_share_stat_user_orange.png')
                          imgColor = {color: '#A477F8'}
                          iconColor = '#A477F8'}
                      else if(rate < 50){
                          imgUser = require('@nativeRes/images/influencer_share_stat_user_red.png')
                          imgColor = {color: '#FBB654'}
                          iconColor = '#FBB654'}
                      else{
                          imgUser = require('@nativeRes/images/influencer_share_stat_user_hot.png')
                          imgColor = {color: '#F77254'}
                          iconColor = '#F77254'}

                      content_sharerate =
                          <View onLayout={(e)=>{this.setState({width:e.nativeEvent.layout.width, height:e.nativeEvent.layout.height})}}>
                              <Image style={{width:width, resizeMode:'contain', marginTop:-100, marginBottom:-150, flexDirection:'row'}} source={require('@nativeRes/images/influencer_share_stat_bg.png')} />
                              <View
                                  style={{position:'absolute', top:height/5, left:0, bottom:0, right:width/2,alignItems:'center'}}
                                  onLayout={(e)=>{this.setState({worldwidth:e.nativeEvent.layout.width})}}>
                                  <Image refs='shareRate_user' style={{width: 300, height:120,}} source={imgUser} />
                                  <Text style={[event_influencers.shareRate_engagement]}>INFLUENCER ENGAGEMENT</Text>
                              </View>
                              <View
                                  style={{position:'absolute', top:height/2, left:width/2, bottom:0, right:0, alignItems:'center', justifyContent:'center'}}
                                  onLayout={(e)=>{this.setState({worldwidth:e.nativeEvent.layout.width})}}>
                                  <Counter
                                      end={rate}
                                      start={0}
                                      time={5000}
                                      digits={0}
                                      easing='linear'
                                      symbol='%'
                                      style={{color:'#ffffff', fontSize:75, fontWeight:'bold', backgroundColor:'#00000000'}}
                                  />
                                  <View style={event_influencers.shareRate_current}>
                                      <Icon name='circle-o' color={iconColor} style={{backgroundColor:'#00000000', alignSelf:'center'}}/>
                                      <Text style={[imgColor,event_influencers.shareRate_currentText]}>CURRENT SHARE RATE</Text>
                                  </View>
                              </View>
                          </View>

                      content_sharerate_res=
                          <View style={{alignItems:'center'}} onLayout={(e)=>{this.setState({width:e.nativeEvent.layout.width, height:e.nativeEvent.layout.height})}}>
                          <Image refs='shareRate_user' style={{width: 300, height:120, alignItems:'center'}} source={imgUser} />
                          <Text style={{color:'white', marginBottom:40, fontWeight:'500'}}>INFLUENCER ENGAGEMENT</Text>
                            <Counter
                              end={rate}
                              start={0}
                              time={5000}
                              digits={0}
                              symbol='%'
                              easing='linear'
                              style={{
                                color:'#ffffff',
                                fontSize:75,
                                fontWeight:'bold',
                                backgroundColor:'#00000000',
                                textShadowColor:'black',
                                textShadowOffset:{
                                  width:2,
                                  height:2
                                },
                                textShadowRadius:0.6,
                                marginBottom:25
                              }}
                            />
                            <View style={event_influencers.shareRate_current}>
                              <Icon name='circle-o' color={iconColor} style={{backgroundColor:'#00000000', alignSelf:'center'}}/>
                              <Text style={[imgColor,event_influencers.shareRate_currentText]}>CURRENT SHARE RATE</Text>
                            </View>
                          </View>

                  }
                  if(data.statistics) {
                      number = _.size(data.statistics.referral_tiers)
                      let classname = 'col-xs-12'

                      if (number > 0) {
                          let width = 12 / number
                          classname = `col-xs-${width}`
                      }

                      let tiers = _.map(data.statistics.referral_tiers, (el) => {
                          return el
                      })
                      number = 0

                      let rows_tiers = _.map(tiers, function(value, index){
                          let Gradientcolor
                              if (index == 0)
                                  Gradientcolor = {color:'#ffa46b'}
                              if (index == 1)
                                  Gradientcolor = {color:'#72d6ff'}
                              if (index == 2)
                                  Gradientcolor = {color:'#88ffa3'}
                          return (
                              <View key={index} style={{flex:1}}>
                                  <View style={{
                                    flexDirection:'row',
                                    paddingTop: 35,
                                    paddingBottom:45,
                                    borderRightWidth:DeviceInfo.isTablet()?1:0,
                                    borderBottomWidth:DeviceInfo.isTablet()? 0:1,
                                    borderColor:'#586071'}}>
                                      <View style={{flex:1, justifyContent: 'center'}}>
                                          <Text style={[event_influencers.tier_left,commonStyle.shadow,Gradientcolor,]}>
                                              {value.sales}
                                          </Text>
                                      </View>
                                      <View style={event_influencers.tier_right}>
                                          <View style={event_influencers.tier_tickets}>
                                              <Text style={event_influencers.tier_tickets_text}>Tickets</Text>
                                              <Image style={event_influencers.tier_tickets_img} source={require('@nativeRes/images/influencers-star.png')}/>
                                          </View>
                                          <Text style={[event_influencers.tier_percentage,Gradientcolor]}>
                                              {value.percentage}%
                                          </Text>
                                          <Text style={[event_influencers.tier_rebate]}>
                                              Rebate
                                          </Text>
                                      </View>
                                  </View>
                              </View>
                          )
                      })
                      content_tiers =
                          <View>
                              <Text style={event_influencers.heading_style}>Referral Tiers</Text>
                              <View style={{flexDirection: DeviceInfo.isTablet()? 'row':'column'}}>
                                  {rows_tiers}
                              </View>
                          </View>

                      let revenue_generated = data.statistics.revenue_generated
                      let refunds_due = data.statistics.refunds_due
                      let total_ticket_revenue = data.statistics.total_ticket_revenue

                      let cost = revenue_generated != 0 ? (refunds_due / revenue_generated) * 100 : 0
                      let percentage_revenue_referred = total_ticket_revenue != 0 ? (revenue_generated / total_ticket_revenue) * 100 : 0
                      let referral_roi = refunds_due != 0 ? (revenue_generated / refunds_due) : 0
                      let rebate_percentage = total_ticket_revenue != 0 ? (refunds_due / total_ticket_revenue) * 100 : 0

                      content_performance =
                          <View>
                              <Text style={event_influencers.heading_style}>Referral Performance</Text>
                              <View style={event_influencers.influencers_performance}>
                                <View style={{flexDirection:DeviceInfo.isTablet() ? 'row': 'column'}}>
                                  <View style={[event_influencers.referral,{flex:DeviceInfo.isTablet() ? 1:0}]}>
                                    <View style={event_influencers.referral_icon_1}>
                                      <Image style={[event_influencers.performance_img, event_influencers.ref_icon_small]} source={require('@nativeRes/images/ref_icon_1.png')}/>
                                      <Text style={[event_influencers.content_number]}>
                                        {percentage_revenue_referred.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}%
                                      </Text>
                                      <Text style={event_influencers.content_text}>of total revenue referred by ticket buyers.</Text>
                                    </View>
                                  </View>

                                  <View style={[event_influencers.referral,{flex:DeviceInfo.isTablet() ? 2:0, marginLeft:DeviceInfo.isTablet() ? 10:0}]}>
                                    <View style={event_influencers.referral_icon_1}>
                                      <Image style={event_influencers.performance_img} indicatorProps={{ size: 'large' }} source={require('@nativeRes/images/ref_icon_2.png')}/>

                                      <Text style={[event_influencers.content_number]}>
                                        ${revenue_generated.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}%
                                      </Text>
                                      <Text style={event_influencers.content_text}>revenue referred by ticket buyers</Text>

                                      <View style={{flexDirection:'row'}}>
                                        <View style={{flex:1, alignItems:'center'}}>
                                          <Text style={[event_influencers.content_text,{paddingVertical:DeviceInfo.isTablet() ? 0: 10, fontWeight:'600'}]}>
                                            ${refunds_due.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                          </Text>
                                          <Text style={event_influencers.content_text}>in rebates</Text>
                                        </View>

                                        <View style={{flex:1, alignItems:'center'}}>
                                          <Text style={[event_influencers.content_text,{paddingVertical:DeviceInfo.isTablet() ? 0: 10, fontWeight:'600'}]}>
                                            {cost.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}%
                                          </Text>
                                          <Text style={DeviceInfo.isTablet() ?event_influencers.content_text: [event_influencers.content_text,{width:80}]}>effective marketing cost</Text>
                                        </View>
                                      </View>
                                    </View>
                                  </View>

                                  <View style={[event_influencers.referral,{flex:DeviceInfo.isTablet() ? 1:0,marginLeft:DeviceInfo.isTablet() ? 10:0}]}>
                                    <View style={[event_influencers.referral_icon_1]}>
                                      <Image style={[event_influencers.performance_img, event_influencers.ref_icon_small]}
                                             source={require('@nativeRes/images/ref_icon_3.png')}/>
                                      <Text style={event_influencers.content_number}>
                                        ${referral_roi.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                      </Text>
                                      <Text style={event_influencers.content_text}> referred revenue
                                        per <Text style={[event_influencers.content_text,commonStyle.extraBoldFont]}>$1</Text> in rebates.
                                      </Text>
                                    </View>
                                  </View>
                                </View>

                                <View style={{flexDirection:DeviceInfo.isTablet() ? 'row':'column'}}>
                                  <View style={[event_influencers.referral]}>
                                    <View style={event_influencers.referral_icon_1}>
                                      <Image style={[event_influencers.performance_img, event_influencers.ref_icon_big]} source={require('@nativeRes/images/ref_icon_4.png')}/>

                                      <View style={{flexDirection:'row'}}>
                                        <View style={{flex:1, alignItems:'center'}}>
                                          <Text style={[event_influencers.content_number]}>
                                            {refunds_due.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}%
                                          </Text>
                                          <Text style={event_influencers.content_text}>in rebates</Text>
                                          <Text style={event_influencers.content_text}>make up</Text>
                                        </View>

                                        <View>
                                          <Text style={[event_influencers.content_number]}>
                                            {rebate_percentage.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}%
                                          </Text>
                                          <Text style={event_influencers.content_text}>of your total </Text>
                                          <Text style={event_influencers.content_text}>revenue</Text>
                                        </View>
                                      </View>
                                    </View>
                                  </View>

                                  <View style={[event_influencers.referral,{marginLeft:DeviceInfo.isTablet() ? 10:0}]}>
                                    <View style={event_influencers.referral_icon_1}>
                                      <Image style={[event_influencers.performance_img, event_influencers.ref_icon_big]} source={require('@nativeRes/images/ref_icon_5.png')}/>

                                      <View style={{flexDirection:'row'}}>
                                        <View style={{flex:1,alignItems:'flex-start'}}>
                                          <View style={{alignItems:'center'}}>
                                            <Text style={[event_influencers.content_number]}>
                                              {data.referrers.length}
                                            </Text>
                                            <Text style={event_influencers.content_text}>ticket buyers generated</Text>
                                          </View>
                                        </View>

                                        <View>
                                          <Text style={[event_influencers.content_number]}>
                                            {percentage_revenue_referred.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}%
                                          </Text>
                                          <Text style={[event_influencers.content_text]}>of your ticket</Text>
                                          <Text style={[event_influencers.content_text]}>revenue</Text>
                                        </View>
                                      </View>
                                    </View>
                                  </View>
                                </View>
                              </View>
                          </View>
                  }
                let referrers = influencers.referrers
                if(referrers && referrers.length > 0){
                  number = 0

                  let frequency = {}
                  let max = 0
                  _.map(referrers, (t, index) => {
                    let referred = t.sales_referred ? parseInt(t.sales_referred) : 0
                    if(max < referred)
                      max = referred
                  })
                  for(let i = 1; i<=max; i++)
                    frequency[i] = 0
                  _.map(referrers, (t, index) => {
                    if(t.sales_referred && !t.isDetail){
                      let referred = parseInt(t.sales_referred)
                      frequency[referred] += 1
                    }
                  })
                      content_referrers = <View>
                          <Text style={event_influencers.heading_style}>Sales Referred by Ticket Buyers</Text>
                          <View style={{padding:25, backgroundColor:'#2B313D', borderRadius:5, marginBottom:10}}>
                              <BarChart json={frequency} options={{titleX:'No. of Tickets Referred'}} />
                          </View>
                          <Grid
                          style={{marginBottom:20}}
                          columns={[
                              {
                                name: '',
                                width: 58,
                                style: {paddingLeft:0,paddingRight:0, paddingTop:0, paddingBottom:0},
                                renderer: (rec) => {
                                  const expanded = _.findIndex(this.state.expandedRows, {...rec})>-1
                                  return (
                                    <TouchableOpacity style={expanded ? styles.expandIcon_expanded : styles.expandIcon} onPress={() => {expanded ? this.collapseRow(rec) : this.expandRow(rec)}}>
                                      <Icon name={expanded ? 'minus-square-o' : 'plus-square-o'} size={18} color='#b6c5cf'/>
                                    </TouchableOpacity>
                                  )
                                }
                              },
                              {
                                  name: 'Customer',
                                  renderer:(record)=>{
                                      let isFBuser = record.fb_user_id && record.fb_user_id != ''
                                      const abbName = record.first_name.charAt(0).toUpperCase() + record.last_name.charAt(0).toUpperCase()
                                      return(
                                          <View style={{alignItems:'center', flexDirection:'row',height:50}}>
                                              <View style={commonStyle.sales_circle}>
                                                  {!!isFBuser &&
                                                      <TouchableOpacity onPress={()=>Linking.openURL('https://www.facebook.com/' + record.fb_user_id)}>
                                                          <Image style={{width:40, height:40, borderRadius:20}} source={{uri:'https://graph.facebook.com/' + record.fb_user_id + '/picture?type=small'}}/>
                                                      </TouchableOpacity>}
                                                  {!isFBuser && <Text style={{fontSize:15, color:'#ffffff'}}>{abbName}</Text>}
                                              </View>
                                              <Text style={{marginLeft:12, fontSize:14, color:'#ffffff'}}>{`${record.first_name} ${record.last_name}`}</Text>
                                          </View>
                                      )
                                  }
                              },{
                                  name: 'No. of Sales Referred',
                                  dataIndex: 'sales_referred',
                                  sort: true,
                                  renderer:(record,value)=>{
                                      return(
                                      <View style={event_influencers.table_content_View}>
                                          <Text style={event_influencers.table_content_text}>{value}</Text>
                                      </View>)
                                  },
                                  align:'center'
                              },{
                                  name: 'Income Generated (excl. fees)',
                                  dataIndex: 'revenue_generated',
                                  renderer:(record,value)=>{
                                      return(
                                      <View style={event_influencers.table_content_View}>
                                          <Text style={event_influencers.table_content_text}>${value}</Text>
                                      </View>)
                                  },
                                  align:'center',
                                  sort: true
                              },{
                                  name: 'Original Purchase Price (excl. fees)',
                                  dataIndex: 'original_cost',
                                  renderer:(record,value)=>{
                                      return(
                                      <View style={event_influencers.table_content_View}>
                                          <Text style={event_influencers.table_content_text}>${value}</Text>
                                      </View>)
                                  },
                                  align:'center',
                                  sort: true
                              },{
                                  name: 'Refund Due',
                                  dataIndex: 'refund_due',
                                  renderer:(record,value)=>{
                                      return(
                                      <View style={event_influencers.table_content_View}>
                                          <Text style={event_influencers.table_content_text}>${value}</Text>
                                      </View>)
                                  },
                                  align:'center'
                              }
                          ]}
                          data={referrers}
                          stripe={true}
                          searchable={true}
                          paging={true}
                          expandedRows={expandedRows}
                          detailViewRender={(rec) => this.renderExpandedRow(rec)}
                          />
                      </View>
                  }
                  content = <View>
                      {DeviceInfo.isTablet() ? content_sharerate:content_sharerate_res}
                      {content_tiers}
                      {content_performance}
                      {content_referrers}
                  </View>
                  break
              default:
                  content = null
                  break
          }

          return (
              <View>
                  {content}
              </View>
          )
      }

}export default connect(
    (state) => {
        const event = state.events.get('selected').toJS()
        const influencers = state.influencers.get('influencers').toJS()
        return {
            event,
            influencers
        }
    },
    {FETCH_EVENT_INFLUENCERS:session.FETCH_EVENT_INFLUENCERS}
)(Influencers)
