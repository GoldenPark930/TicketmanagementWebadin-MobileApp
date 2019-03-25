import {StyleSheet} from 'react-native'

import constants from './constants'

export default StyleSheet.create({

    event_musiclist:{
        flex:1
    },

    card:{
        width:200,
        height:200,
        backgroundColor:'#ffffff',
        borderRadius:5,
        alignItems:'center',
        justifyContent:'center',
        marginLeft:15,
        marginBottom:50
    },

    card_img:{
        width:200,
        height:200,
        borderRadius:5
    },

    description:{
        position:'absolute',
        bottom:0,
        left:0,
        borderBottomLeftRadius:5,
        borderBottomRightRadius:5,
        backgroundColor:'rgba(0,0,0,0.7)',
        padding:5
    },

    category:{
        flex:1,
        fontSize:10,
        color:'#b6c5cf',
        fontFamily: 'OpenSans-Bold',
    },
    name:{
        flex:1,
        fontSize: 15,
        color:'#b6c5cf',
        fontFamily: 'OpenSans-Bold',
    },
    count:{
        fontSize:13,
        color:'#ffffff',
        fontFamily: 'OpenSans-Bold',
    },
    fan:{
        fontSize:8,
        color:'#ffffff',
        fontFamily: 'OpenSans-Bold',
    }

})
