import _ from 'lodash'
import Immutable from 'immutable'
import React from 'react'
import {
  Text,
  View,
  Image
} from 'react-native'
import {connect} from 'react-redux'
import session_audience from '../../_common/redux/audience/actions'
import session_brand from '../../_common/redux/brands/actions'

import {Panel, EmptyBar, LoadingBar, Grid} from '../_library'


const STATE_STATUS_INIT = 0
const STATE_STATUS_LOADING = 1
const STATE_STATUS_LOADING_SUCCESSED = 2
const STATE_STATUS_LOADING_FAILED = 3

const SHOW_MUSICSTREAMING_COUNT_THRESHOLD = 50

class BrandAudienceMusicStreaming extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      status: STATE_STATUS_INIT
    }
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
    Promise.resolve(FETCH_AUDIENCE(id, 'brand', 'music'))
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
        content = <LoadingBar title={'Hold tight! We\'re getting your brand\'s statistics...'} />
        break
      case STATE_STATUS_LOADING_SUCCESSED:
        // --- sales ---
        content = null
        let data = audience.audience
        let content_musicstreaming = null
        if(data == null){
          content = <EmptyBar />
        }else{
          if(data.musicstreaming){
            let newArray_musicstreaming = []
            for(var i = 0; i < data.musicstreaming.length; i++) {
              var obj = data.musicstreaming[i]
              if(parseInt(obj.count) >= SHOW_MUSICSTREAMING_COUNT_THRESHOLD){
                newArray_musicstreaming.push({
                  id: obj.id,
                  count: parseInt(obj.count, 10),
                  name: obj.name,
                  application: obj.application
                })
              }
            }
            newArray_musicstreaming.sort(function(a,b) {return (a.count < b.count) ? 1 : ((b.count < a.count) ? -1 : 0)} )
            //console.log('load from json = ', newArray_musicstreaming.length)
            console.log(data)
            content_musicstreaming =
              <Panel title='Music Streaming' icon={'headphones'} >
                <Grid
                  columns={[
                    {
                      name:'Name',
                      dataIndex:'name',
                      sort:true
                    },{
                      name:'Number of Listeners',
                      dataIndex:'count',
                      sort:true
                    },{
                      name:'Application',
                      dataIndex:'application',
                      sort:true
                    }
                  ]}
                  data={newArray_musicstreaming}
                />
              </Panel>

          }

          content =
            <View>
              {content_musicstreaming}
            </View>
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
    FETCH_AUDIENCE:session_audience.FETCH_AUDIENCE
  }
)(BrandAudienceMusicStreaming)


