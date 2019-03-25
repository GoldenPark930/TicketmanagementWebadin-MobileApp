import _ from 'lodash'
import Immutable from 'immutable'
import React from 'react'
import {connect} from 'react-redux'
import {reduxForm} from '../../router/redux-form'
import {View, Text, TouchableOpacity, Modal} from 'react-native'
import Button from '../../_library/Button'
class EmailTemplateRow extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      template: props.template,
      enabling: false,
      disabling: false
    }
  }

  componentWillReceiveProps(nextProps) {
    if(JSON.stringify(this.props.template)!=JSON.stringify(nextProps.template)){
      this.setState({
        template: nextProps.template,
        enabling: false,
        disabling: false
      })
    }
  }

  previewContent() {
    this.props.previewContent()
  }

  enable() {
    this.makeEnabling()
    this.props.enable()
      .then((v) => {
        this.clearEnabling()
        let {template} = this.state
        template.enabled = '1'
        this.setState({
          template: template
        })
      })
      .catch((err) => {
        this.clearEnabling()
      })
  }

  makeEnabling() {
    this.setState({
      enabling: true
    })
  }

  clearEnabling() {
    this.setState({
      enabling: false
    })
  }

  disable() {
    this.makeDisabling()
    this.props.disable()
      .then((v) => {
        this.clearDisabling()
        let {template} = this.state
        template.enabled = '0'
        this.setState({
          template: template
        })
      })
      .catch((err) => {
        this.clearDisabling()
      })
  }

  makeDisabling() {
    this.setState({
      disabling: true
    })
  }

  clearDisabling() {
    this.setState({
      disabling: false
    })
  }

  edit() {
    this.props.edit()
  }

  render() {
    const {template, enabling, disabling} = this.state

    return(
        <View key={template.id} style={{flexDirection:'row'}}>
          <Button title='Preview' onPress={()=>this.previewContent()} size='small' style={{flex:1, backgroundColor:'#396ba9'}}/>
          {template.enabled == '1' &&
            <Button title='Disable' onPress={()=>this.disable()} size='small' disabled={disabling} style={{flex:1, backgroundColor: '#D45350'}}/>
          }
          {template.enabled == '0' &&
            <Button title='Enable' onPress={()=>this.enable()} size='small' disabled={enabling} style={{flex:1}}/>
          }
          <Button title='Edit' onPress={()=>this.edit()} size='small' style={{flex:1, backgroundColor:'#396ba9'}}/>
        </View>
    )
  }
}

EmailTemplateRow = reduxForm({
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
})(EmailTemplateRow)
EmailTemplateRow = connect(
  (state) => {
    return {
    }
  },
  {}
)(EmailTemplateRow)
export default EmailTemplateRow
