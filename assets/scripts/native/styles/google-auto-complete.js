import {StyleSheet,PixelRatio} from 'react-native'
import Dimensions from 'Dimensions'
import constants from './constants'

const window = Dimensions.get('window')

export default StyleSheet.create({
    container:{
        position:'absolute',
        left:20,
        top:10,
        right:20,
        minWidth: window.width/2
    },
    textInputContainer: {
        backgroundColor: '#373E4C',
        height: 50,
        shadowRadius: 5,
        shadowOpacity: 0.5,
        shadowColor: constants.colors.shadow,
        shadowOffset: {
            height: 10,
            width: 10
        }
    },
    textInput: {
        backgroundColor: '#373E4C',
        height: 30,
        borderRadius: 5,
        paddingTop: 4.5,
        paddingBottom: 4.5,
        paddingLeft: 10,
        paddingRight: 10,
        marginTop: 7.5,
        marginLeft: 8,
        marginRight: 8,
        fontSize: 15,
        flex: 1,
        fontFamily: 'Open Sans'
    },
    listView: {
        backgroundColor:'#000000',
    },
    row:{
      borderWidth: 0
    },
    description:{
        color:'#ffffff'
    },
    description2:{
        color:'#000000'
    }
})
