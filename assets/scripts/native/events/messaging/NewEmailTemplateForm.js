import _ from 'lodash'
import React from 'react'
import {connect} from 'react-redux'
import {reduxForm} from '../../router/redux-form'
import {View, Text, TouchableOpacity, Modal} from 'react-native'

import {Field, RichTextArea, FileUploader, Button} from '../../_library'
import {TabView, Tab} from '../../_library/TabView'
import styles from '../../styles/common'


class NewEmailTemplateForm  extends React.Component{
  constructor(props) {
    super(props)
  }

  onContentModeSelect(index) {
    const {fields: {
      content_mode
    }} = this.props
    content_mode.onChange(index==1?'body':'zip')
  }

  processSubmit(){
    const {handleSubmit} = this.props
    handleSubmit()
  }

  render() {
    const {
      fields: {
        name, description, subject, body, zip
      }, submitting, submitFailed
    } = this.props

    return (
      <View style={styles.card_block}>
        <Field id='emailtemplate-name' label='Name' {...name} />
        <Field id='emailtemplate-description' label='Description' {...description} />
        <Field id='emailtemplate-subject' label='Subject' {...subject} />
        <TabView all={false} onSelectTab={this.onContentModeSelect.bind(this)}>
          <Tab title='Enter Content' style={{}}>
            { submitFailed && body.error &&
              <Text>This field is required</Text>
            }
            <RichTextArea ref='body' id='emailtemplate_body' {...body} baseurl={process.env.ADMIN_CDN_URL} />
          </Tab>
          <Tab title='Upload Zipped Content'>
            { submitFailed && zip.error &&
              <Text style={{color:'red', fontSize:12, fontWeight:'700', paddingVertical:5}}>Please select zip file</Text>
            }
            <Text style={{color:'#ffffff', fontSize:12, fontWeight:'700', paddingVertical:8}}>Your zip file should contain an index.html file with an optional images folder</Text>
            <FileUploader label='Add Zip File' filetype='archive' {...zip} />
          </Tab>
        </TabView>
        <View style={{flexDirection:'row', paddingTop:10, justifyContent:'center'}}>
          <Button title='Create' icon='paper-plane' disabled={submitting} loading={submitting} onPress={()=>this.processSubmit()} />
        </View>

      </View>
    )
  }
}export default reduxForm({
  form: 'NewEmailTemplateForm',
  fields: [
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
    name: '',
    description: '',
    subject: '',
    body: '',
    zip: null,
    content_mode: 'body'
  }
})(NewEmailTemplateForm)
