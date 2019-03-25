import {StyleSheet} from 'react-native'
import Dimensions from 'Dimensions'
import constants from './constants'

const window = Dimensions.get('window')

export default StyleSheet.create({
    daily_title:{
        color: '#ffffff',
        fontSize: 18,
        textAlign: 'center',
        marginTop: 40,
        marginBottom: 10,
        fontFamily: 'Open Sans'
    },
    daily_event_title:{
        color: '#C4CFD7',
        fontSize: 14,
        fontFamily: 'OpenSans-Bold',
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 40,
    },
    title:{
        fontSize:18,
        fontFamily:'OpenSans-Bold',
        textAlign:'center',
        color:'#ffffff'
    },
    number:{
        fontSize:30,
        color:'#ffffff',
        textAlign:'center',
        marginTop:5,
        marginBottom:5,
        fontWeight: 'bold'
    },
    icon:{
        height:20,
        resizeMode:'contain',
        marginLeft:10,
        marginRight:10
    },
    desc:{
        fontSize:10,
        fontFamily:'OpenSans-Bold',
        textAlign:'center',
        color:'#C3CFD7'
    },
    daily_event_bottom:{alignItems:'center', width:75, marginLeft:25, marginRight:25, marginBottom: 25, fontFamily: 'Open Sans'},
    table_cation:{
        margin:10,
        alignSelf:'flex-start',
        alignItems:'center',
        flexDirection:'row',
    }
})
