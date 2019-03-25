import _ from 'lodash'
import {connect} from 'react-redux'
import React from 'react'
import {Link} from 'react-router'

import {UPDATE_BRAND,FETCH_BRAND} from '../../_common/redux/brands/actions'

import Button from '../_library/Button'
import Notifications from '../_library/notifications/Notifications'

import BrandEventTemplatesForm from './BrandEventTemplatesForm'

@connect(
  (state) => {
    const u = state.auth.get('user')
    return {
      user: u ? u.toJS() : null,
      brands: state.brands.get('collection').toJS(),
      loading: state.loading.has('FETCH_BRAND')
    }
  },
  {UPDATE_BRAND,FETCH_BRAND}
)
export default class BrandEventTemplates extends React.Component {
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
    
  }
  render() {
    const {user, loading, brands, params: {id}} = this.props
    const brand = _.get(brands, id)
    const organizations = _.get(user, '$relationships.organizations', [])
    return (
      <div>
        <BrandEventTemplatesForm 
          onSubmit={::this.handleSubmit} 
          submitLabel="Save"
          organizations={organizations}
        />
      </div>
    )
  }
}