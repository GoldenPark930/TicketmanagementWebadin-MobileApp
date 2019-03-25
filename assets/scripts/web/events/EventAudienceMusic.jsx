import _ from 'lodash'
import Immutable from 'immutable'
import React from 'react'
import {connect} from 'react-redux'

import {
	OboeAudience, 
	TYPE_EVENT,
	SECTION_MUSIC, 
} from '../_library/OboeAudience'

@connect(
  (state) => {
    const event = state.events.get('selected').toJS()
    return {
      event
    }
  }
)
export default class EventAudienceMusic extends React.Component {
  componentDidMount() {
    const {event} = this.props
    document.title = `Music - ${event.displayName} - The Ticket Fairy Dashboard`
  }

  render() {
    const {event} = this.props
    return (
      <div className="audience-music">
        <OboeAudience
          type={TYPE_EVENT}
          section={SECTION_MUSIC}
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

