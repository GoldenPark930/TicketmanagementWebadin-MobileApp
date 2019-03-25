import _ from 'lodash'
import Immutable from 'immutable'
import React from 'react'
import {connect} from 'react-redux'

import QRCode from 'qrcode.react'
import moment from 'moment-timezone'
import EmptyBar from '../_library/EmptyBar'
import LoadingBar from '../_library/LoadingBar'
import Button from '../_library/Button'
import BarChart from '../_library/BarChart'
import PieChart from '../_library/PieChart'
import {Tab, TabView} from '../_library/TabView'
import {FETCH_EVENT_CHECKIN} from '../../_common/redux/performance/actions'
import {
	JSONDatatable, 
	TYPE_FROM_ARRAY, TYPE_FROM_URL,
	SEARCHBAR, DATATABLE, PAGINATIONBAR, 
	IS_FOUND,
} from '../_library/JSONDatatable'
import {HTTP_INIT, HTTP_LOADING, HTTP_LOADING_SUCCESSED, HTTP_LOADING_FAILED} from '../../_common/core/http' 

const getSortedJSON = (unsorted) => {
	const sorted = {}
	Object.keys(unsorted).sort().forEach(function(key) {
		sorted[key] = unsorted[key]
	})
	return sorted
}

@connect(
	(state) => {
		const event = state.events.get('selected').toJS()
		const performance = state.performance.get('performance').toJS()
		const loading = state.loading.has('FETCH_EVENT_CHECKIN')
		return {
			event,
			performance,
			loading
		}
	},
	{FETCH_EVENT_CHECKIN}
)
export default class CheckIn extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			status: HTTP_INIT, 
			qr_list: {},
			showDownload: false,
		}
	}

	componentDidMount() {
		if (this.state.status == HTTP_LOADING) {
			return
		}
		const {event, FETCH_EVENT_CHECKIN} = this.props
		document.title = `Check-In - ${event.displayName} - The Ticket Fairy Dashboard`
		const loadingSetter = (val) => () =>{
			this.setState({status: val})			
		}
		Promise.resolve(FETCH_EVENT_CHECKIN(event.id))
			.catch(loadingSetter(HTTP_LOADING_FAILED))
			.then(loadingSetter(HTTP_LOADING_SUCCESSED))
		loadingSetter(HTTP_LOADING)()
	}

	handleReset(){
		let {show} = this.state
		this.setState({show: !show})
	}
	handleQRCode(t){
		let {qr_list} = this.state
		let isVisible = _.get(qr_list, t.ticket_hash, 'none') == 'none' ? false : true
		_.set(qr_list, t.ticket_hash, !isVisible ? 'visible' : 'none')
		this.setState({qr_list: qr_list})
	}

	// functions for JSONDatatable
	validateData(data, index){
		// validate goes here

		// must set id!!!
		data.id = index
		return data
	}

	getFilteredRows(rows, search){
		let rows_filtered = rows
		
		// filter by search
		let keyword = search.join('').trim().toLowerCase()
		if(keyword != ''){
			rows_filtered = _.filter(rows_filtered, (item) => {
				let found = 0
				found += IS_FOUND(item.ticket_hash, keyword)
				found += IS_FOUND(item.first_name + ' ' + item.last_name, keyword)
				found += IS_FOUND(item.ticket_type, keyword)
				found += IS_FOUND(item.status, keyword)
				found += IS_FOUND(item.qr_code, keyword)
				found += IS_FOUND(item.order_id, keyword)
				found += IS_FOUND(item.email, keyword)
				found += IS_FOUND(item.buyer_email, keyword)
				return found > 0
			})
		}
		return rows_filtered
	}

	getSortedRows(rows_filtered, sort){
		if(sort){
			let dir = sort.asc ? 'asc' : 'desc'
			switch(sort.index){
				case 0: // ticket_hash
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return t.ticket_hash}, dir)
					break
				case 1: // order_id
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return t.order_id}, dir)
					break
				case 2: // name
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return t.first_name + ' ' + t.last_name}, dir)
					break
				case 3: // emai
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return t.email}, dir)
					break
				case 4: // ticket_type
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return t.ticket_type}, dir)
					break
				case 5: // status
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return t.status}, dir)
					break
				case 6: // checked_in_at
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return t.checked_in_at}, dir)
					break
				case 7: // qr_code
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return t.qr_data}, dir)
					break
				default:
					break
			}
		}
		return rows_filtered
	}

	getTableData(datatable, rows_filtered, sort){
		const {event} = this.props
		let {qr_list} = this.state

		let clipboard_text = this.getClipboardText(rows_filtered)
		let clipboard = datatable.getClipboardColumn(datatable, clipboard_text)

		let content_header = datatable.getHeaderRow(datatable, [
				{title: 'Ticket ID', sort: true},
				{title: 'Order ID', sort: true},
				{title: 'Ticket Holder', sort: true, className: 'text-center'},
				{title: 'Email', sort: true},
				{title: 'Ticket Type', sort: true, className: 'text-center'},
				{title: 'Status', sort: true, className: 'text-center'},
				{title: 'Checked In At', sort: true, className: 'text-center'},
				{title: 'Scan Ticket', sort: true},
				{title: clipboard, sort: false, className: 'column-clipboard'},
			], sort)

		let camalize = (str) => {
			let ret = str.toLowerCase()
			return ret.replace(/\b[a-z]/g,function(f){return f.toUpperCase()})
		}
		let checked_in_at = (str) => {
			let date = moment(str).format('D MMMM YYYY, HH:mm:ss')
			return date == 'Invalid date' ? 'Not Yet' : date
		}
		
		let number = 0
		let self = this
		let content_table = _.map(rows_filtered, (t, index)=>{
			let isVisible = _.get(qr_list, t.ticket_hash, 'none') != 'none'
			let btn = <div>
				<Button id={index} className="btn btn-blue" type="button" onClick={e => self.handleQRCode(t)}>Scan Ticket</Button>
				{!!isVisible && <div className='qr-code'><QRCode value={t.qr_data} size={50}/></div>}
			</div>
			let qr_code = t.status != 'checked in' ? btn : ''

			let content_row = <tr key={index} className={t.isExpanded ? ' tr-expanded-row' : (number++ % 2==0 ? 'table-stripe-row1' : 'table-stripe-row2')}>					
				<td className="text-left">{t.ticket_hash}</td>
				<td className="text-left">{t.order_id}</td>
				<td className="text-center">{t.first_name + ' ' + t.last_name}</td>
				<td className="text-center">{t.email}</td>
				<td className="text-center">{t.ticket_type}</td>
				<td className="text-center">{camalize(t.status)}</td>
				<td className="text-center">{checked_in_at(t.checked_in_at)}</td>
				<td className="text-right">{qr_code}</td>
				<td>&nbsp;</td>
			</tr>
			return content_row
		})

		return (rows_filtered.length != 0) ? (
			<table className="table">
				<thead>
					{content_header}
				</thead>
				<tbody>
					{content_table}
				</tbody>
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
		let checked_in_at = (str) => {
			let date = moment(str).format('D MMMM YYYY, HH:mm:ss')
			return date == 'Invalid date' ? 'Not Yet' : date
		}

		let ret = ''
		ret += 'Ticket ID' + '\t' + 
			'Order ID' + '\t' + 
			'Ticket Holder' + '\t' + 
			'Email' + '\t' + 
			'Ticket Type' + '\t' + 
			'Status' + '\t' + 
			'Checked In At' + '\n'
		_.map(rows_filtered, (t)=>{
			ret += t.ticket_hash + '\t' + 
				t.order_id + '\t' + 
				(t.first_name + ' ' + t.last_name) + '\t' + 
				t.email + '\t' + 
				t.ticket_type + '\t' + 
				camalize(t.status) + '\t' +
				checked_in_at(t.checked_in_at) + '\n'
		})
		return ret
	}

	onClick_download(){
		this.setState({showDownload: !this.state.showDownload})
	}

	render() {
		const {show} = this.state
		const {status} = this.state
		const {loading, performance} = this.props
		const {event} = this.props
		const isLimitedStats = !!event ? (event.$relationships.self.role == 'limited_stats' ? true : false) : false
		let content
		switch (status){
			case HTTP_INIT:
				content = null
				break
			case HTTP_LOADING:
				content = <LoadingBar title={'Hold tight! We\'re getting your event\'s statistics...'} />
				break
			case HTTP_LOADING_SUCCESSED:
				// --- check_in ---
				let content_check_in = null
				if(!!performance.check_in){
					let daily = {}
					_.each(getSortedJSON(performance.check_in.check_in_stats.daily), function(value, index) {
						daily[moment(index, 'YYYY-MM-DD').format('D MMM YYYY')] = value
					})
					let total_checked_in = _.reduce(daily, function(sum, n) { return sum + n}, 0)
					let daily_dates = _.keys(daily)
					let highest_checked_in_date = _.reduce(daily_dates, function(highest, i) { return daily[highest]>daily[i] ? highest : i }, daily_dates[0])
					let highest_checked_in = daily[highest_checked_in_date]
					let lowest_checked_in_date = _.reduce(daily_dates, function(lowest, i) { return daily[lowest]<daily[i] ? lowest : i }, daily_dates[0])
					let lowest_checked_in = daily[lowest_checked_in_date]
					let chart_daily = 
						<BarChart
							data={{
								method: 'remote',
								url: `/api/events/${event.id}/relationships/check_in/`,
								cb: (response) => {
									let daily = {}
									_.each(getSortedJSON(response.data.check_in.check_in_stats.daily), function(value, index) {
										daily[moment(index, 'YYYY-MM-DD').format('D MMM YYYY')] = value
									})
									return daily
								}
							}}
							options={{
								titleY: 'Tickets',
								autoRefresh: 5 * 60 * 1000
							}}
						/>
					let rows_daily = _.map(daily, function(value, index){
						return (
							<tr key={index}>
								<td className="text-left">{index}</td>
								<td className="text-right">{value}</td>
							</tr>
							)
					})

					const hourly = getSortedJSON(performance.check_in.check_in_stats.hourly)
					let formatted_hourly_time = (str) => {
						let date = moment(str, 'YYYY-MM-DD HH').format('HH:mm')
						return date == 'Invalid date' ? '' : date
					}
					let formatted_hourly_date = (str) => {
						let date = moment(str, 'YYYY-MM-DD HH').format('D MMM YYYY')
						return date == 'Invalid date' ? 'Not Yet' : date
					}
					let total_checked_in_hourly = _.reduce(hourly, function(sum, n) { return sum + n}, 0)
					let rows_hourly = _.map(hourly, function(value, index){
						return (
							<tr key={index}>
								<td className="text-left"><span className="text-large">{formatted_hourly_time(index)}</span> / {formatted_hourly_date(index)}</td>
								<td className="text-right">{value}</td>
							</tr>
							)
					})

					const ticket_types = performance.check_in.check_in_stats.ticket_types
					let total_checked_in_tickettype = _.reduce(ticket_types, function(sum, n) { return sum + n}, 0)
					let rows_ticket_types = _.map(ticket_types, function(value, index){
						return (
							<tr key={index}>
								<td className="text-left">{index}</td>
								<td className="text-right">{value}</td>
							</tr>
							)
					})

					const add_ons = performance.check_in.check_in_stats.add_ons
					let total_add_ons_tickettype = 0
					let rows_add_ons = _.map(add_ons, function(value, index){
						total_add_ons_tickettype += parseInt(value.num_add_ons)
						return (
							<tr key={index}>
								<td className="text-left">{value.name}</td>
								<td className="text-right">{value.num_add_ons}</td>
							</tr>
							)
					})

					const names = performance.check_in.check_in_stats.names
					let chart_names = 
						<PieChart 
							data={{
								method: 'remote',
								url: `/api/events/${event.id}/relationships/check_in/`,
								cb: (response) => {
									return response.data.check_in.check_in_stats.names
								}
							}}
							options={{
								title: 'By Staff Member',
								autoRefresh: 5 * 60 * 1000
							}} 
						/>
					let total_checked_in_name = _.reduce(names, function(sum, n) { return sum + n}, 0)
					let rows_names = _.map(names, function(value, index){
						return (
							<tr key={index}>
								<td className="text-left">{index}</td>
								<td className="text-right">{value}</td>
							</tr>
							)
					})

					const tickets = performance.check_in.tickets

					content_check_in = <div className="checkin">
						<TabView title="View Check-in Status:" all={true}>
							<Tab title="Date">
								<div className="daily-title">Check-Ins by <strong>DAY</strong></div>
								<div className="row">
									<div className="col-xs-12">
										{chart_daily} 
									</div>
								</div>
								<div className="row">
									<div className="col-xs-2 col-12 margin-bottom30 text-center col-xs-offset-3">
										<div className="title">TOTAL</div>
										<div className="number">{total_checked_in}</div>
										<div className="desc">TOTAL CHECK IN</div>
									</div>
									<div className="col-xs-2 col-12 margin-bottom30 text-center">
										<div className="title">{highest_checked_in_date ? moment(highest_checked_in_date, 'D MMM YYYY').format('D MMM') : ''}</div>
										<div className="number"><img src = {asset('/assets/resources/images/demographics-highest.png')} className="icon"/>{highest_checked_in}</div>
										<div className="desc">HIGHEST CHECK IN</div>
									
									</div>
									<div className="col-xs-2 col-12 margin-bottom30 text-center">
										<div className="title">{lowest_checked_in_date ? moment(lowest_checked_in_date, 'D MMM YYYY').format('D MMM') : ''}</div>
										<div className="number"><img src = {asset('/assets/resources/images/demographics-lowest.png')} className="icon"/>{lowest_checked_in}</div>
										<div className="desc">LOWEST CHECK IN</div>
									</div>
								</div>
								<div className="table-caption"><img src = {asset('/assets/resources/images/icon-calendar.png')} className="icon"/>Daily</div>
								<div className="row">
									<div className="col-xs-12">
										<table className="table">
											<thead>
												<tr>
													<th className="text-left">Date</th>
													<th className="text-right">No. of Tickets</th>
												</tr>
											</thead>
											<tbody>
												{rows_daily}
											</tbody>
											<tfoot>
												<tr>
													<td className="text-right" colSpan="2">TOTAL {total_checked_in}</td>
												</tr>
											</tfoot>
										</table>
									</div>
								</div>
							</Tab>
							<Tab title="Hourly">
								<div className="table-caption"><img src = {asset('/assets/resources/images/icon-timer.png')} className="icon"/>Hourly</div>
								<div className = "row">
									<div className="col-xs-12">
										<table className="table">
											<thead>
												<tr>
													<th className="text-left">Time</th>
													<th className="text-right">No. of Tickets</th>
												</tr>
											</thead>
											<tbody>
												{rows_hourly}
											</tbody>
											<tfoot>
												<tr>
													<td className="text-right" colSpan="2">TOTAL {total_checked_in_hourly}</td>
												</tr>
											</tfoot>
										</table>
									</div>
								</div>
							</Tab>
							{!isLimitedStats &&
							<Tab title="Ticket Type">
								<div className="table-caption"><img src = {asset('/assets/resources/images/icon-ticket.png')} className="icon"/>Ticket Types</div>
								<div className = "row">
									<div className="col-xs-12">
										<table className="table">
											<thead>
												<tr>
													<th className="text-left">Ticket Type</th>
													<th className="text-right">No. of Tickets</th>
												</tr>
											</thead>
											<tbody>
												{rows_ticket_types}
											</tbody>
											<tfoot>
												<tr>
													<td className="text-right" colSpan="2">TOTAL {total_checked_in_tickettype}</td>
												</tr>
											</tfoot>
										</table>
									</div>
								</div>								
							</Tab>
							}
							{!isLimitedStats &&
								<Tab title="Add-Ons">									
									<div className="table-caption"><i className="fa fa-plus"/>Add-Ons</div>
									<div className = "row">
										<div className="col-xs-12">
											<table className="table">
												<thead>
													<tr>
														<th className="text-left">Name</th>
														<th className="text-right">No. of Add-Ons</th>
													</tr>
												</thead>
												<tbody>
													{rows_add_ons}
												</tbody>
												<tfoot>
													<tr>
														<td className="text-right" colSpan="2">TOTAL {total_add_ons_tickettype}</td>
													</tr>
												</tfoot>
											</table>
										</div>
									</div>
								</Tab>
								}
							{!isLimitedStats &&
							<Tab title="By Staff Member">
								<div className = "row">
									<div className="col-xs-12">
										{chart_names} 
									</div>
								</div>
								<div className="table-caption"><img src = {asset('/assets/resources/images/icon-people.png')} className="icon"/>Staff Members</div>
								<div className="row">
									<div className="col-xs-12">
										<table className="table">
											<thead>
												<tr>
													<th className="text-left">Name</th>
													<th className="text-right">No. of Tickets</th>
												</tr>
											</thead>
											<tbody>
												{rows_names}
											</tbody>
											<tfoot>
												<tr>
													<td className="text-right" colSpan="2">TOTAL {total_checked_in_name}</td>
												</tr>
											</tfoot>
										</table>
									</div>
								</div>
							</Tab>
							}
							{!isLimitedStats &&
							<Tab title="Individual Tickets">
								<div className="table-caption"><img src = {asset('/assets/resources/images/icon-person.png')} className="icon"/>Individual Tickets</div>
								<div className = "row">
									<div className="col-xs-12">
										<JSONDatatable							
											type={TYPE_FROM_URL}
											data={{url: `/api/events/${event.id}/relationships/check_in/`, node: 'data.check_in.tickets.*'}}
											validateData={::this.validateData}
											getFilteredRows={::this.getFilteredRows}
											getSortedRows={::this.getSortedRows}
											getTableData={::this.getTableData}
											getClipboardText={::this.getClipboardText}
											usePagination={true}
											autoRefresh={5 * 60 * 1000}
											paginationPageSize={1000}
										>
											{/* It can give additional className to SEARCHBAR, DATATABLE, PAGINATIONBAR by specifying className="XXX" */}
											<div ref={SEARCHBAR} hasSearch labelTotalCount="Number of Matching Tickets" />
											<div ref={DATATABLE}/> 
											<div ref={PAGINATIONBAR}/>
										</JSONDatatable>
									</div>
								</div>
							</Tab>
							}
						</TabView>
					</div>
				}				

				if(!!content_check_in){
					content = <div className="card">
						{content_check_in}
					</div>
				}else{
					content = <EmptyBar />
				}
				break
			case HTTP_LOADING_FAILED:
				content = null
				break
			default:
				content = null
				break
		}

		let isMobile = ($(window).width() >= 320 && $(window).width() <= 480)

		return (
			<div className='checkin_container'>
				<div className="mobileview_download clearfix">
					<div className="download_entryfairy">
						<img src = {asset('/assets/resources/images/mobile-appico.png')} className="icon"/>
						<p>Entry Fairy</p>
					</div>
					<Button onClick={::this.onClick_download} className="app_downloadlink btn btn-seablue event-button-s">Download App</Button>
				</div>
				{ (this.state.showDownload || !isMobile) &&
					<div className="app_download">
						<div className="entry_fairy">
							<img src = {asset('/assets/resources/images/mobile-appico.png')} className="icon"/>
							<p>Entry Fairy</p>
						</div>
						<div className="app_downloadlinks">
							<a href="https://itunes.apple.com/us/app/entry-fairy/id900716911?mt=8" target="_blank">
								<img src = {asset('/assets/resources/images/mobile-ios.png')} className="icon"/>
							</a>
							<a href="https://play.google.com/store/apps/details?id=com.theticketfairy.entryfairy">
								<img src = {asset('/assets/resources/images/mobile-android.png')} className="icon"/>
							</a>
						</div>
					</div>
				}
				<div className="row">
					<div className="col-xs-12">
						{content}
					</div>
				</div>
			</div>
		)
	}
}

