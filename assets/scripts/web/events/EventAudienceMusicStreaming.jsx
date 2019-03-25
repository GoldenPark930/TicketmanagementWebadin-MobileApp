import _ from 'lodash'
import Immutable from 'immutable'
import React from 'react'
import {connect} from 'react-redux'

import {
	OboeAudience, 
	TYPE_EVENT,
	SECTION_MUSICSTREAMING, 
} from '../_library/OboeAudience'

@connect(
  (state) => {
    const event = state.events.get('selected').toJS()
    return {
      event
    }
  }
)
export default class EventAudienceMusicStreaming extends React.Component {
  componentDidMount() {
    const {event} = this.props
    document.title = `Music Streaming - ${event.displayName} - The Ticket Fairy Dashboard`
  }
  render() {
    const {event} = this.props
    return (
      <div className="audience-musicstreaming">
        <OboeAudience
          type={TYPE_EVENT}
          section={SECTION_MUSICSTREAMING}
          limitShowing={true}
          data={{
            url: `/api/audience/${event.id}/`, 
            node: 'data.audience.musicstreaming.*', 
            param: {type: 'event', section: 'music'}
          }} 
        />
      </div>
    )
  }
}

