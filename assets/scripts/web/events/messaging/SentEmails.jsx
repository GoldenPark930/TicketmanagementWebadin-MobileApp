import _ from 'lodash'
import Immutable from 'immutable'
import React from 'react'
import {connect} from 'react-redux'
import Modal from 'react-modal'

import {JSONDatatable, SEARCHBAR, DATATABLE, PAGINATIONBAR, TYPE_FROM_URL, TYPE_FROM_ARRAY} from '../../_library/JSONDatatable'
import EmptyBar from '../../_library/EmptyBar'
import modalStyle from '../../../_common/core/modalStyle'
import Button from '../../_library/Button'

@connect(
	(state) => {
		return {
		}
	}
)
export default class SentEmails extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			contentModalOpen: false,
			recipientsModalOpen: false,
			mailoutDisplayed: null
		}
	}

	componentDidMount() {

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
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return t.subject}, dir)
					break
				case 1:
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return t.sent_by_first_name + ' ' + t.sent_by_last_name}, dir)
					break
				case 2:
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return JSON.parse(t.recipients).length}, dir)
					break
			}
		}
		return rows_filtered
	}

	getTableData(datatable, rows_filtered, sort){
		let clipboard_text = this.getClipboardText(rows_filtered)
		let clipboard = datatable.getClipboardColumn(datatable, clipboard_text)

		let content_header = datatable.getHeaderRow(datatable, [
			{title: 'Subject', sort: true},
			{title: 'Sent By', sort: true},
			{title: 'No of Recipients', sort: true},
			{title: clipboard, sort: false, className: 'column-clipboard'}
		], sort)

		return (rows_filtered.length != 0) ? (
			<table className="table sentemails-table">
				<thead>
					{content_header}
				</thead>
				<tbody>
				{
					rows_filtered.map((row) => (
						<tr key={row.id}>
							<td>{row.subject}</td>
							<td>{row.sent_by_first_name} {row.sent_by_last_name}</td>
							<td>{JSON.parse(row.recipients).length}</td>
							<td className="text-right">
								<div className="btn btn-blue btn-shadow" onClick={this.showContentModal.bind(this, row)}>
									<i className="fa fa-file-text" aria-hidden="true"></i>Show Content
								</div>
								<div className="btn btn-default btn-shadow" onClick={this.showRecipientsModal.bind(this, row)}>
									<i className="fa fa-users" aria-hidden="true"></i>Show Recipients
								</div>
							</td>
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
		ret += 'Subject' + '\t' + 'Sent By' + '\t' + 'No of Recipients' + '\n'
		_.map(rows_filtered, (t)=>{
			ret += t.subject + '\t' + 
				(t.sent_by_first_name + ' ' + t.sent_by_last_name) + '\t' +
				(JSON.parse(t.recipients).length) + '\n'
		})
		return ret
	}

	showContentModal(mailout) {
		this.setState({
			contentModalOpen: true,
			mailoutDisplayed: mailout
		})
	}

	closeContentModal() {
		this.setState({
			contentModalOpen: false
		})
	}

	showRecipientsModal(mailout) {
		this.setState({
			recipientsModalOpen: true,
			mailoutDisplayed: mailout
		})
	}

	closeRecipientsModal() {
		this.setState({
			recipientsModalOpen: false
		})
	}

	validateMailoutRecipientsData(data, index){
		return data
	}

	getFilteredMailoutRecipientsRows(rows, search){
		return rows
	}

	getSortedMailoutRecipientsRows(rows_filtered, sort){
		if(sort){
			let dir = sort.asc ? 'asc' : 'desc'
			switch(sort.index){
				case 0:
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return t.billing_first_name}, dir)
					break
				case 1:
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return t.billing_last_name}, dir)
					break
				case 2:
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return t.email}, dir)
					break
			}
		}
		return rows_filtered
	}

	getMailoutRecipientsTableData(datatable, rows_filtered, sort){
		let content_header = datatable.getHeaderRow(datatable, [
			{title: 'First Name', sort: true},
			{title: 'Last Name', sort: true},
			{title: 'Email', sort: true}
		], sort)

		return (rows_filtered.length != 0) ? (
			<table className="table mailout-recipients-table">
				<thead>
					{content_header}
				</thead>
				<tbody>
				{
					rows_filtered.map((row) => (
						<tr key={row.id}>
							<td>{row.billing_first_name}</td>
							<td>{row.billing_last_name}</td>
							<td>{row.email}</td>
						</tr>
					))
				}
				</tbody>
			</table>
		): (
			<EmptyBar/>
		)
	}

	render() {
		const {contentModalOpen, recipientsModalOpen, mailoutDisplayed} = this.state
		const {event} = this.props

		return (
			<div className="SentEmails">
				<JSONDatatable 
					type={TYPE_FROM_URL}
					data={{url: `/api/events/${event.id}/relationships/mailouts/`, node: 'data.mailouts.*'}}
					sort={{index: 0, asc: false}}
					validateData={::this.validateData}
					getFilteredRows={::this.getFilteredRows}
					getSortedRows={::this.getSortedRows}
					getTableData={::this.getTableData}
					getClipboardText={::this.getClipboardText}
					usePagination={false}
					loadingBarTitle={'Hold tight! We\'re getting your event\'s sent emails...'}
				>
					<div ref={DATATABLE}/> 
				</JSONDatatable>
				<Modal
					className="modal-dialog modal-trans"
					style={modalStyle}
					isOpen={!!contentModalOpen}
					contentLabel="Modal"
					onRequestClose={::this.closeContentModal}
					closeTimeoutMS={150}
				>
					<div className="modal-dialog">
						<div className="modal-content">
							<div>
								<div className="modal-header">
									<p className="h4 text-compact">Content of Sent Email</p>
								</div>
								<div className="mailout-content-preview">
									<div dangerouslySetInnerHTML={{ __html: mailoutDisplayed && mailoutDisplayed.body }} />
								</div>
								<div className="modal-footer">
									<div className="btn-toolbar btn-toolbar-right">
										<Button className="btn btn-default" type="button" onClick={::this.closeContentModal}>Close</Button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</Modal>
				<Modal
					className="modal-dialog modal-trans"
					style={modalStyle}
					isOpen={!!recipientsModalOpen}
					contentLabel="Modal"
					onRequestClose={::this.closeRecipientsModal}
					closeTimeoutMS={150}
				>
					<div className="modal-dialog">
						<div className="modal-content">
							<div>
								<div className="modal-header">
									<p className="h4 text-compact">Recipients of Sent Email</p>
								</div>
								<div className="mailout-recipients-preview">
									{mailoutDisplayed && 
										<JSONDatatable
											type={TYPE_FROM_ARRAY}
											data={JSON.parse(mailoutDisplayed.recipients)}
											sort={{index: 0, asc: true}}
											validateData={::this.validateMailoutRecipientsData}
											getFilteredRows={::this.getFilteredMailoutRecipientsRows}
											getSortedRows={::this.getSortedMailoutRecipientsRows}
											getTableData={::this.getMailoutRecipientsTableData}
											usePagination={true}
											paginationPageSize={10}
										>
											<div ref={DATATABLE}/> 
											<div ref={PAGINATIONBAR}/>
										</JSONDatatable>
									}
								</div>
								<div className="modal-footer">
									<div className="btn-toolbar btn-toolbar-right">
										<Button className="btn btn-default" type="button" onClick={::this.closeRecipientsModal}>Close</Button>
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