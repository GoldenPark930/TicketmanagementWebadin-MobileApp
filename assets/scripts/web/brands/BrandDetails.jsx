import _ from 'lodash'
import {connect} from 'react-redux'
import React from 'react'
import {Link} from 'react-router'

import Button from '../_library/Button'
import Notifications from '../_library/notifications/Notifications'
import {UPDATE_BRAND,FETCH_BRAND} from '../../_common/redux/brands/actions'
import BrandForm from './BrandForm'

@connect(
  (state) => ({
    brands: state.brands.get('collection').toJS(),
    loading: state.loading.has('FETCH_BRAND')
  }),
  {UPDATE_BRAND,FETCH_BRAND}
)
export default class BrandDetails extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}    
  }
  componentWillMount() {
    const {brands, FETCH_BRAND, params: {id}} = this.props    
    const brand = brands[id]
    document.title = `Details - ${brand.displayName} - The Ticket Fairy Dashboard`
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
      <div>
        <BrandForm 
          onSubmit={::this.handleSubmit} 
          submitLabel="Save"
          initialValues={brand.$original}/>
      </div>
    )
  }
}