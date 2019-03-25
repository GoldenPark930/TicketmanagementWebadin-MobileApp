import _ from 'lodash'
import React from 'react'
import {reduxForm} from '../router/redux-form'
import {Text, View, TouchableOpacity, Image, TextInput} from 'react-native'

import {commonStyle, eventTicketStyle, newbrand} from '../../native/styles'
import {Radios, Panel, Select, Button, FieldSpacer, DateTimePickera, Switch, Dialog, RichTextArea, Field} from '../_library'
import FEE_MODES from './feemodes'
import DeviceInfo from 'react-native-device-info'
import Icon from 'react-native-vector-icons/FontAwesome';

const options = _.map(new Array(20), (e, i) => {
    return {value: i + 1, label: i + 1}
})
const options_referrel = _.map(new Array(20), (e, i) => {
    return {value: i + 1, label: i + 1}
})
const options_referrel_percent = _.map(new Array(20), (e, i) => {
    return {value: (i + 1) * 5, label: (i + 1) * 5}
})

const range30 = _.map(new Array(31), (e, i) => {
    if (i == 0) return {value: '', label: 'Select minimum age'}
    return {value: 30-i, label: 30-i}
})


function validate(data) {
    const errors = {}

    const min = _.get(data, 'attributes.minOrder')
    const max = _.get(data, 'attributes.maxOrder')

    if (max && max < min) {
        _.set(errors, 'attributes.maxOrder', 'Value must be greater than ' + min)
    }

    const tier1sales = _.get(data, 'attributes.referralTier1Sales')
    const tier2sales = _.get(data, 'attributes.referralTier2Sales')
    const tier3sales = _.get(data, 'attributes.referralTier3Sales')

    if (tier2sales && tier2sales <= tier1sales) {
        _.set(errors, 'attributes.referralTier2Sales', 'Tier 2 target must be greater than Tier 1')
    }

    if (tier3sales && tier3sales <= tier2sales) {
        _.set(errors, 'attributes.referralTier3Sales', 'Tier 3 target must be greater than Tier 2')
    }

    if (tier3sales && tier3sales <= tier1sales) {
        _.set(errors, 'attributes.referralTier3Sales', 'Tier 3 target must be greater than Tier 1')
    }

    const tier1percentage = _.get(data, 'attributes.referralTier1Percentage')
    const tier2percentage = _.get(data, 'attributes.referralTier2Percentage')

    if (tier2percentage && tier2percentage <= tier1percentage) {
        _.set(errors, 'attributes.referralTier2Percentage', 'Tier 2 percentage must be greater than Tier 1')
    }

    return errors
}

class TicketOptionsForm extends React.Component {
    constructor(props) {
        super(props)
        this.state = {importantSetting: false, importantSettingID: null, submitPressed: false}
    }
    onImportantSetting(e){
        if (!e.checked){
            this.setState({importantSetting: false, importantSettingID: e.name.toString()})
            this.processImportantSetting(e.name, true)
        }else{
            this.setState({importantSetting: true, importantSettingID: e.name.toString()})
        }
    }
    handleImportantSetting(){
        this.processImportantSetting(null, false)
        this.setState({importantSetting: false})
    }
    closeImportantSetting(){
        this.setState({importantSetting: false})
    }
    processImportantSetting(id, newValue){
        const {fields: {attributes: {flagNameChecks, flagIDRequired, flagResaleEnabled, flagCollectNames}}} = this.props
        const {importantSettingID} = this.state
        let ctlID = !!id ? id : importantSettingID
        switch(ctlID){
            case 'attributes.flagNameChecks':
                flagNameChecks.onChange(newValue)
                break
            case 'attributes.flagIDRequired':
                flagIDRequired.onChange(newValue)
                break
            case 'attributes.flagResaleEnabled':
                flagResaleEnabled.onChange(newValue)
                break
            case 'attributes.flagCollectNames':
                flagCollectNames.onChange(newValue)
            default:
                break
        }
    }

  decreaseReferralTier1Sales = () => {
    const {referralTier1Sales} = this.props.fields.attributes
    if(referralTier1Sales.value>1) {
      referralTier1Sales.onChange(referralTier1Sales.value-1)
    }
  }

