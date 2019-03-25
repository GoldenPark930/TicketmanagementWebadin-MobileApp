import _ from 'lodash'
import React from 'react'
import {reduxForm} from 'redux-form'
import moment from 'moment-timezone'

import Button from '../_library/Button'
import Field from '../_library/Field'
import Select from '../_library/Select'
import Checkbox from '../_library/Checkbox'
import Radios from '../_library/Radios'
import Card from '../_library/Card'
import NumberAnimation from '../_library/NumberAnimation'
import Modal from 'react-modal'
import FEE_MODES from './ticket/feemodes'
import Scroll from 'react-scroll'
import RichTextArea from '../_library/RichTextArea'

import modalStyle from '../../_common/core/modalStyle'
import DateTimePicker from '../_library/DateTimePicker'

const options = _.map(new Array(20), (e, i) => {
	return {value: i + 1, label: i + 1}
})
const options_referrel = _.map(new Array(20), (e, i) => {
	return {value: i + 1, label: i + 1}
})
const options_referrel_percent = _.map(new Array(20), (e, i) => {
	return {value: (i + 1)*5, label: (i + 1)*5}
})
const range30 = new Array(30)

function isDateRangeInvalid2(start, end) {	
	if(!start)
		return false
	const sm = moment.utc(start)//moment(start, dateFormat, true)
	const em = moment.utc(end)//moment(end, dateFormat, true)
	if (!sm.isValid()) { return }
	if (!em.isValid()) { return }
	return em.isSame(sm) || em.isBefore(sm)
}

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

	if(tier2sales && tier2sales <= tier1sales){
		_.set(errors, 'attributes.referralTier2Sales', 'Tier 2 target must be greater than Tier 1')
	}

	if(tier3sales && tier3sales <= tier2sales){
		_.set(errors, 'attributes.referralTier3Sales', 'Tier 3 target must be greater than Tier 2')
	}

	if(tier3sales && tier3sales <= tier1sales){
		_.set(errors, 'attributes.referralTier3Sales', 'Tier 3 target must be greater than Tier 1')
	}

	const tier1percentage = _.get(data, 'attributes.referralTier1Percentage')
	const tier2percentage = _.get(data, 'attributes.referralTier2Percentage')

	if(tier2percentage && tier2percentage <= tier1percentage){
		_.set(errors, 'attributes.referralTier2Percentage', 'Tier 2 percentage must be greater than Tier 1')
	}

	// --- following fields were moved from event-form
	if (!_.get(data, 'attributes.salesEndDate')){
		_.set(errors, 'attributes.salesEndDate', 'Required')
	}

	const salesStartDate = _.get(data, 'attributes.salesStartDate')
	const salesEndDate = _.get(data, 'attributes.salesEndDate')
	if (isDateRangeInvalid2(salesStartDate, salesEndDate)) {
		_.set(errors, 'attributes.salesEndDate', 'Sales end date must be after sales start date')
	}

	const minAge = _.get(data, 'attributes.minimumAge', 0)
	if (_.get(data, 'attributes.flagValidateAge') && (!minAge || !(minAge > 0))) {
		_.set(errors, 'attributes.minimumAge', 'Required')
	}

	return errors
}

@reduxForm({
	form: 'ticketoptions',
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
		'attributes.flagEnableWaitingList',
		'attributes.flagRequirePhone',
		'attributes.flagTaxesIncluded',
		'attributes.flagValidateAge',
		'attributes.flagNameChanges',
		'attributes.flagTicketSwaps',
		'attributes.ticketText',
	],
	initialValues: {
		attributes: {
			feeMode: 'forward',
			minOrder: 1,
			maxOrder: 10
		}
	},
	validate: validate
})
export default class TicketOptions extends React.Component {
	constructor(props) {
		super(props)
		this.state = {importantSetting: false, importantSettingID: null, submitPressed: false}
	}
	componentWillReceiveProps(nextProps){
		const {submitPressed} = this.state
		if(!_.isEmpty(nextProps.errors) && submitPressed){
			console.log('submit failed due to the errors, now scroll to top')			
			this.setState({submitPressed: false}, function(){
				var scroll = Scroll.animateScroll
				scroll.scrollToTop()
			})
		}
	}
	processSubmit(){
		const {handleSubmit} = this.props
		this.setState({submitPressed: true}, function() {
			handleSubmit()
		})
	}
	handleSelectBlur(field, e) {
		field.onBlur(_.parseInt(e.target.value))
	}
	handleSelectChange(field, e) {
		field.onChange(_.parseInt(e.target.value))
	}
	processImportantSetting(id, newValue){
		const {fields: {attributes: {flagNameChecks, flagIDRequired, flagResaleEnabled, flagCollectNames}}} = this.props
		const {importantSettingID} = this.state
		let ctlID = !!id ? id : importantSettingID
		switch(ctlID){
			case 'flagNameChecks':
				flagNameChecks.onChange(newValue)
				break
			case 'flagIDRequired':
				flagIDRequired.onChange(newValue)
				break
			case 'flagResaleEnabled':
				flagResaleEnabled.onChange(newValue)
				break
			case 'flagCollectNames':
				flagCollectNames.onChange(newValue)
			default:
				break
		}
	}
	onImportantSetting(e){
		if (e.target.checked){
			this.setState({importantSetting: false, importantSettingID: e.target.id})
			this.processImportantSetting(e.target.id, true)
		}else{
			this.setState({importantSetting: true, importantSettingID: e.target.id})
		}
	} 
	handleImportantSetting(){
		this.processImportantSetting(null, false)
		this.setState({importantSetting: false})
	}
	closeImportantSetting(){
		this.setState({importantSetting: false})
	}

