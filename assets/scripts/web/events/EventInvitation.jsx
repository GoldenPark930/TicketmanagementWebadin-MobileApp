import _ from 'lodash'
import Immutable from 'immutable'
import React from 'react'
import {connect} from 'react-redux'
import Papa from 'papaparse'
import {reduxForm} from 'redux-form'
import Modal from 'react-modal'
import Field from '../_library/Field'
import Button from '../_library/Button'
import RichTextArea from '../_library/RichTextArea'
import modalStyle from '../../_common/core/modalStyle'
import {withRouter} from 'react-router'
import {routeActions} from 'react-router-redux'
import {Tab, TabView} from '../_library/TabView'
import Card from '../_library/Card'
import {FETCH_EVENT_TICKETS} from '../../_common/redux/tickets/actions'
import {SEND_INVITATIONS, FETCH_INVITATIONS} from '../../_common/redux/invitation/actions'
import {FETCH_EMAIL_TEMPLATES} from '../../_common/redux/emailtemplates/actions'
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger'
import Tooltip from 'react-bootstrap/lib/Tooltip'
import {JSONDatatable, SEARCHBAR, DATATABLE, PAGINATIONBAR, TYPE_FROM_URL, TYPE_FROM_ARRAY, IS_FOUND} from '../_library/JSONDatatable'
import EmptyBar from '../_library/EmptyBar'
import LoadingBar from '../_Library/LoadingBar'

@withRouter
@connect(
	(state) => {
		const event = state.events.get('selected').toJS()
		return {
			event
		}
	},
	{SEND_INVITATIONS, push: routeActions.push}
)
export default class EventInvitation extends React.Component{
	constructor(props) {
		super(props)
		form_helper_reset()
		this.state = {
			hasEdittedFields: false,
			nextLocation: null
		}
	}

	componentDidMount() {
		Messenger.options = {
		  extraClasses: 'messenger-fixed messenger-on-bottom messenger-on-right',
		  theme: 'future'
		}
		const {event} = this.props
		document.title = `Invitations - ${event.displayName} - The Ticket Fairy Dashboard`
		this.props.router.setRouteLeaveHook(this.props.route, this.routerWillLeave.bind(this))
	}

	componentWillUnmount(){
		form_helper_reset()
	}

	onClickOk(){
		form_helper_reset()
		const{nextLocation} = this.state
		const{push} = this.props
		push(nextLocation)
	}

	onClickCancel() {
		this.setState({hasEdittedFields: false})
	}

	routerWillLeave(nextLocation){
		if(form_helper_isEditted()){
			this.setState({
				hasEdittedFields: true,
				nextLocation: nextLocation.pathname
			})
			return false
		}
	}

	sendNotification(form) {
		const {event, SEND_INVITATIONS} = this.props

		if (form.recipients_mode == 'form') {
			form.recipients = []
			form.recipients.push(form.recipient)
			delete form.recipient
		} else if (form.recipients_mode == 'csv') {
			delete form.recipient
		}
		delete form.recipients_mode

		return Promise.resolve(SEND_INVITATIONS(event.id, form))
			.catch((err) => {
				Messenger().post({
					type: 'error',
					message: err,
					hideAfter: 5,
					showCloseButton: true
				})
				return Promise.reject(_.result(err, 'toFieldErrors', err))
			})
			.then((v)=>{
				Messenger().post({
					type: 'success',
					message: 'Successfully sent!',
					hideAfter: 10,
					showCloseButton: true
				})
				return v
			})
	}

