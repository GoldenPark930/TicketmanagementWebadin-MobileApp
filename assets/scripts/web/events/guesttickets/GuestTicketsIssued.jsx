import _ from 'lodash'
import Immutable from 'immutable'
import React from 'react'
import {connect} from 'react-redux'
import Modal from 'react-modal'

import {JSONDatatable, SEARCHBAR, DATATABLE, PAGINATIONBAR, TYPE_FROM_URL, IS_FOUND} from '../../_library/JSONDatatable'
import EmptyBar from '../../_library/EmptyBar'

@connect(
	(state) => {
		return {
		}
	}
)
export default class GuestTicketsIssued extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
		}
	}

	componentDidMount() {

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
				found += IS_FOUND(item.status)
				found += IS_FOUND(item.order_datetime, keyword)
				found += IS_FOUND(item.issued_by_first_name + ' ' + item.issued_by_last_name, keyword)
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
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return t.first_name + ' ' + t.last_name}, dir)
					break
				case 1:
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return t.email}, dir)
					break
				case 3:
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return t.order_datetime}, dir)
					break
				case 4:
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return t.issued_by_first_name + ' ' + t.issued_by_last_name}, dir)
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
			{title: 'Status', sort: false},
			{title: 'Issued On', sort: true},
			{title: 'Issued By', sort: true},
			{title: clipboard, sort: false, className: 'column-clipboard'},
		], sort)

		let camalize = (str) => {
			let ret = str.toLowerCase()
			return ret.replace(/\b[a-z]/g,function(f){return f.toUpperCase()})
		}

		return (rows_filtered.length != 0) ? (
			<table className="table guest-tickets-issued-table">
				<thead>
					{content_header}
				</thead>
				<tbody>
				{
					rows_filtered.map((row, index) => (
						<tr key={index}>
							<td>{row.first_name + ' ' + row.last_name}</td>
							<td>{row.email}</td>
							<td>{camalize(row.status)}</td>
							<td>{row.order_datetime}</td>
							<td>{row.issued_by_first_name + ' ' + row.issued_by_last_name}</td>
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
		let camalize = (str) => {
			let ret = str.toLowerCase()
			return ret.replace(/\b[a-z]/g,function(f){return f.toUpperCase()})
		}

		let ret = ''
		ret += 'Name' + '\t' + 'Email' + '\t' + 'Status' + '\t' + 'Issued On' + '\t' + 'Issued By' + '\n'
		_.map(rows_filtered, (t)=>{
			ret += (t.first_name + ' ' + t.last_name) + '\t' + 
				t.email + '\t' + 
				camalize(t.status) + '\t' + 
				t.order_datetime + '\t' +
				(t.issued_by_first_name + ' ' + t.issued_by_last_name) + '\n'
		})
		return ret
	}

	render() {
		const {event} = this.props

		return (
			<div className="guest-tickets-issued">
				<JSONDatatable 
					type={TYPE_FROM_URL}
					data={{url: `/api/events/${event.id}/relationships/guest_tickets/`, node: 'data.guest_tickets.*'}}
					sort={{index: 2, asc: false}}
					getFilteredRows={::this.getFilteredRows}
					getSortedRows={::this.getSortedRows}
					getTableData={::this.getTableData}
					getClipboardText={::this.getClipboardText}
					usePagination={false}
					autoRefresh={20 * 1000}
					loadingBarTitle={'Hold tight! We\'re getting your event\'s guest tickets...'}
				>
					<div ref={SEARCHBAR} hasSearch labelTotalCount="Number of Matching Tickets" />
					<div ref={DATATABLE}/> 
				</JSONDatatable>
			</div>
		)
	}
}