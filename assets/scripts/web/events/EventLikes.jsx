import _ from 'lodash'
import Immutable from 'immutable'
import React from 'react'
import {connect} from 'react-redux'

import {
	OboeAudience, 
	TYPE_EVENT,
	SECTION_LIKES, 
} from '../_library/OboeAudience'

@connect(
  (state) => {
    const event = state.events.get('selected').toJS()
    return {
      event
    }
  }
)
export default class EventLikes extends React.Component {
  componentDidMount() {
    const {event} = this.props
    document.title = `Likes - ${event.displayName} - The Ticket Fairy Dashboard`
  }
  
  render() {
    const {event} = this.props
    return (
      <div className="audience-likes">
        <OboeAudience
          type={TYPE_EVENT}
          section={SECTION_LIKES}
          limitShowing={true}
          data={{
            url: `/api/audience/${event.id}/`, 
            node: 'data.audience.likes.*', 
            param: {type: 'event', section: 'likes'}
          }} 
        />
      </div>
    )
  }
}

