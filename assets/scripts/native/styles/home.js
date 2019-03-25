import { StyleSheet } from 'react-native'
import Dimensions from 'Dimensions'
import DeviceInfo from 'react-native-device-info'
const window = Dimensions.get('window')

export default StyleSheet.create({
    body_main: {
        flex: 1,
        alignItems: 'center',
    },
    welcom:{
        color:'rgb(255, 255, 255)',
        fontFamily:'Open Sans',
        fontSize:20,
        marginBottom:12.5,
        marginTop: 25,
    },
    the:{
        color: 'white',
        fontFamily:'Open Sans',
        fontSize:25,
    },
    ticket:{
        color: 'white',
        fontFamily:'Open Sans',
        fontSize:20,
        fontWeight: '700',
    },
    text_center:{
        color: 'rgb(182, 197, 207)',
        fontSize: 16,
        marginBottom: 12.5,
        fontFamily: 'EvilIcons'
    },
    accordion:{
        // flex:0.9,
        width:window.width-50,
        marginTop:DeviceInfo.isTablet() ? 40: 10,
        shadowColor: 'rgba(0, 0, 0, 1)',
        shadowOpacity: 0.3,
        shadowRadius: 7,
        shadowOffset: {
            height: 14,
            width: 14
        },
        backgroundColor:'#373E4C',
        borderRadius:5,
        marginHorizontal:DeviceInfo.isTablet() ? 0:50,
        marginBottom:40,
    },
    unAccordion:{
      flex:0.05
    },
    accordionTop:{
        flexDirection:'row',
        position:'absolute',
        top:0,
        left:0,
        right:0,
        height:66,
    },
    manage_brands:{
        height:370,
        paddingTop:66,
        borderRadius:5,
    },
    manage_events:{
        position:'absolute',
        bottom:0,
        left:0,
        right:0,
        height:376,
        borderRadius:5
    },
    tab_content:{
        flexDirection:'row',
        alignItems:'center',
    },
        tab_content_resphones:{
        justifyContent:'center',
    },
    tab_icon:{
        flex:1,
        height: 300,
        alignItems:'center',
        justifyContent:'center',
    },
    tav_icon_img:{
        height:240,
        resizeMode:'contain'
    },
    type:{
        fontWeight: '500',
        fontSize: 16,
        color:'white',
        fontFamily:'Open Sans',
        backgroundColor:'#00000000'
    },
    description:{
        fontSize: 12,
        color:'white',
        fontFamily:'Open Sans',
        backgroundColor:'#00000000',
        marginLeft:5
    },
    tab_button:{
        width:30,
        height:30,
        alignItems:'center',
        justifyContent:'center',
    },
    tab_buttonImg:{
        width:15,
        height:15,
    },
    manage_team_members:{
        flex:1,
    },
    manage_ad_accounts:{
        flex:1,
    },
    touchableStyle:{
        flex:1,
        justifyContent:'center'
    },
    borderView:{
        height:4,
        backgroundColor:'#2C313E',
        position:'absolute',
        left:0,
        right:0,
        bottom:0
    },
    //===============responesible=================
    manage_events_res:{
        height:380,
        borderRadius:5,
    }
 })
