import React from 'react'
import {connect} from 'react-redux'

@connect(
  (state) => ({event: state.events.get('selected')})
)
export default class EventDashboard extends React.Component {
  static propTypes = {
    event: React.PropTypes.object.isRequired
  }
  render() {
    const {event} = this.props
    return (
        <div className="row">
          <div className="col-xs-12">
            <h2>Dashboard</h2>
            <p>Check out the sidebar if you wish to edit your event's details, venues, tickets and more</p>
            <p>This page will soon contain an overview of your event's schedule and performance. We are working very hard to create a great dashboard and you are more than welcome to contribute some suggestions on what you'd like to see here by emailing our tech team at <a href="mailto:tech@theticketfairy.com?subject=Admin Suggestions">tech@theticketfairy.com</a></p>
          </div>
        </div>
    )
  }
}