	render() {
		const {event} = this.props

		const {hasEdittedFields} = this.state
		let contentEdittedFields = []
		if(hasEdittedFields){
			let recipients = false
			Object.keys(form_helper_get()).forEach((field, index)=>{
				if(field=='subject') {
					contentEdittedFields.push(<div key={field}><i className="fa fa-info-circle" aria-hidden="true"></i> Subject</div>)
				} else if(field=='body') {
					contentEdittedFields.push(<div key={field}><i className="fa fa-info-circle" aria-hidden="true"></i> Invitation Content</div>)
				} else if(field=='ticketTypeID') {
					contentEdittedFields.push(<div key={field}><i className="fa fa-info-circle" aria-hidden="true"></i> Hidden Ticket Type</div>)
				} else if(field=='recipient.first_name') {
					contentEdittedFields.push(<div key={field}><i className="fa fa-info-circle" aria-hidden="true"></i> First Name</div>)
				} else if(field=='recipient.last_name') {
					contentEdittedFields.push(<div key={field}><i className="fa fa-info-circle" aria-hidden="true"></i> Last Name</div>)
				} else if(field=='recipient.email') {
					contentEdittedFields.push(<div key={field}><i className="fa fa-info-circle" aria-hidden="true"></i> Notes</div>)
				} else if(field=='recipient.maxQuantity') {
					contentEdittedFields.push(<div key={field}><i className="fa fa-info-circle" aria-hidden="true"></i> Maximum number of tickets</div>)
				} else if(field=='recipient.maxUses') {
					contentEdittedFields.push(<div key={field}><i className="fa fa-info-circle" aria-hidden="true"></i> Maximum number of transactions</div>)
				} else if(field=='recipients_mode') {
					contentEdittedFields.push(<div key={field}><i className="fa fa-info-circle" aria-hidden="true"></i> Recipients Mode</div>)
				} else if(field.startsWith('recipients[')) {
					if(!recipients) {
						contentEdittedFields.push(<div key={field}> - Recipients from CSV</div>)
						recipients = true
					}
				} else {
					contentEdittedFields.push(<div key={field}> - {field}</div>)
				}
			})
		}

		return (
			<div className="EventInvitation">
				<h3 className="heading_style">Send New Invitation</h3>
				<EventInvitationForm onSubmit={::this.sendNotification} />
				<h3 className="heading_style">Existing Invitations</h3>
				<ExistingInvitations event={event} />
				<Modal
					className="modal-dialog modal-trans"
					style={modalStyle}
					isOpen={hasEdittedFields}
					contentLabel="Modal"
					onRequestClose={::this.onClickCancel}
					closeTimeoutMS={150}>
					<div className="modal-dialog">
						<div className="modal-content">
							<div className="modal-confirm-switch">
								<div className="modal-header">
									Confirm Switch
								</div>
								<div className="modal-body">
									<div className="msg-confirm">Are you sure you want to switch to a new section without saving your changes?</div>
									<div className="msg-desc">You’ve made changes to the following settings:</div>
									<div className="edited-fields">
										{contentEdittedFields}
									</div>
								</div>
								<div className="modal-footer">
									<div className="btn-toolbar btn-toolbar-right">
										<Button
											className="btn btn-success btn-shadow"
											type="button"
											onClick={::this.onClickOk}>Ok</Button>
										<Button
											className="btn btn-default btn-shadow" type="button"
											onClick={::this.onClickCancel}>Cancel</Button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</Modal>
			</div>
		)
	}
}

function validateEmail(email) {
    let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return re.test(email)
}

function validateForm(data) {
	const errors = {}

	if (!_.get(data, 'subject')){
		_.set(errors, 'subject', 'Required')
	}

	if (!_.get(data, 'body')){
		_.set(errors, 'body', 'Required')
	}

	let recipients_mode = _.get(data, 'recipients_mode')

	if (recipients_mode == 'csv') {
		let recipients = _.get(data, 'recipients')
		if (!recipients || recipients.length==0){
			_.set(errors, 'recipients', 'You must import at least one recipient.')
		} else {
			recipients.forEach((r, index) => {
				if(!r.first_name) {
					_.set(errors, 'recipients['+index+'].first_name', 'Required')
				}
				/*if(!r.last_name) {
					_.set(errors, 'recipients['+index+'].last_name', 'Required')
				}*/
				if(!r.email) {
					_.set(errors, 'recipients['+index+'].email', 'Required')
				} else if(!validateEmail(r.email)) {
					_.set(errors, 'recipients['+index+'].email', 'Invalid')
				}
			})
		}
	}

	if (recipients_mode == 'form') {
		let recipient = _.get(data, 'recipient')
		if (!recipient.first_name){
			_.set(errors, 'recipient.first_name', 'Required')
		}
		/*if (!recipient.last_name){
			_.set(errors, 'recipient.last_name', 'Required')
		}*/
		if (!recipient.email){
			_.set(errors, 'recipient.email', 'Required')
		} else if(!validateEmail(recipient.email)) {
			_.set(errors, 'recipient.email', 'Invalid Email Address')
		}
	}
	return errors
}

