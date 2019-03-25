import React from 'react'
import _ from 'lodash'
import moment from 'moment-timezone'
import Card from '../../_library/Card'
import EmptyBar from '../../_library/EmptyBar'
import Select from '../../_library/Select'
import {JSONDatatable, SEARCHBAR, DATATABLE, PAGINATIONBAR, TYPE_FROM_URL} from '../../_library/JSONDatatable'

const FILTER_TYPE_NAME = 'Name'
const FILTER_TYPE_DATE = 'Date'
export default class PerformanceBoxOfficeSales extends React.Component {
	constructor(props){
		super(props)
		this.state = {
			filter_type: FILTER_TYPE_NAME
		}
	}

	getTableContent(datatable, sort, obj, key, type){
		const {event} = this.props
		let currency = getCurrencySymbol(event)

		let cashes = [], cards = []
		cashes = obj[key].cash
		cards = obj[key].card

		let card_total_sales = 0, card_total_revenue = 0.0, card_total_revenue_incl = 0.0
		let cash_total_sales = 0, cash_total_revenue = 0.0, cash_total_revenue_incl = 0.0
		_.map(cards, (card, cardIndex)=>{
			let revenue = parseInt(card.num_sales) * (card.cost ? parseFloat(card.cost) : 0) 
			let revenue2 = parseInt(card.num_sales) * (card.price ? parseFloat(card.price) : 0) 
			card_total_sales += parseInt(card.num_sales)
			card_total_revenue += revenue
			card_total_revenue_incl += revenue2
		})

		_.map(cashes, (cash, cashIndex)=>{
			let revenue = parseInt(cash.num_sales) * (cash.cost ? parseFloat(cash.cost) : 0) 
			let revenue2 = parseInt(cash.num_sales) * (cash.price ? parseFloat(cash.price) : 0) 
			cash_total_sales += parseInt(cash.num_sales)
			cash_total_revenue += revenue
			cash_total_revenue_incl += revenue2
		})

		let clipboard_text_cards = this.getClipboardText(cards)
		let clipboard_cards = datatable.getClipboardColumn(datatable, clipboard_text_cards)
		let content_header_cards = datatable.getHeaderRow(datatable, [
			{title: 'Ticket Type', sort: false},
			{title: 'No of Sales', sort: false},
			{title: 'Price (incl. Fees)', sort: false},
			{title: 'Revenue (incl. Fees)', sort: false},
			{title: 'Price (excl. Fees)', sort: false},
			{title: 'Revenue (excl. Fees)', sort: false},
			{title: clipboard_cards, sort: false, className: 'column-clipboard'},
		], sort)
		let clipboard_text_cashes = this.getClipboardText(cashes)
		let clipboard_cashes = datatable.getClipboardColumn(datatable, clipboard_text_cashes)
		let content_header_cashes = datatable.getHeaderRow(datatable, [
			{title: 'Ticket Type', sort: false},
			{title: 'No of Sales', sort: false},
			{title: 'Price (incl. Fees)', sort: false},
			{title: 'Revenue (incl. Fees)', sort: false},
			{title: 'Price (excl. Fees)', sort: false},
			{title: 'Revenue (excl. Fees)', sort: false},
			{title: clipboard_cashes, sort: false, className: 'column-clipboard'},
		], sort)

		return (
			<div key={key} className='box-office-info dark-box table-responsive'>
				{type == FILTER_TYPE_DATE &&				
					<h4 className="box-office-date">
						<img src={asset('/assets/resources/images/system_icons/cal.svg')}  className="ico-show"/>
							{moment(key, 'YYYY-MM-DD').format('D MMM YYYY')}
					</h4>
				}
				{type != FILTER_TYPE_DATE &&				
					<h4 className="box-office-date">
						<img src={asset('/assets/resources/images/system_icons/user-ico.svg')}  className="ico-show"/>
							{key}
					</h4>
				}
				<h5 className="box-office-payment">
					<img src={asset('/assets/resources/images/system_icons/credit-card.svg')}/>Card
				</h5>
				<table className="table tickets-table">
					<thead>
						{content_header_cards}
					</thead>
					<tbody>
					{
						_.map(cards, (card, cardIndex) => {
							let revenue = parseInt(card.num_sales) * (card.cost ? parseFloat(card.cost) : 0)
							let revenue2 = parseInt(card.num_sales) * (card.price ? parseFloat(card.price) : 0)
							return (
								<tr key={cardIndex} className={cardIndex % 2== 0 ? 'row-stale' : ''}>
									<td>{card.release_type}</td>
									<td>{card.num_sales}</td>
									<td>{currency}{parseFloat(card.price).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
									<td>{currency}{parseFloat(revenue2).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
									<td>{currency}{parseFloat(card.cost).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>											
									<td>{currency}{parseFloat(revenue).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
									<td></td>
								</tr>
							)
						})
					}
					</tbody>
					<tfoot>
						<tr>
							<td><span className="tickets_counts_total">Total</span></td>
							<td>{card_total_sales}</td>
							<td></td>
							<td>{currency}{card_total_revenue_incl.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
							<td></td>								
							<td>{currency}{card_total_revenue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
							<td></td>
						</tr>
					</tfoot>
				</table>
				<div className="div-spacing-20"/>
				<h5 className="box-office-payment">
					<img src={asset('/assets/resources/images/system_icons/cash-money.svg')}/>Cash
				</h5>
				<table className="table tickets-table">
					<thead>
						{content_header_cashes}
					</thead>
					<tbody>
					{
						_.map(cashes, (cash, cashIndex) => {
							let revenue = parseInt(cash.num_sales) * (cash.cost ? parseFloat(cash.cost) : 0)
							let revenue2 = parseInt(cash.num_sales) * (cash.price ? parseFloat(cash.price) : 0)
							return (
								<tr key={cashIndex} className={cashIndex % 2== 0 ? 'row-stale' : ''}>
									<td>{cash.release_type}</td>
									<td>{cash.num_sales}</td>
									<td>{currency}{parseFloat(cash.price).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
									<td>{currency}{parseFloat(revenue2).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
									<td>{currency}{parseFloat(cash.cost).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
									<td>{currency}{parseFloat(revenue).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
									<td></td>
								</tr>
							)
						})
					}
					</tbody>
					<tfoot>
						<tr>
							<td><span className="tickets_counts_total">Total</span></td>
							<td>{cash_total_sales}</td>
							<td></td>								
							<td>{currency}{cash_total_revenue_incl.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
							<td></td>
							<td>{currency}{cash_total_revenue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
							<td></td>
						</tr>
					</tfoot>
				</table>
			</div>
		)
	}

	getSortedRows(rows_filtered, sort){
		return rows_filtered
	}

	getTableData(datatable, rows_filtered, sort){
		let content = null
		let self = this
		const {filter_type} = this.state
		if(filter_type == FILTER_TYPE_NAME){
			content = _.map(rows_filtered, (row, index) => {
				let user = Object.assign({}, row)
				let name = row._key
	
				delete user.id
				delete user.isDetailRow
				delete user.isExpanded
				delete user._key
	
				const dates = Object.keys(user)
				const sortedDates = _.sortBy(dates)
	
				let content_date = _.map(sortedDates, (date)=>{
					return self.getTableContent(datatable, sort, user, date, FILTER_TYPE_DATE)
				})
	
				return (
					<div key={index} className="">
						<div className="">						
							<div className="inner_avatar"></div>
							<h4 className="inline"><img src={asset('/assets/resources/images/system_icons/user-ico.svg')} className="ico-show-small"/>{name}</h4>
							{content_date}
						</div>
					</div>
				)
			})
		}else{
			let date_rows = {}
			let dates, sortedDates

			// reconstruct array
			_.map(rows_filtered, (row, index) => {
				let user = Object.assign({}, row)
				let name = row._key

				delete user.id
				delete user.isDetailRow
				delete user.isExpanded
				delete user._key

				dates = Object.keys(user)
				sortedDates = dates.sort()

				let content_date = _.map(sortedDates, (date)=>{					
					if(!date_rows[date]){
						date_rows[date] = {}
					}
					date_rows[date][name] = user[date]
				})
			})

			dates = Object.keys(date_rows)
			sortedDates = dates.sort()

			content = _.map(sortedDates, (date, index) => {
				let users = Object.keys(date_rows[date])
				let sortedUsers = users.sort()
				let content_user = _.map(sortedUsers, (user)=>{
					return self.getTableContent(datatable, sort, date_rows[date], user, FILTER_TYPE_NAME)
				})
				return (
					<div key={index} className="">
						<div className="">						
							<div className="inner_avatar"></div>
							<h4 className="inline"><img src={asset('/assets/resources/images/system_icons/cal.svg')} className="ico-show-small"/>{moment(date, 'YYYY-MM-DD').format('D MMM YYYY')}</h4>
							{content_user}
						</div>
					</div>
				)
			})
		}		

		return (rows_filtered.length != 0) ? (
			<div>
				{content}
			</div>
		): (
			<EmptyBar/>
		)
	}

	getClipboardText(rows){
		let ret = ''
		ret += 'Ticket Type' + '\t' + 'No of Sales' + '\t' + 'Price (incl. Fees)' + '\t' + 'Revenue (incl. Fees)' + '\t' + 'Price (excl. Fees)' + '\t' + 'Revenue (excl. Fees)' + '\n'
		_.map(rows, (r, index)=>{
			ret += r.release_type + '\t' + 
				r.num_sales + '\t' +
				parseFloat(r.price).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + '\t' +
				parseFloat(parseInt(r.num_sales) * (r.price ? parseFloat(r.price) : 0)).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + '\t' +
				parseFloat(r.cost).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + '\t' +
				parseFloat(parseInt(r.num_sales) * (r.cost ? parseFloat(r.cost) : 0)).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})
		})
		return ret
	}

	onClickTab(type){		
		this.setState({filter_type: type})
	}

	render() {
		const {event, isSelected} = this.props
		let {filter_type} = this.state
		let select_filter_types = [{value: 'Name', label: 'Name'}, {value: 'Date', label: 'Date'}]

		let cs_tab_name = filter_type == FILTER_TYPE_NAME ? 'tab-title selected' :'tab-title'
		let cs_tab_date = filter_type != FILTER_TYPE_NAME ? 'tab-title selected' :'tab-title'
		return (
			<div>
				<div className="tab-view">
					<div className="tab-header">
						<div className="text-center">
							Group by: 
							<div className={cs_tab_name} onClick={this.onClickTab.bind(this, FILTER_TYPE_NAME)}>
								Name
							</div>
							<div className={cs_tab_date} onClick={this.onClickTab.bind(this, FILTER_TYPE_DATE)}>
								Date
							</div>
						</div>
					</div>
				</div>
				<JSONDatatable
					type={TYPE_FROM_URL}
					data={{url: `/api/events/${event.id}/relationships/performance/`, param:{'section': 'box_office_sales'}, node: 'data.box_office_sales.users.*', path: 3}}
					sort={{index: 0, asc: true}}
					getSortedRows={::this.getSortedRows}
					getTableData={::this.getTableData}
					getClipboardText={::this.getClipboardText}
					usePagination={false}
					autoRefresh={20 * 1000}
					loadingBarTitle={'Hold tight! We\'re getting your event\'s box office sales...'}
				>
					<div ref={DATATABLE}/> 
				</JSONDatatable>
			</div>				
		)
	}
}