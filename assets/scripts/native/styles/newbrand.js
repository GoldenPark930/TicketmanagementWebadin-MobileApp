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
    heading_style: {
        flexDirection: 'row',
        paddingTop: 22,
        paddingBottom: 22
    },
    title: {
        flex:1,
        fontSize:22,
        color:'#B6C5CF',
        marginLeft:10,
        fontFamily:'OpenSans-Bold'
    },
    card_block:{
        backgroundColor:'#2C313E',
        borderRadius:3.5,
        marginBottom:35,
    },
    form_group:{
        paddingTop:15,
        paddingLeft:25,
        paddingRight:25,
        paddingBottom:25,
    },
    formControl:{
        color:'#B6C5CF',
        fontWeight: '500',
        fontSize:14,
        fontFamily:'OpenSans-Bold',
        height:56,
        backgroundColor:'#00000000',
        paddingLeft:5
    },
    formControl2:{
        height:37,
        color:'#ffffff',
        fontSize: 12,
        fontFamily:'OpenSans-Bold',
        flex:1
    },
    form_inAutoSlug:{
        flexDirection:'row',
        flex:1,
        marginTop:35,
        height:35,
        borderWidth:0.5,
        borderColor:'#47516d',
        alignItems:'center',
        borderTopWidth:1,
    },
    form_inAutoSlug_Left:{
        flexDirection:'row',
        alignItems:'center',
        height:35,
        backgroundColor:'#424858',
    },
    link_prefix_img:{
        width: 24,
        height: 24,
        marginLeft: 7,
        marginRight:13,
    },
    link_prefix_url:{
        fontSize: 12,
        color:'#B6C5CF',
        marginRight: 10,
        fontFamily:'OpenSans-Bold',
    },
    form_inAutoSlug_Right:{
        fontSize: 14,
        marginLeft: 10,
        width:300,
        height:35,
        color:'#B6C5CF',
        fontFamily:'OpenSans-Bold',
        backgroundColor:'#00000000',
        borderWidth:0
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
    detailInput:{
        flex:1,
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
    }
})
