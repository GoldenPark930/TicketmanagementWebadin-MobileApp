import _ from 'lodash'
import Modal from 'react-modal'
import React from 'react'
import classNames from 'classnames'
import {Link} from 'react-router'
import {connect} from 'react-redux'

import modalStyle from '../../_common/core/modalStyle'
import Notifications from '../_library/notifications/Notifications'
import Button from '../_library/Button'
import EmptyBar from '../_library/EmptyBar'
import LoadingBar from '../_library/LoadingBar'
import {FETCH_TOURS} from '../../_common/redux/tours/actions'

@connect(
  (store) => ({
    loading: store.loading.has('FETCH_TOURS'),
    error: store.tours.get('errors').has('FETCH_TOURS'),
    tours: store.tours.get('tours').toList().toJS(),
    uid: store.auth.getIn(['user', 'id'])
  }),
  {FETCH_TOURS}
)
export default class ToursPage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
    document.title = `Tours - The Ticket Fairy Dashboard`
  }

  componentDidMount() {
    this.props.FETCH_TOURS()
  }

  componentDidUpdate(prevProps) {
    const pid = prevProps.uid
    const nid = this.props.uid
    if (pid !== nid && nid) { this.props.FETCH_TOURS() }
  }

  render() {
    const {loading} = this.props
    const tours = this.props.tours || []
    let content
    if (loading) {
      content = <LoadingBar title={"Hold tight! We\'re getting your TOUR list..."} />
    } else if (tours.length) {
      content = (<div>
        
      </div>)
    } else {
      content = <EmptyBar content={'There are no tours to show.'}/>
    }

    return (
      <div className='body-main'>
        <div className='body-panel-header'>
          <div className='left'>
            <div className='title'>Tours</div>
          </div>
          <div className='right'>
            <Link className="btn btn-success btn-shadow" to="/tours/new">
              <i className="fa fa-fw fa-plus" /> Create Tour
            </Link>
          </div>
        </div>
        <div className='body-panel-spacing'/>
        <div className='body-panel-content'>
          {content}
        </div>
      </div>
    )
  }
}