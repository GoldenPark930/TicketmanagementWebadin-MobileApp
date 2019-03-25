import {StyleSheet, Dimensions} from 'react-native'
import DeviceInfo from 'react-native-device-info'
var {height, width} = Dimensions.get('window')
import constants from './constants'
import common from './common'

export default StyleSheet.create({

    heading_style:{
        marginTop:50,
        marginBottom:30,
        fontWeight:'500',
        fontSize:20,
        color:'#b6c5cf',
        borderLeftWidth: 5,
        borderLeftColor: '#ffa46b',
        fontFamily: 'OpenSans'
    },
    referral:{
        flex:1,
        marginBottom:10,
        backgroundColor: '#2f3239'
    },
    ref_icon_small: {
        marginTop:20,
        marginBottom: 15
    },
    ref_icon_big: {
        marginTop:20,
    },
    influencers_performance:{
        flex:1,
    },
    performance_img:{
        // width: 56,
        resizeMode: 'contain',
        height: 56
    },
    referral_icon_1:{
        backgroundColor: '#2f3239',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        paddingHorizontal: DeviceInfo.isTablet ? 40:20,
    },
    referral_icon_2:{
        backgroundColor: '#202430',
        alignItems:'center',
        justifyContent:'center',
        padding:20
    },
    referral_content_1:{
        backgroundColor: '#252935',
        height:180,
        alignItems:'center',
        padding:20,
    },
    referral_content_2:{
        backgroundColor: '#2B313D',
        height:180,
        alignItems:'center',
        padding:20,
    },

    content_number:{
        fontSize:DeviceInfo.isTablet() ? 32:22,
        fontWeight:'600',
        fontFamily: 'OpenSans',
        color:'white',
        textAlign:'center',
        marginVertical:!DeviceInfo.isTablet() ? 15:0,
    },
    content_text:{
        fontSize:16,
        fontFamily: 'OpenSans',
        color:'#b6c5cf',
        textAlign:'center',
        flexDirection:'row',
    },
    influencers_tier:{
        flex:1,
        borderRadius:3,
        marginRight:20,
        alignItems:'center',
        flexDirection:'row',
    },

    tier_left:{
        fontSize:120,
        fontFamily: 'OpenSans',
        color:'#ffffff',
        backgroundColor:'#00000000',
        letterSpacing: -30,
        textAlign: 'center',
        width: 140,
        lineHeight: 120,
        paddingTop: 40
    },

    tier_right:{
        flex: 1,
        justifyContent:'center',
    },

    tier_percentage:{
        fontSize:30,
        fontWeight:'600',
        fontFamily: 'OpenSans',
        color:'#ffffff',
        backgroundColor:'#00000000',
    },

    tier_rebate: {
      fontSize: 16,
      fontWeight: '400',
      color: '#fff',
      fontFamily: 'OpenSans'
    },

    tier_tickets:{
        flexDirection:'row',
        alignItems:'center',
        paddingBottom: 8
    },

    tier_tickets_text:{
        fontSize:25,
        fontFamily: 'OpenSans',
        marginRight:8,
        color:'#ffffff',
        backgroundColor:'#00000000',
        textAlign:'center',
        fontWeight:'700'
    },

    tier_tickets_img:{
        width:25,
        resizeMode:'contain'
    },
    table_content_View:{alignItems:'center', justifyContent:'center', height:50, flex:1},
    table_content_text:{fontSize:13, fontFamily: 'OpenSans', color:'#ffffff', textAlign:'center'},

    shareRate_background:{flex:1},
    worldmap:{position:'absolute', top:0,  flexDirection:'row'},
    shareRate_engagement:{position:'absolute',left:0,right:0, bottom:-10, textAlign:'center', color:'white', fontSize:14, fontFamily: 'OpenSans', backgroundColor:'#00000000'},
    shareRate_current:{position:'absolute',left:0,right:0, bottom:-10, flexDirection:'row', justifyContent:'center'},
    shareRate_currentText:{fontSize:14, backgroundColor:'#00000000', marginLeft:7, fontFamily: 'OpenSans'},
    user_cooler:{
        color: '#50B7F9'
    },
    user_orange:{
        color: '#A477F8'
    },
    user_red:{
        color: '#FBB654'
    },
    user_hot:{
        color: '#F77254'
    }
})
