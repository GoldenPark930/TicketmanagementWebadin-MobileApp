import _ from 'lodash'
import Immutable from 'immutable'
import React from 'react'
import {connect} from 'react-redux'
import {reduxForm} from 'redux-form'
import Modal from 'react-modal'
import Card from '../../_library/Card'
import Field from '../../_library/Field'
import Button from '../../_library/Button'
import RichTextArea from '../../_library/RichTextArea'
import modalStyle from '../../../_common/core/modalStyle'
import {Tab, TabView} from '../../_library/TabView'
import FileUploader from '../../_library/FileUploader'
import {FETCH_EMAIL_TEMPLATES, CREATE_EMAIL_TEMPLATE, UPDATE_EMAIL_TEMPLATE} from '../../../_common/redux/emailtemplates/actions'
import {JSONDatatable, SEARCHBAR, DATATABLE, PAGINATIONBAR, TYPE_FROM_URL, TYPE_FROM_ARRAY} from '../../_library/JSONDatatable'
import EmptyBar from '../../_library/EmptyBar'
import LoadingBar from '../../_Library/LoadingBar'

const getInitialLetters = str => {
	return str.split(' ').reduce((result, word) => result + word.substr(0,1), '')
}

function validateForm(data) {
	const errors = {}
	return errors
}

@connect(
	(state) => {
		const event = state.events.get('selected').toJS()
		const emailTemplates = state.emailtemplates.get('emailtemplates').toJS().email_templates
		return {
			event,
			emailTemplates
		}
	},
	{FETCH_EMAIL_TEMPLATES, CREATE_EMAIL_TEMPLATE, UPDATE_EMAIL_TEMPLATE}
)
export default class EmailTemplates extends React.Component{
	constructor(props) {
		super(props)
		this.state = {
			loadingEmailTemplates: false,
			previewTemplateContentModalOpen: false,
			templatePreviewed: null,
			editTemplateModalOpen: false,
			templateEdited: null,
			confirmModalOpen: false,
			confirmModalMessage: '',
			confirmCallback: null,
			showNewTemplate: false
		}
	}

	componentDidMount() {
		this.fetchEmailTemplates()
	}

	componentWillReceiveProps(nextProps) {

	}

	fetchEmailTemplates() {
		const {event, FETCH_EMAIL_TEMPLATES} = this.props
		const loadingSetter = (val) => () => this.setState({loadingEmailTemplates: val})

		Promise.resolve(FETCH_EMAIL_TEMPLATES(event.id))
			.catch(loadingSetter(false))
			.then(loadingSetter(false))
		loadingSetter(true)()
	}

	validateData(data, index){
		return data
	}

	getFilteredRows(rows, search){
		return rows
	}

