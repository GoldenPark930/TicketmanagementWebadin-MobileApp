import _ from 'lodash'
import Modal from 'react-modal'
import React from 'react'
import classNames from 'classnames'
import {Link} from 'react-router'
import {connect} from 'react-redux'

import modalStyle from '../../_common/core/modalStyle'
import Notifications from '../_library/notifications/Notifications'
import Button from '../_library/Button'
import EmptyBar from '../_library/EmptyBar'
import LoadingBar from '../_library/LoadingBar'
import {FETCH_EVENTS, UPDATE_EVENT} from '../../_common/redux/events/actions'
import {FETCH_PUBLISH_STATUS} from '../../_common/redux/publishing/actions'
import EventRow from './_library/EventRow'

import {
	JSONDatatable, 
	TYPE_FROM_ARRAY,
	SEARCHBAR, DATATABLE, PAGINATIONBAR, 
	IS_FOUND, DOWNLOAD_CSV
} from '../_library/JSONDatatable'

@connect(
	(store) => ({
		loading: store.loading.has('FETCH_EVENTS'),
		error: store.events.get('errors').has('FETCH_EVENTS'),
		events: store.events.get('events').toList().toJS(),
		publishing: store.publishing.get('events').toJS(),
		uid: store.auth.getIn(['user', 'id'])
	}),
	{FETCH_EVENTS, UPDATE_EVENT, FETCH_PUBLISH_STATUS}
)
export default class EventsPage extends React.Component {
	constructor(props) {
		super(props)
		this.fetchEvents = false
		this.state = {
			loading: {},
			showConfirmModal: false,
			isPublish: false,
			selectedEvent: null,
		}
		document.title = `Events - The Ticket Fairy Dashboard`
	}
	componentDidMount() {
		if(this.props.events.length == 0){
			this.fetchEvents = true
			this.props.FETCH_EVENTS()
		}else{			
			this.fetchEvents = false
		}		
	}
	componentDidUpdate(prevProps) {
		const pid = prevProps.uid
		const nid = this.props.uid
		if (pid !== nid && nid) { this.props.FETCH_EVENTS() }
	}

	handlePublishEvent(event, force) {
		const {UPDATE_EVENT} = this.props
		return UPDATE_EVENT(event.id, {attributes: {status: 'published'}})
	}

	handleUnpublishEvent(event) {
		const {UPDATE_EVENT} = this.props
		return UPDATE_EVENT(event.id, {attributes: {status: 'unpublished'}})
	}

	getFilteredRows(rows, search){
		const isFound = (value, keyword) => {
			if(!value)
				return 0
			return value.toLowerCase().indexOf(keyword) != -1 ? 1 : 0
		}
		let rows_filtered = rows
		let keyword = search.join('').trim().toLowerCase()
		if(keyword != ''){
			rows_filtered = _.filter(rows_filtered, (item) => {
				let found = 0
				found += isFound(item.displayName, keyword)
				if(item.venue){
					found += isFound(item.venue.displayName, keyword)
					found += isFound(item.venue.city, keyword)
				}				
				if(item.$relationships.owner.displayName) {
					found += isFound(item.$relationships.owner.displayName, keyword)
				}
				return found > 0
			})
		}
		return rows_filtered
	}

	handlePublish(event) {
		this.setState({showConfirmModal: true, selectedEvent: event, isPublish: true})
	}

	handleUnpublish(event) {
		this.setState({showConfirmModal: true, selectedEvent: event, isPublish: false})
	}

	hideConfirmModal(){
		this.setState({showConfirmModal: false})
	}

	processEvent(){
		const {selectedEvent, isPublish} = this.state

		const loadingSetter = (val) => () => this.setState({loading: {...this.state.loading, [selectedEvent.id]: val}})
		loadingSetter(true)()

		if(isPublish){
			Promise.resolve(this.handlePublishEvent(selectedEvent))
				.catch(loadingSetter(false))
				.then(loadingSetter(false))	
		} else {
			Promise.resolve(this.handleUnpublishEvent(selectedEvent))
				.catch(loadingSetter(false))
				.then(loadingSetter(false))
		}
		
		this.setState({showConfirmModal: false})
	}

	getSortedRows(rows_filtered, sort){
		rows_filtered = _.orderBy(rows_filtered, (t)=>{return t.startDate}, 'desc')
		return rows_filtered
	}

