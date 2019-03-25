import React from 'react'
import _ from 'lodash'
import Card from '../../_library/Card'
import EmptyBar from '../../_library/EmptyBar'
import {JSONDatatable, IS_FOUND, SEARCHBAR, DATATABLE, PAGINATIONBAR, TYPE_FROM_URL} from '../../_library/JSONDatatable'

export default class PerformanceResale extends React.Component {
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
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return t.first_name + ' ' + t.last_name}, dir)
					break
				case 1:
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return t.ticket_hash}, dir)
					break
				case 2:
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return t.status}, dir)
					break
				default:
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
			{title: 'Ticket ID', sort: true},
			{title: 'Status', sort: true},
			{title: clipboard, sort: false, className: 'column-clipboard'},
		], sort)

		const {event} = this.props
		
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
								<td>{row.first_name} {row.last_name}</td>
								<td>{row.ticket_hash.toUpperCase()}</td>
								<td>{row.status}</td>
								<td></td>
							</tr>
						)
					})
				}
				</tbody>
			</table>
		): (
			<EmptyBar/>
		)
	}

	getClipboardText(rows_filtered){
		let ret = ''
		ret += 'Name' + '\t' + 'Ticket ID' + '\t' + 'Status' + '\n'
		_.map(rows_filtered, (t)=>{
			ret += (t.first_name + ' ' + t.last_name) + '\t' + 
				t.ticket_hash.toUpperCase() + '\t' + 
				t.status + '\n'
		})
		return ret
	}

	render() {
		const {event, isSelected} = this.props
		return (
			<div>
				<JSONDatatable 
					type={TYPE_FROM_URL}
					data={{url: `/api/events/${event.id}/relationships/performance/`, param:{'section': 'resale'}, node: 'data.resale.*'}}
					sort={{index: 0, asc: true}}
					getFilteredRows={::this.getFilteredRows}
					getSortedRows={::this.getSortedRows}
					getTableData={::this.getTableData}
					getClipboardText={::this.getClipboardText}
					usePagination={true}
					autoRefresh={20 * 1000}
					loadingBarTitle={'Hold tight! We\'re getting your event\'s resale list...'}
				>
					<div ref={SEARCHBAR} hasSearch labelTotalCount="Number of Matching Tickets" />
					<div ref={DATATABLE}/> 
					<div ref={PAGINATIONBAR}/>
				</JSONDatatable>
			</div>				
		)
	}
}