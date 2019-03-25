import _ from 'lodash'
import {connect} from 'react-redux'
import React from 'react'
import {Link} from 'react-router'
import {routeActions} from 'react-router-redux'

import Notifications from '../_library/notifications/Notifications'
import BrandForm from './BrandForm'
import {CREATE_BRAND} from '../../_common/redux/brands/actions'

import classNames from 'classnames'

@connect(
  (state) => ({}),
  {CREATE_BRAND, push: routeActions.push}
)
export default class NewBrandPage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
    document.title = 'New Brand - The Ticket Fairy Dashboard'
  }
  handleSubmit(form) {
    const {CREATE_BRAND, push} = this.props
    return Promise.resolve(CREATE_BRAND({...form}))
      .catch(err => {
        return Promise.reject(_.result(err, 'toFieldErrors', err))
      })
      .then(() => {
        push('/brands')
      })
  }
  render() {
    return (
      <div className='body-main'>
        <Notifications />
        <div>
          <div className='body-panel-header'>
            <div className='left'>
              <div className='title'>New Brand</div>
            </div>
          </div>
          <div className='body-panel-spacing'/>
          <div className='body-panel-content'>
            <BrandForm onSubmit={::this.handleSubmit} 
                            submitLabel="Create Brand"
                            initialValues={null}/>
          </div>
        </div>
      </div>
    )
  }
}