@reduxForm({
	form: 'EventInvitationForm',
	fields: [
		'subject',
		'body',
		'ticketTypeID',
		'recipients_mode',
		'recipient.first_name',
		'recipient.last_name',
		'recipient.email',
		'recipient.maxQuantity',
		'recipient.maxUses',
		'recipients[].first_name',
		'recipients[].last_name',
		'recipients[].email',
		'recipients[].maxQuantity',
		'recipients[].maxUses'
	],
	validate: validateForm,
	initialValues: {
		subject: '',
		body: '',
		ticketTypeID: null,
		recipients_mode: 'form',
		recipient: {
			first_name: '',
			last_name: '',
			email: '',
			maxQuantity: 1,
			maxUses: 1
		},
		recipients: []
	}
})
@connect(
	(state) => {
		const col = state.tickets.get('collection')
		const event = state.events.get('selected').toJS()
		const tickets = state.tickets
			.getIn(['byEvent', event.id], Immutable.List())
			.map(tid => col.get(tid))
			.toJS()
		const emailTemplates = state.emailtemplates.get('emailtemplates').toJS().email_templates
		return {
			event,
			tickets,
			emailTemplates
		}
	},
	{FETCH_EVENT_TICKETS, FETCH_EMAIL_TEMPLATES}
)
class EventInvitationForm extends React.Component{
	constructor(props) {
		super(props)

		this.state = {
			loadingEmailTemplates: false,
			emailTemplatesModalOpen: false,
			csvParsing: false,
			csvParseCountAll: 0,
			csvParseCount: 0
		}
	}

	componentDidMount() {
		const {event, FETCH_EVENT_TICKETS} = this.props
		Promise.resolve(FETCH_EVENT_TICKETS(event.id))

		this.fetchEmailTemplates()
	}

	fetchEmailTemplates() {
		const {event, FETCH_EMAIL_TEMPLATES} = this.props
		const loadingSetter = (val) => () => this.setState({loadingEmailTemplates: val})

		Promise.resolve(FETCH_EMAIL_TEMPLATES(event.id))
			.catch(loadingSetter(false))
			.then(loadingSetter(false))
		loadingSetter(true)()
	}

	openCSV() {
		$(this.refs.fileCSV).click()
	}

	importRecipientsCSV(e) {
		let that = this
		const recipients = this.props.fields.recipients

		let len = recipients.length
		for(let i=0; i<len; i++) {
			recipients.removeField(0)
		}

		if(e.target.files[0].type!='application/vnd.ms-excel' && e.target.files[0].type!='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
			this.setState({
				csvParsing: true,
				csvParseCountAll: 0,
				csvParseCount: 0
			})
		
			Papa.parse(e.target.files[0], {
				complete: function(results) {
					let i = 0
					that.setState({csvParseCountAll: results.data.length})
					let addRecipientInterval = setInterval(() => {
						let r = results.data[i]
						recipients.addField({
							first_name: r[0] && r[0].trim(),
							last_name: r[1] && r[1].trim(),
							email: r[2] && r[2].trim(),
							maxQuantity: r[3] && parseInt(r[3].trim()),
							maxUses: r[4] && parseInt(r[4].trim())
						})
						i++
						that.setState({csvParseCount: i})
						if(i==results.data.length) {
							clearInterval(addRecipientInterval)
							that.touchRecipientFields()
							that.setState({csvParsing: false})
						}
					}, 50)
				}
			})
		} else {
			Messenger().post({
				type: 'error',
				message: 'Please upload a CSV file instead of an Excel format file',
				hideAfter: 5,
				showCloseButton: true
			})
		}
		
		$(this.refs.fileCSV).val('')
	}

	touchRecipientFields() {
		let { fields: {recipients}, touch } = this.props
		recipients.forEach((r, index) => {
			touch('recipients['+index+'].first_name',
				'recipients['+index+'].last_name',
				'recipients['+index+'].email',
				'recipients['+index+'].maxQuantity',
				'recipients['+index+'].maxUses')
			recipients[index].first_name.onChange(recipients[index].first_name.value)
			recipients[index].last_name.onChange(recipients[index].last_name.value)
			recipients[index].email.onChange(recipients[index].email.value)
			recipients[index].maxQuantity.onChange(recipients[index].maxQuantity.value)
			recipients[index].maxUses.onChange(recipients[index].maxUses.value)
		})
	}

