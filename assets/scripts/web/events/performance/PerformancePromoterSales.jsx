import React from 'react'
import _ from 'lodash'
import Card from '../../_library/Card'
import EmptyBar from '../../_library/EmptyBar'
import {JSONDatatable, IS_FOUND, SEARCHBAR, DATATABLE, PAGINATIONBAR, TYPE_FROM_URL} from '../../_library/JSONDatatable'
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger'
import Tooltip from 'react-bootstrap/lib/Tooltip'
import ClipboardButton from 'react-clipboard.js'

export default class PerformancePromoterSales extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
		}		
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
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return t.email}, dir)
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
		const {event} = this.props
		let content = _.map(rows_filtered, (row, index) => {
			let clipboard_text = this.getClipboardText(row.sales)
			let clipboard = datatable.getClipboardColumn(datatable, clipboard_text)

			let content_header = datatable.getHeaderRow(datatable, [
				{title: 'Date', sort: false},
				{title: 'Number of Tickets Sold', sort: false},
				{title: clipboard, sort: false, className: 'column-clipboard'},
			], sort)
			let link = `https://www.theticketfairy.com/r/1086/${row.user_id}`
			return (
				<div key={index} className="ticketholder_info">
					<div className="inline ticketholder_owner">
						<div className="inner_avatar"></div>
						<h4 className="inline"><img src={asset('/assets/resources/images/system_icons/user-ico.svg')} className="ico-show-small"/>{row.first_name} {row.last_name}</h4>
					 	<span className="show_emailico"><img src={asset('/assets/resources/images/system_icons/messaging.svg')} className="ico-show"/>{row.email}</span>
						<div className="show_linkico">
							<img src={asset('/assets/resources/images/system_icons/links.svg')} className="ico-show-small"/>Promoter Link: {link}
							<span onMouseLeave={::this.copyPromoterLinkOut}>
								<ClipboardButton component="span" data-clipboard-text={link} onSuccess={::this.copyPromoterLinkAfter.bind(this)}>
									<OverlayTrigger placement="right" overlay={this.state.promoterLinkCopied?<Tooltip id="promoterLinkCopied">Copied</Tooltip>:<Tooltip id="promoterLinkCopied">Copy</Tooltip>} trigger={['hover']}>
										<i className="fa fa-copy event-url-copy" />
									</OverlayTrigger>
								</ClipboardButton>
							</span>
						</div>
					</div>
					<div className="inline tickets_counts">
						<span className="ticket_counter">{row.total_sales}</span>
						Total Tickets Sold
					</div>
					<table className="table tickets-table">
						<thead>
							{content_header}
						</thead>
						<tbody>
						{
							_.map(Object.keys(row.sales), (key, index2) => {
								return (
									<tr key={index2} className={index2 % 2== 0 ? 'row-stale' : ''}>
										<td>{key}</td>
										<td>{row.sales[key].total_sales}</td>
										<td></td>
									</tr>
								)
							})
						}
						</tbody>
						<tfoot>
							<tr>
								<td><span className="tickets_counts_total">Total Tickets Sold</span></td>
								<td>{row.total_sales}</td>
								<td></td>
							</tr>
						</tfoot>
					</table>
				</div>

			)
		})
		
		return (rows_filtered.length != 0) ? (
			<div>
				{content}
			</div>
		): (
			<EmptyBar/>
		)
	}

	getClipboardText(sales){
		let ret = ''
		ret += 'Date' + '\t' + 'Number of Tickets Sold' + '\n'
		_.map(Object.keys(sales), (key, index)=>{
			ret += key + '\t' + 
				sales[key].total_sales + '\n'
		})
		return ret
	}

	copyPromoterLinkAfter() {
		this.setState({
			promoterLinkCopied: true
		})
	}
	copyPromoterLinkOut(e) {
		if(this.state.promoterLinkCopied) {
			setTimeout(() => {
				this.setState({
	  				promoterLinkCopied: false
				})  
			}, 500)
		}
	}

	render() {
		const {event, isSelected} = this.props
		return (
			<div>
				<JSONDatatable
					type={TYPE_FROM_URL}
					data={{url: `/api/events/${event.id}/relationships/performance/`, param:{'section': 'promoter_sales'}, node: 'data.promoter_sales.*'}}
					sort={{index: 0, asc: true}}
					getFilteredRows={::this.getFilteredRows}
					getSortedRows={::this.getSortedRows}
					getTableData={::this.getTableData}
					getClipboardText={::this.getClipboardText}
					usePagination={true}
					autoRefresh={20 * 1000}
					loadingBarTitle={'Hold tight! We\'re getting your event\'s promoter sales...'}
				>
					<div ref={DATATABLE}/> 
				</JSONDatatable>
			</div>				
		)
	}
}