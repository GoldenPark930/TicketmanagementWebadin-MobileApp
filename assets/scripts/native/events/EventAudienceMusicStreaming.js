import _ from 'lodash'
import React from 'react'
import {connect} from 'react-redux'
import Immutable from 'immutable'
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    Linking,
    ListView
} from 'react-native'
import GridView from 'react-native-gridview'
import DeviceInfo from 'react-native-device-info'

import session from '../../_common/redux/audience/actions'
import {LoadingBar, EmptyBar, Grid} from '../_library'
import {commonStyle, event_audience_music} from '../../native/styles'


const STATE_STATUS_INIT = 0
const STATE_STATUS_LOADING = 1
const STATE_STATUS_LOADING_SUCCESSED = 2
const STATE_STATUS_LOADING_FAILED = 3
const SHOW_MUSICSTREAMING_COUNT_THRESHOLD = 50

class EventAudienceMusicStreaming extends React.Component {
    constructor(props) {
        super(props)
        this.unMounted = true
        this.state = {
          status: STATE_STATUS_INIT,
          content: []
        }
    }

    render() {
        const {event} = this.props
        return (
            <View>
                <Grid
                  store={{url: `/api/audience/${event.id}/`, node: 'data.audience.musicstreaming.*', param: {type: 'event', section: 'music'}}}
                  columns={[{
                      align:'center',
                      renderer: (data) => {
                          var img = data.images && data.images[0] ? data.images[0].url : ''
                          return(
                              <TouchableOpacity onPress={() => Linking.openURL('https://www.facebook.com/' + data.id)}>
                                  <View style={[commonStyle.shadow, event_audience_music.card]}>
                                      <Image style={event_audience_music.card_img} source={{uri: img}}>
                                          <View style={event_audience_music.description}>
                                              <View style={{flexDirection: 'row', width: 192, alignItems: 'center'}}>
                                                  <Text style={event_audience_music.category}>{data.category}</Text>
                                                  <Text style={event_audience_music.count}>{data.count}</Text>
                                              </View>
                                              <View style={{flexDirection: 'row', width: 192, alignItems: 'center'}}>
                                                  <Text style={event_audience_music.name}>{data.name}</Text>
                                                  <Text style={event_audience_music.fan}>Number of Fans</Text>
                                              </View>
                                          </View>
                                      </Image>
                                  </View>
                              </TouchableOpacity>
                          )
                      }
                  }]}
                  data={this.state.content}
                  paging
                  hideHeader
                />
            </View>
        )
  }

}export default connect(
    (state) => {
        const event = state.events.get('selected').toJS()
        return {
            event,
        }
    },
    {}
)(EventAudienceMusicStreaming)