	getTableData(datatable, rows_filtered, sort){
		const {showConfirmModal, isPublish} = this.state
		let self = this
		const rows = rows_filtered.map(event => {
			const {id, status, slug} = event
			const previewKey = event.$original.previewKey
			const published = status === 'published'
			const loading = !!self.state.loading[id]

			let permission = !!event ? event.$relationships.self.role : ''			
			let redirectPath = '/performance'

			if (permission === 'onsite'){
				redirectPath = '/details'
			}
			if (permission === 'curator'){
				redirectPath = '/invitations'				
			}
			const isAdmin = permission === 'admin'
			
			return (
				<EventRow key={id} event={event} autoRefresh={30*1000}>
					<div className="btn-toolbar">
						<Link className="btn btn-blue event-button-sm" to={'/event/' + event.id + redirectPath}> <i className="fa fa-cog" />Manage Event</Link>
						{!!published && <Link className="btn btn-seablue event-button-sm" type="button" to={'https://www.theticketfairy.com/event/' + slug + '/'} target='_blank'><i className="fa fa-ticket" />View Page</Link>}
						{!published && isAdmin && previewKey && <Link className="btn btn-seablue event-button-sm" type="button" to={'https://www.theticketfairy.com/event/' + slug + '/?pk=' + previewKey} target='_blank'><i className="fa fa-ticket" />Preview Page</Link>}
						{!published && isAdmin && <Button className="btn btn-ok event-button-sm" type="button"
							onClick={self.handlePublish.bind(self, event)} loading={loading}><i className="fa fa-check-circle-o" />
							Publish
						</Button>}
						{!!published && isAdmin && <Button className="btn btn-danger event-button-sm" type="button"
							onClick={self.handleUnpublish.bind(self, event)} loading={loading}><i className="fa fa-dot-circle-o" />
							Unpublish
						</Button>}			 
					</div>
				</EventRow>
			)
		})

		return (rows_filtered.length != 0) ? (
			<div className='events-table'>
				<Modal
					className="modal-dialog modal-trans"
					style={modalStyle}
					isOpen={!!showConfirmModal}
					contentLabel="Modal"
					onRequestClose={::self.hideConfirmModal}
					closeTimeoutMS={150}>
					<div className="modal-dialog">
						<div className="modal-content">
							<div>
								<div className="modal-header">
									<p className="h4 text-compact">Are you sure?</p>
								</div>
								<div className="modal-body">
									<p>Please confirm that you want to {isPublish ? 'publish' : 'unpublish'} this event?</p>
								</div>
								<div className="modal-footer">
									<div className="btn-toolbar btn-toolbar-right">
										<Button
											className="btn btn-danger btn-shadow"
											type="button"
											onClick={::self.processEvent}>Yes</Button>
										<Button
											className="btn btn-cancel btn-shadow" type="button"
											onClick={::self.hideConfirmModal}>No</Button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</Modal>
				<div className="table-responsive">
					<table>
						<thead>
							<tr>
								<th>
									<div className="clearfix">
										<div className="eventslist-thumbstitle">Event Details</div>
										<div className="eventslist-actions eventsgrid-title">Event Status</div>
									</div>
								</th>
							</tr>
						</thead>
						<tbody>
							{rows}
						</tbody>
						{false && <tfoot>
							<tr>
								<td colSpan="2">
									<Button className="btn btn-default btn-block">Load more</Button>
								</td>
							</tr>
						</tfoot>}
					</table>
				</div>
			</div>
		): (
			<EmptyBar/>
		)

	}


	render() {
		if(this.fetchEvents && this.props.events.length > 0){
			this.fetchEvents = false
		}		
		return (
			<div className='body-main'> 
				<Notifications />
				<div>
					<div className='body-panel-header'>
						<div className='left'>
							<div className='title'>Events</div>
						</div>
						<div className='right'>
							<Link className="btn btn-success btn-shadow" to="/events/new">
								<i className="fa fa-fw fa-plus" /> Create Event
							</Link>
						</div>
					</div>
					<div className='body-panel-spacing'/>
					<div className='body-panel-content'>
						{this.fetchEvents && <LoadingBar title={'Hold tight! We\'re getting your event list...'} />}
						{!this.fetchEvents &&
							<JSONDatatable 
								ref='JSONDatatable'
								type={TYPE_FROM_ARRAY}
								data={this.props.events}
								getSortedRows={::this.getSortedRows}
								getFilteredRows={::this.getFilteredRows}
								getTableData={::this.getTableData}
								usePagination={true}
								paginationPageSize={50}
								loadingBarTitle={'Hold tight! We\'re getting your event list...'}
								saveSearchKey={'EventsPage'}
							>
								{/* It can give additional className to SEARCHBAR, DATATABLE, PAGINATIONBAR by specifying className="XXX" */}
								<div ref={SEARCHBAR} hasSearch autoFocus triggerScroll labelTotalCount="Number of Matching Events" />
								<div ref={DATATABLE}/> 
								<div ref={PAGINATIONBAR}/>
							</JSONDatatable>
						}
					</div>
				</div> 
			</div>
		)
	}
}