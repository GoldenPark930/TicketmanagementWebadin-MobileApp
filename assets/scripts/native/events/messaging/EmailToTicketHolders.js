import _ from 'lodash'
import React from 'react'
import Immutable from 'immutable'
import {View, Text, TouchableOpacity, Modal, ScrollView} from 'react-native'
import {connect} from 'react-redux'
import {reduxForm} from '../../router/redux-form'

import sessionTickets from '../../../_common/redux/tickets/actions'
import sessionEmailTemplates from '../../../_common/redux/emailtemplates/actions'
import DeviceInfo from 'react-native-device-info'

import styles from '../../styles/common'
import {Field, RichTextArea, Button, Dialog, Grid, Panel} from '../../_library'
import {
  MKRadioButton,
  MKCheckbox,
  setTheme
} from 'react-native-material-kit'

setTheme({
  radioStyle: {
    fillColor: '#25b99800',
    borderOnColor: '#25b998',
    borderOffColor: '#545967',
    rippleColor: '#25b99800',
  },
  checkboxStyle: {
    fillColor: '#25b998',
    borderOffColor: '#545967',
    borderOnColor: '#25b998',
    rippleColor: '#25b99800',
}})

class EmailToTicketHolders extends React.Component{
  constructor() {
    super()

    this.state = {
      toAll_selected: true,
      loadingTickets: false,
      loadingEmailTemplates: false,
      emailTemplatesModalOpen: false
    }
  }

  componentDidMount() {
    if (typeof this.props.filterMediumEditor === 'function') {
      this.props.filterMediumEditor(this.exposedMethod.bind(this))
    }
    const {fields: {
      subject
    }, event, FETCH_EVENT_TICKETS} = this.props
    if(subject.value == null){
      subject.onChange('Message to attendees of '+ event.displayName)
    }
    const loadingSetter = (val) => () => this.setState({loadingTickets: val})
    Promise.resolve(FETCH_EVENT_TICKETS(event.id))
      .catch(loadingSetter(false))
      .then(loadingSetter(false))
    loadingSetter(true)()

    this.fetchEmailTemplates()
  }

  fetchEmailTemplates() {
    const {event, FETCH_EMAIL_TEMPLATES} = this.props
    const loadingSetter = (val) => () => this.setState({loadingEmailTemplates: val})

    Promise.resolve(FETCH_EMAIL_TEMPLATES(event.id))
      .catch(loadingSetter(false))
      .then(loadingSetter(false))
    loadingSetter(true)()
  }

  async exposedMethod(){
    const {handleSubmit, fields:{body}} = this.props
    let filtered =await this.refs.body.getHTML()
    if(filtered == '<p><br></p>' || filtered == '<p class="medium-insert-active"><br></p>'){
      return ''
    }
    return filtered
  }

  onChange_recipient(e, toall){
    let toAll_isChecked = false
    if (toall == 'toAll')
      toAll_isChecked = true
    this.setState({toAll_selected: toAll_isChecked})
    const {fields: {toAll}} = this.props
    toAll.onChange(toAll_isChecked)
  }

  onChange_ticket(e, t){
    const {fields: {toSelected}} = this.props
    let strToSelected = toSelected.value
    let id = t.id
    let checked = e.checked
    // firstly, remove from the list
    var removed = strToSelected.replace(id + ',' , '')
    if (checked) {
      removed = removed + id + ','
    }
    toSelected.onChange(removed)
  }

  openEmailTemplatesModal() {
    this.setState({
      emailTemplatesModalOpen: true
    })
  }

  closeEmailTemplatesModal() {
    this.setState({
      emailTemplatesModalOpen: false
    })
  }

  selectEmailTemplate(template) {
    this.props.fields.subject.onChange(template.subject)
    if(template.body) {
      this.refs.body.setContent(template.body)
    } else if(template.preview_url) {
      $.get(template.preview_url, result => {
        this.refs.body.setContent(result)
      })
    }
    this.setState({
      emailTemplatesModalOpen: false
    })
  }

  processSubmit(form, e){}

