import React from 'react'
import _ from 'lodash'
import moment from 'moment-timezone'
import BarChart from '../../_library/BarChart'
import Card from '../../_library/Card'
import EmptyBar from '../../_library/EmptyBar'
import LoadingBar from '../../_library/LoadingBar'
import {TabView,Tab} from '../../_library/TabView'
import DateRangePicker from '../../_library/DateRangePicker'
import {JSONDatatable, SEARCHBAR, DATATABLE, PAGINATIONBAR, TYPE_FROM_ARRAY} from '../../_library/JSONDatatable'
import {makeURL, HTTP_INIT, HTTP_LOADING, HTTP_LOADING_SUCCESSED, HTTP_LOADING_FAILED, CACHE_SIZE} from '../../../_common/core/http' 

export default class PerformanceSales extends React.Component {
	constructor(props) {
		super(props)
		this.unMounted = true
		this.refreshTimer = null
		this.refreshFlag = false
		this.tmp = []
		this.everLoaded = false
		this.state = {
			http_status: HTTP_INIT,
			rows: [],
			startDate: null,
			endDate: null
		}
	}

	componentDidMount() {
		let self = this
		self.unMounted = false
		self.init(this.props)
		self.refreshTimer = setInterval(()=>{
			if((self.state.http_status == HTTP_LOADING_SUCCESSED || self.state.http_status == HTTP_LOADING_FAILED) && !self.refreshFlag){
				self.refreshFlag = true
				self.init(this.props)
			}else{
				// console.log('autoRefresh is already in progress')
			}				
		}, 20 * 1000)
	}

	componentWillUnmount() {
		this.unMounted = true
		this.refreshFlag = false
		if(this.refreshTimer)
			clearInterval(this.refreshTimer)
	}

	componentWillReceiveProps(newProps) {
		let isVisible = this.isInVisibleArea(newProps)
		if(isVisible && !this.everLoaded){
			this.init(newProps)
		}
	}

	isInVisibleArea(props){
		const {isSelected} = props
		return !!isSelected		
	}

	init(props){
		let self = this

		let isVisible = this.isInVisibleArea(props)
		if(!isVisible){
			this.refreshFlag = false
			return
		}
		this.everLoaded = true

		const {event} = self.props
		let api = makeURL(`/api/events/${event.id}/relationships/performance/`, {'section': 'sales'})
		this.tmp = []
		oboe({
			url: api,
			method: 'GET',
			headers: isDemoAccount() ? null : {
				'Accept': 'application/vnd.api+json',
				'Content-Type': 'application/vnd.api+json'
			},
			withCredentials: true
		}).node('data.sales.*', function(record){
			if(!self.unMounted){
				self.tmp.push(record)
				if(self.tmp.length === CACHE_SIZE){
					self.addToRow(self.tmp, HTTP_LOADING)
				}
			}
		}).done(function(){
			if(!self.unMounted)
				self.addToRow(null, HTTP_LOADING_SUCCESSED, null)
		}).fail(function(errorReport){
			if(!self.unMounted)
				self.addToRow(null, HTTP_LOADING_FAILED, errorReport)
		})
	}

	addToRow(cached, http_status, http_error){
		let rows = this.refreshFlag ? [] : this.state.rows
		let tmp = !!cached ? cached : this.tmp
		_.map(tmp, (o, index)=>{
			let newRow = Object.assign({}, o)
			newRow.id = index
			rows.push(newRow)
		})
		if(this.refreshFlag){
			this.refreshFlag = false
		}
		this.tmp = []
		this.setState({rows: rows, http_status: http_status})
	}

