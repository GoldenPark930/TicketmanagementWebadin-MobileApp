
import { StyleSheet } from 'react-native'
import Dimensions from 'Dimensions'

const window = Dimensions.get('window')

export default StyleSheet.create({
  recipients_table:{
    backgroundColor:'#2d3240',
    paddingVertical:20,
    flexDirection:'row',
  },
  recipients_element_title:{
    paddingHorizontal:8,
    color:'#ffffff',
    fontSize:14,
    fontWeight:'800',
    fontFamily: 'Open Sans'
  },
  recipients_element_View:{
    flexDirection:'row',
    borderBottomWidth:1,
    borderBottomColor:'#3E4552',
    paddingVertical:8,
    alignItems:'center',
    paddingHorizontal:10
  },
  recipients_element:{
    flex:1,
    fontSize:12,
    color:'#ffffff',
    fontWeight:'600',
    fontFamily: 'Open Sans'
  },


})
