import { StyleSheet } from 'react-native'
import Dimensions from 'Dimensions'

const window = Dimensions.get('window')

export default StyleSheet.create({
    container: {
        flex:1,
        backgroundColor: '#2C313E',
        height:75,
        flexDirection:'row',
        alignItems:'center',
    },

})
