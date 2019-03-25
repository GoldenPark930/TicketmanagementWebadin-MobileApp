import _ from 'lodash'
import React from 'react'
import {reduxForm} from 'redux-form'
import Modal from 'react-modal'

import modalStyle from '../../_common/core/modalStyle'
import Button from '../_library/Button'
import Select from '../_library/Select'
import Radios from '../_library/Radios'
import TextArea from '../_library/TextArea'

import * as fb from '../../_common/core/fb'

function validate(data) {
  let errors = {}

  const pagePixels = _.get(data, 'attributes.pagePixels')
  const checkoutPixels = _.get(data, 'attributes.checkoutPixels')
  const conversionPixels = _.get(data, 'attributes.conversionPixels')

  return errors
}

@reduxForm({
  form: 'ticketoptions',
  fields: [
    'attributes.pagePixels',
    'attributes.checkoutPixels',
    'attributes.conversionPixels',
  ],
  initialValues: {
    attributes: {
    }
  },
  validate: validate
})
export default class TicketAdvancedOptionsForm extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      showImportFbPixelDialog: false
    }
    this.fbAdAccounts = []
    this.fbAdAccountsLoading = false
  }
  handleSelectBlur(field, e) {
    field.onBlur(_.parseInt(e.target.value))
  }
  handleSelectChange(field, e) {
    field.onChange(_.parseInt(e.target.value))
  }

  clickImportFbPixelDialog() {
    this.openImportFbPixelDialog()
    this.fetchFbPixelsAll()
  }

  openImportFbPixelDialog() {
    this.setState({showImportFbPixelDialog: true})
  }

  closeImportFbPixelDialog() {
    this.setState({showImportFbPixelDialog: false})
  }

  fetchFbPixelsAll() {
    let that = this

    this.fbAdAccountsLoading = true
    this.fbAdAccounts = []
    this.forceUpdate()
    fb.fetchSDK()
      .catch(onerror)
      .then(FB => {
        FB.login(function(){
          that.fetchFbAdAccounts(FB)
        }, {scope:'ads_management,ads_read,business_management'})
      })
  }

  fetchFbAdAccounts(FB) {
    let that = this
    FB.api('/me/adaccounts?fields=id,name,currency,owner,business', function(response){
      if(response.data) {
        that.fbAdAccounts = _.map(response.data, (fbAdAccount, fbAdAccountIndex) => {
          return {
            id: fbAdAccount.id,
            name: fbAdAccount.name,
            currency: fbAdAccount.currency,
            owner_id: fbAdAccount.owner,
            business: fbAdAccount.business,
            pixels: [],
            pixelsLoading: true,
            pixelCreating: false
          }
        })
        that.fbAdAccountsLoading = false
        that.fbAdAccountsLoadingError = null
        that.forceUpdate()
        _.each(that.fbAdAccounts, fbAdAccount => {
          that.fetchFbAdAccountOwner(FB, fbAdAccount)
          that.fetchFbPixels(FB, fbAdAccount)
        })
      } else if(response.error) {
        that.fbAdAccountsLoading = false
        that.fbAdAccountsLoadingError = response.error.message
        that.forceUpdate()
      }
    })
  }

  fetchFbAdAccountOwner(FB, fbAdAccount) {
    let that = this
    if(fbAdAccount.business) {
      fbAdAccount.owner = fbAdAccount.business
      that.forceUpdate()
    } else {
      FB.api('/'+fbAdAccount.owner_id, response => {
        fbAdAccount.owner = response
        that.forceUpdate()
      })
    }
  }

  fetchFbPixels(FB, fbAdAccount) {
    fbAdAccount.pixelsLoading = true
    this.forceUpdate()
    let that = this
    FB.api('/'+fbAdAccount.id+'/adspixels?fields=id,name,code', (response) => {
      if(response.data) {
        fbAdAccount.pixels = _.map(response.data, p => {
          return {
            id: p.id,
            name: p.name,
            code: p.code
          }
        })
        fbAdAccount.pixelsLoading = false
        fbAdAccount.pixelsLoadingError = null
        that.forceUpdate()
      }else if(response.error) {
        fbAdAccount.pixelsLoading = false
        fbAdAccount.pixelsLoadingError = response.error.message
        that.forceUpdate()
      }
    })
  }

  importFbPixelCode(fbPixel) {
    const extraCodePage = '<script>\nfbq(\'track\', \'ViewContent\');\n</script>'
    const extraCodeCheckout = '<script>\nfbq(\'track\',\'InitiateCheckout\');\n</script>'
    const extraCodePurchase = '<script>\nfbq(\'track\',\'Purchase\',{\nvalue:\'{VALUE}\',\ncurrency: \'{CURRENCY}\'\n});\n</script>'
    
    const {fields: {
      attributes: {
        pagePixels, checkoutPixels, conversionPixels
      }}} = this.props
    pagePixels.onChange((pagePixels.value?pagePixels.value+'\n':'') + fbPixel.code + '\n' + extraCodePage)
    checkoutPixels.onChange((checkoutPixels.value?checkoutPixels.value+'\n':'') + fbPixel.code + '\n' + extraCodeCheckout)
    conversionPixels.onChange((conversionPixels.value?conversionPixels.value+'\n':'') + fbPixel.code + '\n' + extraCodePurchase)
    this.closeImportFbPixelDialog()
  }

  createFbPixel(fbAdAccount) {
    if(fbAdAccount.pixels.length > 0) return
    let that = this
    fbAdAccount.pixelCreating = true
    this.forceUpdate()
    fb.fetchSDK()
      .catch(onerror)
      .then(FB => {
        FB.login(function(){
          FB.api('/'+fbAdAccount.id+'/adspixels', 'post', {name:'The Ticket Fairy'}, (response) => {
            if(response.error) {
              fbAdAccount.pixelCreating = false
              fbAdAccount.pixelCreatingError = response.error.message
              that.forceUpdate()
            } else {
              that.fetchFbPixels(FB, fbAdAccount)
              fbAdAccount.pixelCreating = false
              fbAdAccount.pixelCreatingError = null
              that.forceUpdate()  
            }
          })
        }, {scope:'ads_management,ads_read'})
      })
  }

  render() {
    let that = this
    const {fields: {
      attributes: {
        pagePixels, checkoutPixels, conversionPixels
      }
    }, submitting, handleSubmit, submitLabel} = this.props

    let fbAdAccounts_element = _.map(this.fbAdAccounts, (fbAdAccount, fbAdAccountIndex) => {
      let fbPixels_element = _.map(fbAdAccount.pixels, (fbPixel, fbPixelIndex) => {
        return (
          <tr key={fbPixelIndex}>
            <td>{ fbPixel.name }</td>
            <td className="text-right">
              <Button key={fbPixelIndex} className="btn btn-blue" type="button" onClick={that.importFbPixelCode.bind(that, fbPixel)}>Import</Button>
            </td>
          </tr>
        )
      })
      return (
        <table key={fbAdAccountIndex} className="table" style={{marginTop:'20px'}}>
          <thead>
            <tr>
              <th>
                { fbAdAccount.name }
                &nbsp;&#91;{ fbAdAccount.currency }&#93;
                { fbAdAccount.owner &&
                  <span>&nbsp;owned by {fbAdAccount.owner.name}</span>
                }
                { fbAdAccount.pixelsLoading && <i className="fa fa-spin fa-circle-o-notch" aria-hidden="true"></i>}
                { fbAdAccount.pixelsLoadingError && 
                  <div className="fbpixels-loading-error text-danger">Loading Pixels failed: {fbAdAccount.pixelsLoadingError}</div> 
                }
                { fbAdAccount.pixelCreatingError && 
                  <div className="fbpixel-creating-error text-danger">Creating Pixel failed: {fbAdAccount.pixelCreatingError}</div> 
                }
              </th>
              <th className="text-right">
                { fbAdAccount.pixels.length == 0 &&
                  <Button key={fbAdAccountIndex} className="btn btn-blue" disabled={fbAdAccount.pixelCreating} onClick={that.createFbPixel.bind(that, fbAdAccount)}>
                    Create New Pixel
                    { fbAdAccount.pixelCreating && <i className="fa fa-spin fa-circle-o-notch" aria-hidden="true"></i>}
                  </Button>
                }
              </th>
            </tr>
          </thead>
          <tbody>
            { fbPixels_element }
          </tbody>
        </table>
      )
    })

    return (
        <form ref="form" method="POST" onSubmit={handleSubmit} className="event-ticket-advanced-options">
          <div className="row">
            <div className="col-xs-12">
              <span className="junior_text">Conversion Tracking JavaScript Code</span>
              <button className="btn btn-primary" style={{float:'right'}} type="button" onClick={::this.clickImportFbPixelDialog}>
                <i className="fa fa-facebook-official" aria-hidden="true"></i> Import Facebook Pixel
              </button>
            </div>
            
          </div>
          <br />
          <div className="row">
            <div className="col-xs-12">
              <TextArea rows="5" id="pagePixels" label="View of Event Page" {...pagePixels} />
            </div>
          </div>
          <div className="row">
            <div className="col-xs-12">
              <TextArea rows="5" id="checkoutPixels" label="Start of Checkout" {...checkoutPixels} />
            </div>
          </div>
          <div className="row">
            <div className="col-xs-12">
              <TextArea rows="5" id="conversionPixels" label="Completion of Purchase (use {CURRENCY} and {VALUE} to auto-insert conversion data)" {...conversionPixels} />
            </div>
          </div>
          <div className="row">
            <div className="col-xs-12 text-center">
              <Button className="btn btn-success btn-lg btn-shadow" type="submit" loading={submitting}>{submitLabel || 'Save'}</Button>
            </div>
          </div>
          <Modal
            className="modal-dialog modal-trans"
            style={modalStyle}
            isOpen={!!this.state.showImportFbPixelDialog}
            contentLabel="Modal"
            onRequestClose={::this.closeImportFbPixelDialog}
            closeTimeoutMS={150}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div>
                  <div className="modal-header">
                    <p className="h4 text-compact">
                      Facebook Pixels 
                      { this.fbAdAccountsLoading && <i className="fa fa-spin fa-circle-o-notch" aria-hidden="true"></i>}
                    </p>
                  </div>
                  <div className="modal-body">
                    { this.fbAdAccountsLoadingError &&
                     <div className="text-danger">Loading Ad Accounts failed: {this.fbAdAccountsLoadingError}</div> 
                    }
                    { fbAdAccounts_element }
                  </div>
                  <div className="modal-footer">
                    <div className="btn-toolbar btn-toolbar-right">
                      <Button
                        className="btn btn-default btn-shadow" type="button"
                        onClick={::this.closeImportFbPixelDialog}>Cancel</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Modal> 
        </form>
    )
  }
}
