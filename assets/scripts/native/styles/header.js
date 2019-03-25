import { StyleSheet } from 'react-native'
import Dimensions from 'Dimensions'
import DeviceInfo from 'react-native-device-info'
import _ from 'lodash'
var {Dheight, Dwidth} = Dimensions.get('window')
import constants from './constants'
let style = {
    header_bar: {
        backgroundColor: '#2f3239',
        height: 60,
        flexDirection:'row',
        alignItems:'center',
        borderBottomWidth: 1,
        borderBottomColor: '#B6C5CF',
        marginBottom:5,
        shadowColor: '#000000',
        shadowOpacity: 0.2,
        shadowRadius: 5,
        shadowOffset: {
          height: 5,
          width: 5
        },
    },
    header_bar_left:{
        flexDirection:'row',
        alignItems:'center',
        width:40,
        height:60,
    },
    route_path:{
        marginLeft: 12,
        fontSize: 12,
        color:'#B6C5CF',
        fontFamily:'OpenSans-Bold'
    },
    header_bar_right:{
        flexDirection:'row',
        alignItems:'center',
        marginRight:25
    },
    name_in_circle:{
        marginRight: 10,
        width: 35,
        height: 35,
        alignItems: 'center',
        justifyContent:'center',
        borderRadius:17.5,
        borderWidth:0.5,
        borderColor:'#4F5460',
        backgroundColor:'#373e4c'
    },
    name_in_circle_text:{
        fontSize:13,
        color:'#ffffff',
        fontWeight:'600',
        fontFamily: 'Open Sans'
    },
    avatar:{
      width:80,
      marginLeft: 20,
      alignItems:'center'
    },
    logo_img:{
      height:44,
      resizeMode:'contain'
    },
    name:{
        fontSize:13,
        color:'#ffffff',
        marginRight: 10,
        fontFamily: 'Open Sans'
    },
    page_route:{
        flex:1,
        flexDirection:'row',
        alignItems:'center',
    },
    route_sub:{
        alignItems:'center',
        flexDirection:'row',
        marginLeft:12,
    },
    route_selected:{
        marginLeft:12,
        color:'#ffffff',
        fontSize:12,
        fontFamily:'OpenSans-Bold'
    }
}
if(!DeviceInfo.isTablet()) style = _.merge(style, {
  header_bar_left:{
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center',
    width:50,
    height:60,
  },
  avatar:{
    borderWidth:1,
    width:1,
    marginLeft: 1,
  },
})
export default StyleSheet.create(style)
