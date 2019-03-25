import React from 'react'
import {connect} from 'react-redux'
import {FETCH_BRAND} from '../../_common/redux/brands/actions'

export default class BrandDashboard extends React.Component {
  render() {
    const {brands, params: {id}} = this.props
    const brand = _.get(brands, id)
    return (
        <div className="row">
          <div className="col-xs-12">
            <h2>Dashboard</h2>
            <p>Here is Brandanization Dashboard.</p>
          </div>
        </div>
    )
  }
}
