import { StyleSheet } from 'react-native'
import Dimensions from 'Dimensions'

const window = Dimensions.get('window')

export default StyleSheet.create({
    footer_bar:{
        height:46,
        backgroundColor:'#373e4c',
        borderTopWidth:2,
        borderTopColor:'#B6C5CF',
        alignItems:'center',
        flexDirection:'row'
    },
    footer_bar_left:{
        flex:1,
        marginLeft:10,
        justifyContent:'center'
    },
    copyright:{
        color: 'rgb(182, 197, 207)',
        fontFamily: 'Open Sans',
        fontSize: 14,

    },
    the:{
        color: 'rgb(255, 255, 255)',
        fontFamily: 'Open Sans',
        fontSize: 14,
    },
    ticket:{
        color: 'rgb(255, 255, 255)',
        fontFamily: 'Open Sans',
        fontSize: 14,
        fontWeight: 'bold',
    },
    footer_bar_right:{
        marginRight:10,
        justifyContent:'center',
        flexDirection:'row'
    },
    facebook:{
        width:20,
        height:20,
        marginRight:15
    },
    twitter:{
        width:20,
        height:20,
    }
})
