import _ from 'lodash'
import React from 'react'
import {connect} from 'react-redux'
import {View, Text, TouchableOpacity, Modal} from 'react-native'

import {Grid, LoadingBar} from '../../_library'
import {fetchAPI} from '../../../_common/core/http'

class GuestTicketsIssued extends React.Component {
  constructor(props) {
    super(props)
    this.unMounted = true
    this.state = {
      Data:[],
      showLoading:false
    }
  }
  componentWillUnmount(){
    this.unMounted = true
  }
  componentDidMount() {
    this.unMounted = false
    this.setState({showLoading:true})
    const {event} = this.props
    fetchAPI(`/api/events/${event.id}/relationships/guest_tickets/`, {
      method: 'GET',
      headers: {
        'Accept' : 'application/vnd.api+json',
        'Content-Type' : 'application/vnd.api+json'
      },
      withCredentials: true
    }).then(res => {
      if(!this.unMounted) this.setState({Data:res.data.$original.guest_tickets, showLoading:false})
    })
  }

  render() {
    const {event} = this.props
    const {Data,showLoading} = this.state
    return (
      <View>
        {!showLoading ?
          <Grid
            columns={[{
              name: 'Name',
              renderer: (row, val) => {
                return (
                  <Text style={{color: '#ffffff'}}>{row.first_name + ' ' + row.last_name}</Text>
                )
              },
            }, {
              name: 'Email',
              dataIndex: 'email'
            }, {
              name: 'Issued On',
              dataIndex: 'order_datetime'
            }, {
              name: 'Issued By',
              renderer: (row, val) => {
                return (
                  <Text style={{color: '#ffffff'}}>{row.issued_by_first_name + ' ' + row.issued_by_last_name}</Text>
                )
              },
            }]}
            data={Data}
            paging={true}
          /> : <LoadingBar />
        }
      </View>
    )
  }
}export default connect(
  (state) => {
    return {
    }
  }
)(GuestTicketsIssued)
