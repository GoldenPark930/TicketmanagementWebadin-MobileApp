import _ from 'lodash'
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
  DatePickerIOS,
  TouchableWithoutFeedback,
  StyleSheet,
  Image,
  ActivityIndicator
} from 'react-native'
import PropTypes from 'prop-types'
import LinearGradient from 'react-native-linear-gradient'
import Icon from 'react-native-vector-icons/FontAwesome'
var ImagePicker = require('react-native-image-picker')
import {RichTextEditor, RichTextToolbar, actions} from 'react-native-zss-rich-text-editor'

import {fetchAPI} from '../../_common/core/http'
import config from '../../../../config.json'

var options = {
  title: 'Select Avatar',

  storageOptions: {
    skipBackup: true,
    path: 'images'
  }
}

const myActions = [
  actions.setBold,
  actions.setItalic,
  actions.setStrikethrough,
  actions.heading2,
  actions.heading3,
  actions.heading4,
  actions.insertLink,
  actions.insertImage,
  actions.insertBulletsList,
  actions.alignCenter,
  actions.alignFull,
  actions.alignLeft,
  actions.alignRight,
]
var texts = {}

const script = `
<script>
	window.location.hash = 1;
    var calculator = document.createElement('div');
    calculator.id = 'height-calculator';
    while (document.body.firstChild) {
        calculator.appendChild(document.body.firstChild);
    }
	document.body.appendChild(calculator);
    document.title = calculator.scrollHeight;
    var iframes = document.querySelectorAll('iframe');
    for (var i = 0; i < iframes.length; i++) {
        iframes[i].parentNode.removeChild(iframes[i]);
    }
</script>
`
const style = `
<style>
body, html, #height-calculator {
    margin: 0;
    padding: 0;
}
p    {color: #ffffff;}
#height-calculator {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
}
</style>
`
class RichTextArea extends Component {

  state = {
    option: 0,
    description:'',
    loading:false,
    Height:150
  };

  componentDidMount() {
    const {value, defaultValue, baseurl, id} = this.props
    // const refId = '#'+id
    texts[actions.setBold] = <Icon name='bold' size={20} color='#fff' />
    texts[actions.setItalic] = <Icon name='italic' size={20} color='#fff' />
    texts[actions.setStrikethrough] = <Icon name='strikethrough' size={20} color='#fff' />
    texts[actions.heading2] = <Icon name='header' size={20} color='#fff' ><Text style={{fontSize:13}}>2</Text></Icon>
    texts[actions.heading3] = <Icon name='header' size={20} color='#fff' ><Text style={{fontSize:13}}>3</Text></Icon>
    texts[actions.heading4] = <Icon name='header' size={20} color='#fff' ><Text style={{fontSize:13}}>4</Text></Icon>
    texts[actions.insertLink] = <Icon name='link' size={20} color='#fff' />
    texts[actions.insertImage] = <Icon name='image' size={20} color='#fff' />
    texts[actions.insertBulletsList] = <Icon name='list' size={20} color='#fff' />
    texts[actions.alignCenter] = <Icon name='align-center' size={20} color='#fff' />
    texts[actions.alignFull] = <Icon name='align-justify' size={20} color='#fff' />
    texts[actions.alignLeft] = <Icon name='align-left' size={20} color='#fff' />
    texts[actions.alignRight] = <Icon name='align-right' size={20} color='#fff' />
  }

  handleChange() {
    const {onChange} = this.props
    if (onChange) { onChange(this.richtext.innerHTML) }
  }

  handleFocus() {
    const {onFocus} = this.props
    if (onFocus) { onFocus(this.richtext.innerHTML) }
  }

  handleBlur() {
    const {onBlur} = this.props
    if (onBlur) { onBlur(this.richtext.innerHTML) }
  }

  onEditorInitialized() {
    this.setFocusHandlers()
    this.getHTML()
  }

  async getHTML() {
    const {onChange} = this.props
    const contentHtml = await this.richtext.getContentHtml()
    if (onChange) { onChange(contentHtml) }
    return contentHtml
  }

  setFocusHandlers() {
    this.richtext.setContentFocusHandler(() => {
      const {onFocus} = this.props
      const contentHtml = this.richtext.getContentHtml()
      if (onFocus) { onFocus(contentHtml) }
    })
  }

