import { StyleSheet } from 'react-native'
import Dimensions from 'Dimensions'

const window = Dimensions.get('window')

export default StyleSheet.create({
    container: {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        position: 'absolute'
    },
    video:{
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginContainer:{
        position:'absolute',
        left:0,
        top:0,
        right:0,
        bottom:0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    login:{
        backgroundColor:'rgba(44, 49, 62, 0.95)',
        borderRadius:5,
        width: 350,
        padding:25,
        alignItems:'center',
        elevation:54
    },
    login_logo:{
        marginTop:10,
        height:65,
        resizeMode:'contain'
    },
    login_text:{
        fontSize: 24,
        marginBottom: 14,
        marginTop:20,
        fontWeight:'600',
        color:'#ffffff',
        fontFamily:'OpenSans-Bold'
    },
    formControl:{
        width:300,
        height:37,
        color:'#ffffff',fontWeight: '400', fontSize:20,flex: 1,
        fontFamily: 'Open Sans'
    },
    formControl2:{
        height:37,
        color:'#ffffff',fontWeight: '400', fontSize:20,flex: 1,
        fontFamily: 'Open Sans'
    },
    linearGradient:{
        width:300,
        height:50,
        borderRadius:5,
        marginTop:35,
        justifyContent: 'center',
        alignItems: 'center',
    },
    login_button_text:{
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 14,
        marginTop:20,
        color:'#ffffff',
        fontFamily: 'Open Sans'
    },
    footer_bar:{
        color:'#B6C5CF',
        fontSize:12,
        fontFamily: 'Open Sans'
    },
    floating_field:{width:300, borderBottomWidth:1, borderBottomColor:'#47516d', height:45,  justifyContent:'center', padding:6},
    floating_text:{height:45, fontSize:14,color:'#ffffff',
        fontFamily:'OpenSans-Bold'
    },
    error_field:{width:300, paddingLeft:6,paddingRight:6,paddingTop:12, paddingBottom:12, borderBottomLeftRadius:4,borderBottomRightRadius:4, backgroundColor:'#d9534f',
        elevation:50,
        shadowOpacity: 0.25,
        shadowRadius: 5,
        shadowOffset: {
            height: 7,
            width: 7
        },},
    error_text:{
        fontFamily:'OpenSans-Bold',
        fontSize:14,
        color:'#ffffff'
    },
    alert:{
        margin:10
    },
    alert_danger:{backgroundColor:'#e2616a',  padding:15, borderRadius:4,alignItems:'center'},
    alert_title:{
        fontFamily:'OpenSans-Bold',
        fontSize:20,
        color:'#ffffff',
        flex:1
    },
    alert_detail:{
        fontFamily:'OpenSans-bold',
        fontSize:14,
        color:'#ffffff',
        alignSelf:'flex-start',
        marginTop:5
    },
    alert_button:{
        position:'absolute',
        right:15,
        top:12.5,
        width:20,
        height:20,
        alignItems:'center',
        justifyContent:'center'
    },
    alert_buttonText:{
        fontSize:21,
        fontFamily:'OpenSans-Bold',
        color: 'rgba(255,255,255,0.2)'
    }

})