	deleteRecipient(index) {
		let recipients = this.props.fields.recipients
		recipients.removeField(index)
	}

	openEmailTemplatesModal() {
		this.setState({
			emailTemplatesModalOpen: true
		})
	}

	closeEmailTemplatesModal() {
		this.setState({
			emailTemplatesModalOpen: false
		})
	}

	selectEmailTemplate(template) {
		this.props.fields.subject.onChange(template.subject)
		if(template.body) {
			this.refs.body.setContent(template.body)
		} else if(template.preview_url) {
			$.get(template.preview_url, result => {
				this.refs.body.setContent(result)	
			})
		}
		this.setState({
			emailTemplatesModalOpen: false
		})
	}

	selectRecipientsMode(index) {
		this.props.fields.recipients_mode.onChange(index==1 ? 'form' : 'csv')
	}

	changeMaxQuantity(e, rowIndex) {
		console.log(rowIndex)
		if(rowIndex!=undefined) {
			this.props.fields.recipients[rowIndex].maxQuantity.onChange(e.target.value)
			this.props.fields.recipients[rowIndex].maxUses.onChange(e.target.value)
		} else {
			this.props.fields.recipient.maxQuantity.onChange(e.target.value)
			this.props.fields.recipient.maxUses.onChange(e.target.value)
		}
	}

