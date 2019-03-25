import _ from 'lodash'
import Immutable from 'immutable'
import React from 'react'
import {connect} from 'react-redux'
import {View, Text, TouchableOpacity, Modal, WebView, ScrollView} from 'react-native'
import sessionEmailTemplate from '../../../_common/redux/emailtemplates/actions'

import EmailTemplateRow from './EmailTemplateRow'
import NewEmailTemplateForm from './NewEmailTemplateForm'
import EditEmailTemplateForm from './EditEmailTemplateForm'

import {LoadingBar, Button, Dialog, Panel, Grid} from '../../_library'
import styles from '../../styles/common'

class EventMessaging extends React.Component{
  constructor(props) {
    super(props)
    this.state = {
      loadingEmailTemplates: false,
      previewTemplateContentModalOpen: false,
      templatePreviewed: null,
      editTemplateModalOpen: false,
      templateEdited: null,
      showNewTemplate: false
    }
  }

  componentDidMount() {
    this.fetchEmailTemplates()
  }

  componentWillReceiveProps(nextProps) {

  }

  fetchEmailTemplates() {
    const {event, FETCH_EMAIL_TEMPLATES} = this.props
    const loadingSetter = (val) => () => this.setState({loadingEmailTemplates: val})

    Promise.resolve(FETCH_EMAIL_TEMPLATES(event.id))
      .catch(loadingSetter(false))
      .then(loadingSetter(false))
    loadingSetter(true)()
  }


  previewTemplateContent(template) {
    this.setState({
      previewTemplateContentModalOpen: true,
      templatePreviewed: template
    })
  }

  closePreviewTemplateContentModal() {
    this.setState({
      previewTemplateContentModalOpen: false
    })
  }

  enableTemplate(template) {
    const {event, UPDATE_EMAIL_TEMPLATE} = this.props

    let form = JSON.parse(JSON.stringify(template))
    form.enabled = '1'

    return Promise.resolve(UPDATE_EMAIL_TEMPLATE(template.id, event.id, form))
      .catch((err) => {
        return Promise.reject(_.result(err, 'message', err))
      })
      .then((v)=>{
        return v
      })
  }

  disableTemplate(template) {
    const {event, UPDATE_EMAIL_TEMPLATE} = this.props

    let form = JSON.parse(JSON.stringify(template))
    form.enabled = '0'

    return Promise.resolve(UPDATE_EMAIL_TEMPLATE(template.id, event.id, form))
      .catch((err) => {
        return Promise.reject(_.result(err, 'message', err))
      })
      .then((v)=>{
        return v
      })
  }

  editTemplate(template) {
    this.setState({
      editTemplateModalOpen: true,
      templateEdited: template
    })
  }

  closeEditTemplateModal() {
    this.setState({
      editTemplateModalOpen: false
    })
  }

  updateTemplate(form) {
    if(form.content_mode=='zip') {
      delete form.body
    }
    if(form.content_mode=='body'){
      delete form.zip
    }
    delete form.content_mode

    const {event, UPDATE_EMAIL_TEMPLATE} = this.props

    return Promise.resolve(UPDATE_EMAIL_TEMPLATE(form.id, event.id, form))
      .catch((err) => {
        return Promise.reject(_.result(err, 'toFieldErrors', err))
      })
      .then((v)=>{
        this.closeEditTemplateModal()
        this.fetchEmailTemplates()
        return v
      })
  }

  showNewTemplateSection() {
    this.setState({
      showNewTemplate: true
    })
  }

  createTemplate(form) {
    if(form.content_mode=='zip') {
      delete form.body
    }
    if(form.content_mode=='body'){
      delete form.zip
    }
    delete form.content_mode

    const {event, CREATE_EMAIL_TEMPLATE} = this.props
    return Promise.resolve(CREATE_EMAIL_TEMPLATE(event.id, form))
      .catch((err) => {
        return Promise.reject(_.result(err, 'toFieldErrors', err))
      })
      .then((v)=>{
        this.fetchEmailTemplates()
        return v
      })
  }