	getSortedRows(rows_filtered, sort){
		if(sort){
			let dir = sort.asc ? 'asc' : 'desc'
			switch(sort.index){
				case 0:
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return t.order_date}, dir)
					break
				case 1:
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return parseInt(t.quantity)}, dir)
					break
				case 2:
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return parseFloat(t.income)}, dir)
					break
				default:
					break
			}
		}
		return rows_filtered
	}

	getTableData(datatable, rows_filtered, sort){
		const {event, isLimited} = this.props
		let headers = [
			{title: 'Order Date', sort: true},
			{title: 'No. of Tickets Sold', sort: true},
		]
		if(!isLimited)
			headers.push({title: 'Revenue', sort: true})

		let clipboard_text = this.getClipboardText(rows_filtered)
		let clipboard = datatable.getClipboardColumn(datatable, clipboard_text)
		headers.push({title: clipboard, sort: false, className: 'column-clipboard'})

		let content_header = datatable.getHeaderRow(datatable, headers, sort)
		
		let total_ticket_sales = 0
		let total_ticket_revenue = 0.0
		let currency = getCurrencySymbol(event)

		if(rows_filtered){
			_.each(rows_filtered, (s, index) => {
				total_ticket_sales += parseInt(s.quantity)
				total_ticket_revenue += parseFloat(s.income)
			})
		}

		return (rows_filtered.length != 0) ? (
			<table className="table tickets-table">
				<thead>
					{content_header}
				</thead>
				<tbody>
				{
					rows_filtered.map((row, index) => (
						<tr key={index} className={index % 2== 0 ? 'row-stale' : ''}>
							<td>{moment(row.order_date, 'YYYY-MM-DD').format('D MMM YYYY')}</td>
							<td>{row.quantity}</td>
							{!isLimited && 
							<td>{currency}{row.income ? parseFloat(row.income).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : ''}</td>
							}
							<td></td>
						</tr>
					))
				}				
				</tbody>
				<tfoot>
					<tr>
						<td><strong>Total:</strong></td>
						<td>{total_ticket_sales}</td>
						{!isLimited &&
						<td>{currency}{total_ticket_revenue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
						}
						<td></td>
					</tr>
				</tfoot>
			</table>
		): (
			<EmptyBar/>
		)
	}

	getClipboardText(rows_filtered){
		const {event, isLimited} = this.props

		let ret = ''
		ret += 'Order Date' + '\t' + 'No. of Tickets Sold' + (isLimited ? '' : '\t' + 'Revenue') + '\n'
		_.map(rows_filtered, (t)=>{
			ret += moment(t.order_date, 'YYYY-MM-DD').format('D MMM YYYY') + '\t' + 
				t.quantity +  
				(isLimited ? '\n' : '\t' + (t.income ? parseFloat(t.income).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '') + '\n')
		})
		return ret
	}

	onDateRangeApply(start, end) {
		this.setState({
			startDate: start,
			endDate: end
		})		
	}

	onDateRangeClear() {
		this.setState({
			startDate: null,
			endDate: null
		})
	}

	render() {
		const {event, isLimited, isSelected} = this.props
		let {rows, http_status, startDate, endDate} = this.state
		
		let count = rows.length
		let data_quantity = {}, data_revenue = {}
		if(http_status > HTTP_LOADING){
			// filter by date
			if(startDate && endDate){
				let start = startDate.clone()
				let end = endDate.clone()
				console.log(start, end)
				if(startDate.isSame(endDate)){
					start = start.add(-1, 'days')
				}
				rows = _.filter(rows, (row)=>{
					return moment(row.order_date, 'YYYY-MM-DD').isSameOrBefore(end) && 
						moment(row.order_date, 'YYYY-MM-DD').isSameOrAfter(start)
				})
			}	

			// calculate data	
			_.map(rows, (row, index)=>{
				data_quantity[moment(row.order_date, 'YYYY-MM-DD').format('D MMM YYYY')] = parseInt(row.quantity)
				data_revenue[moment(row.order_date, 'YYYY-MM-DD').format('D MMM YYYY')] = row.income ? parseInt(row.income) : 0
			})
		}		
		
		return (
			<div ref='cardContainer' className="performance-sales">
				{http_status <= HTTP_LOADING && 
					<div className="">
						<LoadingBar title={'Hold tight! We\'re getting your event\'s sales...'} />
					</div>
				}
				{http_status > HTTP_LOADING &&
					<div className="">						
						<TabView>
							<Tab style={{}} title={(<span><i className="fa fa-ticket" />Quantity</span>)}>
								<BarChart 
									data={{
										method: 'local',
										data: data_quantity
									}}
									parent_http_status={http_status}
									options={{
										titleY: 'Quantity'
									}}
								/>
							</Tab>
							{!isLimited && 
							<Tab style={{}} title={(<span><i className="fa fa-money" />Revenue</span>)}>
								<BarChart
									data={{
										method: 'local',
										data: data_revenue
									}}
									parent_http_status={http_status}
									options={{
										titleY: 'Revenue'
									}}
								/>
							</Tab>}
						</TabView>
						{count > 0 &&
							<div className="performance-sales-daterange">
								<DateRangePicker onApply={::this.onDateRangeApply} onClear={::this.onDateRangeClear}/>								
							</div>
						}
						<JSONDatatable 
							type={TYPE_FROM_ARRAY}
							parent_http_status={http_status}
							data={rows}
							sort={{index: 0, asc: true}}
							getSortedRows={::this.getSortedRows}
							getTableData={::this.getTableData}
							getClipboardText={::this.getClipboardText}
							usePagination={false}
						>
							<div ref={DATATABLE}/> 
						</JSONDatatable>
					</div>
				}
			</div>
		)
	}
}