import _ from 'lodash'
import {connect} from 'react-redux'
import {Link} from 'react-router'
import React from 'react'

import Notifications from '../_library/notifications/Notifications'
import LoadingBar from '../_library/LoadingBar'
import {CLEAR_SELECTED_TOUR, FETCH_TOUR} from '../../_common/redux/tours/actions'
import Address from '../_library/Address'
import classNames from 'classnames'

@connect(
  (state) => {
    const tour = state.tours.get('selected')
    return {
      loading: state.loading.has('FETCH_TOUR'),
      error: state.tours.get('errors').get('FETCH_TOUR'),
      tour: tour ? tour.toJS() : null
    }
  },
  {CLEAR_SELECTED_TOUR, FETCH_TOUR}
)
export default class TourPage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  componentDidMount() {
    const {FETCH_TOUR, CLEAR_SELECTED_TOUR, params: {id}} = this.props
    if (_.get(this.props.tour, 'id', '') !== id) {
      CLEAR_SELECTED_TOUR()
      FETCH_TOUR(id)
    }
  }
  componentDidUpdate(prevProps) {
    const {FETCH_TOUR, params: {id: newid}} = this.props
    const {params: {id: oldid}} = prevProps
    if (newid && newid !== oldid && !this.props.tour) {
      FETCH_TOUR(newid)
    }
  }
  
  render() {
    const {tour, error, loading, routes} = this.props
    let showLoading = loading
    if(!tour) {
      showLoading = true
    }

    return (
      <div className='body-main'>
        <Notifications />
        <div>
          <div className='body-panel-header'>
            <div className='left'>
              <div className='title'>Tour</div>
              <div className='description'>
              {!showLoading &&
                <div className='tour'>
                  {!!tour.bannerURL && <img src={tour.bannerURL} />}
                  <div>
                    <div>{tour.displayName}</div>
                  </div>
                </div>
              }
              </div>
            </div>
          </div>
          <div className='body-panel-spacing'/>
          <div className='body-panel-content'>
            {!showLoading && this.props.children}
            {!!showLoading && <LoadingBar title={'Hold tight! We\'re getting your tour\'s details...'}/>}
          </div>
        </div>
      </div>
    )
  }
}