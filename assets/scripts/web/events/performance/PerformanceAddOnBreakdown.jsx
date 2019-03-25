import React from 'react'
import _ from 'lodash'
import Card from '../../_library/Card'
import EmptyBar from '../../_library/EmptyBar'
import {JSONDatatable, SEARCHBAR, DATATABLE, PAGINATIONBAR, TYPE_FROM_URL} from '../../_library/JSONDatatable'

export default class PerformanceAddOnBreakdown extends React.Component {
	getSortedRows(rows_filtered, sort){
		if(sort){
			let dir = sort.asc ? 'asc' : 'desc'
			switch(sort.index){
				case 0:
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return t.name}, dir)
					break
				case 1:
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return parseFloat(t.cost)}, dir)
					break
				case 2:
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return parseInt(t.num_sales)}, dir)
					break				
				case 3:
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return parseInt(t.num_sales) * (t.cost ? parseFloat(t.cost) : 0)}, dir)
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
			{title: 'No of Sales', sort: true},
			{title: 'Price (excl. Fees)', sort: true},
			{title: 'Revenue', sort: true},
			{title: clipboard, sort: false, className: 'column-clipboard'},
		], sort)

		const {event} = this.props
		let total_sales = 0
		let total_revenue = 0.0
		let currency = getCurrencySymbol(event)
		
		if(rows_filtered){
			_.each(rows_filtered, (s, index) => {
				let revenue = parseInt(s.num_sales) * (s.cost ? parseFloat(s.cost) : 0)
				total_sales += parseInt(s.num_sales)
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
						let revenue = parseInt(row.num_sales) * (row.cost ? parseFloat(row.cost) : 0)
						return (
							<tr key={index} className={index % 2== 0 ? 'row-stale' : ''}>
								<td>{row.name}</td>								
								<td className="check">{row.num_sales}</td>
								<td>{currency}{parseFloat(row.cost).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
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
						<td>{total_sales}</td>
						<td></td>
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
		const {event} = this.props

		let ret = ''
		ret += 'Name' + '\t' + 'No of Sales' + '\t' + 'Price (excl. Fees)' + '\t' + 'Revenue' + '\n'
		_.map(rows_filtered, (t)=>{
			ret += t.name + '\t' + 
				t.num_sales + '\t' + 
				parseFloat(t.cost).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + '\t' +
				parseFloat(parseInt(t.num_sales) * (t.cost ? parseFloat(t.cost) : 0)).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + '\n'
		})
		return ret
	}

	render() {
		const {event, isSelected} = this.props
		return (
			<div>
				<JSONDatatable
					type={TYPE_FROM_URL}
					data={{url: `/api/events/${event.id}/relationships/performance/`, param:{'section': 'add_on_breakdown'}, node: 'data.add_on_breakdown.*'}}
					sort={{index: 0, asc: true}}
					getSortedRows={::this.getSortedRows}
					getTableData={::this.getTableData}
					getClipboardText={::this.getClipboardText}
					usePagination={false}
					autoRefresh={20 * 1000}
					loadingBarTitle={'Hold tight! We\'re getting your event\'s add on sales...'}
				>
					<div ref={DATATABLE}/> 
				</JSONDatatable>
			</div>				
		)
	}
}