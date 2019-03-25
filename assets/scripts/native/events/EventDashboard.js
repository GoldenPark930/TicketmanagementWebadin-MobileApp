import React from 'react'
import {connect} from 'react-redux'
import {View, Text} from 'react-native'
import PropTypes from 'prop-types';
class EventDashboard extends React.Component {
    static propTypes = {
        event: PropTypes.object.isRequired
    }
    render() {
        const {event} = this.props
        return (
            <View>
                <View>
                    <Text>Dashboard</Text>
                    <Text>Check out the sidebar if you wish to edit your event's details, venues, tickets and more</Text>
                    <Text>This page will soon contain an overview of your event's schedule and performance. We are working very hard to create a great dashboard and you are more than welcome to contribute some suggestions on what you'd like to see here by emailing our tech team at <a href='mailto:tech@theticketfairy.com?subject=Admin Suggestions'>tech@theticketfairy.com</a></Text>
                </View>
            </View>
        )
    }
}
export default connect(
    (state) => ({event: state.events.get('selected')})
)
