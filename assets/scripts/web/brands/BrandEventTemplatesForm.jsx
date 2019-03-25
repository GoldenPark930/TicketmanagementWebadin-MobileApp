import _ from 'lodash'
import {connect} from 'react-redux'
import {reduxForm} from 'redux-form'
import React from 'react'

import Button from '../_library/Button'

import EventForm from '../events/EventForm'
import VenueEditor from '../events/VenueEditor'
import TicketOptionsForm from '../events/TicketOptionsForm'

@connect(
  (state) => {    
    const u = state.auth.get('user')
    return {
      user: u ? u.toJS() : null
    }
  },
  {}
)
export default class brandEventTemplatesForm extends React.Component {
  receiveExposedMethod(exposedMethod) {
    this.exposedMethod = exposedMethod
  }
  exposedMethod(){}
  render() {
    const {user, submitting} = this.props
    const brands = _.get(user, '$relationships.organizations', [])
    return (
      <div className="brand-eventtemplates">
        
      </div>
    )
  }
}