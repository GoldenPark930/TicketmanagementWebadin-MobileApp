import _ from 'lodash'
import Immutable from 'immutable'
import React from 'react'
import {reduxForm} from '../../router/redux-form'
import {View, Text, TouchableOpacity, Modal} from 'react-native'
import {Field, Button, RichTextArea, EmptyBar, FileUploader} from '../../_library'
import {TabView, Tab} from '../../_library/TabView'
import {JSONDatatable, SEARCHBAR, DATATABLE, PAGINATIONBAR, TYPE_FROM_URL, TYPE_FROM_ARRAY} from '../../_library/JSONDatatable'
import styles from '../../styles/common'

class EditEmailTemplateForm  extends React.Component{
  constructor(props) {
    super(props)
  }

  onContentModeSelect(index) {
    const {fields: {
      content_mode
    }} = this.props
    content_mode.onChange(index==1?'body':'zip')
  }

  componentDidMount() {
    this.refs.tabview.selectIndex(this.props.fields.content_mode.initialValue=='body'?1:2)
  }

  processSubmit() {
    this.props.handleSubmit()
  }

  processCancel() {
    this.props.onCancel()
  }
  render() {
    const {
      fields: {
        name, description, subject, body, zip
      }, submitting,  submitFailed
    } = this.props

    return(
      <View style={styles.card_block}>
        <Field id='emailtemplate-name' label='Name' {...name} />
        <Field id='emailtemplate-description' label='Description' {...description} />
        <Field id='emailtemplate-subject' label='Subject' {...subject} />
        <TabView
          ref='tabview'
          all={false}
          onSelectTab={(index)=>this.onContentModeSelect(index)}>
          <Tab title='Enter Content'>
            { submitFailed && body.error &&
              <Text style={{color:'#ffffff' , fontSize:12, fontWeight:'700'}}>This field is required</Text>
            }
            <RichTextArea ref='body' id='emailtemplate_body' {...body} baseurl={process.env.ADMIN_CDN_URL} />
          </Tab>
          <Tab title='Upload Zipped Content'>
            { submitFailed && zip.error &&
              <Text style={{color:'red' , fontSize:12, fontWeight:'700'}}>Please select zip file</Text>
            }
            <Text style={{color:'#ffffff' , fontSize:12, fontWeight:'700'}}>Your zip file should contain an index.html file with an optional images folder</Text>
            <Text>{zip.value}</Text>
            <FileUploader label='Add Zip File' filetype='archive' {...zip} />
          </Tab>
        </TabView>
        <View style={{flexDirection:'row', paddingVertical:8, justifyContent:'center'}}>
          <Button
            title='Save'
            icon='paper-plane'
            disabled={submitting}
            loading={submitting}
            onPress={()=>this.processSubmit()}
          />
          <Button
            title='Cancel'
            onPress={()=>this.processCancel()}
          />
        </View>
      </View>
    )
  }
}export default reduxForm({
  form: 'EditEmailTemplateForm',
  fields: [
    'id',
    'name',
    'description',
    'subject',
    'body',
    'zip',
    'content_mode'
  ],
  validate: (data) => {
    const errors = {}
    if (!_.get(data, 'name')){
      _.set(errors, 'name', 'Required')
    }
    if (!_.get(data, 'subject')){
      _.set(errors, 'subject', 'Required')
    }
    if (_.get(data, 'content_mode')=='body') {
      if (!_.get(data, 'body')){
        _.set(errors, 'body', 'Required')
      }
    }
    if (_.get(data, 'content_mode')=='zip') {
      if (!_.get(data, 'zip')){
        _.set(errors, 'zip', 'Required')
      }
    }
    return errors
  },
  initialValues: {
    id: '',
    name: '',
    description: '',
    subject: '',
    body: '',
    zip: null,
    content_mode: 'body'
  }
})(EditEmailTemplateForm)
