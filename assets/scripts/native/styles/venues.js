import { StyleSheet } from 'react-native'
import Dimensions from 'Dimensions'
const window = Dimensions.get('window')

export default StyleSheet.create({
    card_title: {
        flex:1,
        height: 60,
        paddingLeft: 15
    },
    description:{
        height: 110,
        padding: 15,
        marginBottom: 15,
        backgroundColor:'#2C313E'
    },
    description_name:{
        marginBottom:15,
        color:'white',
        fontSize:20,
        width:250,
        fontFamily: 'Open Sans',
    },
    description_img:{
        width:80,
        height:80,
        alignItems:'stretch',
        resizeMode:'contain',
        marginRight:15
    },
    event_address:{
        color:'#B6C5CF',
        fontSize:14,
        fontFamily: 'Open Sans',
    },
    event_img:{
        width:10,
        height:14,
        marginLeft:1,
        marginRight:11
    }
})