	decreaseReferralTier1Sales() {
		const {referralTier1Sales} = this.props.fields.attributes
		if(referralTier1Sales.value>1) {
			referralTier1Sales.onChange(referralTier1Sales.value-1)
		}
	}

	increaseReferralTier1Sales() {
		const {referralTier1Sales, referralTier2Sales} = this.props.fields.attributes
		if(referralTier1Sales.value<20 && referralTier1Sales.value<referralTier2Sales.value-1) {
			referralTier1Sales.onChange(referralTier1Sales.value+1)
		}
	}

	decreaseReferralTier2Sales() {
		const {referralTier2Sales, referralTier1Sales} = this.props.fields.attributes
		if(referralTier2Sales.value>1 && referralTier2Sales.value>referralTier1Sales.value+1) {
			referralTier2Sales.onChange(referralTier2Sales.value-1)
		}
	}

	increaseReferralTier2Sales() {
		const {referralTier2Sales, referralTier3Sales} = this.props.fields.attributes
		if(referralTier2Sales.value<20 && referralTier2Sales.value<referralTier3Sales.value-1) {
			referralTier2Sales.onChange(referralTier2Sales.value+1)
		}
	}

	decreaseReferralTier3Sales() {
		const {referralTier3Sales, referralTier2Sales} = this.props.fields.attributes
		if(referralTier3Sales.value>1 && referralTier3Sales.value>referralTier2Sales.value+1) {
			referralTier3Sales.onChange(referralTier3Sales.value-1)
		}
	}

	increaseReferralTier3Sales() {
		const {referralTier3Sales} = this.props.fields.attributes
		if(referralTier3Sales.value<20) {
			referralTier3Sales.onChange(referralTier3Sales.value+1)
		}
	}

	decreaseReferralTier1Percentage() {
		const {referralTier1Percentage} = this.props.fields.attributes
		if(referralTier1Percentage.value>5) {
			referralTier1Percentage.onChange(referralTier1Percentage.value-5)
		}
	}

	increaseReferralTier1Percentage() {
		const {referralTier1Percentage, referralTier2Percentage} = this.props.fields.attributes
		if(referralTier1Percentage.value<100 && referralTier1Percentage.value<referralTier2Percentage.value-5) {
			referralTier1Percentage.onChange(referralTier1Percentage.value+5)
		}
	}

	decreaseReferralTier2Percentage() {
		const {referralTier2Percentage, referralTier1Percentage} = this.props.fields.attributes
		if(referralTier2Percentage.value>5 && referralTier2Percentage.value>referralTier1Percentage.value+5) {
			referralTier2Percentage.onChange(referralTier2Percentage.value-5)
		}
	}

	increaseReferralTier2Percentage() {
		const {referralTier2Percentage} = this.props.fields.attributes
		if(referralTier2Percentage.value<95) {
			referralTier2Percentage.onChange(referralTier2Percentage.value+5)
		}
	}

	decreaseMaxOrder() {
		const {maxOrder} = this.props.fields.attributes
		if(maxOrder.value>1) {
			maxOrder.onChange(parseInt(maxOrder.value)-1)
		}
	}

