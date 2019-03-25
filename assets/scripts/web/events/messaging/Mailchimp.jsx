import _ from 'lodash'
import Immutable from 'immutable'
import React from 'react'
import {connect} from 'react-redux'
import {reduxForm} from 'redux-form'
import {FETCH_MC_LISTS, CONNECT_TO_MAILCHIMP} from '../../../_common/redux/mailchimp/actions'
import {UPDATE_EVENT} from '../../../_common/redux/events/actions'

import Button from '../../_library/Button'
import LoadingBar from '../../_library/LoadingBar'
import EmptyBar from '../../_library/EmptyBar'

const STATE_STATUS_INIT = 0
const STATE_STATUS_LOADING = 1
const STATE_STATUS_LOADING_SUCCESSED = 2
const STATE_STATUS_CONNECTING_SUCCESSED = 22
const STATE_STATUS_LOADING_FAILED = 3
@connect(
	(state) => {
	const event = state.events.get('selected').toJS()
	const mailchimp = state.mailchimp.get('mailchimp').toJS()
	const redirect_uri = state.mailchimp.get('redirect_uri').toJS()
	const navigation = state.navigation.toJS()
	return {
		event,
		mailchimp,
		redirect_uri,
		navigation
	}
	},
	{FETCH_MC_LISTS, CONNECT_TO_MAILCHIMP, UPDATE_EVENT}
)
export default class Mailchimp extends React.Component{
	constructor(props) {
		super(props)
		this.state = {status: STATE_STATUS_INIT}
	}

	componentDidMount() {
		const {event, FETCH_MC_LISTS} = this.props
		const loadingSetter = (val) => () =>{
			this.setState({status: val})		
		}
		Promise.resolve(FETCH_MC_LISTS(event.id))
			.catch(loadingSetter(STATE_STATUS_LOADING_FAILED))
			.then(loadingSetter(STATE_STATUS_LOADING_SUCCESSED))
		loadingSetter(STATE_STATUS_LOADING)()
	}

	connectToMailchimp() {		
		const {event, CONNECT_TO_MAILCHIMP, navigation} = this.props
		const loadingSetter = (val) => () =>{
			this.setState({status: val})		
		}
		Promise.resolve(CONNECT_TO_MAILCHIMP(event.id, 'event', window.location.href))
			.catch(loadingSetter(STATE_STATUS_LOADING_FAILED))
			.then(loadingSetter(STATE_STATUS_CONNECTING_SUCCESSED))
		loadingSetter(STATE_STATUS_LOADING)()
	}

	useList(id) {
		const {event, UPDATE_EVENT} = this.props
		const loadingSetter = (val) => () =>{
			this.setState({status: val})		
		}
		Promise.resolve(UPDATE_EVENT(event.id, {
				attributes: {
					mailChimpListId: id	
				}				
			}))
			.catch(loadingSetter(STATE_STATUS_LOADING_FAILED))
			.then(loadingSetter(STATE_STATUS_LOADING_SUCCESSED))
		loadingSetter(STATE_STATUS_LOADING)()
	}

	render() {
		const {status} = this.state
		const {mailchimp, event, redirect_uri} = this.props
		const {flagMailChimpConnected, mailChimpListId} = event.$original.attributes

		if(status == STATE_STATUS_CONNECTING_SUCCESSED){
			this.setState({status: STATE_STATUS_INIT})
			window.location = redirect_uri.redirect_uri
		}	

		let self = this
		let content = null
		let content_connect = 
			<div className="row">
				<div className="col-xs-12 text-center">
					<Button className="btn btn-primary btn-shadow" 
					 type="button" disabled={status == STATE_STATUS_LOADING}
					 onClick={::this.connectToMailchimp}>
						{status == STATE_STATUS_LOADING && <i className="fa fa-circle-o-notch fa-fw fa-spin" />}
						{status != STATE_STATUS_LOADING && <div>Connect To MailChimp</div>}
					</Button>
				</div>
			</div>

		if(flagMailChimpConnected){
			let lists = []
			if(mailchimp && mailchimp.mailchimp_lists){
				// const getSortedJSON = (unsorted) => {
				// 	const sorted = unsorted.slice()
				// 	sorted.sort((a,b) => {
				// 		return (parseInt(a.revenue_generated) < parseInt(b.revenue_generated)) ? 1 : ((parseInt(b.revenue_generated) < parseInt(a.revenue_generated)) ? -1 : 0)
				// 	})
				// 	return sorted
				// }
				lists = mailchimp.mailchimp_lists.lists//getSortedJSON(mailchimp.mailchimp_lists.lists)
			}
			let number = 0
			let rows_list = _.map(lists, function(m, index){
				return (
					<tr key={index} className={number++ % 2 == 0 ? 'row-stale' : ''}>
						<td>{m.name}</td>
						<td>{m.id}</td>
						<td>
							{m.id != mailChimpListId && 
								<Button className="btn btn-seablue btn-shadow" type="button" disabled={status == STATE_STATUS_LOADING} onClick={self.useList.bind(self, m.id)}>
									{status != STATE_STATUS_LOADING && <span><i className="fa fa-check" /> Use this</span>}
									{status == STATE_STATUS_LOADING && <i className="fa fa-circle-o-notch fa-fw fa-spin" />}
								</Button>
							}
							{m.id == mailChimpListId &&
								<div><i className="fa fa-check using-this-list-check" aria-hidden="true" /> Using this list</div>							
							}
						</td>
					</tr>
					)
			})

			content = 
				<div className="mailchimp-lists-table">
					<table>
						<thead>
							<tr>
								<th>List Name</th>
								<th>ID</th>
								<th>Action</th>
							</tr>
						</thead>
						<tbody>
							{rows_list}
						</tbody>
					</table>
				</div>
		}
		

		return (
			<div className="Mailchimp">		
				{!flagMailChimpConnected && content_connect}	
				{content}
			</div>
		)
	}
}