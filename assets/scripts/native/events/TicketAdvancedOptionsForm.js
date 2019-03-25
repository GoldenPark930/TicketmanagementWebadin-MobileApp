import _ from 'lodash'
import {reduxForm} from '../router/redux-form'
import React from 'react'
import {View, Text, TouchableWithoutFeedback} from 'react-native'
import {commonStyle} from '../../native/styles'
import {Button, TextArea, Dialog} from '../_library'
// import * as fb from '../../fb'

function validate(data) {
    const errors = {}

    const pagePixels = _.get(data, 'attributes.pagePixels')
    const checkoutPixels = _.get(data, 'attributes.checkoutPixels')
    const conversionPixels = _.get(data, 'attributes.conversionPixels')

    return errors
}

function fbOnError(err) {
}

class TicketAdvancedOptionsForm extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            showImportFbPixelDialog: false
        }
        this.fbAdAccounts = []
        this.fbAdAccountsLoading = false
    }


    onPressImportFbPixel = () => {
        this.openImportFbPixelDialog()
        this.fetchFbPixelsAll()
    }

    openImportFbPixelDialog = () => {
        this.setState({showImportFbPixelDialog: true})
    }

    closeImportFbPixelDialog = () => {
        this.setState({showImportFbPixelDialog: false})
    }

    fetchFbPixelsAll() {
        let that = this

        this.fbAdAccountsLoading = true
        this.fbAdAccounts = []
        this.forceUpdate()
        fb.fetchSDK()
            .catch(fbOnError)
            .then(FB => {
                FB.login(function () {
                    that.fetchFbAdAccounts(FB)
                }, {scope: 'ads_management,ads_read,business_management'})
            })
    }

    fetchFbAdAccounts(FB) {
        let that = this
        FB.api('/me/adaccounts?fields=id,name,currency,owner,business', function (response) {
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
            console.log(that.fbAdAccounts)
            that.fbAdAccountsLoading = false
            that.forceUpdate()
            _.each(that.fbAdAccounts, fbAdAccount => {
                that.fetchFbAdAccountOwner(FB, fbAdAccount)
                that.fetchFbPixels(FB, fbAdAccount)
            })
        })
    }

    fetchFbAdAccountOwner(FB, fbAdAccount) {
        let that = this
        if (fbAdAccount.business) {
            fbAdAccount.owner = fbAdAccount.business
            that.forceUpdate()
        } else {
            FB.api('/' + fbAdAccount.owner_id, response => {
                fbAdAccount.owner = response
                that.forceUpdate()
            })
        }
    }

    fetchFbPixels(FB, fbAdAccount) {
        fbAdAccount.pixelsLoading = true
        this.forceUpdate()
        let that = this
        FB.api('/' + fbAdAccount.id + '/adspixels?fields=id,name,code', function (response) {
            fbAdAccount.pixels = _.map(response.data, p => {
                return {
                    id: p.id,
                    name: p.name,
                    code: p.code
                }
            })
            fbAdAccount.pixelsLoading = false
            that.forceUpdate()
        })
    }

    importFbPixelCode = (fbPixel) => {
        const extraCodePage = '<script>\nfbq(\'track\', \'ViewContent\');\n</script>'
        const extraCodeCheckout = '<script>\nfbq(\'track\',\'InitiateCheckout\');\n</script>'
        const extraCodePurchase = '<script>\nfbq(\'track\',\'Purchase\',{\nvalue:\'{VALUE}\',\ncurrency: \'{CURRENCY}\'\n});\n</script>'

        const {
            fields: {
                attributes: {
                    pagePixels, checkoutPixels, conversionPixels
                }
            }
        } = this.props
        pagePixels.onChange((pagePixels.value ? pagePixels.value + '\n' : '') + fbPixel.code + '\n' + extraCodePage)
        checkoutPixels.onChange((checkoutPixels.value ? checkoutPixels.value + '\n' : '') + fbPixel.code + '\n' + extraCodeCheckout)
        conversionPixels.onChange((conversionPixels.value ? conversionPixels.value + '\n' : '') + fbPixel.code + '\n' + extraCodePurchase)
        this.closeImportFbPixelDialog()
    }

    createFbPixel(fbAdAccount) {
        if (fbAdAccount.pixels.length > 0) return
        let that = this
        fbAdAccount.pixelCreating = true
        this.forceUpdate()
        fb.fetchSDK()
            .catch(fbOnError)
            .then(FB => {
                FB.login(function () {
                    FB.api('/' + fbAdAccount.id + '/adspixels', 'post', {name: 'The Ticket Fairy'}, function (response) {
                        that.fetchFbPixels(FB, fbAdAccount)
                        fbAdAccount.pixelCreating = false
                        that.forceUpdate()
                    })
                }, {scope: 'ads_management,ads_read'})
            })
    }

    render() {
        const {
            fields: {
                attributes: {
                    pagePixels, checkoutPixels, conversionPixels
                }
            }, submitting, handleSubmit, submitLabel
        } = this.props

        let fbAdAccounts_element = this.fbAdAccounts.map((fbAdAccount, fbAdAccountIndex) => {
            let fbPixels_element = fbAdAccount.pixels.map((fbPixel, fbPixelIndex) => {
                return (
                    <tr key={fbPixelIndex}>
                        <td>{ fbPixel.name }</td>
                        <td className='text-right'>
                            <Button key={fbPixelIndex} className='btn btn-blue' type='button' onClick={that.importFbPixelCode.bind(that, fbPixel)}>Import</Button>
                        </td>
                    </tr>
                )
            })
            return (
                <table key={fbAdAccountIndex} className='table' style={{marginTop:'20px'}}>
                    <thead>
                    <tr>
                        <th>
                            { fbAdAccount.name }
                            &nbsp;&#91;{ fbAdAccount.currency }&#93;
                            { fbAdAccount.owner &&
                            <span>&nbsp;owned by {fbAdAccount.owner.name}</span>
                            }
                            { fbAdAccount.pixelsLoading && <i className='fa fa-spin fa-spinner' aria-hidden='true'></i>}
                        </th>
                        <th className='text-right'>
                            { fbAdAccount.pixels.length == 0 &&
                            <Button key={fbAdAccountIndex} className='btn btn-blue' onClick={that.createFbPixel.bind(that, fbAdAccount)}>
                                Create New Pixel
                                { fbAdAccount.pixelCreating && <i className='fa fa-spin fa-spinner' aria-hidden='true'></i>}
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
            <View>
                <View style={commonStyle.rowContainer_ticket}>
                    <Text style={commonStyle.fieldHeaderLabel}>Conversion Tracking
                      JavaScript Code</Text>
                    <View style={{flexDirection:'row'}}>
                        <View style={{flex:1}} />
                        <Button style={commonStyle.buttonPrimary} title='Import Facebook Pixel'
                                  onPress={this.onPressImportFbPixel} size='small'/>
                    </View>
                </View>
                <View>
                    <TextArea label='View of Event Page' {...pagePixels}/>
                </View>
                <View>
                    <TextArea label='Start of Checkout' {...checkoutPixels}/>
                </View>
                <View>
                    <TextArea label='Completion of Purchase' {...conversionPixels}/>
                </View>
                <View style={[commonStyle.rowContainer, {justifyContent: 'center'}]}>
                    <Button title='Save' loading={submitting} onPress={handleSubmit}/>
                </View>

                <Dialog title='Facebook Pixels' isOpen={this.state.showImportFbPixelDialog} onClose={this.closeImportFbPixelDialog} footer={<Button title='Cancel' style={commonStyle.buttonSecondary} size='small' onPress={this.closeImportFbPixelDialog}/>}>
                    {fbAdAccounts_element}
                </Dialog>
            </View>
        )
    }
}

export default reduxForm({
    form: 'ticketAdvancedOptionsForm',
    fields: [
        'attributes.pagePixels',
        'attributes.checkoutPixels',
        'attributes.conversionPixels'
    ],
    initialValues: {
        attributes: {}
    },
    validate: validate
})(TicketAdvancedOptionsForm)
