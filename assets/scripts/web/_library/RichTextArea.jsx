import _ from 'lodash'
import React from 'react'


import {fetchAPI} from '../../_common/core/http'

// http://stackoverflow.com/a/3866442
function hasClass(el, className) {
  if (el.classList) {
    el.classList.contains(className)
  } else {
    return new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className)
  }
}
function setEndOfContenteditable(contentEditableElement)
{
  var range,selection
  if(document.createRange)//Firefox, Chrome, Opera, Safari, IE 9+
  {
    range = document.createRange() //Create a range (a range is a like the selection but invisible)
    range.selectNodeContents(contentEditableElement) //Select the entire contents of the element with the range
    range.collapse(false) //collapse the range to the end point. false means collapse to end rather than the start
    selection = window.getSelection() //get the selection object (allows you to change selection)
    selection.removeAllRanges() //remove any selections already made
    selection.addRange(range) //make the range you have just created the visible selection
  }
  else if(document.selection)//IE 8 and lower
  {
    range = document.body.createTextRange() //Create a range (a range is a like the selection but invisible)
    range.moveToElementText(contentEditableElement) //Select the entire contents of the element with the range
    range.collapse(false) //collapse the range to the end point. false means collapse to end rather than the start
    range.select() //Select the range (make it the visible selection
  }
}

export default class RichTextEditor extends React.Component {
  componentDidMount() {
    const {value, defaultValue, baseurl, id, disablePlugin, disableEmbeds, limit} = this.props
    const refId = '#'+id

    const editor = this.editor = new MediumEditor(this.refs.editor, {
      buttonLabels: 'fontawesome',
      targetBlank: true,
      autoLink: true,
      placeholder: disablePlugin ? null : {
        text: 'Enter some text and select it for formatting options...'
      },
      toolbar: {
        buttons: [
          'bold', 'italic', 'strikethrough', 'quote', 'h2', 'h3', 'h4',
          'anchor', 'image', 'unorderedlist', 'orderedlist',
          'justifyCenter', 'justifyFull', 'justifyLeft', 'justifyRight',
        ],
      },
      paste: {
        cleanPastedHTML: true
      }
    })
    editor.setContent(value || defaultValue || '', 0)
    editor.subscribe('editableInput', ::this.handleChange)
    editor.subscribe('blur', ::this.handleBlur)
    editor.subscribe('focus', ::this.handleFocus)

    const restrictInput = (event) => {
      const obj = editor.serialize()
      if (!obj || !obj[id] || !obj[id].value) {
        return
      }
      let matched = obj[id].value.match(/<p>(.*?)<\/p>/g)
      const lineNumbers = matched ? matched.length : 1
      if(lineNumbers > limit){
        event.preventDefault()
        event.stopPropagation()
      }
    }
    if(disablePlugin)
      editor.on(document.querySelector(refId), 'keypress', restrictInput)

    $(this.refs.editor).mediumInsert({
        editor: editor,
        enabled: !disablePlugin,
        addons: { // (object) Addons configuration
          images: { // (object) Image addon configuration
              useDragAndDrop:false,
              preview:false,
              label: '<span class="fa fa-camera"></span>', // (string) A label for an image addon
              captions: true, // (boolean) Enable captions
              captionPlaceholder: 'Type caption for image (optional)', // (string) Caption placeholder
              autoGrid: 3, // (integer) Min number of images that automatically form a grid
              styles: { // (object) Available image styles configuration
                  wide: { // (object) Image style configuration. Key is used as a class name added to an image, when the style is selected (.medium-insert-images-wide)
                      label: '<span class="fa fa-align-justify"></span>', // (string) A label for a style
                      added: function ($el) {}, // (function) Callback function called after the style was selected. A parameter $el is a current active paragraph (.medium-insert-active)
                      removed: function ($el) {} // (function) Callback function called after a different style was selected and this one was removed. A parameter $el is a current active paragraph (.medium-insert-active)
                  },
                  left: {
                      label: '<span class=\"fa fa-align-left\"></span>'
                  },
                  right: {
                      label: '<span class=\"fa fa-align-right\"></span>'
                  },
                  grid: {
                      label: '<span class=\"fa fa-th\"></span>'
                  }
              },
              actions: { // (object) Actions for an optional second toolbar
                  remove: { // (object) Remove action configuration
                      label: '<span class=\"fa fa-times\"></span>', // (string) Label for an action
                      clicked: function ($el) { // (function) Callback function called when an action is selected
                          var $event = $.Event('keydown')

                          $event.which = 8
                          $(document).trigger($event)
                      }
                  }
              },
              fileUploadOptions: { // (object) File upload configuration. See https://github.com/blueimp/jQuery-File-Upload/wiki/Options                  
                  forceIframeTransport: hasClass(document.documentElement, 'lte-ie9'),
                  autoUpload: false,
                  acceptFileTypes: /(.|\/)(gif|jpe?g|png)$/i,
                  singleFileUploads:true,
                  add: (event, data) => {
                    fetchAPI('/api/uploads', {
                      method: 'POST',
                      body: JSON.stringify({
                        filename: data.files[0].name
                      })
                    }).then(res => {
                      data.formData = {
                        AWSAccessKeyId: res.aws,
                        acl: 'public-read',
                        success_action_status: 200,
                        key: res.key,
                        policy: res.policy,
                        signature: res.signature,
                      }
                      data.url = res.url
                      data.context = {fileURL: (baseurl || '') + res.dest}
                      data.submit()
                    })
                  },
                  send: () => { console.log('send called') },
                  fail: (event, data) => {
                    console.log('fail called', data.errorThrown, data.textStatus,data.jqXHR)
                  }
              },
              messages: {
                  acceptFileTypesError: 'This file is not in a supported format: ',
                  maxFileSizeError: 'This file is too big: '
              },
              uploadCompleted: function ($el, data) {} // (function) Callback function called when upload is completed
          },
          embeds: !disableEmbeds
        }
    })
  }  
  componentWillUnmount() {
    if (this.editor) { this.editor.destroy() }
  }
  handleChange() {
    const {onChange} = this.props
    if (onChange) { onChange(this.refs.editor.innerHTML) }
  }
  handleFocus() {
    const {onFocus} = this.props
    if (onFocus) { onFocus(this.refs.editor.innerHTML) }
  }
  handleBlur() {
    const {onBlur} = this.props
    if (onBlur) { onBlur(this.refs.editor.innerHTML) }
  }
  setContent(content) {
    this.editor.setContent(content)
    this.handleChange()
  }
  render() {
    const {label, id} = this.props

    return (
      <div className="form-group">
        {!!label && <label className="control-label" htmlFor={id}>{label}</label>}
        <div id={id} className="rte" ref="editor" />
      </div>
    )
  }
}