  _defaultRenderAction(action, selected) {
    return (
      <LinearGradient
        start={{x: 1.0, y: 0.0}} end={{x: 0.0, y: 0.0}}
        colors={selected?['rgba(0,0,0,0.89)', '#000000','rgba(0,0,0,0.89)']
          :['rgba(36,36,36,0.89)', '#242424','rgba(36,36,36,0.89)']}>
        <TouchableOpacity
          style={{
            height: 50,
            width: 50,
            justifyContent: 'center',
            alignItems:'center',
            shadowRadius: 1,
            shadowOpacity: 0.5,
            shadowColor: 'rgba(0,0,0,0.3)',
            shadowOffset: {
              height: 2,
              width: 2
            },
            borderLeftWidth:1,
            borderLeftColor:'rgba(255,255,255,0.098392)',
            borderRightWidth:1,
            borderRightColor:'rgb(0,0,0)'
          }}
          key={action}
          onPress={() => this._onPress(action)}
        >
          {texts[action]}
        </TouchableOpacity>
      </LinearGradient>
    )
  }

  onImagePicker(){
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

          this.setState({loading: false, fileURL, flag:true})
          this.richtext.setContentFocusHandler(()=>this.richtext.insertImage({src: fileURL }))

          if (onChange) {
            onChange(fileURL)
          }
          if (onUploadSuccess) {
            onUploadSuccess(fileURL)
          }
        } else {
          this.setState({loading: false,})
          alert('Upload image error')
          console.warn('error', e)
        }
      }

      xhr.open('POST', res.url)
      xhr.send(body)
    })
  }

  _onPress(action) {
    switch (action) {
      case actions.setBold:
        this.richtext.setBold();break
      case actions.setItalic:
        this.richtext.setItalic();break
      case actions.setStrikethrough:
        this.richtext.setStrikethrough();break
      case actions.heading2:
        this.richtext.heading2();break
      case actions.heading3:
        this.richtext.heading3();break
      case actions.heading4:
        this.richtext.heading4();break
      case actions.insertLink:
        this.richtext.showLinkDialog(optionalTitle = '', optionalUrl = '');break
      case actions.insertImage:
        this.onImagePicker();break
      case actions.insertBulletsList:
        this.richtext.insertBulletsList();break
      case actions.alignCenter:
        this.richtext.alignCenter();break
      case actions.alignFull:
        this.richtext.alignFull();break
      case actions.alignLeft:
        this.richtext.alignLeft();break
      case actions.alignRight:
        this.richtext.alignRight();break
    }
  }
  onNavigationChange(event) {
    if (event.title) {
      const htmlHeight = Number(event.title) //convert to number
      if (htmlHeight > 150)
        this.setState({Height: htmlHeight})
    }
  }

  setContent(content) {
    this.richtext.setContentHTML(content)
    this.handleChange()
  }

  render() {
    const {label, defaultValue} = this.props
     return (
      <View style={{flex:1, backgroundColor:'#2a2f3c',borderWidth:1, borderColor:'#47516d', paddingTop:10}}>
        {!!label && <Text>{label}</Text>}
        <RichTextEditor
          contentPlaceholder='Enter some text and select it for formatting options...'
          hiddenTitle={true}
          ref={(r)=>this.richtext = r}
          style={{
            flex:1,
            backgroundColor: 'transparent',
            height:this.state.Height
          }}
          javaScriptEnabled ={false}
          scrollEnabled={false}
          initialContentHTML={defaultValue+style+script}
          editorInitializedCallback={() => this.onEditorInitialized()}
          onNavigationStateChange={(e)=>this.onNavigationChange(e)}
        />
        <RichTextToolbar
          style={{backgroundColor:'#24242400', borderRadius:2}}
          getEditor={() => this.richtext}
          actions={myActions}
          iconMap={texts}
          renderAction={(action, selected)=>this._defaultRenderAction(action, selected)}
        />
        {this.state.loading ? <View style={{position: 'absolute',left:0,right:0,top:0,bottom:0, alignItems:'center',justifyContent:'center'}}><ActivityIndicator/></View>:null}
      </View>
    )
  }
}export default RichTextArea
