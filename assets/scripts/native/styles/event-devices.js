import {StyleSheet} from 'react-native'
import Dimensions from 'Dimensions'
import constants from './constants'
import DeviceInfo from 'react-native-device-info'

const window = Dimensions.get('window')

export default StyleSheet.create({
  event_devices : {
    flex:1,
    borderTopWidth: 30,
    borderTopColor: '#2f3239',
    backgroundColor: '#393d46',
    alignItems: 'center'
  },
  total_buyers: {
    position: 'absolute',
    left: 0,
    right: 0,
    top:0,
    alignItems: 'center'
  },
  total_image: {
    width:75,
    height:38.5,
    marginBottom:8
  },
  total_count:{
    color: '#ffffff',
    fontSize: 32,
    backgroundColor: '#00000000',
    fontWeight: '600',
    textShadowColor:'rgba(255,255,255,.65)',
    textShadowRadius:10,
    textShadowOffset: {
      width:1,
      height:0
    },
    fontFamily: 'OpenSans'
  },
  total_description: {
    fontSize: 9,
    color:'#c6cbd0',
    fontFamily: 'OpenSans'
  },
  tab_titile_category: {
    alignItems:'center',
    marginHorizontal: 5,
    borderBottomWidth: 2,
    borderBottomColor: '#00000000'
  },
  tab_titile_active_category: {
    alignItems:'center',
    marginHorizontal: 5,
    borderBottomWidth: 2,
    borderBottomColor: '#ffa46b'
  },
  tab_title_category_text: {
    textAlign: 'center',
    fontSize: 9,
    color: 'white',
    fontFamily: 'OpenSans'
  },
  tab_title_category_active_text:{
    textAlign: 'center',
    fontSize: 9,
    color: '#fbcc8f',
    fontFamily: 'OpenSans'
  },
  tab_title_category_img_view: {
    height: 30,
    flexDirection: 'row',
    fontFamily: 'OpenSans'
  },
  tab_titile_category_img: {
    opacity: 0.6,
    width: 25,
    height: 22,
    resizeMode: 'contain'
  },
  tab_title_active_img: {
    opacity: 1,
    width: 25,
    height: 22,
    resizeMode: 'contain'
  },
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10
  },
  icon: {
    height: 40,
    width: 40,
    margin: 10
  },
  rank: {
    letterSpacing: -5,
    fontWeight: '700',
    color: '#666666',
    fontSize: 60,
    fontFamily: 'OpenSans'
  },
  value: {
    alignItems: 'center',
  },
  numbers: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '600',
    color: 'white',
    fontFamily: 'OpenSans'
  },
  title: {
    fontSize: 10,
    lineHeight: 16,
    color: 'white',
    fontFamily: 'OpenSans'
  },
  top5: {
    alignItems: 'center'
  },
  decoration_icon: {
    width: window.width-60,
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 100,
    alignItems: 'center',
  },
  decoration: {
    width: 70,
    height:1,
    backgroundColor: '#555',
    margin: 10
  },
  decoration_image: {
    width:80,
    height:70
  },
  decoration_text:{
    padding: 10,
    fontSize: 11,
    color: 'white',
    fontWeight: '700',
    fontFamily: 'OpenSans'
  },
  device_type_tile: {
    padding: 20,
    margin: 10,
    width: 160,
    backgroundColor: '#474D55',
    shadowColor: '#000',
    shadowOffset: {width: 2, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 5,
    alignItems: 'center',
    borderRadius: 5,
  },
  tab_content_device_types: {
    paddingBottom: 50,
    paddingTop: 20
  }
})
