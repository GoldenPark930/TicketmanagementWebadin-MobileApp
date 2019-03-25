import React from 'react'
import _ from 'lodash'
import Card from '../../_library/Card'
import EmptyBar from '../../_library/EmptyBar'
import {JSONDatatable, IS_FOUND, SEARCHBAR, DATATABLE, PAGINATIONBAR, TYPE_FROM_URL} from '../../_library/JSONDatatable'

export default class PerformanceWaitingList extends React.Component {
	getFilteredRows(rows, search){		
		let rows_filtered = rows
		
		// filter by search
		let keyword = search.join('').trim().toLowerCase()
		if(keyword != ''){
			rows_filtered = _.filter(rows_filtered, (item) => {
				let found = 0
				found += IS_FOUND(item.first_name + ' ' + item.last_name, keyword)
				found += IS_FOUND(item.email, keyword)
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
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return (t.firstName + ' ' + t.lastName).trim().toLowerCase()}, dir)
					break				
				case 1:
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return parseInt(t.quantityRequested)}, dir)
					break
				case 2:
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return t.email.trim().toLowerCase()}, dir)
					break
				case 3:
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return t.status}, dir)
					break
				default:
					break
			}
		}
		return rows_filtered
	}

	getCSVData(rows_filtered){
		let data = [], newRow = []
		// add header
		newRow.push('First Name')
		newRow.push('Last Name')
		newRow.push('Quantity Requested')
		newRow.push('Email Address')
		newRow.push('Status')

		data.push(newRow)

		// add body
		_.map(rows_filtered, (t, index)=>{
			newRow = []
			newRow.push(t.firstName)
			newRow.push(t.lastName)
			newRow.push(t.quantityRequested)
			newRow.push(t.email)
			newRow.push(t.status)
			data.push(newRow)
		})
		return data
	}

	getTableData(datatable, rows_filtered, sort, totalCount){
		let clipboard_text = this.getClipboardText(rows_filtered)
		let clipboard = datatable.getClipboardColumn(datatable, clipboard_text)

		let content_header = datatable.getHeaderRow(datatable, [
			{title: 'Name', sort: true},
			{title: 'Quantity Requested', sort: true},
			{title: 'Email Address', sort: true},
			{title: 'Status', sort: true},
			{title: clipboard, sort: false, className: 'column-clipboard'},
		], sort)

		const {event} = this.props
		const rows = datatable.state.rows

		let camalize = (str) => {
			let ret = str.toLowerCase()
			return ret.replace(/\b[a-z]/g,function(f){return f.toUpperCase()})
		}

		let totalWaiting = 0
		
		rows.map((row, index) => {
			totalWaiting += parseInt(row.quantityRequested)
		})

		return (rows_filtered.length != 0) ? (
			<table className="table tickets-table">
				<thead>
					{content_header}
				</thead>
				<tbody>
				{
					rows_filtered.map((row, index) => {
						return (
							<tr key={index} className={index % 2== 0 ? 'row-stale' : ''}>
								<td>{row.firstName} {row.lastName}</td>
								<td>{row.quantityRequested}</td>
								<td>{row.email}</td>
								<td>{camalize(row.status)}</td>
								<td></td>
							</tr>
						)
					})
				}
				</tbody>
				<tfoot>
					<tr>
						<td><strong>Total:</strong></td>
						<td>{totalWaiting}</td>
						<td></td>
						<td></td>
						<td></td>
					</tr>
				</tfoot>
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
		ret += 'Name' + '\t' + 'Quantity Requested' + '\t' + 'Email Address' + '\t' + 'Status' + '\n'
		_.map(rows_filtered, (t)=>{
			ret += (t.firstName + ' ' + t.lastName) + '\t' + 
				t.quantityRequested + '\t' + 
				t.email + '\t' +
				camalize(t.status) + '\n'
		})
		return ret
	}

	render() {
		const {event, isSelected} = this.props
		return (
			<div>
				<JSONDatatable 
					type={TYPE_FROM_URL}
					data={{url: `/api/events/${event.id}/relationships/performance/`, param:{'section': 'waiting_list'}, node: 'data.waiting_list.*'}}
					sort={{index: 0, asc: true}}
					getFilteredRows={::this.getFilteredRows}
					getSortedRows={::this.getSortedRows}
					getTableData={::this.getTableData}
					getCSVData={::this.getCSVData}
					getClipboardText={::this.getClipboardText}
					usePagination={true}
					autoRefresh={20 * 1000}
					loadingBarTitle={'Hold tight! We\'re getting your event\'s waiting list...'}
				>
					<div ref={SEARCHBAR} hasSearch labelTotalCount="Number of Matching Waiting List Members" />
					<div ref={DATATABLE}/> 
					<div ref={PAGINATIONBAR} hasCSVExport csvFileName={`performance_waitinglist_${event.id}.csv`}/>
				</JSONDatatable>
			</div>				
		)
	}
}