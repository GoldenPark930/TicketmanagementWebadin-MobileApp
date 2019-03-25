import {StyleSheet} from 'react-native'
import Dimensions from 'Dimensions'
import constants from './constants'
import DeviceInfo from 'react-native-device-info'

const window = Dimensions.get('window')

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#4F5460',
    },

    title: {
        marginLeft: DeviceInfo.isTablet() ? 10 :0,
        marginRight: DeviceInfo.isTablet() ? 10 :0,
        flexDirection: DeviceInfo.isTablet() ?'row':'column'
    },

    titleLabel1: {
        fontSize: 16,
        fontWeight: '500',
        flex: 1,
        color: constants.colors.text1,
        fontFamily: 'Open Sans'
    },

    titleLabel2: {
        fontSize: 13.9,
        fontWeight: '400',
        color: constants.colors.text1,
        marginTop:DeviceInfo.isTablet() ? 0:16,
        fontFamily: 'Open Sans'
    },

    radioContainer: {height: 200, flex: 1, marginHorizontal: DeviceInfo.isTablet() ? 5 :0, marginVertical:5},
    radioSelected: {
        flex: 1,
        borderRadius: 3,
        shadowOpacity: 0.5,
        shadowColor: constants.colors.shadow,
        shadowRadius: 5,
        shadowOffset: {
            height: 10,
            width: 10
        }
    },
    radio: {
        flex: 1,
        padding: 5,
        borderColor: constants.colors.border1,
        borderWidth: 0.5,
        borderRadius: 3
    },

    radioIcon: {
        color: constants.colors.text2,
        backgroundColor: 'transparent'
    },

    radioLabel1: {
        color: constants.colors.text2,
        fontSize: 25,
        fontWeight: '400',
        marginBottom: 10,
        textAlign: 'center',
        backgroundColor: 'transparent',
        fontFamily: 'Open Sans'
    },

    radioLabel2: {
        color: constants.colors.text2,
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 10,
        paddingLeft: 20,
        paddingRight: 20,
        textAlign: 'center',
        backgroundColor: 'transparent',
        fontFamily: 'Open Sans'
    },
    radioLabel3: {
        color: constants.colors.text2,
        fontSize: 16,
        textAlign: 'center',
        backgroundColor: 'transparent',
        fontFamily: 'Open Sans'
    },

    edit_ticket_tiers: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#575f70',
        paddingTop:50,
        paddingBottom:60,
        marginHorizontal: 20,
        flex:1
    },
    tier_left:{
      flex:0.5,
      flexDirection: 'row',
      justifyContent: 'center'
    },
    tier_left_text: {
      fontSize: 120,
      color: '#ffa46b',
      shadowColor: '#000',
      shadowOffset: { width: 6, height: 6 },
      shadowOpacity: 0.8,
      shadowRadius: 2,
    },
    tier_left_value: {
      alignItems: 'center',
      justifyContent:'center',
      paddingVertical:20
    },
    tier_left_value_content: {
      shadowColor: '#000',
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 0.8,
      shadowRadius: 2,
    },
    tier_right:{
      flex:0.5,
      marginLeft: 25
    },
    tier_tickets:{
      fontSize: 25,
      fontWeight: '700',
      fontFamily: 'Open Sans',
      color:'white',
    },
    count_animation_container: {
      fontSize: 30,
      fontFamily: 'Open Sans',
      marginTop: 10,
      fontWeight: '600',
      lineHeight: 30
    },
    tier_rebate: {
      fontSize: 18,
      fontWeight: '400',
      fontFamily: 'Open Sans',
      color: 'white'
    },
    max_order_label: {
      lineHeight: 24,
      marginLeft: 5,
      fontSize: 14,
      color:'#c6cbd0',
      fontFamily: 'Open Sans'
    },
    max_order_value_up_down: {
      backgroundColor: '#4d5257',
      borderRadius: 3,
      width:20, height:20,
      alignItems: 'center',
      justifyContent: 'center'
    },
    orderValue: {
      flex:0.8,
      borderWidth: 1,
      borderColor: '#63666d',
      backgroundColor:'#494d54',
      borderRadius: 2,
      color: 'white',
      fontSize:20,
      height:40,
      paddingHorizontal:8,
      fontFamily: 'Open Sans',
      marginRight: 10
    }
})
