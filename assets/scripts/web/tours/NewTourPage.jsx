import _ from 'lodash'
import {connect} from 'react-redux'
import {routeActions} from 'react-router-redux'
import React from 'react'

import Notifications from '../_library/notifications/Notifications'
import {CREATE_TOUR} from '../../_common/redux/tours/actions'
import {FETCH_EVENTS} from '../../_common/redux/events/actions'
import TourForm from './TourForm'

import classNames from 'classnames'

const noop = () => {}

@connect(
  (state) => {    
    const u = state.auth.get('user')
    const events = state.events.get('events').toList()
    return {
      user: u ? u.toJS() : null,
      events: events.toJS()
    }
  },
  {CREATE_TOUR, push: routeActions.push, FETCH_EVENTS}
)
export default class NewTourPage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
    document.title = `New Tour - The Ticket Fairy Dashboard`
  }

  componentDidMount() {
    this.props.FETCH_EVENTS()
  }

  receiveExposedMethod(exposedMethod) {
    this.exposedMethod = exposedMethod
  }

  exposedMethod(){

  }

  handleSubmit(form) {
    const {push, CREATE_TOUR} = this.props
    const description = this.exposedMethod()
    form.attributes.description = description

    console.log(form)
    
    // return Promise.resolve(CREATE_TOUR(form))
    //   .catch(err => {
    //     return Promise.reject(_.result(err, 'toFieldErrors', err))
    //   })
    //   .then(res => {
    //     const id = _.get(res, 'data.id')
    //     const next = id ? `/event/${id}/venues` : '/events'
    //     push(next)
    //     return res
    //   })
  }

  render() {
    const {user, events} = this.props
    const initialValues = {}
    
    return (
      <div className='body-main'>
        <Notifications />
        <div>
          <TourForm
            onSubmit={::this.handleSubmit}
            initialValues={initialValues}
            user={user}
            events={events}
            getExposedMethod={this.receiveExposedMethod.bind(this)}
            isNew={true}
          />
        </div>
      </div>
    )
  }
}