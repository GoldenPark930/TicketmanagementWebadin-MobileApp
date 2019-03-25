import _ from 'lodash'
import Immutable from 'immutable'
import React from 'react'
import {connect} from 'react-redux'
import {reduxForm} from 'redux-form'
import Modal from 'react-modal'
import modalStyle from '../../../_common/core/modalStyle'
import Field from '../../_library/Field'
import Button from '../../_library/Button'
import RichTextArea from '../../_library/RichTextArea'
import {FETCH_EVENT_TICKETS} from '../../../_common/redux/tickets/actions'
import {FETCH_EMAIL_TEMPLATES} from '../../../_common/redux/emailtemplates/actions'

function validateForm(data) {
	const errors = {}
	if (!_.get(data, 'subject')){
    _.set(errors, 'subject', 'Required')
  }
	return errors
}

@reduxForm({
	form: 'EmailToTicketHolders',
	fields: [
		'subject',
		'body',
		'toAll',
		'toSelected',
	],
	validate: validateForm,
	initialValues: {
		subject: '',
		toAll: true,
		toSelected: '', // id1,id2,id3...
	}
})
@connect(
	(state) => {
		const event = state.events.get('selected').toJS()
		const col = state.tickets.get('collection')
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
export default class EmailToTicketHolders extends React.Component{
	constructor(props) {
		super(props)
		this.state = {
			toAll_selected: true,
			loadingTickets: false,
			loadingEmailTemplates: false,
			emailTemplatesModalOpen: false
		}
	}

	componentDidMount() {
		if (typeof this.props.filterMediumEditor === 'function') {
			this.props.filterMediumEditor(this.exposedMethod.bind(this))
		}
		const {fields: {
			subject
		}, event, FETCH_EVENT_TICKETS} = this.props
		if(subject.value == null){
			subject.onChange('Message to attendees of '+ event.displayName)
		}
		const loadingSetter = (val) => () => this.setState({loadingTickets: val})
		Promise.resolve(FETCH_EVENT_TICKETS(event.id))
			.catch(loadingSetter(false))
			.then(loadingSetter(false))
		loadingSetter(true)()

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

	exposedMethod(){
		const {handleSubmit, fields:{body}} = this.props
		let filtered = this.refs.body.editor.serialize().rtebody.value
		if(filtered == '<p><br></p>' || filtered == '<p class="medium-insert-active"><br></p>'){
			return ''
		}	 
		return filtered
	}

	onChange_recipient(e){
		let toAll_isChecked = e.target.id == 'toAll'		
		const {fields: {toAll}} = this.props
		this.setState({toAll_selected: toAll_isChecked})
		toAll.onChange(toAll_isChecked)
	}

	onChange_ticket(e){
		const {fields: {toSelected}} = this.props
		let strToSelected = toSelected.value
		let id = e.target.id
		let checked = e.target.checked
		// firstly, remove from the list
		var removed = strToSelected.replace(id + ',' , '')
		if (checked) {
			removed = removed + id + ','
		}
		toSelected.onChange(removed)
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

	processSubmit(form, e){

	}

	render() {
		const {toAll_selected, loadingTickets, emailTemplatesModalOpen, loadingEmailTemplates} = this.state
		const {fields: {
			subject, body, toAll, toSelected
		}, event, tickets, submitting, handleSubmit, submitLabel, emailTemplates} = this.props
		let selectTickets = _.map(tickets, (t, index) => {
			return (
				<div key={index} className="line ticket">
					<div className="line-cell">
						<input type="checkbox" id={t.id} name={t.id} onChange={::this.onChange_ticket}/>
						<label htmlFor={t.id}></label>
					</div>
					<div className="line-cell" style={{paddingLeft: 10}}>
						<label htmlFor={t.id}>{t.displayName}</label>
					</div>
				</div>
			)
		})

		return (
			<form ref="form" method="POST" onSubmit={handleSubmit}>
				<div className="EmailToTicketHolders">
					<div className="row">
						<div className="col-xs-12 text-right">
							<div className="btn btn-success btn-shadow" onClick={this.openEmailTemplatesModal.bind(this)}>
								Select from Email Templates
							</div>
						</div>
					</div>
					<div className="row">
						<div className="col-xs-12">
							<Field id="subject" label="Subject" {...subject}/>
						</div>
					</div>
					<div className="row" style={{marginBottom: 10}}>
						<div className="col-xs-4 col-12 padding-bottom10 recipient">
							<input type="radio" id="toAll" name="radioBtns" checked={toAll_selected} onChange={::this.onChange_recipient}/>
							<label htmlFor="toAll">All ticket holders</label>
						</div>
						<div className="col-xs-8 col-12 recipient">
							<input type="radio" id="toSelected" name="radioBtns" checked={!toAll_selected} onChange={::this.onChange_recipient}/>
							<label htmlFor="toSelected">Choose ticket types</label>
							<div>
								&nbsp;&nbsp;{loadingTickets && <i className="fa fa-circle-o-notch fa-fw fa-spin" />}
							</div>
						</div>
						<div className={'col-xs-8 col-12 tickets ' + (!toAll_selected ? 'show' : '')}>
							{selectTickets}
						</div>
					</div>
					<div className="row">
						<div className="col-xs-12">
							Body
						</div>
						<div className="col-xs-12">
							<RichTextArea ref="body" id="rtebody" disableEmbeds={true} {...body} baseurl={process.env.ADMIN_CDN_URL} />
						</div>
					</div>
					<div className="row text-center">
						<Button
							className="btn btn-success btn-lg btn-shadow" type="submit" disabled={submitting} loading={submitting}>{submitLabel || <span><i className="fa fa-paper-plane" aria-hidden="true"></i> Send</span>}</Button>
					</div>
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
										<table className="table emailtemplates-table">
											<thead>
												<tr>
													<th>Name</th>
													<th>Description</th>
													<th>Subject</th>
													<th>Action</th>
												</tr>
											</thead>
											<tbody>
												{ !loadingEmailTemplates && emailTemplates && emailTemplates.map((template, index) => (
													<tr key={index}>
														<td>{ template.name }</td>
														<td>{ template.description }</td>
														<td>{ template.subject }</td>
														<td>
															<div className="btn btn-primary btn-shadow" onClick={this.selectEmailTemplate.bind(this, template)}>Select</div>
														</td>
													</tr>
												))}
											</tbody>
										</table>
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