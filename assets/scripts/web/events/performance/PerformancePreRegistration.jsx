import React from 'react'
import _ from 'lodash'
import moment from 'moment-timezone'
import Card from '../../_library/Card'
import EmptyBar from '../../_library/EmptyBar'
import {JSONDatatable, SEARCHBAR, DATATABLE, PAGINATIONBAR, TYPE_FROM_URL} from '../../_library/JSONDatatable'

export default class PerformancePreRegistration extends React.Component {
	getSortedRows(rows_filtered, sort){
		if(sort){
			let dir = sort.asc ? 'asc' : 'desc'
			switch(sort.index){
				case 0:
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return t.date}, dir)
					break
				case 1:
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return parseInt(t.quantity)}, dir)
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
			{title: 'Date', sort: true},
			{title: 'Quantity', sort: true},
			{title: clipboard, sort: false, className: 'column-clipboard'},
		], sort)

		const {event} = this.props
		let total_quantity = 0
		
		if(rows_filtered){
			_.each(rows_filtered, (s, index) => {
				total_quantity += parseInt(s.quantity)
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
						return (
							<tr key={index} className={index % 2== 0 ? 'row-stale' : ''}>
								<td>{moment(row.date, 'YYYY-MM-DD').format('D MMM YYYY')}</td>
								<td>{row.quantity}</td>
								<td></td>
							</tr>
						)
					})
				}
				</tbody>
				<tfoot>
					<tr>
						<td><strong>Total:</strong></td>
						<td>{total_quantity}</td>
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
		ret += 'Date' + '\t' + 'Quantity' + '\n'
		_.map(rows_filtered, (t)=>{
			ret += moment(t.date, 'YYYY-MM-DD').format('D MMM YYYY') + '\t' + 
				t.quantity + '\n'
		})
		return ret
	}

	render() {
		const {event, isSelected} = this.props
		return (
			<div>
				<JSONDatatable 
					type={TYPE_FROM_URL}
					data={{url: `/api/events/${event.id}/relationships/performance/`, param:{'section': 'pre_registration'}, node: 'data.pre_registration.*'}}
					sort={{index: 0, asc: true}}
					getSortedRows={::this.getSortedRows}
					getTableData={::this.getTableData}
					getClipboardText={::this.getClipboardText}
					usePagination={false}
					autoRefresh={20 * 1000}
					loadingBarTitle={'Hold tight! We\'re getting your event\'s pre registration...'}
				>
					<div ref={DATATABLE}/> 
				</JSONDatatable>
			</div>				
		)
	}
}