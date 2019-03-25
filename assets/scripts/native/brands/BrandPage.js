import _ from 'lodash'
import React, {
  Component, PropTypes
} from 'react'
import {View,Text,ScrollView} from 'react-native'
import {connect} from 'react-redux'
import {Link} from 'react-router-native'
import Notifications from '../_library/notifications/Notifications'
import LoadingBar from '../_library/LoadingBar'
import session from '../../_common/redux/brands/actions'
import styles from '../styles/common'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'


class BrandPage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  componentWillMount() {
    const {brands, FETCH_BRAND, params: {id}} = this.props
    const brand = brands[id]
    if (!brand) { FETCH_BRAND(id)}
  }

  render() {
    const {loading, brands, params: {id}} = this.props
    const brand = _.get(brands, id)
    let showLoading = loading
    if (!brand) {
      showLoading = true
      return null
    }

    return (
      <KeyboardAwareScrollView>
          <Notifications />
          <View style={styles.title}>
            {!showLoading &&
              <Text style={{color:'white', fontSize:20, fontWeight:'700'}}>{brand.displayName}</Text>
            }
          </View>
          <View style={{paddingHorizontal:20}}>
            {!showLoading && this.props.children}
            {!!showLoading && <LoadingBar title={'Hold tight! We\'re getting your brand\'s details...'}/>}
          </View>
      </KeyboardAwareScrollView>
    )
  }
}export default connect(
  (state) => ({
    brands: state.brands.get('collection').toJS(),
    loading: state.loading.has('FETCH_BRAND')
  }),
  {FETCH_BRAND:session.FETCH_BRAND}
)(BrandPage)
