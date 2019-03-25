import _ from 'lodash'
import React from 'react'
import {connect} from 'react-redux'
import Immutable from 'immutable'
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    Linking
} from 'react-native'
import GridView from 'react-native-gridview'
import session from '../../_common/redux/audience/actions'
import {LoadingBar, EmptyBar, Grid} from '../_library'
import {commonStyle, event_audience_music} from '../../native/styles'
import DeviceInfo from 'react-native-device-info'

const STATE_STATUS_INIT = 0
const STATE_STATUS_LOADING = 1
const STATE_STATUS_LOADING_SUCCESSED = 2
const STATE_STATUS_LOADING_FAILED = 3
const SHOW_LIKES_COUNT_THRESHOLD = 40
const LIKES_ALLOWED_CATEGORY = ['Musician/Band', 'Musician', 'Record Label', 'Music Genre']
class EventAudienceMusic extends React.Component {
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
                store={{url: `/api/audience/${event.id}/`, node: 'data.audience.likes.*', param: {type: 'event', section: 'likes'}}}
                columns={[{
                  align:'center',
                  renderer: (data) => {
                      return(
                          <TouchableOpacity onPress={() => Linking.openURL('https://www.facebook.com/' + data.id)}>
                              <View style={[commonStyle.shadow, event_audience_music.card]}>
                                  <Image style={event_audience_music.card_img} source={{uri: 'https://graph.facebook.com/' + data.id + '/picture?width=200'}}>
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
)(EventAudienceMusic)