  increaseReferralTier1Sales = () => {
    const {referralTier1Sales, referralTier2Sales} = this.props.fields.attributes
    if(referralTier1Sales.value<20 && referralTier1Sales.value<referralTier2Sales.value-1) {
      referralTier1Sales.onChange(referralTier1Sales.value+1)
    }
  }

  decreaseReferralTier2Sales = () => {
    const {referralTier2Sales, referralTier1Sales} = this.props.fields.attributes
    if(referralTier2Sales.value>1 && referralTier2Sales.value>referralTier1Sales.value+1) {
      referralTier2Sales.onChange(referralTier2Sales.value-1)
    }
  }

  increaseReferralTier2Sales = () => {
    const {referralTier2Sales, referralTier3Sales} = this.props.fields.attributes
    if(referralTier2Sales.value<20 && referralTier2Sales.value<referralTier3Sales.value-1) {
      referralTier2Sales.onChange(referralTier2Sales.value+1)
    }
  }

  decreaseReferralTier3Sales = () => {
    const {referralTier3Sales, referralTier2Sales} = this.props.fields.attributes
    if(referralTier3Sales.value>1 && referralTier3Sales.value>referralTier2Sales.value+1) {
      referralTier3Sales.onChange(referralTier3Sales.value-1)
    }
  }

  increaseReferralTier3Sales = () => {
    const {referralTier3Sales} = this.props.fields.attributes
    if(referralTier3Sales.value<20) {
      referralTier3Sales.onChange(referralTier3Sales.value+1)
    }
  }

  decreaseReferralTier1Percentage = () => {
    const {referralTier1Percentage} = this.props.fields.attributes
    if(referralTier1Percentage.value>5) {
      referralTier1Percentage.onChange(referralTier1Percentage.value-5)
    }
  }

  increaseReferralTier1Percentage = () => {
    const {referralTier1Percentage, referralTier2Percentage} = this.props.fields.attributes
    if(referralTier1Percentage.value<100 && referralTier1Percentage.value<referralTier2Percentage.value-5) {
      referralTier1Percentage.onChange(referralTier1Percentage.value+5)
    }
  }

  decreaseReferralTier2Percentage = () => {
    const {referralTier2Percentage, referralTier1Percentage} = this.props.fields.attributes
    if(referralTier2Percentage.value>5 && referralTier2Percentage.value>referralTier1Percentage.value+5) {
      referralTier2Percentage.onChange(referralTier2Percentage.value-5)
    }
  }

  increaseReferralTier2Percentage = () => {
    const {referralTier2Percentage} = this.props.fields.attributes
    if(referralTier2Percentage.value<95) {
      referralTier2Percentage.onChange(referralTier2Percentage.value+5)
    }
  }

  decreaseMaxOrder = () => {
    const {maxOrder} = this.props.fields.attributes
    if(maxOrder.value>1) {
      maxOrder.onChange(parseInt(maxOrder.value)-1)
    }
  }

  increaseMaxOrder = () => {
    const {maxOrder} = this.props.fields.attributes
    if(maxOrder.value<20) {
      maxOrder.onChange(parseInt(maxOrder.value)+1)
    }
  }

  onCheckimg(data){
        if (data.checked){
            return(
                <TouchableOpacity style={{width:30, height:30, backgroundColor:'#00D0B4', borderRadius:2,}} onPress={()=>this.onImportantSetting(data)}>
                    <Image style={{width:29, height:29}} source={require('@nativeRes/images/checkBox.png')}/>
                </TouchableOpacity>
            )
        }else{
            return(
                <TouchableOpacity style={{width:30, height:30, backgroundColor:'#414754', borderRadius:2,}} onPress={()=>this.onImportantSetting(data)}>

                </TouchableOpacity>
            )
        }
    }

