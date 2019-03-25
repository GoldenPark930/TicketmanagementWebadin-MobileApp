import _ from 'lodash'
import {connect} from 'react-redux'
import React from 'react'
import {Link} from 'react-router'
import classNames from 'classnames'

import Button from '../_library/Button'
import LoadingBar from '../_library/LoadingBar'
import Notifications from '../_library/notifications/Notifications'
import {FETCH_BRAND} from '../../_common/redux/brands/actions'


@connect(
  (state) => ({
    brands: state.brands.get('collection').toJS(),
    loading: state.loading.has('FETCH_BRAND')
  }),
  {FETCH_BRAND}
)
export default class BrandPage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }
  componentWillMount() {
    const {brands, FETCH_BRAND, params: {id}} = this.props
    const brand = brands[id]
    if (!brand) { FETCH_BRAND(id) }
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
      <div className='body-main'>
        <Notifications />
        <div>
          <div className='body-panel-header'>
            <div className='left'>
              <div className='title'>
                {!showLoading &&
                  <h3>{brand.displayName}</h3>
                }
              </div>
            </div>
          </div>
          <div className='body-panel-spacing'/>
          <div className='body-panel-content'>
            {!showLoading && this.props.children}
            {!!showLoading && <LoadingBar title={'Hold tight! We\'re getting your brand\'s details...'}/>}
          </div>
        </div>
      </div>
    )
  }
}