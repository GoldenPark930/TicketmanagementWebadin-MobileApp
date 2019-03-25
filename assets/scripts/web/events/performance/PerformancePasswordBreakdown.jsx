import React from 'react'
import _ from 'lodash'
import Card from '../../_library/Card'
import EmptyBar from '../../_library/EmptyBar'
import {JSONDatatable, SEARCHBAR, DATATABLE, PAGINATIONBAR, TYPE_FROM_URL} from '../../_library/JSONDatatable'

export default class PerformancePasswordBreakdown extends React.Component {
	getSortedRows(rows_filtered, sort){
		if(sort){
			let dir = sort.asc ? 'asc' : 'desc'
			switch(sort.index){
				case 0:
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return t.ticketType}, dir)
					break
				case 1:
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return t.password}, dir)
					break
				case 2:
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return parseFloat(t.cost)}, dir)
					break
				case 3:
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return parseInt(t.numSales)}, dir)
					break
				case 4:
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return parseInt(t.numSales) * (t.cost ? parseFloat(t.cost) : 0)}, dir)
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
			{title: 'Ticket Type', sort: true},
			{title: 'Password', sort: true},
			{title: 'Price (excl. Fees)', sort: true},
			{title: 'No of Sales', sort: true},
			{title: 'Revenue', sort: true},
			{title: clipboard, sort: false, className: 'column-clipboard'},
		], sort)

		const {event} = this.props
		let total_sales = 0
		let total_revenue = 0.0
		let currency = getCurrencySymbol(event)
		
		if(rows_filtered){
			_.each(rows_filtered, (s, index) => {
				let revenue = parseInt(s.numSales) * (s.cost ? parseFloat(s.cost) : 0)
				total_sales += parseInt(s.numSales)
				total_revenue += revenue
			})
		}

		return (rows_filtered.length != 0) ? (
			<table className="table tickets-table">
				<thead>
					{content_header}
				</thead>
				<tbody>
				{
					rows_filtered.map((row, index) => {
						let revenue = parseInt(row.numSales) * (row.cost ? parseFloat(row.cost) : 0)
						return (
							<tr key={index} className={index % 2== 0 ? 'row-stale' : ''}>
								<td>{row.ticketType}</td>
								<td>{row.password}</td>
								<td>{currency}{parseFloat(row.cost).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
								<td>{row.numSales}</td>
								<td>{currency}{parseFloat(revenue).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
								<td></td>
							</tr>
						)
					})
				}
				</tbody>
				<tfoot>
					<tr>
						<td><strong>Total:</strong></td>
						<td></td>
						<td></td>
						<td>{total_sales}</td>
						<td>{currency}{total_revenue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
						<td></td>
					</tr>
				</tfoot>
			</table>
		): (
			<EmptyBar/>
		)
	}

	getClipboardText(rows_filtered){
		let ret = ''
		ret += 'Ticket Type' + '\t' + 'Password' + '\t' + 'Price (excl. Fees)' + '\t' + 'No of Sales' + '\t' + 'Revenue' + '\n'
		_.map(rows_filtered, (t)=>{
			ret += t.ticketType + '\t' + 
				t.password + '\t' + 
				parseFloat(t.cost).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + '\t' +
				t.numSales + '\t' +
				parseFloat(parseInt(t.numSales) * (t.cost ? parseFloat(t.cost) : 0)).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + '\n'
		})
		return ret
	}

	render() {
		const {event, isSelected} = this.props
		return (
			<div>
				<JSONDatatable 
					type={TYPE_FROM_URL}
					data={{url: `/api/events/${event.id}/relationships/performance/`, param:{'section': 'password_breakdown'}, node: 'data.password_breakdown.*'}}
					sort={{index: 0, asc: true}}
					getSortedRows={::this.getSortedRows}
					getTableData={::this.getTableData}
					getClipboardText={::this.getClipboardText}
					usePagination={false}
					autoRefresh={20 * 1000}
					loadingBarTitle={'Hold tight! We\'re getting your event\'s sales by password...'}
				>
					<div ref={DATATABLE}/> 
				</JSONDatatable>
			</div>				
		)
	}
}