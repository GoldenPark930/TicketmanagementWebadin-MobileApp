import React from 'react'
import _ from 'lodash'
import Card from '../../_library/Card'
import EmptyBar from '../../_library/EmptyBar'
import {JSONDatatable, IS_FOUND, SEARCHBAR, DATATABLE, PAGINATIONBAR, TYPE_FROM_URL} from '../../_library/JSONDatatable'

export default class PerformanceCharges extends React.Component {
	getFilteredRows(rows, search){		
		let rows_filtered = rows
		
		// filter by search
		let keyword = search.join('').trim().toLowerCase()
		if(keyword != ''){
			rows_filtered = _.filter(rows_filtered, (item) => {
				let found = 0
				found += IS_FOUND(item.short_description, keyword)
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
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return t.short_description}, dir)
					break
				case 1:
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return t.quantity}, dir)
					break
				case 2:
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return t.gross_charge}, dir)
					break
				case 3:
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return t.net_charge}, dir)
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
			{title: 'Charge Description', sort: false},
			{title: 'Quantity', sort: false},
			{title: 'Gross Charge', sort: false},
			{title: 'Net Charge', sort: false},
			{title: clipboard, sort: false, className: 'column-clipboard'},
		], sort)

		const {event} = this.props
		let currency = getCurrencySymbol(event)

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
								<td>{row.short_description}</td>
								<td>{row.quantity}</td>
								<td>{currency}{parseFloat(row.gross_amount).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
								<td>{currency}{parseFloat(row.net_amount).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
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
		ret += 'Charge Description' + '\t' + 'Quantity' + '\t' + 'Gross Charge' + '\t' + 'Net Charge' + '\n'
		_.map(rows_filtered, (t)=>{
			ret += t.short_description + '\t' + 
				t.quantity + '\t' + 
				parseFloat(t.gross_amount).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + '\t' +
				parseFloat(t.net_amount).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + '\n'
		})
		return ret
	}

	render() {
		const {event, isSelected} = this.props
		return (
			<div>
				<JSONDatatable 
					type={TYPE_FROM_URL}
					data={{url: `/api/events/${event.id}/relationships/performance/`, param:{'section': 'charges'}, node: 'data.charges.*'}}
					sort={{index: 1, asc: false}}
					getFilteredRows={::this.getFilteredRows}
					getSortedRows={::this.getSortedRows}
					getTableData={::this.getTableData}
					getClipboardText={::this.getClipboardText}
					usePagination={true}
					autoRefresh={20 * 1000}
					loadingBarTitle={'Hold tight! We\'re getting your event\'s charges...'}
				>
					<div ref={DATATABLE}/> 
				</JSONDatatable>
			</div>				
		)
	}
}