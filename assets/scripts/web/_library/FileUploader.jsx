import React from 'react'
import Modal from 'react-modal'
import {shortid} from '../../_common/core/rand'
import {fetchAPI} from '../../_common/core/http'
import Button from './Button'
import Image from './Image'

function hasClass(el, className) {
  if (el.classList) {
    el.classList.contains(className)
  } else {
    return new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className)
  }
}

export default class FileUploader extends React.Component {
  static propTypes = {
    label: React.PropTypes.string.isRequired,
    onUploadSuccess: React.PropTypes.func,
    onUploadFailed: React.PropTypes.func,
    filetype: React.PropTypes.oneOf(['image', 'archive']),
  }
  constructor(props) {
    super(props)
    this.state = {loadingFile: false}
    this.widgetId = `#uploader_${shortid()}`
  }
  onClear() {
    const {onChange} = this.props
    this.setState({loading: false, fileURL: '', fileName: ''})
    if (onChange) { onChange('') }
  }
  render() {
    const id = this.widgetId.slice(1)
    const {label, filetype, children, ...field} = this.props
    const {awsKey, key, policy, signature, fileURL, loadingFile, loading, fileName} = this.state
    const icon = filetype ? `fa-file-${filetype}-o` : 'fa-file-o'
    const u = field.value || fileURL
    const classes = [
      'fileuploader',
      u && !loadingFile ? 'fileuploader-set' : '',
    ].join(' ')

    let fileNode
    if (filetype === 'image') {
        fileNode = (
            <Image transition={true}
              key={u} className="fileuploader-image img-responsive" src={u}
              onLoading={() => {this.setState({loadingFile: true})}}
              onCompleted={() => {this.setState({loadingFile: false})}} />
        )
    } else {
        fileNode = (
            <div className="fileuploader-file"><i className={'fa '+icon} aria-hidden="true"></i><div>{fileName}</div></div>
        )
    }

    let labelNode
    if (loading) {
      labelNode = (
        <label className="control-label" htmlFor={id}>
          <i className="fa fa-fw fa-circle-o-notch fa-spin" /><div className="label-label">Uploading</div>
        </label>
      )
    } else if (loadingFile) {
      labelNode = (
        <label className="control-label" htmlFor={id}>
          <i className="fa fa-fw fa-circle-o-notch fa-spin" /><div className="label-label">Downloading</div>
        </label>
      )
    } else {
      labelNode = (
        <label className="control-label" htmlFor={id}>
          <img src={asset('/assets/resources/images/event-add-background.png')}/><div className="label-label">{label}</div>
        </label>
      )
    }

    return (
      <div className="form-group">        
        <div className={classes}>
          <input type="hidden" {...field} value={fileURL} />
          { u && fileNode}
          {labelNode}
        </div>
        <div className="btn-toolbar">
          {children}
            {!!u && <Button className="btn btn-danger btn-shadow clear_btn" type="button" title="Clear image" onClick={::this.onClear}><i className="fa fa-times"/> Clear</Button>}
        </div>
        <input id={id} type="file" name="file" ref="input" style={{display: 'none'}} />
      </div>
    )
  }

  componentWillUnmount() {
    $(this.widgetId).fileupload('destroy')
  }

  componentDidMount() {
    $(this.widgetId).fileupload({
      forceIframeTransport: hasClass(document.documentElement, 'lte-ie9'),
      autoUpload: true,
      add: (event, data) => {
        this.setState({fileName: data.files[0].name})
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
          data.context = {fileURL: (process.env.ADMIN_CDN_URL || '') + res.dest}
          data.submit()
          console.log(data)
        })
      },
      send: () => { this.setState({loading: true, fileURL: null}) },
      fail: (event, data) => {
        const {onChange, onUploadFailed} = this.props

        this.setState({loading: false, fileURL: null})
        if (onChange) { onChange('') }

        if (onUploadFailed) { onUploadFailed() }
      },
      done: (event, data) => {
        const {onChange, onUploadSuccess} = this.props
        const {fileURL} = data.context

        this.setState({loading: false, fileURL: fileURL})
        if (onChange) { onChange(fileURL) }

        if (onUploadSuccess) { onUploadSuccess(data.context.fileURL) }
      }
    })
  }
}
