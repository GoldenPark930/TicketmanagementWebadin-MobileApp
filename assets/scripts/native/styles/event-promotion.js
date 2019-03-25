import {StyleSheet} from 'react-native'
import Dimensions from 'Dimensions'
import constants from './constants'
import DeviceInfo from 'react-native-device-info'

const window = Dimensions.get('window')

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  eventpromotion_item:{
    height:45,
    marginVertical:10,
    paddingHorizontal:15,
    alignItems:'center',
    flexDirection:'row',
    backgroundColor: '#2C313E',
    width:550,
  },
  eventpromotion_item_flex:{flex:1},
  ticket_type:{width:200},
  eventpromotion_item_text:{color:'#b6c5cf'},
  eventpromotion_promotion:{backgroundColor:'#1a1d25',padding:5,marginVertical:5}
})
