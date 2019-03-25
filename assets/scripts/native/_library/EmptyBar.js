import React from 'react'
import {
    Text,
    View,
    Image
} from 'react-native'
class EmptyBar extends React.Component {
    constructor(props) {
        super(props)
    }
    render() {
        const {link, buttonTitle, content} = this.props
        return (
        <View style={{ alignItems:'center', justifyContent:'center',
            marginTop:10, marginBottom:30,backgroundColor:'#2C313E',borderRadius:3,padding:25,}}>
            <Image source={require('@nativeRes/images/no_data_icon_new.png')} style={{height:90, resizeMode: 'contain'}}/>
        </View>

        )
    }
}export default EmptyBar