  render(){
    const {toAll_selected, loadingTickets, emailTemplatesModalOpen, loadingEmailTemplates} = this.state
    const {fields: {
      subject, body, toAll, toSelected
    }, event, tickets, submitting, handleSubmit, submitLabel, emailTemplates} = this.props

    let selectTickets = _.map(tickets, (t, index) =>{
      return(
        <View  key={index} style={{flexDirection:'row', alignItems:'center', marginRight: 15}}>
          <MKCheckbox
            id={t.id}
            style={{width:15, height:15, borderWidth:1}}
            onCheckedChange={(e)=>this.onChange_ticket(e, t)}
          />
          <Text style={[styles.buttonTitleLabelSmall, {paddingLeft: 10, fontWeight: '600', fontSize: 13}]}>{t.displayName}</Text>
        </View>
      )
    })

    return(
      <Panel title='Contact Ticket Holders' style={{marginBottom:30}}>
        <View style={[styles.heading_style,{flexDirection:'row', marginTop:0, paddingTop: 0}]}>
          {/*<Text style={[styles.heading_text,{flex:1}]}>Contact Ticket Holders</Text>*/}
          {DeviceInfo.isTablet() &&
            <Button title='Select from Email Templates' size='small' onPress={this.openEmailTemplatesModal.bind(this)}/>
          }
        </View>
        <View style={[styles.card_block,{paddingTop:0, paddingBottom:25, marginTop:0}]}>
          {!DeviceInfo.isTablet() &&
            <View style={{flexDirection:'row', marginTop:-20}}>
              <View style={{flex:1}}/>
              <Button title='Select from Email Templates' size='small' onPress={this.openEmailTemplatesModal.bind(this)}/>
            </View>
          }
          <Field id="subject" label="Subject" {...subject}/>
          <View style={{flexDirection:DeviceInfo.isTablet() ? 'row':'column', alignItems:'flex-start'}}>
            <View style={{flexDirection:'row', alignItems:'center', marginRight:25,}}>
              <MKRadioButton
                ref = "toAll"
                checked = {toAll_selected}
                style = {{width:15, height:15, borderWidth:3.5}}
                onCheckedChange = {(e)=>this.onChange_recipient(e,'toAll')}
              />
              <Text style = {[styles.buttonTitleLabelSmall,{paddingLeft:7}]}>All ticket holders</Text>
            </View>

            <View>
              <View style={{flexDirection:'row', alignItems:'center', alignSelf:'flex-start',}}>
                <MKRadioButton
                  ref="toSelected"
                  checked={!toAll_selected}
                  style={{width:15, height:15, borderWidth:3.5}}
                  onCheckedChange = {(e)=>this.onChange_recipient(e,'toSelected')}
                />
                <Text style={[styles.buttonTitleLabelSmall,{paddingLeft: 7}]}>Choose ticket types</Text>
              </View>
              {toAll_selected ? null:
                <View style={{flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 20, flexWrap: 'wrap'}}>
                  {selectTickets}
                </View>
              }
            </View>
          </View>

          <View style={{paddingHorizontal:8, paddingVertical:15}}>
            <Text style={{color: '#B6C5CF', marginVertical:8, fontSize:12}}>Body</Text>
            <RichTextArea ref="body" id="rtebody" disableEmbeds={true} {...body} baseurl={process.env.ADMIN_CDN_URL} />
          </View>

          <View style={{alignItems:'center', paddingHorizontal:25}}>
            <Button title={submitLabel || 'Send'} icon="paper-plane" disabled={submitting} loading={submitting} onPress={handleSubmit}/>
          </View>

          <Dialog
            title="Select Email Template"
            isOpen={!!emailTemplatesModalOpen}
            onClose={()=>this.closeEmailTemplatesModal()}
            footer={
              <View style={{flexDirection:'row'}}>
                <Button title="Cancel" style={styles.buttonSecondary} size='small' onPress={()=>this.closeEmailTemplatesModal()}/>
              </View>
            }>
              <ScrollView style={{height:500}}>
                <Grid
                  headerStyle={{backgroundColor: '#232732'}}
                  style={{width:300}}
                  columns={[{
                    name: 'Name',
                    dataIndex: 'name',
                  }, {
                    name: 'Description',
                    dataIndex: 'description',
                  }, {
                    name: 'Subject',
                    dataIndex: 'subject',
                  }, {
                    name: 'Action',
                    renderer: (record)=>{
                      return(
                        <View style={{flexDirection:'row', height:35}}>
                          <Button title='Select' onPress={()=>this.selectEmailTemplate(record)} size='small'/>
                        </View>
                      )
                    }
                  }]}
                  data={emailTemplates}
                />
              </ScrollView>
          </Dialog>
        </View>
      </Panel>
    )
  }
}

EmailToTicketHolders = reduxForm({
  form: 'EmailToTicketHolders',
  fields: [
    'subject',
    'body',
    'toAll',
    'toSelected',
  ],
  validate: validateForm,
  initialValues: {
    subject: '',
    toAll: true,
    toSelected: '', // id1,id2,id3...
  }
})(EmailToTicketHolders)
EmailToTicketHolders = connect(
  (state) => {
    const event = state.events.get('selected').toJS()
    const col = state.tickets.get('collection')
    const tickets = state.tickets
      .getIn(['byEvent', event.id], Immutable.List())
      .map(tid => col.get(tid))
      .toJS()
    const emailTemplates = state.emailtemplates.get('emailtemplates').toJS().email_templates
    return {
      event,
      tickets,
      emailTemplates
    }
  },
  {FETCH_EVENT_TICKETS:sessionTickets.FETCH_EVENT_TICKETS, FETCH_EMAIL_TEMPLATES:sessionEmailTemplates.FETCH_EMAIL_TEMPLATES}
)(EmailToTicketHolders)

function validateForm(data) {
  const errors = {}
  if (!_.get(data, 'subject')){
    _.set(errors, 'subject', 'Required')
  }
  return errors
}
export default EmailToTicketHolders
