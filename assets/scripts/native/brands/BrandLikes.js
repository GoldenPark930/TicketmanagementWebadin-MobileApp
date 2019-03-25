import _ from 'lodash'
import React, {
  Component, PropTypes
} from 'react'
import {connect} from 'react-redux'

import session_audience from '../../_common/redux/audience/actions'
import session_brand from '../../_common/redux/brands/actions'
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  TextInput,
  ListView,
  Picker,
  TouchableWithoutFeedback,
  Linking
} from 'react-native'
import GridView from 'react-native-gridview'
import DeviceInfo from 'react-native-device-info'
import {LoadingBar, EmptyBar, Grid} from '../_library'
import {commonStyle, event_audience_music} from '../../native/styles'

const STATE_STATUS_INIT = 0
const STATE_STATUS_LOADING = 1
const STATE_STATUS_LOADING_SUCCESSED = 2
const STATE_STATUS_LOADING_FAILED = 3

const SHOW_LIKES_COUNT_THRESHOLD = 50
const LIKES_ALLOWED_CATEGORY = ['Musician/Band', 'Musician', 'Record Label', 'Music Genre']

class BrandLikes extends React.Component {
  constructor(props) {
    super(props)
    this.state = {status: STATE_STATUS_INIT}
  }
  componentDidMount() {
    if (this.state.status == STATE_STATUS_LOADING) {
      return
    }
    const {brands, params: {id}, FETCH_AUDIENCE} = this.props
    const brand = brands[id]
    const loadingSetter = (val) => () =>{
      this.setState({status: val})
    }
    Promise.resolve(FETCH_AUDIENCE(id, 'brand', 'likes'))
      .catch(loadingSetter(STATE_STATUS_LOADING_FAILED))
      .then(loadingSetter(STATE_STATUS_LOADING_SUCCESSED))
    loadingSetter(STATE_STATUS_LOADING)()
  }
  render() {
    const {status} = this.state
    const {audience} = this.props
    let content
    switch (status){
      case STATE_STATUS_INIT:
        content = null
        break
      case STATE_STATUS_LOADING:
        content = <LoadingBar title={'Hold tight! We\'re getting your event\'s statistics...'} />
        break
      case STATE_STATUS_LOADING_SUCCESSED:
        // --- sales ---
        content = null
        let data = audience.audience
        let content_likes = null
        if(data == null){
          content = <EmptyBar />
        }else{
          if(data.likes){
            let newArray_likes = []
            for(var i = 0; i < data.likes.length; i++) {
              var obj = data.likes[i]
              if(parseInt(obj.count) >= SHOW_LIKES_COUNT_THRESHOLD){
                if (LIKES_ALLOWED_CATEGORY.indexOf(obj.category) == -1) {
                  newArray_likes.push({
                    id: obj.id,
                    count: parseInt(obj.count, 10),
                    name: obj.name,
                    category: obj.category
                  })
                }
              }
            }

            newArray_likes.sort(function(a,b) {return (a.count < b.count) ? 1 : ((b.count < a.count) ? -1 : 0)} )
            if(newArray_likes.length > 0){
              content =
                <Grid
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
                  data={newArray_likes}
                  paging
                  hideHeader
                />
            }
          }
       }
        break
      case STATE_STATUS_LOADING_FAILED:
        content = null
        break
      default:
        content = null
        break
    }

    return (
      <View>
        {content}
      </View>
    )
  }
}export default connect(
  (state) => {
    const brands = state.brands.get('collection').toJS()
    const audience = state.audience.get('audience').toJS()
    return {
      brands,
      audience
    }
  },
  {
    FETCH_BRAND:session_brand.FETCH_BRAND,
    FETCH_AUDIENCE:session_audience.FETCH_AUDIENCE}
)(BrandLikes)