	increaseMaxOrder() {
		const {maxOrder} = this.props.fields.attributes
		if(maxOrder.value<20) {
			maxOrder.onChange(parseInt(maxOrder.value)+1)
		}
	}

	render() {
		const {fields: {
			attributes: {
				feeMode, minOrder, maxOrder,
				salesStartDate, salesEndDate, minimumAge, ticketText,
				flagDisableReferral, flagEnableWaitingList,	flagRequirePhone, flagTaxesIncluded, flagValidateAge, flagNameChanges, flagTicketSwaps,
				flagCollectNames, flagNameChecks, flagIDRequired, flagResaleEnabled, 
				referralTier1Sales, referralTier1Percentage, referralTier2Sales, referralTier2Percentage, referralTier3Sales, referralTier3Percentage,
			}
		}, submitting, handleSubmit, submitLabel} = this.props
		const {importantSetting} = this.state
		const hideReferral = flagDisableReferral.value || flagDisableReferral.initialValue
		const minimumAgeEnabled = !!(flagValidateAge.value)

		return (
			<div className='event-ticketoptions'>
				<form ref="form" method="POST" onSubmit={handleSubmit}>
					<Modal
						className="modal-dialog modal-trans"
						style={modalStyle}
						isOpen={!!importantSetting}
						contentLabel="Modal"
						onRequestClose={::this.closeImportantSetting}
						closeTimeoutMS={150}>
						<div className="modal-dialog">
							<div className="modal-content">
								<div>
									<div className="modal-header">
										<p className="h4 text-compact">Are you sure?</p>
									</div>
									<div className="modal-body">
										<p>We strongly recommend leaving this enabled to increase security and reduce the risk of fraudulent payment disputes from customers. Are you sure you want to disable it?</p>
									</div>
									<div className="modal-footer">
										<div className="btn-toolbar btn-toolbar-right">
											<Button
												className="btn btn-danger btn-shadow"
												type="button"
												onClick={::this.handleImportantSetting}>Yes</Button>
											<Button
												className="btn btn-cancel btn-shadow" type="button"
												onClick={::this.closeImportantSetting}>No</Button>
										</div>
									</div>
								</div>
							</div>
						</div>
					</Modal>
					<div className="row">
						<div className="col-xs-12">
							<div className="ticket-radio col-12 sub-title">
								<Radios
									id="feeMode"
									label="How do you want to handle booking fees?"
									label1="This option has no effect on free events"
									options={FEE_MODES}
									{...feeMode}>
								</Radios>
							</div>
						</div>
					</div>
					<Card icon={'fa-toggle-on'} title={'Ticket Settings'}>
						<div className="row">
							<div className="col-sm-6 col-12">
								<DateTimePicker id="salesStartDate" label="Sales start (optional)" placeholder="D MMM YYYY H:M AM" {...salesStartDate} />
							</div>
							<div className="col-sm-6">
								<DateTimePicker id="salesEndDate" label="Sales end" placeholder="D MMM YYYY H:M AM" {...salesEndDate} />
							</div>
						</div>						
						<div className="row">
							<div className="col-xs-6 col-12">									
								<div className="line">
									<div className="line-cell">
										<div className="checkbox-switch">
											<input type="checkbox" id="flagDisableReferral" {...flagDisableReferral}/>
											<label htmlFor="flagDisableReferral"></label>
										</div>
									</div>
									<div className="line-cell">
										<label htmlFor="flagDisableReferral">Disable referral system</label>
									</div>
								</div>
								<div className="line">
									<div className="line-cell">
										<div className="checkbox-switch">
											<input type="checkbox" id="flagEnableWaitingList" {...flagEnableWaitingList}/>
											<label htmlFor="flagEnableWaitingList"></label>
										</div>
									</div>
									<div className="line-cell">
										<label htmlFor="flagEnableWaitingList">Enable waiting list after sell-out</label>
									</div>
								</div>									
								<div className="line">
									<div className="line-cell">
										<div className="checkbox-switch">
											<input type="checkbox" id="flagRequirePhone" {...flagRequirePhone}/>
											<label htmlFor="flagRequirePhone"></label>
										</div>
									</div>
									<div className="line-cell">
										<label htmlFor="flagRequirePhone">Require buyer to enter their phone number</label>
									</div>
								</div>
								<div className="line">
									<div className="line-cell">
										<div className="checkbox-switch">
											<input type="checkbox" id="flagTaxesIncluded" {...flagTaxesIncluded}/>
											<label htmlFor="flagTaxesIncluded"></label>
										</div>
									</div>
									<div className="line-cell">
										<label htmlFor="flagTaxesIncluded">Show ticket prices including taxes</label>
									</div>
								</div>									
							</div>
							<div className="col-xs-6 col-12">
								<div className="line">
									<div className="line-cell">
										<div className="checkbox-switch">
											<input type="checkbox" id="flagValidateAge" {...flagValidateAge}/>
											<label htmlFor="flagValidateAge"></label>
										</div>
									</div>
									<div className="line-cell">
										<label htmlFor="flagValidateAge">Collect and validate DOB against a minimum age</label>
									</div>
								</div>
								<div className="line">
									<div className="line-cell">
										<div className="checkbox-switch">
											<input type="checkbox" id="flagNameChanges" {...flagNameChanges}/>
											<label htmlFor="flagNameChanges"></label>
										</div>
									</div>
									<div className="line-cell">
										<label htmlFor="flagNameChanges">Name changes allowed</label>
									</div>
								</div>
								<div className="line">
									<div className="line-cell">
										<div className="checkbox-switch">
											<input type="checkbox" id="flagTicketSwaps" {...flagTicketSwaps}/>
											<label htmlFor="flagTicketSwaps"></label>
										</div>
									</div>
									<div className="line-cell">
										<label htmlFor="flagTicketSwaps">Ticket swaps allowed</label>
									</div>
								</div>
							</div>
						</div>
						{minimumAgeEnabled && 
							<div className="row">
								<div className="col-xs-12">
									<div className={'form-group ' + (minimumAge.error ? 'has-error' : '')}>
									{!!flagValidateAge.value && <div className="floating-field-group active">
										<div className="floating-field">
											<label htmlFor="minimumAge">Minimum age</label>
											<select id="minimumAge" className="form-control" {...minimumAge}>		 
												<option value={0}>Select minimum age</option>
												{_.map(range30, (e, i) => <option key={30-i} value={30-i}>{30-i}</option>)}
											</select>
											<small>Since this event requires age checks, a minimum age must be specified.</small> 
										</div>								
									</div>}
									{!!minimumAge.error && <div className="help-block">{minimumAge.error}</div>}
									</div>
								</div>
							</div>
						}
						<div className="row">
							<div className="col-xs-12" style={{paddingBottom:'5px'}}>
								Text to display on ticket PDF
							</div>
							<div className="col-xs-12">
								<RichTextArea ref="ticketText" id="ticketText" defaultValue="<p><br/></p>" disablePlugin {...ticketText} limit={10}/>
							</div>
						</div>
					</Card>
					<Card icon={'fa-shield'} title={'Anti-Scalping/Fraud Settings'}>
						<div className="card-warning">
							<img src = {asset('/assets/resources/images/icon-warning.png')}/>Important
							<div className="description">
								We recommend that these settings are switched on for <br/> maximum security and fraud prevention.
							</div>
						</div>
						<div className="body-panel-spacing"/>
						<div className="row">
							<div className="col-xs-3 col-12 bottom_space">
								<div className="checkbox-group-square">
									<div className="checkbox-square">
										<input id="flagCollectNames" type="checkbox" checked={true} {...flagCollectNames} onChange={::this.onImportantSetting}/>
										<label htmlFor="flagCollectNames"></label>
									</div>
									<div className="checkbox-description">
										Names required for each ticket
									</div>
								</div>
							</div>									
							<div className="col-xs-3 col-12 bottom_space">
								<div className="checkbox-group-square">
									<div className="checkbox-square">
										<input id="flagIDRequired" type="checkbox" checked={true} {...flagIDRequired} onChange={::this.onImportantSetting}/>
										<label htmlFor="flagIDRequired"></label>
									</div>
									<div className="checkbox-description">
										ID is required
									</div>
								</div>
							</div>
							<div className="col-xs-3 col-12 bottom_space">
								<div className="checkbox-group-square">
									<div className="checkbox-square">
										<input id="flagResaleEnabled" type="checkbox" checked={true} {...flagResaleEnabled} onChange={::this.onImportantSetting}/>
										<label htmlFor="flagResaleEnabled"></label>
									</div>
									<div className="checkbox-description">
										Ticket resale system enabled
									</div>
								</div>
							</div>
							<div className="col-xs-3 col-12 bottom_space">
								<div className="checkbox-group-square">
									<div className="checkbox-square">
										<input id="flagNameChecks" type="checkbox" checked={true} {...flagNameChecks} onChange={::this.onImportantSetting}/>
										<label htmlFor="flagNameChecks"></label>
									</div>
									<div className="checkbox-description">
										Name checks enforced
									</div>
								</div>
							</div>
						</div>
					</Card>
					<Card icon={'fa-random'} title={'Referral System Thresholds and Limits'}>
						{!hideReferral &&
						<div className="edit-ticket-tiers">
							<div className="tiers row">
								<div className="tier-slice">
									<div className="influencers-tier influencers-tier-0">
										<div className="tier-left">
											{referralTier1Sales.value}
											<i className="tier-value-up fa fa-angle-up" onClick={this.increaseReferralTier1Sales.bind(this)} />
											<i className="tier-value-down fa fa-angle-down" onClick={this.decreaseReferralTier1Sales.bind(this)} />
										</div>
										<div className="tier-right">
											<div className="tier-tickets">
												Tickets <img src={asset('/assets/resources/images/influencers-star.png')}/>
											</div>
											<div className="tier-percentage">
												<NumberAnimation 
													isLoading={false}
													initValue={0} 
													target={referralTier1Percentage.value} 
													duration={1500} 
													decimals={0}
													useGroup={false} 
													animation={'up'} 
													subfix={'%'}
												/>
												<i className="tier-percentage-up fa fa-angle-up" onClick={this.increaseReferralTier1Percentage.bind(this)} />
												<i className="tier-percentage-down fa fa-angle-down" onClick={this.decreaseReferralTier1Percentage.bind(this)} />
											</div>
											<div className="tier-rebate color_rebate">
												Rebate
											</div>
										</div>
									</div>
								</div>
								<div className="tier-slice">
									<div className="influencers-tier influencers-tier-1">
										<div className="tier-left">
											{referralTier2Sales.value}
											
											<i className="tier-value-up fa fa-angle-up" onClick={this.increaseReferralTier2Sales.bind(this)} />
											<i className="tier-value-down fa fa-angle-down" onClick={this.decreaseReferralTier2Sales.bind(this)} />

										</div>
										<div className="tier-right">
											<div className="tier-tickets">
												Tickets <img src={asset('/assets/resources/images/influencers-star.png')}/>
											</div>
											<div className="tier-percentage">
												<NumberAnimation 
													isLoading={false}
													initValue={0} 
													target={referralTier2Percentage.value} 
													duration={1500} 
													decimals={0}
													useGroup={false} 
													animation={'up'} 
													subfix={'%'}
												/>
											
												<i className="tier-percentage-up fa fa-angle-up" onClick={this.increaseReferralTier2Percentage.bind(this)} />
												<i className="tier-percentage-down fa fa-angle-down" onClick={this.decreaseReferralTier2Percentage.bind(this)} />

											</div>
											<div className="tier-rebate color_rebate">
												Rebate
											</div>
										</div>
									</div>
								</div>
								<div className="tier-slice">
									<div className="influencers-tier influencers-tier-2">
										<div className="tier-left">
											{referralTier3Sales.value}
											
											<i className="tier-value-up tier-value fa fa-angle-up" onClick={this.increaseReferralTier3Sales.bind(this)} />
											<i className="tier-value-down tier-value fa fa-angle-down" onClick={this.decreaseReferralTier3Sales.bind(this)} />
											
										</div>
										<div className="tier-right">
											<div className="tier-tickets">
												Tickets <img src={asset('/assets/resources/images/influencers-star.png')}/>
											</div>
											<div className="tier-percentage">
												100%
											</div>
											<div className="tier-rebate color_rebate">
												Rebate
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
						}					
						<div className="row">
							<div className="max-order">
								<img src={asset('/assets/resources/images/system_icons/tickets.svg')} width='24' height='24' className="max-order-icon" />
								<div className="max-order-label">Maximum ticket quantity per order</div>
								<Field size="large" value={maxOrder.value} className="max-order-field" />
								<i className="max-order-up fa fa-angle-up" onClick={this.increaseMaxOrder.bind(this)} />
								<i className="max-order-down fa fa-angle-down" onClick={this.decreaseMaxOrder.bind(this)} />
							</div>
						</div>
					</Card>
					<div className="row">
						<div className="col-xs-12 text-center">
							<Button className="btn btn-success btn-lg btn-shadow" type="button" loading={submitting} onClick={::this.processSubmit}>{submitLabel || 'Save'}</Button>
						</div>
					</div>
				</form>
			</div>
		)
	}
}