  render(){
    const {loadingEmailTemplates, previewTemplateContentModalOpen, templatePreviewed, editTemplateModalOpen, templateEdited, showNewTemplate} = this.state
    const {event, emailTemplates} = this.props
    return(
      <Panel title='Email Templates' style={{marginBottom:30}}>
        <View style={[styles.card_block,{marginBottom:25}]}>
          { !emailTemplates &&
            <LoadingBar key='loadingbar' title={'Hold tight! We\'re getting your event\'s email templates...'} />
          }
          { emailTemplates &&
            <Grid
              columns={[{
                name:'Name',
                dataIndex:'name',
                flex:1,
                sort:true
              },{
                name:'Description',
                dataIndex:'description',
                flex:1,
                sort:true
              },{
                name:'Subject',
                dataIndex:'subject',
                flex:1,
                sort:true
              },{
                name:'',
                flex:3,
                sort:true,
                renderer: (rec, val) => {
                  return (
                    <EmailTemplateRow
                      key={rec.id}
                      template={rec}
                      previewContent={()=>this.previewTemplateContent(rec)}
                      enable={()=>this.enableTemplate(rec)}
                      disable={()=>this.disableTemplate(rec)}
                      edit = {()=>this.editTemplate(rec)}
                    />
                  )
                },
              }]}
              data={emailTemplates}
              paging={true}
            />
          }
        </View>
        { !showNewTemplate &&
          <View style={{flexDirection:'row'}}>
            <Button title='Add New Template' onPress={()=>this.showNewTemplateSection()} />
          </View>
        }
        { showNewTemplate &&
          <NewEmailTemplateForm
            onSubmit={(form)=>this.createTemplate(form)}
          />
        }
        <Dialog
          isOpen={!!previewTemplateContentModalOpen}
          onRequestClose={()=>this.closePreviewTemplateContentModal()}
          closeTimeoutMS={150}
          title='Email Template Content'
          footer={
            <View style={{flexDirection:'row'}}>
              <Button title='Dismiss' style={styles.buttonSecondary} size='small' onPress={()=>this.closePreviewTemplateContentModal()}/>
            </View>
          }
        >
          <View style={{flexDirection:'row'}}>
            { templatePreviewed && templatePreviewed.body &&
              <View style={{height:50, backgroundColor:'#00000000'}}>
                <WebView source={{html:templatePreviewed.body}} style={{backgroundColor:'#00000000'}}/>
              </View>
            }
            { templatePreviewed && templatePreviewed.preview_url &&
              <View style={{height:400, backgroundColor:'#00000000'}}>
                <WebView source={{url:templatePreviewed.preview_url}} style={{backgroundColor:'#00000000'}}/>
              </View>
            }
          </View>
        </Dialog>
        <Dialog
          isOpen={!!editTemplateModalOpen}
          onClose={()=>this.closeEditTemplateModal()}
          closeTimeoutMS={150}
          title='Edit Template'
          footer={
            <View style={{flexDirection:'row'}}>
              <Button title='Dismiss' style={styles.buttonSecondary} size='small' onPress={()=>this.closeEditTemplateModal()}/>
            </View>
          }
        >
          <ScrollView>
            {templateEdited &&
            <EditEmailTemplateForm
              initialValues={{
                id: templateEdited.id,
                name: templateEdited.name,
                description: templateEdited.description,
                subject: templateEdited.subject,
                body: templateEdited.body,
                zip: templateEdited.preview_url,
                content_mode: templateEdited.body ? 'body' : 'zip'
              }}
              onSubmit={(form)=>this.updateTemplate(form)}
              onCancel={()=>this.closeEditTemplateModal()}
            />
            }
          </ScrollView>
        </Dialog>
      </Panel>
    )
  }
}export default connect(
  (state) => {
    const event = state.events.get('selected').toJS()
    const emailTemplates = state.emailtemplates.get('emailtemplates').toJS().email_templates
    return {
      event,
      emailTemplates
    }
  },
  {
    FETCH_EMAIL_TEMPLATES:sessionEmailTemplate.FETCH_EMAIL_TEMPLATES,
    CREATE_EMAIL_TEMPLATE:sessionEmailTemplate.CREATE_EMAIL_TEMPLATE,
    UPDATE_EMAIL_TEMPLATE:sessionEmailTemplate.UPDATE_EMAIL_TEMPLATE
  }
) (EventMessaging)
