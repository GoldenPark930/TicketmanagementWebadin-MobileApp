import React, {
    Component, PropTypes
} from 'react'
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Image,
    ListView
} from 'react-native'

import {footer} from 'AppStyles'
import Icon from 'react-native-vector-icons/FontAwesome'
class Header extends Component {

    static propTypes = {
        // onOpenDrawer: PropTypes.func.isRequired
    };

    render() {
        return (
            <View style={footer.footer_bar}>
                <View style={footer.footer_bar_left}>
                    <Text style={footer.copyright}>Copyright © 2018 <Text style={footer.the}>THE</Text><Text style={footer.ticket}>TICKET</Text><Text style={footer.the}>FAIRY.com</Text></Text>
                </View>
                <View style={footer.footer_bar_right}>
                    <TouchableOpacity>
                        <Image style={footer.facebook} source={require('@nativeRes/images/icon-facebook.png')}/>
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Image style={footer.twitter} source={require('@nativeRes/images/icon-twitter.png')}/>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}

module.exports = Header
