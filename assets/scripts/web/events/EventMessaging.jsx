import _ from 'lodash'
import Immutable from 'immutable'
import React from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router'
import {routeActions} from 'react-router-redux'
import Modal from 'react-modal'

import Button from '../_library/Button'
import modalStyle from '../../_common/core/modalStyle'
import Card from '../_library/Card'
import EmailToTicketHolders from './messaging/EmailToTicketHolders'
import Mailchimp from './messaging/Mailchimp'
import EmailTemplates from './messaging/EmailTemplates'
import SentEmails from './messaging/SentEmails'
import {EMAIL_TICKET_HOLDERS} from '../../_common/redux/mailchimp/actions'

@withRouter
@connect(
  (state) => {
	const event = state.events.get('selected').toJS()
	return {
	  event
	}
  },
  {EMAIL_TICKET_HOLDERS, push: routeActions.push}
)
export default class EventMessaging extends React.Component{
	constructor(props) {
		super(props)
		form_helper_reset()
		this.state = {
			hasEdittedFields: false,
			nextLocation: null
		}
		this.mounted = false
	}

	componentDidMount() {
		Messenger.options = {
		  extraClasses: 'messenger-fixed messenger-on-bottom messenger-on-right',
		  theme: 'future'
		}
		const {event} = this.props
		document.title = `Messaging - ${event.displayName} - The Ticket Fairy Dashboard`
		this.props.router.setRouteLeaveHook(this.props.route, this.routerWillLeave.bind(this))
		this.mounted = true
	}

	componentWillUnmount(){
		form_helper_reset()
		this.mounted = false
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
		if(this.mounted && form_helper_isEditted()){
			this.setState({
				hasEdittedFields: true,
				nextLocation: nextLocation.pathname
			})
			return false
		}
	}

	sendEmailToTicketHolders(form) {
		const {event, EMAIL_TICKET_HOLDERS} = this.props
		let filteredBody = this.filterMediumEditor()
		let filteredToSelected = form.toSelected.replace(/,\s*$/, '')

		form.toSelected = form.toAll ? [] : filteredToSelected.split(',')
		form.body = filteredBody

		return Promise.resolve(EMAIL_TICKET_HOLDERS(event.id, form))
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
			  message: 'Successfully sent!',
			  hideAfter: 3,
			  showCloseButton: true
			})
			return v
		  })
	}

	filterMediumEditor(){}
	receiveMediumEditor(func) {
		this.filterMediumEditor = func
	}

	render() {
		const {event} = this.props

		const {hasEdittedFields} = this.state
		let contentEdittedFields = null
		if(hasEdittedFields){
			contentEdittedFields = _.map(form_helper_get(), (field, index)=>{
				let field_title = ''
				switch(field){
					case 'subject':
						field_title = 'Contact Ticket Holders - Subject'
						break
					case 'body':
						field_title = 'Contact Ticket Holders - Body'
						break
					case 'toAll':
						field_title = 'Contact Ticket Holders - All ticket holders'
						break
					case 'toSelected':
						field_title = 'Contact Ticket Holders - Ticket Types'
						break
					case 'name':
						field_title = 'Email Template - Name'
						break
					case 'description':
						field_title = 'Email Template - Description'
						break
					case 'subject':
						field_title = 'Email Template - Subject'
						break
					case 'body':
						field_title = 'Email Template - Body'
						break
					case 'zip':
						field_title = 'Email Template - Zip'
						break
					default:
						field_title = field
						break
				}
				return (
					<div key={index}><i className="fa fa-info-circle" aria-hidden="true"></i>  {field_title}</div>
				)
			})
		}

		return (
			<div className="EventMessaging">
				<Card title={'Contact Ticket Holders'}>
					<EmailToTicketHolders filterMediumEditor={this.receiveMediumEditor.bind(this)} onSubmit={::this.sendEmailToTicketHolders}/>
				</Card>
				<Card title={'Sent Emails'}>						
					<SentEmails event={event} />
				</Card>
				<EmailTemplates />
				<div className="mail_chipbg"></div>
				<Card title={'MailChimp Integration'}>						
					<Mailchimp/>
				</Card>
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