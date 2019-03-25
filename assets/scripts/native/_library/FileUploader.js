import React, {
  Component
} from 'react'
import {
  TextInput,
  View,
  StatusBar,
  Text,
  TouchableOpacity,
  Modal,
  Image,
  DatePickerIOS,
  TouchableWithoutFeedback,
  StyleSheet,
  ActivityIndicator,
  Dimensions
} from 'react-native'
import PropTypes from 'prop-types';

import ImagePicker from 'react-native-image-picker'
import {Button} from '../_library'
import {fetchAPI} from '../../_common/core/http'
import config from '../../../../config.json'
var window = Dimensions.get('window')

var options = {
  title: 'Select Avatar',

  storageOptions: {
    skipBackup: true,
    path: 'images'
  }
}

class FileUploader extends Component {

  static propTypes = {
    label: PropTypes.string.isRequired,
    onUploadSuccess: PropTypes.func,
    onUploadFailed: PropTypes.func,
    filetype: PropTypes.oneOf(['image']),
  }

  onImagePicker() {
    ImagePicker.showImagePicker(options, (response) => {
      console.log('Response = ', response)

      if (response.didCancel) {
        console.log('User cancelled image picker')
      }
      else if (response.error) {
        console.log('ImagePicker Error: ', response.error)
      }
      else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton)
      }
      else {
        const {uri, fileName} = response

        // You can also display the image using data:
        // let source = { uri: 'data:image/jpeg;base64,' + response.data };

        this.setState({
          avatarSource: {uri}
        })
        this.onUpload({uri, fileName})
      }
    })
  }

  onUpload({uri, fileName}) {
    if (!uri || !fileName) return

    console.log('[onUpload]', uri, fileName)
    this.setState({loading: true})

    fetchAPI('/api/uploads', {
      method: 'POST',
      body: JSON.stringify({
        filename: fileName
      })
    }).then(res => {
      console.log('/api/uploads response', res)

      const fileURL = (config.ADMIN_CDN_URL || '') + res.dest
      console.log(`FileDestUrl=${fileURL}`)

      const file = {
        uri: uri,
        type: 'image/jpeg',
        name: fileName,
      }

      const body = new FormData()
      body.append('AWSAccessKeyId', res.aws)
      body.append('acl', 'public-read')
      body.append('success_action_status', 200)
      body.append('key', res.key)
      body.append('policy', res.policy)
      body.append('signature', res.signature)
      body.append('file', file)

      const xhr = new XMLHttpRequest()
      xhr.onreadystatechange = (e) => {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
          return
        }

        if (xhr.status === 200) {
          const {onChange, onUploadSuccess} = this.props
          Image.getSize(fileURL, (width, height) => {
            if(!this.unMounted) this.setState({height:((window.width-62)/width) * height})
          })
          this.setState({loading: false, fileURL})
          if (onChange) { onChange(fileURL) }
          if (onUploadSuccess) { onUploadSuccess(fileURL) }
        } else {
          console.warn('error', e)
        }
      }

      xhr.open('POST', res.url)
      xhr.send(body)
    })

  }

  constructor(props) {
    super(props)
    this.unMounted = true
    this.state = {loadingFile: false}
  }

  onClear() {
    const {onChange} = this.props
    this.setState({loading: false, fileURL: ''})
    if (onChange) {
      onChange('')
    }
  }

  componentDidMount() {
    this.unMounted = false
    const { ...field} = this.props
    if(field.defaultValue){
      Image.getSize(field.defaultValue, (width, height) => {
        if(!this.unMounted) this.setState({height:((window.width-62)/width) * height})
      })
    }
  }
  componentWillUnmount(){
    this.unMounted=true
  }
  render() {
    const {label, filetype, children, ...field} = this.props
    const {fileURL, loadingFile, loading} = this.state
    const icon = filetype ? `fa-file-${filetype}-o` : 'fa-file-o'
    const u = field.value || fileURL
    let fileNode
    if (filetype == 'image') {
      fileNode =
        <Image
          resizeMode = 'cover'
          style = {{height:this.state.height, width:window.width-62}}
          source = {{uri: u}}
        />
    }

    let labelNode
    if (loading) {
      labelNode = (
        <View
          style={{flex: 1, height: 183, backgroundColor: '#363D4B', alignItems: 'center', justifyContent: 'center'}}>
          <ActivityIndicator/>
          <Text style={{fontSize: 13, color: '#E9E9E9', fontFamily: 'OpenSans-Bold', marginTop: 10}}>Uploading</Text>
        </View>
      )
    } else if (loadingFile) {
      labelNode = (
        <View
          style={{flex: 1, height: 183, backgroundColor: '#363D4B', alignItems: 'center', justifyContent: 'center'}}>
          <ActivityIndicator/>
          <Text style={{fontSize: 13, color: '#E9E9E9', fontFamily: 'OpenSans-Bold', marginTop: 10}}>Downloading</Text>
        </View>
      )
    } else {
      labelNode = (
        <TouchableOpacity
          style={{flex: 1, height: 183, backgroundColor: '#363D4B', alignItems: 'center', justifyContent: 'center'}}
          onPress={() => this.onImagePicker()}>
          <Image style={{width: 60, height: 60}}
                 source={require('@nativeRes/images/event-add-background.png')}/>
          <Text style={{fontSize: 13, color: '#E9E9E9', fontFamily: 'OpenSans-Bold', marginTop: 10}}>{label}</Text>
        </TouchableOpacity>
      )
    }

    return (
      <View>
        <View
          style={{borderWidth: 2, borderColor: '#777777', borderStyle: 'dashed', padding: u ? 1 : 10}}>
          {u ? fileNode : labelNode}
        </View>
        <View style={{marginTop: 20, width: 89}}>
          {!!u &&
            <Button style={{backgroundColor: '#D45350',}} icon='times' title='Clear' onPress={() => this.onClear()}/>
          }
        </View>
      </View>
    )
  }
}

export default FileUploader
