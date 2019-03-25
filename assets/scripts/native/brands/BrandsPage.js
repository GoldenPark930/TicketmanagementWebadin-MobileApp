import _ from 'lodash'
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
import {connect} from 'react-redux'
import {Link} from 'react-router-native'
import Notifications from '../_library/notifications/Notifications'
import LoadingBar from '../_library/LoadingBar'
import session from '../../_common/redux/auth/actions'
import {brand,commonStyle} from '../styles'

class BrandsPage extends Component {

    constructor(props) {
      super(props)
      this.state = {
        getWidth:50
      }
    }
    componentDidMount() {
        const {user, FETCH_SESSION} = this.props
        FETCH_SESSION()
    }
    render() {
        const {loading} = this.props
        const {user} = this.props
        const brands = _.get(user, '$relationships.organizations', [])
        const nodes = _.map(brands, (o, index) => {
            return (
                <View key={o.id+'_'+index}>
                    <View style={brand.card}>
                      <View style={{alignItems:'center'}} >
                        <Image style={{height:91.17,width:130}} resizeMode='contain' source={require('@nativeRes/images/brand_ico_inner.png')}/>
                      </View>
                      <Link to={'/brand/' + o.id + '/details'}>
                          <Text style={{color:'white', fontWeight:'600', fontSize:14}}>{o.displayName}</Text>
                      </Link>
                    </View>
                </View>
            )
        })
        let content
        if (loading) {
          content = <LoadingBar title={'Hold tight! We\'re getting your brand list...'} />
        } else if (brands.length) {
          content = nodes
        }
        return (
            <ScrollView style={brand.container}>
                <Notifications />
                <View style={brand.event_topView}>
                    <View style={commonStyle.title}>
                      <Text style={brand.title}>Brands</Text>
                    </View>
                    <Link to='/brands/new'>
                        <TouchableOpacity style={brand.rightButton}>
                            <Text style={brand.rightButtonText}>＋ Create Brand</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
                <View style={[brand.brandMain]}>
                  {content}
                </View>
            </ScrollView>
        )
    }
}export default connect(
  (state) => {
    const u = state.auth.get('user')
    const loading = state.loading.has('FETCH_SESSION')
    return {
      loading: loading,
      user: u ? u.toJS() : null
    }
  },
  {FETCH_SESSION:session.FETCH_SESSION}
)(BrandsPage)