	render() {
		const {fields: {
			subject, body, ticketTypeID, recipients_mode, recipient, recipients,
		}, submitting, handleSubmit, submitLabel, submitFailed, event, tickets, emailTemplates} = this.props

		const {emailTemplatesModalOpen, loadingEmailTemplates, csvParsing, csvParseCountAll, csvParseCount} = this.state

		let ticketsHidden = tickets.filter((ticket) => ticket.flagHidden)

		return (
			<form ref="form" method="POST" onSubmit={handleSubmit}>
				<Card icon={'fa-envelope'} title={'Message'}>
					<div className="row">
						<div className="col-xs-12 text-right">
							<div className="btn btn-success btn-shadow" onClick={this.openEmailTemplatesModal.bind(this)}>
								Select from Email Templates
							</div>
						</div>
						<div className="col-xs-12">
							<Field id="subject" label="Subject" {...subject} />
						</div>
						<div className="col-xs-12">
							<label className="control-label"><span>Invitation Content</span></label>
							<RichTextArea ref="body" {...body} baseurl={process.env.ADMIN_CDN_URL} />
						</div>
					</div>
				</Card>
				<Card icon={'fa-unlock-alt'} title={'Unlock Registration for Hidden Ticket Type (optional)'}>
					<select className="form-control" {...ticketTypeID}>
						<option value="">Select hidden ticket type</option>
						{_.map(ticketsHidden, (t) => <option key={t.id} value={t.id}>{t.displayName}</option>)}
					</select>
				</Card>
				<Card icon={'fa-users'} title={'Recipients'}>
					<TabView all={false} onSelectTab={this.selectRecipientsMode.bind(this)}>
						<Tab title="Enter Recipient">
							<div className="row">
								<div className="col-sm-6 col-xs-12">
									<Field label="First name" {...recipient.first_name} type="text" id="firstName" />
								</div>
								<div className="col-sm-6 col-xs-12">
									<Field label="Last name" {...recipient.last_name} type="text" id="lastName" />
								</div>
							</div>
							<div className="row">
								<div className="col-sm-6 col-xs-12">
									<Field label="Email" {...recipient.email} type="email" id="email" />
								</div>
							</div>
							<div className="row">
								<div className="col-sm-6 col-xs-12">
									<div className="form-group">
										<label htmlFor="maxQuantity" className="number-dropdown-label">Maximum number of tickets</label>
										<select id="maxQuantity" className="form-control" {...recipient.maxQuantity} onChange={e => this.changeMaxQuantity(e)}>										
											{_.map(new Array(30), (e, i) => <option key={30-i} value={30-i}>{30-i}</option>)}
										</select>
									</div>
								</div>
								<div className="col-sm-6 col-xs-12">
									<div className="form-group">
										<label htmlFor="maxUses" className="number-dropdown-label">Maximum number of transactions</label>
										<select id="maxUses" className="form-control" {...recipient.maxUses}>
											{_.map(new Array(30), (e, i) => <option key={30-i} value={30-i}>{30-i}</option>)}
										</select>
									</div>
								</div>
							</div>
						</Tab>
						<Tab title="Upload Recipients">
							{ submitFailed && recipients.length == 0 && 
								<div className="recipients-error text-danger">You must import at least one recipient.</div>
							}
							<div className="row">
								<div className="col-sm-10 col-xs-12">
									Recipients (CSV file with first name, last name, email address, max tickets and max transactions columns and no header row)
								</div>
								<div className="col-sm-2 col-xs-12 text-right">
									<div className="btn btn-success btn-shadow btn-importcsv" onClick={this.openCSV.bind(this)}>
										<i className="fa fa-upload" aria-hidden="true"></i> Add from CSV
									</div>
								</div>
							</div>
							<input type="file" accept=".csv" onChange={this.importRecipientsCSV.bind(this)} ref="fileCSV" className="file-csv" />
							<div className="recipients">
								<table className="table recipients-table">
									<thead>
										<tr>
											<th>First Name</th>
											<th>Last Name</th>
											<th>Email</th>
											<th>Maximum number of tickets</th>
											<th>Maximum number of transactions</th>
											<th></th>
										</tr>
									</thead>
									<tbody>
										{ csvParsing &&
											<tr>
												<td colSpan="6" className="text-center">
													<i className="fa fa-circle-o-notch fa-fw fa-spin" />&nbsp;&nbsp;Loaded {csvParseCount} of {csvParseCountAll}
												</td>
											</tr>
										}
										{ !csvParsing && recipients && recipients.map((recip, index) => (
											<tr key={index}>
												<td><Field {...recip.first_name} type="text" id="firstName" /></td>
												<td><Field {...recip.last_name} type="text" id="lastName" /></td>
												<td><Field {...recip.email} type="text" id="email" /></td>
												<td>
													<select id="maxQuantity" className="form-control" {...recip.maxQuantity} onChange={e =>  this.changeMaxQuantity(e, index)}>
														{_.map(new Array(30), (e, i) => <option key={30-i} value={30-i}>{30-i}</option>)}
													</select>
												</td>
												<td>
													<select id="maxUses" className="form-control" {...recip.maxUses}>
														{_.map(new Array(30), (e, i) => <option key={30-i} value={30-i}>{30-i}</option>)}
													</select>
												</td>
												<td>
													<div className="delete-recipient" onClick={this.deleteRecipient.bind(this, index)}><i className="fa fa-trash" aria-hidden="true"></i></div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
							{ (!recipients || recipients.length==0) && 
								<div className="addnew-msg">Please Add New Recipients</div>
							}
						</Tab>
					</TabView>
				</Card>
				<div className="row text-center">
					<Button className="btn btn-success btn-lg btn-shadow btn-send" type="submit" disabled={submitting} loading={submitting}>{submitLabel || <span><i className="fa fa-paper-plane" aria-hidden="true"></i> Send </span>}</Button>
				</div>
				<Modal
					className="modal-dialog modal-trans"
					style={modalStyle}
					isOpen={!!emailTemplatesModalOpen}
					contentLabel="Modal"
					onRequestClose={::this.closeEmailTemplatesModal}
					closeTimeoutMS={150}
				>
					<div className="modal-dialog">
						<div className="modal-content">
							<div>
								<div className="modal-header">
									<p className="h4 text-compact">Select Email Template</p>
								</div>
								<div className="modal-body">
									<div className="emailtemplates-table-container">
									<div className="email-template-containter">
										<div className="email-tempalate-title clearfix">
											<span className="template-left-side">Name and Description</span>
												<span className="template-right-side mobile-template-action">Action</span>
										</div>



									<div className="email-template-content">
										{ !loadingEmailTemplates && emailTemplates && emailTemplates.map((template, index) => (
										<div key={index} className-="clearfix">
										<div className="template-list">
										<span className="template-left-side">
										<div><b className="template-subtitle">Name:</b>{ template.name }</div>
										<div><b className="template-subtitle">Subject</b>{ template.subject }</div>
										<div><b className="template-subtitle">Description:</b>{ template.description }</div>
										</span>
										<span className="template-right-side clearfix">
										<span className="btn btn-primary btn-shadow select-template-btn" onClick={this.selectEmailTemplate.bind(this, template)}>Select</span>
										</span>
										</div>
										</div>
										))}
									</div>
											</div>
												</div>
								</div>
								<div className="modal-footer">
									<div className="btn-toolbar btn-toolbar-right">
										<Button className="btn btn-default" type="button" onClick={::this.closeEmailTemplatesModal}>Cancel</Button>
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


class ExistingInvitations extends React.Component{
	constructor(props) {
		super(props)
	}

	validateData(data, index){
		return data
	}

	getFilteredRows(rows, search){
		let rows_filtered = rows
		
		// filter by search
		let keyword = search.join('').trim().toLowerCase()
		if(keyword != ''){
			rows_filtered = _.filter(rows_filtered, (item) => {
				let found = 0
				found += IS_FOUND(item.first_name + ' ' + item.last_name, keyword)
				found += IS_FOUND(item.email, keyword)
				found += IS_FOUND(item.invited_by_first_name + ' ' + item.invited_by_last_name, keyword)
				found += IS_FOUND(item.status, keyword)
				return found > 0
			})
		}
		return rows_filtered
	}

	getSortedRows(rows_filtered, sort){
		if(sort){
			let dir = sort.asc ? 'asc' : 'desc'
			switch(sort.index){
				case 0:
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return t.first_name+' '+t.last_name}, dir)
					break
				case 1:
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return t.email}, dir)
					break
				case 2:
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return t.invited_by_first_name+' '+t.invited_by_last_name}, dir)
					break
				case 3:
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return t.status}, dir)
					break
			}
		}
		return rows_filtered
	}

	getTableData(datatable, rows_filtered, sort){
		let clipboard_text = this.getClipboardText(rows_filtered)
		let clipboard = datatable.getClipboardColumn(datatable, clipboard_text)

		let content_header = datatable.getHeaderRow(datatable, [
			{title: 'Name', sort: true},
			{title: 'Email', sort: true},
			{title: 'Invited By', sort: true},
			{title: 'Status', sort: true},
			{title: clipboard, sort: false, className: 'column-clipboard'},
		], sort)

		return (rows_filtered.length != 0) ? (
			<table className="table invitations-table">
				<thead>
					{content_header}
				</thead>
				<tbody>
				{
					rows_filtered.map((row, index) => (
						<tr key={index}>
							<td>{row.first_name + ' ' + row.last_name}</td>
							<td>{row.email}</td>
							<td>{row.invited_by_first_name + ' ' + row.invited_by_last_name}</td>
							<td>{row.status}</td>
							<td></td>
						</tr>
					))
				}
				</tbody>
			</table>
		): (
			<EmptyBar/>
		)
	}

	getClipboardText(rows_filtered){
		let ret = ''
		ret += 'Name' + '\t' + 'Email' + '\t' + 'Invited By' + '\t' + 'Status' + '\n'
		_.map(rows_filtered, (t)=>{
			ret += (t.first_name + ' ' + t.last_name) + '\t' + 
				t.email + '\t' + 
				(t.invited_by_first_name + ' ' + t.invited_by_last_name) + '\t' + 
				t.status + '\n'
		})
		return ret
	}

	render() {
		const {event} = this.props

		return (
			<div className="existing-invitations">
				<Card icon={'fa-users'} title={'Recipients'}>
					<JSONDatatable 							
						type={TYPE_FROM_URL}
						data={{url: `/api/events/${event.id}/relationships/invitations/`, node: 'data.invitations.*'}}
						validateData={::this.validateData}
						getFilteredRows={::this.getFilteredRows}
						getSortedRows={::this.getSortedRows}
						getTableData={::this.getTableData}
						getClipboardText={::this.getClipboardText}
						usePagination={false}
						loadingBarTitle={'Hold tight! We\'re getting your event\'s invitations...'}
						autoRefresh={20 * 1000}
					>				
						<div ref={SEARCHBAR} hasSearch labelTotalCount="Number of Matching Invitations" />
						<div ref={DATATABLE}/>
					</JSONDatatable>
				</Card>
			</div>
		)
	}
}