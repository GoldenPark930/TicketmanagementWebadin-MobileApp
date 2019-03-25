import React, {
    Component
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
import {newbrand} from 'AppStyles'
import BrandForm from './BrandForm'
import PropTypes from 'prop-types';
const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})
class NewBrandPage extends Component {

    static propTypes = {
        onOpenDrawer: PropTypes.func.isRequired
    };

    state = {
        option: 0,
        dataSource:[1,2,3,4,5,6,7,8,9],
    };

    render() {
        return (
            <View style={newbrand.container}>
                <View style={newbrand.event_topView}>
                    <Text style={newbrand.title}> New Brands</Text>
                </View>
                <BrandForm />
            </View>
        )
    }

}

module.exports = NewBrandPage