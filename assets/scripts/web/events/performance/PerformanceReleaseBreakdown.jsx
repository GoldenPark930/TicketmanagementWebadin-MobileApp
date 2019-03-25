import React from 'react'
import _ from 'lodash'
import moment from 'moment-timezone'
import Button from '../../_library/Button'
import Card from '../../_library/Card'
import EmptyBar from '../../_library/EmptyBar'
import LoadingBar from '../../_library/LoadingBar'
import PieChart from '../../_library/PieChart'
import {JSONDatatable, SEARCHBAR, DATATABLE, PAGINATIONBAR, TYPE_FROM_ARRAY} from '../../_library/JSONDatatable'
import {makeURL, HTTP_INIT, HTTP_LOADING, HTTP_LOADING_SUCCESSED, HTTP_LOADING_FAILED, CACHE_SIZE} from '../../../_common/core/http' 

export default class PerformanceReleaseBreakdown extends React.Component {
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
			tags: [],
			tags_all: []
		}
		this.expandedRowID = null
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
		let tags_all = _.uniq(_.flatten(newProps.tickets.map((t) => t.tags ? t.tags : [])))
		this.setState({tags_all: tags_all})
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
		let api = makeURL(`/api/events/${event.id}/relationships/performance/`, {'section': 'release_breakdown'})
		this.tmp = []
		oboe({
			url: api,
			method: 'GET',
			headers: isDemoAccount() ? null : {
				'Accept': 'application/vnd.api+json',
				'Content-Type': 'application/vnd.api+json'
			},
			withCredentials: true
		}).node('data.release_breakdown.*', function(record){
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
				case 1:
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return t.release_type}, dir)
					break
				case 2:
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return parseInt(t.num_sales)}, dir)
					break
				case 3:
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return parseFloat(t.cost)}, dir)
					break
				case 4:
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return parseFloat(t.revenue)}, dir)
					break
				default:
					break
			}
		}
		return rows_filtered
	}

	toggleTag(tag) {
		let {tags} = this.state
		let _tags = tags
		if(_tags.includes(tag)) {			
			_.remove(_tags, (t) => (t==tag))
		} else {
			_tags.push(tag)
		}
		this.setState({tags: _tags})
	}

	clearTags() {
		this.setState({tags: []})
	}

	getTableData(datatable, rows_filtered, sort){
		let clipboard_text = this.getClipboardText(rows_filtered)
		let clipboard = datatable.getClipboardColumn(datatable, clipboard_text)

		let content_header = datatable.getHeaderRow(datatable, [
			{title: '', sort: false},
			{title: 'Ticket Type', sort: true},
			{title: 'No of Sales', sort: true},
			{title: 'Price (excl. Fees)', sort: true},
			{title: 'Revenue', sort: true},
			{title: clipboard, sort: false, className: 'column-clipboard'},
		], sort)

		const {event} = this.props
		let total_sales = 0
		let total_revenue = 0.0
		let currency = getCurrencySymbol(event)	
		
		let hasExpanded = false
		if(rows_filtered){
			_.each(rows_filtered, (s, index) => {
				// let revenue = parseInt(s.num_sales) * (s.cost ? parseFloat(s.cost) : 0)
				if(!s.isDetailRow){
					total_sales += parseInt(s.num_sales)
					total_revenue += parseFloat(s.revenue)
				}
				if(s.isExpanded && !s.isDetailRow){
					hasExpanded = true
					this.expandedRowID = s.id
				}
			})
		}

		if(!hasExpanded){
			this.expandedRowID = null
		}

		let number = 0

		return (rows_filtered.length != 0) ? (
			<table className="table tickets-table">
				<thead>
					{content_header}
				</thead>
				<tbody>
				{
					rows_filtered.map((row, index) => {
						// let revenue = parseInt(row.num_sales) * (row.cost ? parseFloat(row.cost) : 0)
						let content_row = null
						if(!row.isDetailRow){ // normal row
							content_row = (
								<tr key={index} className={row.isExpanded ? ' tr-expanded-row' : (number++ % 2==0 ? 'table-stripe-row1' : 'table-stripe-row2')}>
									<td className='toggleExpand' onClick={datatable.onClickDetail.bind(datatable, row.id)}>
										<div className={row.isExpanded ? 'expandIcon expanded' : 'expandIcon'}>
											<i className={row.isExpanded ? 'fa fa-minus-square-o' : 'fa fa-plus-square-o'}/>
										</div>
									</td>
									<td>{row.release_type}</td>
									<td>{row.num_sales}</td>
									<td>{currency}{parseFloat(row.cost).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
									<td>{currency}{parseFloat(row.revenue).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
									<td></td>
								</tr>
							)
						}else{
							let content_date_rows = _.map(row.dates, (date, dindex) => {
								let revenue = parseInt(date.num_sales) * (date.cost ? parseFloat(date.cost) : 0)
								return (									
									<tr key={dindex} className={dindex % 2== 0 ? 'table-stripe-row1' : 'table-stripe-row2'}>
										<td>{moment(date.orderDate, 'YYYY-MM-DD').format('D MMM YYYY')}</td>
										<td>{date.num_sales}</td>
										<td>{currency}{parseFloat(date.cost).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
										<td>{currency}{parseFloat(revenue).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
									</tr>
								)
							})
							content_row = (
								<tr className='tr-detail-row' key={index}>
									<td colSpan={6}>
									<div className="expanded-sales-table">
										<table className="table">
											<thead>
												<tr>
													<th>Date</th>
													<th>No of Sales</th>
													<th>Price (excl. Fees)</th>
													<th>Revenue</th>
												</tr>
											</thead>
											<tbody>
												{content_date_rows}
											</tbody>
										</table>
										</div>
									</td>
								</tr>
							)
						}
						return content_row
					})
				}
				</tbody>
				<tfoot>
					<tr>
						<td></td>
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
		ret += 'Ticket Type' + '\t' + 'No of Sales' + '\t' + 'Price (excl. Fees)' + '\t' + 'Revenue' + '\n'
		_.map(rows_filtered, (t)=>{
			ret += t.release_type + '\t' + 
				t.num_sales + '\t' + 
				parseFloat(t.cost).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + '\t' +
				parseFloat(parseInt(t.num_sales) * (t.cost ? parseFloat(t.cost) : 0)).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + '\n'
		})
		return ret
	}

	render() {
		const {event, tickets, isSelected} = this.props
		const {rows, http_status, tags, tags_all} = this.state

		let _rows = rows
		if(tags.length > 0) {
			_rows = _rows.filter((r) => {
				let tt = tickets.find((t) => t.displayName==r.release_type)
				return tt.tags && tt.tags.length>0 && tt.tags.filter((ttt) => tags.includes(ttt)).length > 0
			})
		}

		let data_ticketType = {}
		_.map(_rows, (row, index)=>{
			if(!data_ticketType[row.release_type])
				data_ticketType[row.release_type] = 0
			data_ticketType[row.release_type] += row.num_sales ? parseInt(row.num_sales) : 0
		})

		const rows_grouped = _.map(_.groupBy(_rows, rows=>rows.release_type+rows.cost), (value, key) => {
			let total_num_sales = 0
			let total_revenue = 0.0
			_.each(value, (item) => {
				let revenue = parseInt(item.num_sales) * (item.cost ? parseFloat(item.cost) : 0)
				total_num_sales += parseInt(item.num_sales)
				total_revenue += revenue
			})
			return {
				release_type: value[0].release_type,
				num_sales: total_num_sales,
				cost: value[0].cost,
				revenue: total_revenue,
				dates: value,
			}
		})

		return (
			<div ref="cardContainer" className="performance-by-ticket">
				{http_status <= HTTP_LOADING && 
					<div>
						<LoadingBar title={'Hold tight! We\'re getting your event\'s sales by ticket type...'} />
					</div>
				}
				{http_status > HTTP_LOADING &&
					<div>
						<PieChart 
							data={{
								method: 'local',
								data: data_ticketType
							}}
							parent_http_status={http_status}
							options={{
								title: 'Ticket Type'
							}}
						/>
						<div className="filters">
							<div className="tag-filter-label"><i className="fa fa-tags"/> Filter by tag</div>
							{tags_all.map((t, i) => 
								<div key={i} className={'tag-filter'+(tags.includes(t) ? ' selected' : '')} onClick={()=>{this.toggleTag(t)}}>{t}</div>
							)}
							{tags.length> 0 && <Button className="btn btn-default btn-shadow tags-clear" type="button" onClick={() => {this.clearTags()}}>Clear Filter</Button>}
						</div>
						<JSONDatatable 
							type={TYPE_FROM_ARRAY}
							parent_http_status={http_status}
							data={rows_grouped}
							sort={{index: 1, asc: true}}
							getSortedRows={::this.getSortedRows}
							getTableData={::this.getTableData}
							getClipboardText={::this.getClipboardText}
							usePagination={false}
							keepExpanded={this.expandedRowID}
						>
							<div ref={DATATABLE}/> 
						</JSONDatatable>
					</div>
				}
			</div>
		)
	}
}