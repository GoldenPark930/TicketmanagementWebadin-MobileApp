import {StyleSheet,PixelRatio} from 'react-native'
import Dimensions from 'Dimensions'
import constants from './constants'

const window = Dimensions.get('window')

export default StyleSheet.create({
  title_content:{
    backgroundColor:'#1a1d25',
    flexDirection:'row'
  },
  tab_title:{
    flex:1,
    paddingVertical:15,
    paddingHorizontal:12,
    alignItems:'center',
    justifyContent:'center'
  },
  tab_title_selected:{
    flex:1,
    borderBottomWidth:3,
    borderBottomColor:'#ffa46b',
    paddingVertical:15,
    paddingHorizontal:12,
    alignItems:'center',
    justifyContent:'center'
  },
  tab_title_text:{
    fontSize: 15,
    fontWeight:'700',
    color:'#ffffff',
    fontFamily: 'Open Sans',
  },
  tab_title_text_selected:{
    fontSize: 15,
    fontWeight:'700',
    color:'#fbcc8f',
    fontFamily: 'Open Sans',
  },
  tr_expanded_row:{
    flexDirection:'row',
    backgroundColor:'#353b4a'
  },
  table_stripe_orders_row1:{
    flexDirection:'row',
    backgroundColor:'#232732',
  },
  table_stripe_orders_row2:{
    backgroundColor:'#2a2f3c',
    flexDirection:'row',
    justifyContent:'center',
  },
  table_stripe_row1:{
    flexDirection:'row',
    backgroundColor:'#232732',
    paddingHorizontal:15
  },
  table_stripe_row2:{
    backgroundColor:'#2a2f3c',
    flexDirection:'row',
    justifyContent:'center',
    paddingHorizontal:15
  },
  expandIcon_expanded:{
    position: 'absolute',
    flex:1,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    backgroundColor: '#232732',
    alignItems:'center',
    justifyContent:'center',
    left:10,
    right:10,
    bottom:-1,
    top:10
  },
  expandIcon:{
    flex:0.5,
    marginHorizontal:10,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    alignItems: 'center',
    justifyContent:'center',
    backgroundColor: '#23273200'
  },
  row_detail:{
    borderBottomLeftRadius:8,
    borderBottomRightRadius:8,
    borderTopRightRadius:8,
    paddingVertical:20,
    paddingHorizontal:20,
    marginHorizontal:10,
    marginBottom:10,
    backgroundColor:'#232732'
  },
  low_title:{
    flex:1,
    borderLeftColor:'#ffa46b',
    borderLeftWidth:3,
    height:18,
    justifyContent:'center',
    paddingLeft: 10
  },
  low_title_text:{
    fontSize:16,
    fontWeight:'800',
    color:'white',
    fontFamily: 'Open Sans',
  },
  detail_item_text:{
    color:'#b6c5cf',
    fontSize:14,
    fontWeight:'600',
    fontFamily: 'Open Sans',
    marginLeft:10
  },
  row_content:{
    flexDirection:'row',
    paddingVertical:20,
    borderBottomWidth:1.5,
    borderBottomColor:'#424756'
  },
  ticket_title:{
    color:'#b6c5cf',
    fontSize:14,
    fontFamily: 'Open Sans',
  },
  ticket_green:{
    backgroundColor: 'rgba(60, 155, 134, 0.55)',
    padding:4,
    borderWidth:1,
    borderColor:'#378a77',
    flexDirection:'row'
  },
  ticket_yellow:{
    backgroundColor: 'rgba(169, 158, 71, 0.55)',
    padding:4,
    borderWidth: 1,
    borderColor: '#c5a347',
    flexDirection:'row'
  },
  ticket_red:{
    backgroundColor: 'rgba(216, 82, 98, 0.55)',
    padding:4,
    borderWidth: 1,
    borderColor: '#b34242',
    flexDirection:'row'
  },
})
