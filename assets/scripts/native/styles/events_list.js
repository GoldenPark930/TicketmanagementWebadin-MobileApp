import _ from 'lodash'
import { StyleSheet } from 'react-native'
import Dimensions from 'Dimensions'
import DeviceInfo from 'react-native-device-info'

const window = Dimensions.get('window')

let style = {
  container: {
    flex:1,
    padding:10
  },

  event_main_body: {
    flex:0.8,
    height:100,
    borderWidth:1,
  },

  event_topView: {
    flexDirection: 'row',
    padding: 10,
  },
  thumb: {
    borderRadius:5,
    width : 130,
    height: 130,
    resizeMode: 'contain',
  },
  title: {
    flex:1,
    paddingLeft:10,
    borderLeftWidth:3,
    marginBottom:20,
    borderLeftColor:'#ffa46b',
    justifyContent:'center'
  },
  titleStyle: {
    fontSize: 21,
    color:'#ffffff',
    fontFamily:'Open Sans',
    fontWeight: '600'
  },

  rightButton: {
    width: 111,
    height: 34,
    backgroundColor: '#25b998',
    borderRadius: 3,
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: {
      height: 4,
      width: 4
    },
    alignItems:'center',
    justifyContent:'center',
    flexDirection:'row'
  },

  rightButtonText: {
    marginLeft:5,
    color: '#ffffff',
    fontSize:12,
    fontFamily:'Open Sans',
    fontWeight: '500'
  },

  events_mainView: {
    backgroundColor:'#ffffff00',
    margin: 10
  },

  events_mainTopView: {
    backgroundColor: 'rgb(36,41,53)',
    flexDirection:'row',
    height:41,
    alignItems: 'center',
  },

  events_mainTopRightText: {
    flex:1,
    fontSize: 12,
    fontWeight: 'bold',
    color:'#ffffff',
    marginLeft:20,
    fontFamily:'OpenSans-Bold'
  },

  events_mainTopLeftText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
    width:300,
    marginRight:20,
    fontFamily:'OpenSans-Bold'
  },
  datatable_searchbar:{
    flexDirection:'row',
    flex:1,
    marginBottom:10,
  },
  searchbar_left:{
    flex:1,
    height:39,
    justifyContent:'center'
  },
  searchbar_right:{
    flexDirection:'row',
    height:39,
  },
  row_stale:{
    flexDirection:'row',
    padding: 20,
    backgroundColor:'#2C313E',
    marginBottom:3
  },
  searchbar_button: {
    alignItems:'center',
    justifyContent:'center',
    marginTop:3, borderRadius:3,
    backgroundColor: '#638a94', height:37,marginLeft:10,
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: {
      height: 4,
      width: 4
    },
  },
  eventslist_details:{
    flex:1,
    flexDirection:'row',
    marginVertical: 10,
    paddingVertical: 40
  },
  LazyLoad:{
    // width:150,
    // alignItems:'center',
    // justifyContent:'center',
    justifyContent: 'center',
    shadowOpacity: 0.8,
    shadowRadius: 10,
    shadowOffset: {
      height: 4,
      width: 4
    },
  },
  LazyLoad_res:{
    width:300,
    // alignItems:'center',
    // justifyContent:'center',
    shadowOpacity: 0.8,
    shadowRadius: 10,
    shadowOffset: {
      height: 4,
      width: 4
    },
  },

  event_brand:{
    color: '#b6c5cf',
    fontSize: 12,
    fontWeight:'600',
    fontFamily: 'Open Sans',
    backgroundColor:'#00000000'
  },
  event_name:{
    marginTop: 5,
    color: '#ffffff',
    fontSize: 20,
    fontFamily: 'Open Sans',
    fontWeight:'600'
  },
  event_time: {
    flexDirection:'row',
    alignItems:'center'
  },
  eventTimeImg:{
    width:12,
    marginRight:10,
    resizeMode:'contain'
  },
  eventStartTime:{
    fontSize:12,
    color:'#b6c5cf',
    fontWeight:'600',
    textAlign:'left',
    fontFamily: 'Open Sans',
  },
  event_address:{
    marginTop:-4,
    flexDirection:'row',
    alignItems:'center',
  },
  btn_blue:{
    paddingTop:6,
    paddingBottom:6,
    paddingLeft:10,
    paddingRight:10,
    backgroundColor:'#396ba9',
    alignItems:'center',
    justifyContent:'center',
    marginRight:10,
    borderRadius:3,
    borderRadius: 3,
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: {
      height: 4,
      width: 4
    },
    marginBottom:10
  },
  btn_view:{
    paddingVertical:5,
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center'
  },
  btnBlueText:{
    color:'#ffffff',
    fontSize:13,
    marginLeft: 5,
    fontFamily: 'Open Sans'
  },

  eventStatisticsItemWrapper:{
    paddingLeft:15,
    paddingRight:20,
    paddingBottom: 15,
    alignItems: 'center'
  },
  eventStatisticsInfo:{
    color:'#b6c5cf',
    fontSize:18,
    fontWeight:'600',
    fontFamily: 'Open Sans',
  },
  eventStatisticsDescription:{
    color:'#b6c5cf',
    fontFamily:'Open Sans',
    textAlign: 'center',
    fontWeight: '500',
    fontSize: 18,
    marginLeft: 10
  },
  legEnd: {
    marginTop: 5,
    fontSize: 15,
    color:'#b6c5cf',
    fontWeight: '500',
    fontFamily:'Open Sans'
  },
  sold: {
    color:'#b6c5cf',
    fontSize:16,
    fontWeight:'600',
    fontFamily:'Open Sans'
  }
}

if(!DeviceInfo.isTablet()) style = _.merge(style, {
  event_topView: {
    flexDirection: 'column'
  },

  datatable_searchbar:{
    flexDirection:'column'
  },
  row_stale:{
    flex:1,
    flexDirection:'column',
    backgroundColor: '#393e46'
  },
  eventslist_details:{
    flexDirection: 'column',
  },
  event_details:{
    marginHorizontal: 27,
    marginVertical: 35
  },
  eventItemFlexDirection:{
    alignItems: 'center',
  },
  thumb: {
    width: window.width-70,
    overflow: 'visible',
    alignSelf:'stretch',
    resizeMode:'cover',
    borderRadius:5,
  },
  LazyLoad:{
    width: window.width-70,
    shadowOpacity: 0.8,
    shadowRadius: 10,
    shadowOffset: {
      height: 4,
      width: 4
    },
  },
  events_mainTopView: {
    backgroundColor: 'rgb(36,41,53)',
    height:41,
    alignItems: 'center',
  },
})
export default StyleSheet.create(style)
