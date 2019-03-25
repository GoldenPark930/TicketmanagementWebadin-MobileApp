import _ from 'lodash'
import React, {
  Component, PropTypes
} from 'react'
import {View} from 'react-native'
import {connect} from 'react-redux'
import session from '../../_common/redux/brands/actions'
import {brand} from 'AppStyles'
import BrandForm from './BrandForm'

class BrandDetails extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }
  componentWillMount() {
    const {brands, FETCH_BRAND, params: {id}} = this.props
    const brand = brands[id]
    if (!brand) { FETCH_BRAND(id) }
  }
  handleSubmit(form) {
    const {brands, FETCH_BRAND, params: {id}} = this.props
    const {UPDATE_BRAND, push} = this.props
    return Promise.resolve(UPDATE_BRAND(id, {...form}))
      .catch(err => {
        return Promise.reject(_.result(err, 'toFieldErrors', err))
      })
  }
  render() {
    const {loading, brands, params: {id}} = this.props
    const brand = _.get(brands, id)

    return (
      <View>
        <BrandForm
          onSubmit={(form)=>this.handleSubmit(form)}
          submitLabel='Save'
          initialValues={brand.$original}/>
      </View>
    )
  }
}export default connect(
  (state) => ({
    brands: state.brands.get('collection').toJS(),
    loading: state.loading.has('FETCH_BRAND')
  }),
  {
    UPDATE_BRAND:session.UPDATE_BRAND,
    FETCH_BRAND:session.FETCH_BRAND
  }
)(BrandDetails)
