import _ from 'lodash'
import React from 'react'
import {View, Text, TouchableOpacity, Modal, WebView, ScrollView} from 'react-native'
import {connect} from 'react-redux'
import {Button,EmptyBar,Dialog, Grid, LoadingBar, Panel} from '../../_library'
import {fetchAPI} from '../../../_common/core/http'

import styles from '../../styles/common'
class SentEmails extends React.Component {
  constructor(props) {
    super(props)
    this.unMounted = true
    this.state = {
      contentModalOpen: false,
      recipientsModalOpen: false,
      mailoutDisplayed: null,
      emailData:[],
      showLoading: false
    }
  }
  componentWillUnmount(){
    this.unMounted = true
  }
  componentDidMount() {
    this.setState({ showLoading: true})
    const {event} = this.props
    fetchAPI(`/api/events/${event.id}/relationships/mailouts/`, {
      method: 'GET',
      headers: {
        'Accept' : 'application/vnd.api+json',
        'Content-Type' : 'application/vnd.api+json'
      },
      withCredentials: true
    }).then(res => {
      this.setState({emailData: res.data.$original.mailouts, showLoading: false})
    })
  }


  showContentModal(mailout) {
    console.warn(JSON.stringify(mailout.body))
    this.setState({
      contentModalOpen: true,
      mailoutDisplayed: mailout
    })
  }

  closeContentModal() {
    this.setState({
      contentModalOpen: false
    })
  }

  showRecipientsModal(mailout) {
    this.setState({
      recipientsModalOpen: true,
      mailoutDisplayed: mailout
    })
  }

  closeRecipientsModal() {
    this.setState({
      recipientsModalOpen: false
    })
  }

  validateMailoutRecipientsData(data, index){
    return data
  }

  getFilteredMailoutRecipientsRows(rows, search){
    return rows
  }

  getSortedMailoutRecipientsRows(rows_filtered, sort){
    if(sort){
      let dir = sort.asc ? 'asc' : 'desc'
      switch(sort.index){
        case 0:
          rows_filtered = _.orderBy(rows_filtered, (t)=>{return t.billing_first_name}, dir)
          break
        case 1:
          rows_filtered = _.orderBy(rows_filtered, (t)=>{return t.billing_last_name}, dir)
          break
        case 2:
          rows_filtered = _.orderBy(rows_filtered, (t)=>{return t.email}, dir)
          break
      }
    }
    return rows_filtered
  }

  getMailoutRecipientsTableData(datatable, rows_filtered, sort){
    let content_header = datatable.getHeaderRow(datatable, [
      {title: 'First Name', sort: true, flex:1},
      {title: 'Last Name', sort: true, flex:1},
      {title: 'Email', sort: true, flex:1}
    ], sort)
    return (rows_filtered.length != 0) ? (
      <View>
        <View style={{paddingHorizontal:10}}>
          {content_header}
        </View>
        <View>
        {
          rows_filtered.map((row) => (
            <View key={row.id} style={{flexDirection:'row'}}>
              <Text style={{color:'#ffffff', flex:1}}>{row.billing_first_name}</Text>
              <Text style={{color:'#ffffff', flex:1}}>{row.billing_last_name}</Text>
              <Text style={{color:'#ffffff', flex:1}}>{row.email}</Text>
            </View>
          ))
        }
        </View>
      </View>
    ): (
      <EmptyBar/>
    )
  }

  render(){
    const {contentModalOpen, recipientsModalOpen, mailoutDisplayed, emailData, showLoading} = this.state
    const {event} = this.props

    return(
      <Panel title='Sent Emails' style={{marginBottom:30}}>
        {!showLoading ?
          <Grid
            columns={[{
              name:'subject',
              dataIndex:'subject',
              sort:true,
              flex:3
            },{
              name:'Sent By',
              dataIndex:'sent_by_first_name',
              sort:true,
              flex:1
            },{
              name:'No of Recipients',
              dataIndex:'recipients',
              flex:1,
              renderer: (rec, val) => {
                return (
                  <Text style={{color:'#ffffff'}}>{JSON.parse(rec.recipients).length.toString()}</Text>
                )
              }
            },{
              name:'    ',
              flex:3,
              renderer: (rec, val) => {
                return (
                  <View style={{flexDirection:'row',marginVertical:8}}>
                    <Button title='Show Content' onPress={()=>this.showContentModal(rec)} size='small' style={{ backgroundColor:'#396ba9'}}/>
                    <Button title='Show Recipients' onPress={()=>this.showRecipientsModal(rec)} style={{marginLeft:5,backgroundColor:'#396ba9'}} size='small'/>
                  </View>
                )
              }
            }]}
            data={emailData}
            paging={true}
          />:<LoadingBar/>
        }
        <Dialog
          isOpen={!!contentModalOpen}
          onClose={()=>this.closeContentModal()}
          closeTimeoutMS={150}
          title='Content of Sent Email'
          footer={
            <View style={{flexDirection:'row'}}>
              <Button title='Dismiss' style={styles.buttonSecondary} size='small' onPress={()=>this.closeContentModal()}/>
            </View>
          }
        >
          {mailoutDisplayed && mailoutDisplayed.body &&
            <View style={{height: 50, backgroundColor: '#00000000'}}>
              <WebView source={{html: mailoutDisplayed.body}} style={{backgroundColor: '#00000000'}}/>
            </View>
          }
        </Dialog>
        <Dialog
          isOpen={!!recipientsModalOpen}
          onClose={()=>this.closeRecipientsModal()}
          title='Recipients of Sent Email'
          footer={
            <View style={{flexDirection:'row'}}>
              <Button title='Dismiss' style={styles.buttonSecondary} size='small' onPress={()=>this.closeRecipientsModal()}/>
            </View>
          }
        >
          <ScrollView style={{height:500}}>
            {mailoutDisplayed &&
              <Grid
                style={{marginBottom:20}}
                columns={[{
                    name: 'First Name',
                    dataIndex: 'billing_first_name',
                    sort: true,
                  },{
                    name: 'Last Name',
                    dataIndex: 'billing_last_name',
                    sort: true
                  },{
                    name: 'Original Purchase Price (excl. fees)',
                    dataIndex: 'email',
                    sort: true
                  }
                ]}
                data={JSON.parse(mailoutDisplayed.recipients)}
                stripe={true}
                searchable={true}
                paging={true}
              />
            }
          </ScrollView>
        </Dialog>
      </Panel>
    )
  }
}export default connect(
  (state) => {
    return {
    }
  }
)(SentEmails)
