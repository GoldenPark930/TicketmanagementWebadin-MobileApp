import React from 'react'
import {connect} from 'react-redux'
import _ from 'lodash'
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    Linking,
    ScrollView,
} from 'react-native'
import ScrollableTabView, {DefaultTabBar, } from 'react-native-scrollable-tab-view'
import QRCode from 'react-native-qrcode'
import DeviceInfo from 'react-native-device-info'
import {EmptyBar, LoadingBar, CustomTabBar, Panel, Button, Grid, BarChart, PieChart} from '../_library'
import {TabView,Tab} from '../_library/TabView'

import session from '../../_common/redux/performance/actions'
import moment from 'moment'

import {commonStyle, newevent, newbrand, event_check_in} from '../../native/styles'

const getSortedJSON = (unsorted) => {
    const sorted = {}
    Object.keys(unsorted).sort().forEach(function(key) {
        sorted[key] = unsorted[key]
    })
    return sorted
}

const STATE_STATUS_INIT = 0
const STATE_STATUS_LOADING = 1
const STATE_STATUS_LOADING_SUCCESSED = 2
const STATE_STATUS_LOADING_FAILED = 3

class CheckIn extends React.Component {
    constructor(props) {
        super(props)
        this.unMounted = true

        this.state = {status: STATE_STATUS_INIT, qr_list: {}, showDownload: false}
    }
    componentDidMount() {
        this.unMounted = false
        if (this.state.status == STATE_STATUS_LOADING) {
            return
        }
        const {event, FETCH_EVENT_CHECKIN} = this.props
        const loadingSetter = (val) => () =>{
            if (val == STATE_STATUS_LOADING_FAILED){
            }
           if(!this.unMounted) this.setState({status: val})
        }
        Promise.resolve(FETCH_EVENT_CHECKIN(event.id))
            .catch(loadingSetter(STATE_STATUS_LOADING_FAILED))
            .then(loadingSetter(STATE_STATUS_LOADING_SUCCESSED))
        loadingSetter(STATE_STATUS_LOADING)()
    }
    componentWillUnmount(){
      this.unMounted = true
    }
    handleReset(){
        let {show} = this.state
        this.setState({show: !show})
    }
    handleQRCode(t){
        let {qr_list} = this.state
        let isVisible = _.get(qr_list, t.ticket_hash, 'none') == 'none' ? false : true
        _.set(qr_list, t.ticket_hash, !isVisible ? 'visible' : 'none')
        this.setState({qr_list: qr_list})
    }
    render() {
        const {show} = this.state
        const {status} = this.state
        const {loading, performance} = this.props
        const {event} = this.props
        let content
        switch (status) {
            case STATE_STATUS_INIT:
                content = null
                break
            case STATE_STATUS_LOADING:
                content = <LoadingBar title={'Hold tight! We\'re getting your event\'s statistics...'} />
                break
            case STATE_STATUS_LOADING_SUCCESSED:
                // --- check_in ---
                let content_check_in = null
                if(!!performance.check_in) {
                    let daily = {}
                    _.each(getSortedJSON(performance.check_in.check_in_stats.daily), function (value, index) {
                        daily[moment(index, 'YYYY-MM-DD').format('DD-MM-YYYY')] = value
                    })
                    let total_checked_in = _.reduce(daily, function(sum, n) { return sum + n}, 0)
                    let daily_dates = _.keys(daily)
                    let highest_checked_in_date = _.reduce(daily_dates, function(highest, i) { return daily[highest]>daily[i] ? highest : i }, daily_dates[0])
                    let highest_checked_in = daily[highest_checked_in_date]
                    let lowest_checked_in_date = _.reduce(daily_dates, function(lowest, i) { return daily[lowest]<daily[i] ? lowest : i }, daily_dates[0])
                    let lowest_checked_in = daily[lowest_checked_in_date]
                    let chart_daily = <BarChart json={daily} data={{method: 'local', data: daily}} options={{}} />
                    let array_dayily = []
                    _.map(daily, function(value, index){
                        let json_dayily = {}
                        json_dayily.index = index
                        json_dayily.value = value
                        array_dayily.push(json_dayily)
                    })
                    let rows_daily =
                        <Grid
                            columns={[{
                                name: 'Date',
                                dataIndex: 'index',
                                renderer:(record, value)=>{
                                    return(
                                        <Text style={{fontSize:14, color:'#ffffff',textAlign:'left', fontFamily:'OpenSans-bold'}}>{value}</Text>
                                    )
                                },
                                summaryValue: ''
                            },{
                                name: 'No. of Tickets Sold',
                                dataIndex: 'value',
                                renderer:(record, value)=>{
                                    return(
                                        <Text style={{fontSize:14, color:'#ffffff',textAlign:'right', fontFamily:'OpenSans-bold'}}>{value}</Text>
                                    )
                                },
                                summaryValue: 'TOTAL '+ total_checked_in,
                                align:'right'
                            }]}
                            data={array_dayily}
                            summary={true}
                            headerCellStyle = {{fontWeight:'bold'}}
                        />
                    const hourly = getSortedJSON(performance.check_in.check_in_stats.hourly)
                    let formatted_hourly_time = (str) => {
                        let date = moment(str, 'YYYY-MM-DD HH').format('HH:mm')
                        return date == 'Invalid date' ? '' : date
                    }
                    let formatted_hourly_date = (str) => {
                        let date = moment(str, 'YYYY-MM-DD HH').format('DD-MM-YYYY')
                        return date == 'Invalid date' ? 'Not Yet' : date
                    }
                    let total_checked_in_hourly = _.reduce(hourly, function(sum, n) { return sum + n}, 0)
                    let array_hourly = []
                    _.map(hourly, function(value, index){
                        let json_hourly = {}
                        json_hourly.index = index
                        json_hourly.value = value
                        json_hourly.hourly_time = formatted_hourly_time(index)
                        json_hourly.hourly_date = formatted_hourly_date(index)
                        array_hourly.push(json_hourly)
                    })
                    let rows_hourly =
                        <Grid
                            columns={[{
                                name: 'Date',
                                dataIndex: 'index',
                                renderer:(record,value)=>{
                                    return(
                                        <View style={{flexDirection:'row', alignItems:'center'}}>
                                            <Text style={{fontSize:18, color:'#ffffff', textAlign:'center', fontWeight:'bold'}}>{record.hourly_time}</Text>
                                            <Text style={{fontSize:12, color:'#ffffff', textAlign:'center', fontFamily:'OpenSans-Bold'}}> / {record.hourly_date}</Text>
                                        </View>
                                    )
                                }
                            },{
                                name: 'No. of Tickets Sold',
                                dataIndex: 'value',
                                summaryValue: 'TOTAL '+total_checked_in_hourly,
                                renderer:(record,value)=>{
                                    return(
                                        <Text style={{fontSize:12, color:'#ffffff', textAlign:'right', fontWeight:'bold'}}>{value}</Text>
                                    )
                                },
                                align:'right'
                            }]}
                            data={array_hourly}
                            summary={true}
                            headerCellStyle = {{fontWeight:'bold'}}
                        />
                    const ticket_types = performance.check_in.check_in_stats.ticket_types
                    let total_checked_in_tickettype = _.reduce(ticket_types, function(sum, n) { return sum + n}, 0)

                    let array_ticket_type = []
                    _.map(ticket_types, function(value, index){
                        let json_ticket_type = {}
                        json_ticket_type.index = index
                        json_ticket_type.value = value
                        array_ticket_type.push(json_ticket_type)
                    })

                    let rows_ticket_types =
                        <Grid
                            columns={[
                                {
                                    name: 'Ticket Type',
                                    dataIndex: 'index',
                                    renderer:(record,value)=>{
                                        return(
                                            <Text style={{fontSize:12, color:'#ffffff', textAlign:'left', fontWeight:'bold'}}>{value}</Text>
                                        )
                                    }
                                },{
                                    name: 'No. of Tickets Sold',
                                    dataIndex: 'value',
                                    summaryValue:'TOTAL '+ total_checked_in_tickettype,
                                    renderer:(record,value)=>{
                                        return(
                                            <Text style={{fontSize:12, color:'#ffffff', textAlign:'right', fontWeight:'bold'}}>{value}</Text>
                                        )
                                    },
                                    align:'right'
                                }
                            ]}
                            data={array_ticket_type}
                            summary={true}
                            headerCellStyle = {{fontWeight:'bold'}}
                        />
                    const names = performance.check_in.check_in_stats.names
                    let chart_names = <PieChart json={names} data={{method:'local', data:names}} options={{title:'By Staff Member'}} />
                    let total_checked_in_name = _.reduce(names, function(sum, n) { return sum + n}, 0)
                    let array_name=[]
                    _.map(names, function(value, index){
                        let json_name={}
                        json_name.index = index
                        json_name.value = value
                        array_name.push(json_name)
                    })
                    let rows_names =
                        <Grid
                            columns={[
                                {
                                    name: 'Name',
                                    dataIndex: 'index',
                                    renderer:(record,value)=>{
                                        return(
                                            <Text style={{fontSize:12, color:'#ffffff', textAlign:'left', fontWeight:'bold'}}>{value}</Text>
                                        )
                                    }
                                },{
                                    name: 'No. of Tickets Sold',
                                    dataIndex: 'value',
                                    summaryValue:'TOTAL '+ total_checked_in_name,
                                    renderer:(record,value)=>{
                                        return(
                                            <Text style={{fontSize:12, color:'#ffffff', textAlign:'right', fontWeight:'bold'}}>{value}</Text>
                                        )
                                    },
                                    align:'right'
                                }
                            ]}
                            data={array_name}
                            summary={true}
                            headerCellStyle = {{fontWeight:'bold'}}
                            />

                    const thisObj = this
                    let {qr_list} = this.state
                    const tickets = performance.check_in.tickets
                    let camalize = (str) => {
                        let ret = str.toLowerCase()
                        return ret.replace(/\b[a-z]/g,function(f){return f.toUpperCase()})
                    }
                    let checked_in_at = (str) => {
                        let date = moment(str).format('D MMMM YYYY, HH:mm:ss')
                        return date == 'Invalid date' ? 'Not Yet' : date
                    }

                    let rows_tickets =
                        <Grid
                            stripe={true}
                            searchable={true}
                            paging={true}
                            columns={[
                                {
                                    name: 'Ticket ID',
                                    dataIndex: 'ticket_hash',
                                    sort: true,
                                },
                                {
                                    name: 'Ticket Holder',
                                    align:'center',
                                    sort: true,
                                    renderer:(record,value)=>{
                                        return(
                                            <View style={{flexDirection:'row', alignItems:'center',}}>
                                                <Text style={{fontSize:14, color:'#ffffff', textAlign:'center'}}>{record.first_name} {record.last_name}</Text>
                                            </View>
                                        )
                                    }

                                },
                                {
                                     name: 'Ticket Type',
                                     dataIndex: 'ticket_type',
                                     align:'center',
                                     sort: true,
                                },
                                {
                                    name: 'Status',
                                    align:'center',
                                    sort: true,
                                    renderer:(record,value)=>{
                                        return(
                                            <View style={{flexDirection:'row', alignItems:'center'}}>
                                                <Text style={{fontSize:14, color:'#ffffff', textAlign:'center'}}>{camalize(record.status)}</Text>
                                            </View>
                                        )
                                    }
                                },
                                {
                                    name: 'Checked in At',
                                    align:'center',
                                    sort: true,
                                    renderer:(record,value)=>{
                                       return(
                                          <View style={{flexDirection:'row', alignItems:'center'}}>
                                              <Text style={{fontSize:14, color:'#ffffff', textAlign:'center'}}>{checked_in_at(record.checked_in_at)}</Text>
                                          </View>
                                       )
                                    }
                                 },
                                {
                                    name: 'Scan Ticket',
                                    sort: true,
                                    renderer:(record,value)=>{
                                        let isVisible = _.get(qr_list, record.ticket_hash, 'none') != 'none'
                                        let btn =
                                            <View>
                                                <Button title={'Scan Ticket'} style={{backgroundColor:'#396ba9', marginBottom:15}} onPress={() => thisObj.handleQRCode(record)}/>
                                                {isVisible && <QRCode value={record.qr_data} size={128}/>}
                                            </View>
                                        let qr_code = record.status != 'checked in' && btn
                                        return(
                                            <View style={{flexDirection:'row', alignItems:'flex-end'}}>
                                                {qr_code}
                                            </View>
                                        )
                                    },
                                    flex:2,
                                    align:'right',
                                }
                            ]}
                            data={tickets}
                            summary={true}
                        />

                    let daily_contain =
                        <View>
                            <Text style={event_check_in.daily_title}>Check-Ins by <Text style={[event_check_in.daily_title,{fontWeight:'bold'}]}>DAY</Text></Text>
                            {chart_daily}
                            <View style={{alignItems:'center', justifyContent:'center'}}>
                                <View style={event_check_in.daily_event_bottom}>
                                    <Text style={event_check_in.title}>TOTAL</Text>
                                    <Text style={event_check_in.number}>{total_checked_in}</Text>
                                    <Text style={event_check_in.desc}>TOTAL CHECK IN</Text>
                                </View>
                                <View style={event_check_in.daily_event_bottom}>
                                    <Text style={event_check_in.title}>{moment(highest_checked_in_date, 'DD-MM-YYYY').format('D MMM')}</Text>
                                    <View style={{flexDirection:'row', alignItems:'center'}}>
                                        <Image style={{width:20,height:20, marginRight:15}} source={require('@nativeRes/images/demographics-highest.png')}/>
                                        <Text style={event_check_in.number}>{highest_checked_in}</Text>
                                    </View>
                                    <Text style={event_check_in.desc}>HIGHEST CHECK IN</Text>
                                </View>
                                <View style={event_check_in.daily_event_bottom}>
                                    <Text style={event_check_in.title}>{moment(lowest_checked_in_date, 'DD-MM-YYYY').format('D MMM')}</Text>
                                    <View style={{flexDirection:'row', alignItems:'center', justifyContent:'center'}}>
                                        <Image  style={{width:20,height:20, marginRight:15}} source={require('@nativeRes/images/demographics-lowest.png')}/>
                                        <Text style={event_check_in.number}>{lowest_checked_in}</Text>
                                    </View>
                                    <Text style={event_check_in.desc}>LOWEST CHECK IN</Text>
                                </View>
                            </View>

                            <View style={event_check_in.table_cation}>
                                <Image style={event_check_in.icon} source={require('@nativeRes/images/icon-calendar.png')}/>
                                <Text style={event_check_in.title}>Daily</Text>
                            </View>
                            <View style={{margin:20}}>
                                {rows_daily}
                            </View>
                        </View>

                    let hourlyContain =
                        <View>
                            <View style={event_check_in.table_cation}>
                                <Image style={event_check_in.icon} source={require('@nativeRes/images/icon-timer.png')}/>
                                <Text style={event_check_in.title}>Hourly</Text>
                            </View>
                            <View style={{margin:20}}>
                                {rows_hourly}
                            </View>
                        </View>

                    let TicketTypeContain =
                        <View>
                            <View style={event_check_in.table_cation}>
                                <Image style={[event_check_in.icon]} source={require('@nativeRes/images/icon-ticket.png')}/>
                                <Text style={event_check_in.title}>Ticket Types</Text>
                            </View>
                            <View style={{margin:20}}>
                                {rows_ticket_types}
                            </View>
                        </View>

                    let namesContain =
                        <View>
                            {chart_names}
                            <View style={event_check_in.table_cation}>
                                <Image style={[event_check_in.icon]} source={require('@nativeRes/images/icon-people.png')}/>
                                <Text style={event_check_in.title}>Staff Members</Text>
                            </View>
                            <View style={{margin:20}}>
                            {rows_names}
                            </View>
                        </View>
                    let ticketContain =
                        <View>
                            <View style={event_check_in.table_cation}>
                                <Image style={[event_check_in.icon]} source={require('@nativeRes/images/icon-person.png')} />
                                <Text style={event_check_in.title}>Individual Tickets</Text>
                            </View>
                            <View style={{margin:20}}>
                                {rows_tickets}
                            </View>
                        </View>
                    let content_check_in=
                        <TabView
                          style={{backgroundColor: '#393e46'}}
                          tabBarUnderlineColor = '#ffa46b'
                          tabBarActiveTextStyle = {{color:'#ffa46b',fontSize:14, fontWeight:'700'}}
                          tabBarTextStyle={{fontSize:14, fontWeight:'700'}}
                          tabBarActiveViewColor = '#ffffff00'
                          tabBarStyle = {{backgroundColor: '#1a1d25', marginTop: 10}}
                        >
                            <Tab style={{paddingTop:20}} title='All'>
                              {daily_contain}
                              {hourlyContain}
                              {TicketTypeContain}
                              {namesContain}
                              {ticketContain}
                            </Tab>

                            <Tab style={{paddingTop:20}} title='Date'>
                                {daily_contain}
                            </Tab>
                            <Tab style={{paddingTop:20}} title='Hourly'>
                                {hourlyContain}
                            </Tab>
                            <Tab style={{paddingTop:20}} title='Ticket Type'>
                                {TicketTypeContain}
                            </Tab>
                            <Tab style={{paddingTop:20}} title='By Staff Member'>
                                {namesContain}
                            </Tab>
                            <Tab style={{paddingTop:20}} title='Individual Tickets'>
                                {ticketContain}
                            </Tab>
                        </TabView>
                    if(!!content_check_in){
                        content = <View>
                            {content_check_in}
                        </View>
                    }else{
                        content = <EmptyBar />
                    }
                    break
                }
        }


        return(
            <View>

                <TouchableOpacity
                  style={{backgroundColor: '#323744', marginBottom: 10, padding:10, flexDirection: 'row', borderRadius: 2, alignItems: 'center'}}
                  onPress={()=>this.setState({showDownload: !this.state.showDownload})}
                >
                    <Image style={{width: 50, height: 40, marginRight: 10}} source={require('@nativeRes/images/mobile-appico.png')}/>
                    <Text style={{fontSize: 14, fontFamily: 'Open Sans', color: '#fff', flex:1}}>Entry Fairy</Text>
                    <View style={{backgroundColor: '#638a94', borderRadius: 3, paddingVertical: 6, paddingHorizontal:10, alignItems: 'center', justifyContent: 'center'}}>
                      <Text style={{fontSize: 12, fontFamily: 'Open Sans', color: '#fff',}}>Download App</Text>
                    </View>
                </TouchableOpacity>
                {this.state.showDownload &&
                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#323744', padding:10, borderRadius: 2,marginBottom: 10, }}>
                      <TouchableOpacity onPress={()=>Linking.openURL('https://itunes.apple.com/us/app/entry-fairy/id900716911?mt=8')}>
                        <Image style={{width: 155.08, height: 45.89, marginRight: 10}} source={require('@nativeRes/images/mobile-ios.png')}/>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={()=>Linking.openURL('https://play.google.com/store/apps/details?id=com.theticketfairy.entryfairy')}>
                        <Image style={{width: 155.08, height: 45.89, marginRight: 10}} source={require('@nativeRes/images/mobile-android.png')}/>
                      </TouchableOpacity>
                    </View>
                }
                {content}
            </View>
        )
    }
}export default connect(
    (state) => {
        const event = state.events.get('selected').toJS()
        const performance = state.performance.get('performance').toJS()
        const loading = state.loading.has('FETCH_EVENT_CHECKIN')
        return {
            event,
            performance,
            loading
        }
    },
    {FETCH_EVENT_CHECKIN: session.FETCH_EVENT_CHECKIN}
)(CheckIn)
