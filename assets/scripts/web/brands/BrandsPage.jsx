import _ from 'lodash'
import {connect} from 'react-redux'
import React from 'react'
import {Link} from 'react-router'

import Notifications from '../_library/notifications/Notifications'
import {FETCH_SESSION} from '../../_common/redux/auth/actions'
import LoadingBar from '../_library/LoadingBar'

import classNames from 'classnames'
@connect(
  (state) => {
    const u = state.auth.get('user')
    const loading = state.loading.has('FETCH_SESSION')
    return {
      loading: loading,
      user: u ? u.toJS() : null
    }
  },
  {FETCH_SESSION}
)
export default class BrandsPage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
    document.title = 'Brands - The Ticket Fairy Dashboard'
  }
  componentDidMount() {
    const {user, FETCH_SESSION} = this.props
    FETCH_SESSION()
  }
  render() {
    const {loading} = this.props
    const {user} = this.props
    const brands = _.get(user, '$relationships.organizations', [])
    let filteredBrands = _.uniqBy(brands, 'id')
    const nodes = _.map(filteredBrands, (o, index) => {
      return (
        <div key={o.id} className="col-md-3 brands_container">
          <div className="card brands-card-radius">
            <div className="card-block">
              <div className="brand-ico">
                <img src={asset('/assets/resources/images/brand_ico_inner.png')} />
              </div>
              <div className='title'></div>
              <Link className="brands_title" to={'/brand/' + o.id + '/details'}>{o.displayName}</Link>
            </div>
          </div>
        </div>
      )
    })

    let content
    if (loading) {
      content = <LoadingBar title={"Hold tight! We\'re getting your brand list..."} />
    } else if (filteredBrands.length) {
      content = <div className="row"> {nodes} </div>
    } else {
      content = <div className="alert brand-infobar">You are not a member of any brands. Why not start one?</div>
    } 

    return (
      <div className='body-main'> 
        <Notifications />
        <div>
          <div className='body-panel-header'>
            <div className='left'>
              <div className='title'>Brands</div>
            </div>
            <div className='right'>
              <Link className="btn btn-primary" to="/brands/new">
                <i className="fa fa-fw fa-plus" /> Create Brand
              </Link>
            </div>
          </div>
          <div className='body-panel-spacing'/>
          <div className='body-panel-content'>
            {content}
          </div>
        </div> 
      </div>
    )
  }
}