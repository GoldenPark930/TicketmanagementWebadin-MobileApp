import { StyleSheet } from 'react-native'
import Dimensions from 'Dimensions'

const window = Dimensions.get('window')

export default StyleSheet.create({
    container: {
        flex:1,
    },

    event_main_body: {
        flex:0.8,
        height:100,
        borderWidth:1,
        // paddingLeft: window.width * 0.4,
        // paddingRight: window.width * 0.4,
    },

    event_topView: {
        flexDirection: 'row',
        paddingTop: 22,
        paddingBottom: 22,
    },

    title: {
        flex:1,
        fontSize:22,
        color:'#B6C5CF',
        fontFamily:'OpenSans-Bold'
    },

    rightButton: {
        marginRight: 25,
        width: 111,
        height: 34,
        backgroundColor: '#45b163',
        borderRadius: 3,
        shadowOpacity: 0.5,
        shadowRadius: 10,
        shadowOffset: {
            height: 4,
            width: 4
        },
        alignItems:'center',
        justifyContent:'center',
        flexDirection:'row'
    },

    rightButtonText: {
        marginLeft:5,
        color: '#ffffff',
        fontSize:12,
        fontFamily:'OpenSans-Bold'
    },

    brandMain:{
        marginHorizontal:35
    },
    card: {
        backgroundColor: '#2C313E',
        borderRadius: 3,
        borderColor: '#2C313E',
        borderWidth: 1,
        marginBottom: 30,
        flex:1,
        justifyContent:'center',
        paddingHorizontal:15,
        paddingTop:25,
        paddingBottom:20
    },
    cardText: {
        color:'#ffffff',
        fontFamily:'OpenSans-Bold',
        fontSize:12,
        marginLeft:25
    }
})