	getSortedRows(rows_filtered, sort){
		if(sort){
			let dir = sort.asc ? 'asc' : 'desc'
			switch(sort.index){
				case 0:
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return t.name}, dir)
					break
				case 1:
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return t.description}, dir)
					break
				case 2:
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return t.subject}, dir)
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
			{title: 'Description', sort: true},
			{title: 'Subject', sort: true},
			{title: clipboard, sort: false, className: 'column-clipboard'}
		], sort)

		return (rows_filtered.length != 0) ? (
			<table className="table emailtemplates-table">
				<thead>
					{content_header}
				</thead>
				<tbody>
				{
					rows_filtered.map((row) => (
						<EmailTemplateRow
							key={row.id}
							template={row}
							previewContent={this.previewTemplateContent.bind(this, row)}
							enable={this.enableTemplate.bind(this, row)}
							disable={this.disableTemplate.bind(this, row)}
							confirm={this.openConfirmModal.bind(this)}
							edit = {this.editTemplate.bind(this, row)}
						/>
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
		ret += 'Name' + '\t' + 'Description' + '\t' + 'Subject' + '\n'
		_.map(rows_filtered, (t)=>{
			ret += t.name + '\t' + 
				t.description + '\t' +
				t.subject + '\n'
		})
		return ret
	}

	previewTemplateContent(template) {
		this.setState({
			previewTemplateContentModalOpen: true,
			templatePreviewed: template
		})
	}

	closePreviewTemplateContentModal() {
		this.setState({
			previewTemplateContentModalOpen: false
		})
	}

	enableTemplate(template) {
		const {event, UPDATE_EMAIL_TEMPLATE} = this.props

		let form = JSON.parse(JSON.stringify(template))
		form.enabled = '1'

		return Promise.resolve(UPDATE_EMAIL_TEMPLATE(template.id, event.id, form))
			.catch((err) => {
				Messenger().post({
					type: 'error',
					message: err,
					hideAfter: 3,
					showCloseButton: true
				})
				return Promise.reject(_.result(err, 'message', err))
			})
			.then((v)=>{
				Messenger().post({
					type: 'success',
					message: 'Successfully enabled!',
					hideAfter: 3,
					showCloseButton: true
				})
				return v
			})
	}

	disableTemplate(template) {
		const {event, UPDATE_EMAIL_TEMPLATE} = this.props

		let form = JSON.parse(JSON.stringify(template))
		form.enabled = '0'

		return Promise.resolve(UPDATE_EMAIL_TEMPLATE(template.id, event.id, form))
			.catch((err) => {
				Messenger().post({
					type: 'error',
					message: err,
					hideAfter: 3,
					showCloseButton: true
				})
				return Promise.reject(_.result(err, 'message', err))
			})
			.then((v)=>{
				Messenger().post({
					type: 'success',
					message: 'Successfully disabled!',
					hideAfter: 3,
					showCloseButton: true
				})
				return v
			})
	}

	editTemplate(template) {
		this.setState({
			editTemplateModalOpen: true,
			templateEdited: template
		})
	}

	closeEditTemplateModal() {
		this.setState({
			editTemplateModalOpen: false
		})
	}

	updateTemplate(form) {
		if(form.content_mode=='zip') {
			delete form.body
		}
		if(form.content_mode=='body'){
			delete form.zip
			form.body = this.exposedMethodEdit()
		}
		delete form.content_mode

		const {event, UPDATE_EMAIL_TEMPLATE} = this.props

		return Promise.resolve(UPDATE_EMAIL_TEMPLATE(form.id, event.id, form))
			.catch((err) => {
				Messenger().post({
					type: 'error',
					message: err,
					hideAfter: 3,
					showCloseButton: true
				})
				return Promise.reject(_.result(err, 'toFieldErrors', err))
			})
			.then((v)=>{
				Messenger().post({
					type: 'success',
					message: 'Successfully updated!',
					hideAfter: 3,
					showCloseButton: true
				})
				this.closeEditTemplateModal()
				this.fetchEmailTemplates()
				return v
			})
	}

	showNewTemplateSection() {
		this.setState({
			showNewTemplate: true
		})
	}

	createTemplate(form) {
		if(form.content_mode=='zip') {
			delete form.body
		}
		if(form.content_mode=='body'){
			delete form.zip
			form.body = this.exposedMethodNew()
		}
		delete form.content_mode

		const {event, CREATE_EMAIL_TEMPLATE} = this.props
		return Promise.resolve(CREATE_EMAIL_TEMPLATE(event.id, form))
			.catch((err) => {
				Messenger().post({
					type: 'error',
					message: err,
					hideAfter: 3,
					showCloseButton: true
				})
				this.setState({
					showNewTemplate: false
				})
				return Promise.reject(_.result(err, 'toFieldErrors', err))
			})
			.then((v)=>{
				Messenger().post({
					type: 'success',
					message: 'Successfully created!',
					hideAfter: 3,
					showCloseButton: true
				})
				this.setState({
					showNewTemplate: false
				})
				this.fetchEmailTemplates()
				return v
			})
	}

	openConfirmModal(message, callback) {
		this.setState({
			confirmModalOpen: true,
			confirmModalMessage: message,
			confirmCallback: callback
		})
	}

	closeConfirmModal() {
		this.setState({
			confirmModalOpen: false
		})
	}

	confirmInConfirmModal() {
		this.state.confirmCallback()
		this.closeConfirmModal()
	}

	receiveExposedMethodNew(exposedMethod) {
		this.exposedMethodNew = exposedMethod
	}
	exposedMethodNew(){}

	receiveExposedMethodEdit(exposedMethod) {
		this.exposedMethodEdit = exposedMethod
	}
	exposedMethodEdit(){}

	render() {
		const {loadingEmailTemplates, previewTemplateContentModalOpen, templatePreviewed, editTemplateModalOpen, templateEdited, showNewTemplate, confirmModalOpen, confirmModalMessage, confirmCallback} = this.state
		const {event, emailTemplates} = this.props

		return (
			<div className="EmailTemplates">
				<Card title={'Email Templates'}>
					{ loadingEmailTemplates &&
						<LoadingBar key='loadingbar' title={"Hold tight! We\'re getting your event\'s email templates..."} />
					}
					{ !loadingEmailTemplates && 
					<JSONDatatable 
						type={TYPE_FROM_ARRAY}
						data={emailTemplates}
						validateData={::this.validateData}
						getFilteredRows={::this.getFilteredRows}
						getSortedRows={::this.getSortedRows}
						getTableData={::this.getTableData}
						getClipboardText={::this.getClipboardText}
						usePagination={false}
						loadingBarTitle={'Hold tight! We\'re getting your event\'s email templates...'}
					>
						<div ref={DATATABLE}/> 
					</JSONDatatable> }
				</Card>
				{ !showNewTemplate &&
					<div className="btn btn-primary btn-shadow btn-shownewtemplate" onClick={this.showNewTemplateSection.bind(this)}>
						Add New Template
					</div>
				}
				{ showNewTemplate &&
					<Card title={'New Template'}>
						<NewEmailTemplateForm
							onSubmit={::this.createTemplate}
							getExposedMethod={this.receiveExposedMethodNew.bind(this)}
						/>
					</Card>
				}
				<Modal
					className="modal-dialog modal-trans"
					style={modalStyle}
					isOpen={!!previewTemplateContentModalOpen}
					contentLabel="Modal"
					onRequestClose={::this.closePreviewTemplateContentModal}
					closeTimeoutMS={150}
				>
					<div className="modal-dialog">
						<div className="modal-content">
							<div>
								<div className="modal-header">
									<p className="h4 text-compact">Email Template Content</p>
								</div>
								<div className="template-content-preview">
									{ templatePreviewed && templatePreviewed.body && 
									<div dangerouslySetInnerHTML={{ __html: templatePreviewed.body }} />
									}
									{ templatePreviewed && templatePreviewed.preview_url &&
									<iframe src={templatePreviewed.preview_url} width="100%" height="400px" frameBorder="0" />
									}
								</div>
								<div className="modal-footer">
									<div className="btn-toolbar btn-toolbar-right">
										<Button className="btn btn-default" type="button" onClick={::this.closePreviewTemplateContentModal}>Close</Button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</Modal>
				<Modal
					className="modal-dialog modal-trans"
					style={modalStyle}
					isOpen={!!editTemplateModalOpen}
					contentLabel="Modal"
					onRequestClose={::this.closeEditTemplateModal}
					closeTimeoutMS={150}
				>
					<div className="modal-dialog">
						<div className="modal-content">
							<div>
								<div className="modal-header">
									<p className="h4 text-compact">Edit Template</p>
								</div>
								<div className="emailtemplate-edit-modal">
									{templateEdited &&
									<EditEmailTemplateForm
										initialValues={{
											id: templateEdited.id,
											name: templateEdited.name,
											description: templateEdited.description,
											subject: templateEdited.subject,
											body: templateEdited.body,
											zip: templateEdited.preview_url,
											content_mode: templateEdited.body ? 'body' : 'zip'
										}}
										onSubmit={::this.updateTemplate}
										onCancel={::this.closeEditTemplateModal}
										getExposedMethod={this.receiveExposedMethodEdit.bind(this)}
									/>
									}
								</div>
							</div>
						</div>
					</div>
				</Modal>
				<Modal
					className="modal-dialog modal-trans"
					style={modalStyle}
					isOpen={!!confirmModalOpen}
          			contentLabel="Modal"
					onRequestClose={::this.closeConfirmModal}
					closeTimeoutMS={150}>
					<div className="modal-dialog">
						<div className="modal-content">
							<div>
								<div className="modal-header">
									<p className="h4 text-compact">Are you sure?</p>
								</div>
								<div className="modal-body">
									<p>{ confirmModalMessage }</p>
								</div>
								<div className="modal-footer">
									<div className="btn-toolbar btn-toolbar-right">
										<Button
											className="btn btn-danger btn-shadow"
											type="button"
											onClick={::this.confirmInConfirmModal}>Yes</Button>
										<Button
											className="btn btn-cancel btn-shadow" type="button"
											onClick={::this.closeConfirmModal}>No</Button>
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

class EmailTemplateRow extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			template: props.template,
			enabling: false,
			disabling: false
		}
	}

	componentWillReceiveProps(nextProps) {
		if(JSON.stringify(this.props.template)!=JSON.stringify(nextProps.template)){
			this.setState({
				template: nextProps.template,
				enabling: false,
				disabling: false
			})
		}
	}

	previewContent() {
		this.props.previewContent()
	}

	confirmEnable() {
		this.props.confirm('Please confirm that you want to enable this email template.', this.enable.bind(this))
	}

	enable() {
		this.makeEnabling()
		this.props.enable()
			.then((v) => {
				this.clearEnabling()
				let {template} = this.state
				template.enabled = '1'
				this.setState({
					template: template
				})
			})
			.catch((err) => {
				this.clearEnabling()
			})
	}

	makeEnabling() {
		this.setState({
			enabling: true
		})
	}

	clearEnabling() {
		this.setState({
			enabling: false
		})
	}

	confirmDisable() {
		this.props.confirm('Please confirm that you want to disable this email template.', this.disable.bind(this))
	}

	disable() {
		this.makeDisabling()
		this.props.disable()
			.then((v) => {
				this.clearDisabling()
				let {template} = this.state
				template.enabled = '0'
				this.setState({
					template: template
				})
			})
			.catch((err) => {
				this.clearDisabling()
			})
	}

	makeDisabling() {
		this.setState({
			disabling: true
		})
	}

	clearDisabling() {
		this.setState({
			disabling: false
		})
	}

	edit() {
		this.props.edit()
	}

	render() {
		const {template, enabling, disabling} = this.state

		return(
			<tr>
				<td>{template.name}</td>
				<td>{template.description}</td>
				<td>{template.subject}</td>
				<td className="text-right">

					<Button className="btn btn-blue btn-shadow" onClick={this.previewContent.bind(this)}>
						<i className="fa fa-tags" aria-hidden="true"></i>Preview
					</Button>
					{template.enabled == '1' && 
					<Button className="btn btn-danger btn-shadow" onClick={this.confirmDisable.bind(this)} disabled={disabling}>
						<i className="fa fa-minus-circle" aria-hidden="true"></i>Disable {disabling && <i className="fa fa-circle-o-notch fa-fw fa-spin" />}
					</Button>
					}
					{template.enabled == '0' && 
					<Button className="btn btn-success btn-shadow" onClick={this.confirmEnable.bind(this)} disabled={enabling}>
						<i className="fa fa-check-circle" aria-hidden="true"></i>Enable {enabling && <i className="fa fa-circle-o-notch fa-fw fa-spin" />}
					</Button>
					}
					<Button className="btn btn-default btn-shadow" onClick={this.edit.bind(this)}>
						<i className="fa fa-pencil" aria-hidden="true"></i>Edit
					</Button>
				</td>
			</tr>
		)
	}
}

@reduxForm({
	form: 'NewEmailTemplateForm',
	fields: [
		'name',
		'description',
		'subject',
		'body',
		'zip',
		'content_mode'
	],
	validate: (data) => {
		const errors = {}
		if (!_.get(data, 'name')){
			_.set(errors, 'name', 'Required')
		}
		if (!_.get(data, 'subject')){
			_.set(errors, 'subject', 'Required')
		}
		if (_.get(data, 'content_mode')=='body') {
			if (!_.get(data, 'body')){
				_.set(errors, 'body', 'Required')
			}
		}
		if (_.get(data, 'content_mode')=='zip') {
			if (!_.get(data, 'zip')){
				_.set(errors, 'zip', 'Required')
			}
		}
		return errors
	},
	initialValues: {
		name: '',
		description: '',
		subject: '',
		body: '',
		zip: null,
		content_mode: 'body'
	}
})
@connect(
	(state) => {
		return {
		}
	},
	{}
)
class NewEmailTemplateForm  extends React.Component{
	constructor(props) {
		super(props)
	}

	componentDidMount(){
		if (typeof this.props.getExposedMethod === 'function') {
			this.props.getExposedMethod(this.exposedMethod.bind(this))
		}
	}

	onContentModeSelect(index) {
		const {fields: {
			content_mode
		}} = this.props
		content_mode.onChange(index==1?'body':'zip')
	}

	processSubmit(){
		const {handleSubmit} = this.props
		handleSubmit()
	}

	exposedMethod(){
		const {handleSubmit, fields:{body}} = this.props
		let filtered = this.refs.body.editor.serialize().emailtemplate_body.value
		if(filtered == '<p><br></p>' || filtered == '<p class="medium-insert-active"><br></p>'){
			return ''
		}
		return filtered
	}

	render() {
		const {fields: {
			name, description, subject, body, zip
		}, submitting, handleSubmit, submitLabel, submitFailed} = this.props

		return (
			<form ref="form" method="POST" onSubmit={handleSubmit}>
				<div className="emailtemplate-new">
					<div className="row">
						<div className="col-xs-12">
							<Field id="emailtemplate-name" label="Name" {...name} />
						</div>
					</div>
					<div className="row">
						<div className="col-xs-12">
							<Field id="emailtemplate-description" label="Description" {...description} />
						</div>
					</div>
					<div className="row">
						<div className="col-xs-12">
							<Field id="emailtemplate-subject" label="Subject" {...subject} />
						</div>
					</div>
					<div className="row">
						<div className="col-xs-12 template-content">
							<TabView all={false} onSelectTab={this.onContentModeSelect.bind(this)}>
								<Tab title="Enter Content">
									{ submitFailed && body.error && 
										<div className="text-danger">This field is required</div>
									}
									<RichTextArea ref="body" id="emailtemplate_body" {...body} disableEmbeds={true} baseurl={process.env.ADMIN_CDN_URL} />
								</Tab>
								<Tab title="Upload Zipped Content">
									{ submitFailed && zip.error && 
										<div className="text-danger">Please select zip file</div>
									}
									<p>Your zip file should contain an index.html file with an optional images folder</p>
									<FileUploader label="Add Zip File" filetype="archive" {...zip} />
								</Tab>
							</TabView>
						</div>
					</div>
					<div className="row">
						<div className="col-xs-12 text-center">
							<Button className="btn btn-success btn-lg btn-shadow" type="button" disabled={submitting} loading={submitting} onClick={::this.processSubmit}>{submitLabel || <span><i className="fa fa-paper-plane" aria-hidden="true"></i> Create</span>}</Button>
						</div>
					</div>
				</div>
			</form>
		)
	}
}


@reduxForm({
	form: 'EditEmailTemplateForm',
	fields: [
		'id',
		'name',
		'description',
		'subject',
		'body',
		'zip',
		'content_mode'
	],
	validate: (data) => {
		const errors = {}
		if (!_.get(data, 'name')){
			_.set(errors, 'name', 'Required')
		}
		if (!_.get(data, 'subject')){
			_.set(errors, 'subject', 'Required')
		}
		if (_.get(data, 'content_mode')=='body') {
			if (!_.get(data, 'body')){
				_.set(errors, 'body', 'Required')
			}
		}
		if (_.get(data, 'content_mode')=='zip') {
			if (!_.get(data, 'zip')){
				_.set(errors, 'zip', 'Required')
			}
		}
		return errors
	},
	initialValues: {
		id: '',
		name: '',
		description: '',
		subject: '',
		body: '',
		zip: null,
		content_mode: 'body'
	}
})
@connect(
	(state) => {
		return {
		}
	},
	{}
)
class EditEmailTemplateForm  extends React.Component{
	constructor(props) {
		super(props)

		if (typeof props.getExposedMethod === 'function') {
			props.getExposedMethod(this.exposedMethod.bind(this))
		}
	}

	onContentModeSelect(index) {
		const {fields: {
			content_mode
		}} = this.props
		content_mode.onChange(index==1?'body':'zip')
	}

	componentDidMount() {
		this.refs.tabview.selectIndex(this.props.fields.content_mode.initialValue=='body'?1:2)
	}

	processSubmit() {
		this.props.handleSubmit()
	}

	processCancel() {
		this.props.onCancel()
	}

	exposedMethod(){
		const {handleSubmit, fields:{body}} = this.props
		let filtered = this.refs.body.editor.serialize().emailtemplate_body.value
		if(filtered == '<p><br></p>' || filtered == '<p class="medium-insert-active"><br></p>'){
			return ''
		}
		return filtered
	}

	render() {
		const {fields: {
			name, description, subject, body, zip
		}, submitting, handleSubmit, submitLabel, submitFailed} = this.props

		return (
			<form ref="form" method="POST" onSubmit={handleSubmit}>
				<div className="emailtemplate-edit">
					<div className="row">
						<div className="col-xs-12">
							<Field id="emailtemplate-name" label="Name" {...name} />
						</div>
					</div>
					<div className="row">
						<div className="col-xs-12">
							<Field id="emailtemplate-description" label="Description" {...description} />
						</div>
					</div>
					<div className="row">
						<div className="col-xs-12">
							<Field id="emailtemplate-subject" label="Subject" {...subject} />
						</div>
					</div>
					<div className="row">
						<div className="col-xs-12 template-content">
							<TabView ref="tabview" all={false} onSelectTab={this.onContentModeSelect.bind(this)}>
								<Tab title="Enter Content">
									{ submitFailed && body.error && 
										<div className="text-danger">This field is required</div>
									}
									<RichTextArea ref="body" id="emailtemplate_body" {...body} disableEmbeds={true} baseurl={process.env.ADMIN_CDN_URL} />
								</Tab>
								<Tab title="Upload Zipped Content">
									{ submitFailed && zip.error && 
										<div className="text-danger">Please select zip file</div>
									}
									<p>Your zip file should contain an index.html file with an optional images folder</p>
									<div className="zip-path">{zip.value}</div>
									<FileUploader label="Add Zip File" filetype="archive" {...zip} />
								</Tab>
							</TabView>
						</div>
					</div>
					<div className="row">
						<div className="col-xs-12 text-center">
							<Button className="btn btn-success btn-shadow" type="button" disabled={submitting} loading={submitting} onClick={::this.processSubmit}>{submitLabel || <span><i className="fa fa-paper-plane" aria-hidden="true"></i> Save</span>}</Button>
							<Button className="btn btn-default btn-shadow" type="button" onClick={::this.processCancel}>Cancel</Button>
						</div>
					</div>
				</div>
			</form>
		)
	}
}