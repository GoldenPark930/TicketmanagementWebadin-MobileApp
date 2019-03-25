
import { StyleSheet } from 'react-native'
import Dimensions from 'Dimensions'

const window = Dimensions.get('window')

export default StyleSheet.create({
    container: {
        flex:1,
        backgroundColor: '#373e4c',
    },
    event_main_body: {
        flex:0.8,
        height:100,
        marginLeft:25,
        marginRight:25
    },
    event_topView: {
        flexDirection: 'row',
    },
    title: {
        flex:1,
        fontSize:20,
        color:'#B6C5CF',
        marginLeft:10,
        fontWeight:'700',
        fontFamily: 'Open Sans'
    },
    card_block:{
        backgroundColor:'#2C313E',
        borderBottomLeftRadius:3.5,
        marginBottom:35,
        borderBottomRightRadius:3.5,
        paddingTop:15,
        paddingLeft:25,
        paddingRight:25,
        paddingBottom:25,
    },
    card_title:{
        backgroundColor: '#242935',
        height: 40,
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
        justifyContent:'center'
    },
    card_title_text:{
        color:'#E9E9E9',
        paddingLeft: 25,
        fontSize: 14,
        fontWeight: '600',
        fontFamily:'OpenSans-Bold',
    },
    event_topRightBtn:{
        marginRight:25,
        alignItems:'center',
        justifyContent:'center',
        paddingLeft:10,
        paddingRight:10,
        paddingTop:6,
        paddingBottom:6,
        flexDirection:'row',
        borderRadius:2,
        backgroundColor:'#508ef5',
        shadowColor: '#222',
        shadowOpacity: 0.5,
        shadowRadius: 2,
        shadowOffset: {
            height: 3,
            width: 3
        },
    },
    event_topRightBtnImg:{
        width:22,
        height:22,
        marginRight:5,
    },
    event_topRightBtnTxt:{
        color:'#ffffff',
        fontSize: 12,
        fontFamily:'OpenSans-Bold',
    },
    country:{
        flex:1,
        height:51,
    },
    countryTitle:{
        color: '#E9E9E9',
        fontWeight: '600',
        fontSize: 12,
        fontFamily:'OpenSans-Bold',
    },
    countryText:{
        fontSize: 12,
        color: '#E9E9E9',
        fontFamily:'OpenSans-Bold',
        flex:1,
        marginTop:10
    },
    eventUrlTxt:{
        color:'#ffffff',
        fontSize: 12,
        fontFamily:'OpenSans-Bold',
        marginBottom:5
    },
    eventUrl:{
        flex:1,
        paddingLeft:7,
        paddingRight:7
    },
    eventUrlView:{
        height:35,
        borderWidth:1,
        borderColor:'#47516d',
        alignItems:'center',
        flexDirection:'row'
    },
    eventDate:{
        flex:1,
        justifyContent:'center',
        paddingBottom:5,
        paddingTop:5,
        height:35,
        backgroundColor: '#2a2f3c',
        borderWidth: 1,
        borderRadius: 2,
        borderColor:'#47516d',
        paddingLeft:5,
    },
    eventDateText:{
        fontSize: 14,
        color: '#E9E9E9',
        fontFamily: 'Open Sans',

    },
})
