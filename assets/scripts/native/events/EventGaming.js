import _ from 'lodash'
import React, {
  Component
} from 'react'
import {
  Text,
  TouchableOpacity,
  View,
  Image,
  Linking
} from 'react-native'
import PropTypes from 'prop-types';
import {connect} from 'react-redux'
import styles from '../styles/common'
import {LoadingBar, EmptyBar, Grid} from '../_library'
import Icon from 'react-native-vector-icons/FontAwesome'

class EventGaming extends React.Component {
  constructor(props) {
    super(props)
  }

  componentWillUnmount() {
    Linking.removeEventListener('url', this._handleOpenURL)
  }

  _handleOpenURL(url) {
    Linking.openURL(url).catch(err => console.error('An error occurred', err))
  }
  componentDidMount() {
    const {event} = this.props
    Linking.addEventListener('url', this._handleOpenURL)
  }

  render() {
    const {event} = this.props
    return(
      <View>
        <View style={styles.heading_style}>
          <Icon name="twitch" size={18} color="white" />
          <Text style={styles.heading_text}>Twitch Users</Text>
        </View>
        <Grid
          columns={[
            {
              name:'',
              renderer : (t)=>{
                return (
                  <TouchableOpacity onPress={()=>Linking.openURL(t.channel.logo)}>
                    <View style={{width:40, height:40, borderRadius: 20}}>
                      {t.channel.logo && <Image style={{width: 40, height: 40, borderRadius: 20}} source={{url: t.channel.logo}}/>}
                    </View>
                  </TouchableOpacity>
                )
              },
            },{
              name:'Channel Name',
              renderer : (t) => {
                return(
                  <TouchableOpacity onPress={()=>Linking.openURL(t.channel.logo)}>
                    <Text style={{color: 'white', fontFamily: 'Open Sans', }}>
                      {t.channel.name}
                    </Text>
                  </TouchableOpacity>
                )
              },
              sort:true
            },{
              name:'Followers',
              renderer : (t) => {
                return (
                  <TouchableOpacity onPress={()=>Linking.openURL(t.channel.logo)}>
                    <Text style={{color: 'white', fontFamily: 'Open Sans', }}>
                      {t.channel.followers.toLocaleString()}
                    </Text>
                  </TouchableOpacity>
                )
              },
              sort:true
            },{
              name:'Views',
              renderer : (t)=>{
                return(
                  <TouchableOpacity onPress={()=>Linking.openURL(t.channel.logo)}>
                    <Text style={{color: 'white', fontFamily: 'Open Sans', }}>
                      {t.channel.views.toLocaleString()}
                    </Text>
                  </TouchableOpacity>
                )
              },
              sort:true
            }
          ]}
          searchable
          store = {{url: `/api/events/${event.id}/relationships/gaming/`, node: 'data.twitch_users.*'}}
        />
      </View>
    )
  }
}export default connect(
  (state) => {
    const event = state.events.get('selected').toJS()
    return {
      event
    }
  }
)(EventGaming)