    onincreaseReferralTierSales (Sales) {
      if (Sales.name == "attributes.referralTier2Sales") {
        this.increaseReferralTier2Sales()
      }else if (Sales.name == "attributes.referralTier3Sales"){
        this.increaseReferralTier3Sales()
      }else if (Sales.name == "attributes.referralTier1Sales") {
        this.increaseReferralTier1Sales()
      }
    }
    ondecreaseReferralTierSales (Sales) {
      if (Sales.name == "attributes.referralTier2Sales") {
        this.decreaseReferralTier2Sales()
      }else if (Sales.name == "attributes.referralTier3Sales"){
        this.decreaseReferralTier3Sales()
      }else if (Sales.name == "attributes.referralTier1Sales") {
        this.decreaseReferralTier1Sales()
      }
    }
    onincreaseReferralTierPercentage(Sales) {
      if (Sales.name == "attributes.referralTier2Sales") {
        this.increaseReferralTier2Percentage()
      }else if (Sales.name == "attributes.referralTier1Sales") {
        this.increaseReferralTier1Percentage()
      }
    }
    ondecreaseReferralTierPercentage(Sales) {
      if (Sales.name == "attributes.referralTier2Sales") {
        this.decreaseReferralTier2Percentage()
      }else if (Sales.name == "attributes.referralTier1Sales") {
        this.decreaseReferralTier1Percentage()
      }
    }
    _renderReferralSystemValue = (Sales, Percentage) => {
        var textColor = '#ffa46b'
        if (Sales.name == "attributes.referralTier2Sales") {
            textColor = '#72d6ff'
        }else if (Sales.name == "attributes.referralTier3Sales"){
            textColor = '#88ffa3'
        }
        return (
            <View style={eventTicketStyle.edit_ticket_tiers}>
                <View style={eventTicketStyle.tier_left}>
                  <Text style={[eventTicketStyle.tier_left_text, {color: textColor}]}>{Sales.value}</Text>
                  <View style={eventTicketStyle.tier_left_value}>
                    <TouchableOpacity style={{flex:1}} onPress={()=>this.onincreaseReferralTierSales(Sales)}><Icon name="angle-up" size={32} color="#9c9fa3" style={eventTicketStyle.tier_left_value_content}/></TouchableOpacity>
                    <TouchableOpacity onPress={()=>this.ondecreaseReferralTierSales(Sales)}><Icon name="angle-down" size={32} color="#9c9fa3" style={eventTicketStyle.tier_left_value_content}/></TouchableOpacity>
                  </View>
                </View>
                <View style={eventTicketStyle.tier_right}>
                    <View style={{flexDirection: 'row', alignItems: 'center', paddingBottom:8, flex:1}}>
                        <Text style={eventTicketStyle.tier_tickets}>Tickets</Text>
                        <Image style={{marginLeft: 7, width: 25, height: 16.13}} source={require('@nativeRes/images/influencers-star.png')}/>
                    </View>
                    <View style={{flexDirection: 'row', paddingRight: 30, alignItems: 'center'}}>
                        <View style={{marginRight: 10}}>
                            <Text style={[eventTicketStyle.count_animation_container, {color: textColor}]}>{Percentage.value}%</Text>
                            <Text style={eventTicketStyle.tier_rebate}>Rebate</Text>
                        </View>
                        <View style={eventTicketStyle.tier_left_value}>
                            <TouchableOpacity style={{flex:1}} onPress={()=>this.onincreaseReferralTierPercentage(Sales)}><Icon name="angle-up" size={32} color="#9c9fa3" style={eventTicketStyle.tier_left_value_content}/></TouchableOpacity>
                            <TouchableOpacity onPress={()=>this.ondecreaseReferralTierPercentage(Sales)}><Icon name="angle-down" size={32} color="#9c9fa3" style={eventTicketStyle.tier_left_value_content}/></TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        )
    }
    render() {
        const {
            fields: {
                attributes: {
                    feeMode, minOrder, maxOrder, ticketText,
                    salesStartDate, salesEndDate, minimumAge,
                    flagDisableReferral, flagEnableWaitingList,	flagRequirePhone, flagTaxesIncluded, flagValidateAge, flagNameChanges, flagTicketSwaps,
                    flagCollectNames, flagNameChecks, flagIDRequired, flagResaleEnabled,
                    referralTier1Sales, referralTier1Percentage, referralTier2Sales, referralTier2Percentage, referralTier3Sales, referralTier3Percentage,
                }
            }, submitting, handleSubmit, submitLabel
        } = this.props
        const hideReferral = flagDisableReferral.value || flagDisableReferral.initialValue
        return (
            <View>
                <View>
                    <Dialog
                        title='Are you sure?'
                        isOpen={this.state.importantSetting}
                        onClose={()=>this.closeImportantSetting()}
                        footer={
                            <View style={{flexDirection:'row'}}>
                                <Button title='Yes' style={commonStyle.buttonDanger} size='small'
                                        onPress={()=>this.handleImportantSetting()} />
                                <Button title='No' style={commonStyle.buttonSecondary} size='small'
                                        onPress={()=>this.closeImportantSetting()} />
                            </View>
                        }>
                        <Text style={{textAlign:'center',color:'white'}}>
                            We strongly recommend leaving this enabled to increase security and reduce the risk of fraudulent payment disputes from customers. Are you sure you want to disable it?
                        </Text>
                    </Dialog>
                    <Radios
                        id='feeMode'
                        label='How do you want to handle booking fees?'
                        label1='This option has no effect on free events'
                        options={FEE_MODES}
                        {...feeMode}/>
                    <Panel title='Ticket Settings' icon='toggle-on' style={{marginBottom:25}}>
                         <View style={{flexDirection:DeviceInfo.isTablet() ?'row':'column',marginBottom:25}}>
                            <View style={{flex:1, paddingRight:DeviceInfo.isTablet() ? 10 : 0}}>
                                <DateTimePickera id='salesStartDate' label='Sales start (optional)' placeholder='D MMM YYYY H:M AM' {...salesStartDate}/>
                            </View>
                            <View style={{flex:1, paddingLeft:DeviceInfo.isTablet() ? 10:0}}>
                                <DateTimePickera id='salesEndDate' label='Sales end' placeholder='D MMM YYYY H:M AM' {...salesEndDate} />
                            </View>
                         </View>
                         <View style={{flexDirection:DeviceInfo.isTablet() ? 'row':'column'}}>
                             <View style={{flex:1,}}>
                                 <Switch label='Disable referral system'
                                     checked={flagDisableReferral.defaultValue}/>
                                 <Switch label='Enable waiting list after sell-out'
                                     checked={flagEnableWaitingList.defaultValue}/>
                                 <Switch label={'Require buyer to enter their phone \n number'}
                                     checked={flagRequirePhone.defaultValue}/>
                                 <Switch label='Show ticket prices including taxes'
                                     checked={flagTaxesIncluded.defaultValue}/>
                             </View>
                             <View style={{flex:1,}}>
                                  <Switch label={'Collect and validate DOB against \n a minimum age'}
                                       checked={flagValidateAge.defaultValue}/>
                                  <Switch label='Name changes allowed'
                                       checked={flagNameChanges.defaultValue}/>
                                  <Switch label='Ticket swaps allowed'
                                       checked={flagTicketSwaps.defaultValue}/>
                             </View>
                         </View>
                        <View style={{marginTop: 70}}>
                          <Text style={{color: '#E9E9E9', fontWeight: '600', fontFamily: 'Open Sans'}}>Minimum age</Text>
                          <Select
                            options={range30}
                            {...minimumAge}
                          />
                          <Text style={{color: '#c6cbd0', fontSize: 12, fontFamily: 'Open Sans', }}>Since this event requires age checks, a minimum age must be specified.</Text>
                          <Text style={{color: '#c6cbd0', fontSize: 15, fontFamily: 'Open Sans', marginTop: 15}}>Text to display on ticket PDF</Text>
                          <RichTextArea ref="ticketText" id="ticketText" defaultValue="<p><br/></p>" disablePlugin {...ticketText} limit={10}/>
                        </View>
                    </Panel>
                    <Panel title='Anti-Scalping/Fraud Settings' icon='shield' style={{marginBottom:30}}>
                        <View style={{flex:1, alignItems:'center'}}>
                            <View style={{flex:1,flexDirection:'row', alignItems:'center'}}>
                                <Image style={{width:20, height:20, marginRight:10}} source={require('@nativeRes/images/icon-warning.png')}/>
                                <Text style={{color:'#E9E9E9', fontSize:20,fontFamily:'OpenSans',}}>Important</Text>
                            </View>
                            <View style={{padding:10, alignItems:'center'}}>
                                <Text style={{color:'#E9E9E9', textAlign:'center',fontSize:13,fontFamily:'OpenSans',}}>We recommend these four settings to be switched on for </Text>
                                <Text style={{color:'#E9E9E9',textAlign:'center', fontSize:13,fontFamily:'OpenSans',}}> maximum security and fraud prevention.</Text>
                            </View>
                        </View>

                        <View style={{marginTop:40, flexDirection:DeviceInfo.isTablet() ? 'row':'column',}}>
                            <View style={{flex:1, alignItems:'center', marginBottom:10}}>
                                {this.onCheckimg({...flagCollectNames})}
                                <Text style={{marginTop:20, color:'#E9E9E9', fontSize:12}}>Names required for </Text>
                                <Text style={{marginTop:5, color:'#E9E9E9', fontSize:12}}>each ticket</Text>
                            </View>
                            <View style={{flex:1, alignItems:'center', marginBottom:10}}>
                                {this.onCheckimg({...flagIDRequired})}
                                <Text style={{marginTop:20, color:'#E9E9E9', fontSize:12}}>ID is required</Text>
                            </View>
                            <View style={{flex:1, alignItems:'center', marginBottom:10}}>
                                {this.onCheckimg({...flagResaleEnabled})}
                                <Text style={{marginTop:20, color:'#E9E9E9', fontSize:12}}>Ticket resale system enabled</Text>
                            </View>
                            <View style={{flex:1, alignItems:'center', marginBottom:10}}>
                                {this.onCheckimg({...flagNameChecks})}
                                <Text style={{marginTop:20, color:'#E9E9E9', fontSize:12}}>Name checks enforced</Text>
                            </View>
                        </View>

                    </Panel>
                    <Panel title='Referral System Thresholds and Limits' icon='random'>
                      {this._renderReferralSystemValue(referralTier1Sales, referralTier1Percentage)}
                      {this._renderReferralSystemValue(referralTier2Sales, referralTier2Percentage)}
                      {this._renderReferralSystemValue(referralTier3Sales, referralTier3Percentage)}
                      <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop:7}}>
                        <Image source={require('@nativeRes/images/system_icons/tickets.png')} style={{width:24, height:24}}/>
                        <Text style={eventTicketStyle.max_order_label}>Maximum ticket quantity per order</Text>
                      </View>
                      <View style={{flexDirection:'row', alignItems: 'center',justifyContent: 'center'}}>
                        <TextInput
                          ref = 'input'
                          maxLength = {50}
                          returnKeyType = {'next'}
                          underlineSize = {0}
                          tintColor = '#B6C5CF'
                          style = {eventTicketStyle.orderValue}
                          value={`${maxOrder.value}`}
                        />
                        <View style={eventTicketStyle.tier_left_value}>
                          <TouchableOpacity
                            style={[eventTicketStyle.max_order_value_up_down,{flex:1, marginBottom: 3}]}
                            onPress={this.increaseMaxOrder}>
                            <Icon name="angle-up" size={20} color="#9c9fa3" style={eventTicketStyle.tier_left_value_content}/>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={eventTicketStyle.max_order_value_up_down}
                            onPress={this.decreaseMaxOrder}>
                            <Icon name="angle-down" size={20} color="#9c9fa3" style={eventTicketStyle.tier_left_value_content}/>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </Panel>
                    <View style={[commonStyle.rowContainer,{justifyContent:'center'}]}>
                        <Button title='Save' loading={submitting} onPress={handleSubmit}/>
                    </View>
                </View>
            </View>
        )
    }
}

export default reduxForm({
    form: 'ticketOptionsForm',
    fields: [
        'attributes.feeMode',
        'attributes.minOrder',
        'attributes.maxOrder',
        'attributes.flagDisableReferral',
        'attributes.referralTier1Sales',
        'attributes.referralTier1Percentage',
        'attributes.referralTier2Sales',
        'attributes.referralTier2Percentage',
        'attributes.referralTier3Sales',
        'attributes.referralTier3Percentage',
        'attributes.salesStartDate',
        'attributes.salesEndDate',
        'attributes.minimumAge',
        'attributes.flagCollectNames',
        'attributes.flagIDRequired',
        'attributes.flagResaleEnabled',
        'attributes.flagNameChecks',
        'attributes.flagDisableReferral',
        'attributes.flagEnableWaitingList',
        'attributes.flagRequirePhone',
        'attributes.flagTaxesIncluded',
        'attributes.flagValidateAge',
        'attributes.flagNameChanges',
        'attributes.flagTicketSwaps',
    ],
    initialValues: {
        attributes: {
            feeMode: 'forward',
            minOrder: 1,
            maxOrder: 10
        }
    },
    validate: validate
})(TicketOptionsForm)
