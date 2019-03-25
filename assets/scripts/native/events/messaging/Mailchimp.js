import _ from 'lodash'
import React from 'react'
import {View, Text, TouchableOpacity, Modal, Image} from 'react-native'
import {connect} from 'react-redux'
import sessionMailchimp from '../../../_common/redux/mailchimp/actions'
import sessionEvents from '../../../_common/redux/events/actions'
import {Grid, Button, Dialog, Panel} from '../../_library'
import Icon from 'react-native-vector-icons/FontAwesome'

const STATE_STATUS_INIT = 0
const STATE_STATUS_LOADING = 1
const STATE_STATUS_LOADING_SUCCESSED = 2
const STATE_STATUS_CONNECTING_SUCCESSED = 22
const STATE_STATUS_LOADING_FAILED = 3

class Mailchimp extends React.Component{
  constructor(props) {
    super(props)
    this.unMounted = true
    this.state = {
      status: STATE_STATUS_INIT,
      loading: false
    }
  }
  componentWillUnmount(){
    this.unMounted = true
  }
  componentDidMount() {
    this.unMounted = true
    const {event, FETCH_MC_LISTS} = this.props
    const loadingSetter = (val) => () =>{
      if(!this.unMounted) this.setState({status: val})
    }
    Promise.resolve(FETCH_MC_LISTS(event.id))
      .catch(loadingSetter(STATE_STATUS_LOADING_FAILED))
      .then(loadingSetter(STATE_STATUS_LOADING_SUCCESSED))
    loadingSetter(STATE_STATUS_LOADING)()
  }

  connectToMailchimp() {
    const {event, CONNECT_TO_MAILCHIMP, navigation} = this.props
    const loadingSetter = (val) => () =>{
      if(!this.unMounted) this.setState({status: val})
    }
    this.setState({loading: true})
    Promise.resolve(CONNECT_TO_MAILCHIMP(event.id, 'event'))
      .catch(loadingSetter(STATE_STATUS_LOADING_FAILED))
      .then((result) => {
        this.setState({loading: false})
      })
    loadingSetter(STATE_STATUS_LOADING)()
  }

  useList(id) {
    const {event, UPDATE_EVENT} = this.props
    const loadingSetter = (val) => () =>{
      if(!this.unMounted)this.setState({status: val})
    }
    Promise.resolve(UPDATE_EVENT(event.id, {
      attributes: {
        mailChimpListId: id
      }
    }))
      .catch(loadingSetter(STATE_STATUS_LOADING_FAILED))
      .then(loadingSetter(STATE_STATUS_LOADING_SUCCESSED))
    loadingSetter(STATE_STATUS_LOADING)()
  }

  render(){
    const {status} = this.state
    const {mailchimp, event, redirect_uri} = this.props
    const {flagMailChimpConnected, mailChimpListId} = event.$original.attributes

    if(status == STATE_STATUS_CONNECTING_SUCCESSED){
      this.setState({status: STATE_STATUS_INIT})
    }
    let self = this
    let content = null
    let content_connect =
      <View style={{flexDirection: 'row', alignItems: 'center',justifyContent: 'center'}}>
        <View style={{alignItems: 'center'}}>
          <Button disabled={status == STATE_STATUS_LOADING}
                  loading={this.state.loading}
                  title={status != STATE_STATUS_LOADING && 'Connect To MailChimp'}
                  size = 'small'
                  style={{backgroundColor: '#396ba9'}}
                  onPress={() => this.connectToMailchimp()}>
          </Button>
        </View>
      </View>
    if(flagMailChimpConnected) {
      let lists = []
      if (mailchimp && mailchimp.mailchimp_lists) {
        lists = mailchimp.mailchimp_lists.lists

        let ticketloading = false
        if(status != STATE_STATUS_LOADING)
          ticketloading = false
        else ticketloading = true

        content=
          <Grid
            columns={[{
              name:'List Name',
              dataIndex:'name',
            },{
              name:'ID',
              dataIndex:'id',
            },{
              name:'Action',
              renderer: (record) => {
                return(
                  <View style={{flexDirection:'row', paddingVertical:7}}>
                    {record.id != mailChimpListId &&
                      <Button
                        style={{backgroundColor:'#638a94'}}
                        icon='check'
                        loading={ticketloading}
                        onPress={() => this.useList(record.id)}
                        title='Use this'
                      />
                    }
                    {record.id == mailChimpListId &&
                      <View style={{flexDirection:'row', alignItems:'center'}}>
                        <View
                          style={{width:16, height:16, borderRadius:8,marginRight:5,
                            alignItems:'center', justifyContent:'center',
                            backgroundColor:'#25b998'}}
                        ><Icon name='check' size={12} color='#ffffff' /></View>
                        <Text style={{color:'#ffffff', fontSize:12, fontWeight:'700',marginLeft:5}}>Using this list</Text>
                      </View>
                    }
                  </View>
                )
              }
            }]}
            data={lists}
            stripe={true}
          />
        }
    }

    return(
      <Panel title='MailChimp Integration'>
        {!flagMailChimpConnected && content_connect}
        {content}
      </Panel>
    )
  }
}export default connect(
  (state) => {
    const event = state.events.get('selected').toJS()
    const mailchimp = state.mailchimp.get('mailchimp').toJS()
    const redirect_uri = state.mailchimp.get('redirect_uri').toJS()
    const navigation = state.navigation.toJS()
    return {
      event,
      mailchimp,
      redirect_uri,
      navigation
    }
  },
  {
    FETCH_MC_LISTS:sessionMailchimp.FETCH_MC_LISTS,
    CONNECT_TO_MAILCHIMP:sessionMailchimp.FETCH_MC_LISTS,
    UPDATE_EVENT:sessionEvents.UPDATE_EVENT
  }
)(Mailchimp)
