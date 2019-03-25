import _ from 'lodash'
import Immutable from 'immutable'
import React from 'react'
import {connect} from 'react-redux' 
import moment from 'moment-timezone'
import Select from '../_library/Select'
import Modal from 'react-modal'
import modalStyle from '../../_common/core/modalStyle'
import Field from '../_library/Field'
import Button from '../_library/Button'
import {RESEND_ORDER} from '../../_common/redux/orders/actions'

import {
	JSONDatatable, 
	TYPE_FROM_URL,
	SEARCHBAR, DATATABLE, PAGINATIONBAR, 
	IS_FOUND, DOWNLOAD_CSV
} from '../_library/JSONDatatable'
import EmptyBar from '../_library/EmptyBar'

const ORDER_STATUS_ALL = 0
const ORDER_STATUS_PAID = 1
const ORDER_STATUS_REFUNDED = 2
const ORDER_STATUS_PENDING = 3

@connect(
	(state) => {
		const event = state.events.get('selected').toJS()
		const resent = state.resent
		return {
			event,
			resent
		}
	},
	{RESEND_ORDER}
)
export default class Orders extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			order_status: ORDER_STATUS_ALL,
			csvData: null,
			csvFileName: '',
			filter_type: '',
			filter_types: [],
			filter_addon: '',
			filter_addons: [],
			filter_compOrder: false,
			showResend: false,
			resendEmail: '',
			orderID: null,
		}
	}

	componentDidMount() {
		const {event} = this.props
		document.title = `Orders - ${event.displayName} - The Ticket Fairy Dashboard`
		Messenger.options = {
      extraClasses: 'messenger-fixed messenger-on-bottom messenger-on-right',
      theme: 'future'
    }
	}

	onClickTab(order_status) {
		this.setState({order_status: order_status})
	}

	onFilterType(e){
		this.setState({filter_type: e.target.value})
	}

	onFilterAddon(e){
		this.setState({filter_addon: e.target.value})
	}

	onFilterCompOrder(e, value){
		this.setState({filter_compOrder: e.target.checked})
	}

	fetchCallback(rows, status){
		const {event} = this.props
		let fileName = 'tickets_' + event.id + '_' + moment().format('YYYYMMDDHHmmss') + '.csv'

		let data = [], newRow = {}, filter_types = [], filter_addons = []
		// add body
		_.map(rows, (t, index)=>{
			if(t.tickets){
				_.map(t.tickets, (ticket, tid)=>{
					filter_types.push(ticket.ticketType)
				})
			}
			if(t.addOns){
				_.map(t.addOns, (addon, aid)=>{
					filter_addons.push(addon.name)
				})
			}
			if(t.tickets && t.order.status == 'Paid'){
				_.map(t.tickets, (ticket, tid)=>{
					newRow = {}
					newRow.qr_data = ''
					newRow.ticket_first_name = ticket.firstName
					newRow.ticket_last_name = ticket.lastName
					newRow.ticket_email = ticket.email
					newRow.buyer_email = t.order.billingEmail
					newRow.phone = t.order.billingPhone
					newRow.street_address = ''
					newRow.city = t.order.billingCity
					newRow.state = ''
					newRow.zip_postcode = ''
					newRow.country = t.order.billingCountry
					newRow.ticket_type = ticket.ticketType
					newRow.ticket_price = ''
					newRow.status = ticket.status
					newRow.order_id = t.order.id
					newRow.ticket_id = ticket.ticketHash
					newRow.ordered_by_first_name = t.order.billingFirstName
					newRow.ordered_by_last_name = t.order.billingLastName
					newRow.order_date = t.order.orderDate
					newRow.order_datetime = t.order.orderDateTime
					newRow.checked_in_at = ''
					newRow.discount_code = t.order.discountCode
					newRow.twitch_display_name = ''
					newRow.twitch_partnered = ''
					newRow.upgrades = ''
					newRow.data_capture = ''
					if(ticket.status != 'cancelled' && ticket.status != 'refunded')
						data.push(newRow)
				})
			}
		})

		filter_types = _.orderBy(_.uniq(filter_types))
		filter_addons = _.orderBy(_.uniq(filter_addons))
		this.setState({csvData: data, csvFileName: fileName, filter_types: filter_types, filter_addons: filter_addons})
	}

	validateData(data, index){
		// validate goes here
		if(!data.order)
			return null
		// set id
		data.id = data.order.id
		return data
	}

	getFilteredRows(rows, search){
		const {order_status, filter_type, filter_addon, filter_compOrder} = this.state
		let rows_filtered = rows

		// filter by order status
		switch(order_status){
			case ORDER_STATUS_ALL:
				rows_filtered = rows
				break
			case ORDER_STATUS_PAID:
				rows_filtered = _.filter(rows, {'order': {'status':'Paid'}})
				break
			case ORDER_STATUS_PENDING:
				rows_filtered = _.filter(rows, {'order': {'status':'Pending'}})
				break
			case ORDER_STATUS_REFUNDED:
				rows_filtered = _.filter(rows, {'order': {'status':'Refunded'}})
				break
			default:
				rows_filtered = rows
				break
		}

		// filter by ticket type
		if(filter_type != ''){
			rows_filtered = _.filter(rows_filtered, (item) => {
				let found = 0
				_.map(item.tickets, (t) => {
					found += t.ticketType == filter_type ? 1 : 0
				})
				return found > 0
			})
		}

		// filter by addon
		if(filter_addon != ''){
			rows_filtered = _.filter(rows_filtered, (item) => {
				let found = 0
				_.map(item.addOns, (a) => {
					found += a.name == filter_addon ? 1 : 0
				})
				return found > 0
			})
		}

		// filter by compOrder
		if(filter_compOrder){
			rows_filtered = _.filter(rows_filtered, (item) => {
				return item.order.compOrder
			})
		}
		
		// filter by search
		let keyword = search.join('').trim().toLowerCase()
		if(keyword != ''){
			rows_filtered = _.filter(rows_filtered, (item) => {
				let found = 0
				found += IS_FOUND(item.order.id, keyword)
				found += IS_FOUND(item.order.billingFirstName + ' ' + item.order.billingLastName, keyword)
				found += IS_FOUND(item.order.billingEmail, keyword)

				if (item.order.twitchChannel) {
					found += IS_FOUND(item.order.twitchChannel.display_name, keyword)
				}
				_.map(item.tickets, (t) => {
					found += IS_FOUND(t.firstName + ' ' + t.lastName, keyword)
					found += IS_FOUND(t.email, keyword)
					found += IS_FOUND(t.ticketHash, keyword)
				})
				return found > 0
			})
		}
		return rows_filtered
	}

	getSortedRows(rows_filtered, sort){
		if(sort){
			let dir = sort.asc ? 'asc' : 'desc'
			switch(sort.index){
				case 1: // Order ID
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return parseInt(t.id)}, dir)
					break
				case 2: // Date
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return t.order.orderDate}, dir)
					break
				case 3: // Status
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return t.order.status}, dir)
					break
				case 4: // Name
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return (t.order.billingFirstName + ' ' + t.order.billingLastName).trim().toLowerCase()}, dir)
					break
				case 5: // Email
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return t.order.billingEmail.trim().toLowerCase()}, dir)
					break
				case 6: // Total
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return parseFloat(t.order.total)}, dir)
					break
				default:
					break
			}
		}
		return rows_filtered
	}
	
	getCSVData(rows_filtered){
		let data = [], newRow = []
		// add header
		newRow.push('Order ID')
		newRow.push('Date')
		newRow.push('Status')
		newRow.push('Name')
		newRow.push('Email')
		newRow.push('Total')
		data.push(newRow)

		// add body
		_.map(rows_filtered, (t, index)=>{
			newRow = []
			newRow.push(t.id)
			newRow.push(moment(t.order.orderDate, 'YYYY-MM-DD').format('D MMM YYYY'))
			newRow.push(t.order.status)
			newRow.push(t.order.billingFirstName + ' ' + t.order.billingLastName)
			newRow.push(t.order.billingEmail)
			newRow.push(t.order.total)
			data.push(newRow)
		})
		return data
	}

	getTableData(datatable, rows_filtered, sort){
		let clipboard_text = this.getClipboardText(rows_filtered)
		let clipboard = datatable.getClipboardColumn(datatable, clipboard_text)

		const {event} = this.props
		let content_header = datatable.getHeaderRow(datatable, [
				{title: '', sort: false},
				{title: 'Order ID', sort: true},
				{title: 'Date', sort: true},
				{title: 'Status', sort: true},
				{title: 'Name', sort: true},
				{title: 'Email', sort: true},
				{title: 'Total', sort: true},
				{title: 'Action', sort: false},
				{title: clipboard, sort: false, className: 'column-clipboard'}
			], sort)
		
		let self = this
		let number = 0
		let currency = getCurrencySymbol(event)
		let content_table = _.map(rows_filtered, (t, index)=>{
			let total = parseFloat(t.order.total)
			let content_row = null
			if(!t.isDetailRow){ // normal row
				content_row = <tr key={index} className={t.isExpanded ? ' tr-expanded-row' : (number++ % 2==0 ? 'table-stripe-row1' : 'table-stripe-row2')}>
					<td className='toggleExpand' onClick={datatable.onClickDetail.bind(datatable, t.id)}>
						<div className={t.isExpanded ? 'expandIcon expanded' : 'expandIcon'}>
							<i className={t.isExpanded ? 'fa fa-minus-square-o' : 'fa fa-plus-square-o'}/>
						</div>
					</td>
					<td>{t.id}</td>
					<td>{moment(t.order.orderDate, 'YYYY-MM-DD').format('D MMM YYYY')}</td>
					<td>{t.order.status}</td>
					<td>{t.order.billingFirstName} {t.order.billingLastName}</td>
					<td>{t.order.billingEmail}</td>
					<td>{currency}{total.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
					<td className='tdAction'>
						<div className='btnAction' onClick={self.onClickResend.bind(self, t.id, t.order.billingEmail)}>
							<i className='fa fa-share-square-o '/>
							Resend
						</div>
						{/*
						<div className='btnAction'>
							<i className='fa fa-undo'/>
							Refund
						</div>*/}
					</td>
					<td></td>
				</tr>
			} else { // detail row
				let ticket_rows = null, addons_rows = null, data_capture_rows = null
				ticket_rows = _.map(t.tickets, (ticket, tid)=>{
					let row_color = 'ticket-red'
					if(ticket.status == 'valid')
						row_color = 'ticket-green'
					if(ticket.status == 'checked in')
						row_color = 'ticket-yellow'
					return (
						<div key={tid} className={'row-content row-ticket row ' + row_color}>
							<div className="col-xs-2">
								<div className="content">
									<div className="value">
										<a href={`https://www.theticketfairy.com/download-ticket/${ticket.id}/${ticket.ticketHash}/`}><i className="fa fa-download" aria-hidden="true"></i></a>&nbsp;&nbsp; 
										{ticket.ticketHash.toUpperCase()}
									</div>
								</div>
							</div>
							<div className="col-xs-3">
								<div className="content">
									<div className="value">
										{ticket.firstName} {ticket.lastName}
									</div>
								</div> 
							</div>
							<div className="col-xs-3">
								<div className="content">
									<div className="value">
										{ticket.ticketType}
									</div>
								</div> 
							</div>
							<div className="col-xs-2">
								<div className="content">
									<div className="value">
										{ticket.status}
									</div>
								</div> 
							</div>
							<div className="col-xs-2">
								<div className="content">
									<div className="value">
										{ticket.extraInfo}
									</div>
								</div> 
							</div>
						</div>
						)
				})

				data_capture_rows = _.map(t.dataCapture, (dcRow, dcid)=>{
					return (
						<div key={dcid} className={'row-content row-ticket row ticket-green'}>
							<div className="col-xs-6">
								<div className="content">
									<div className="value">
										{dcRow.name}
									</div>
								</div>
							</div>
							<div className="col-xs-6">
								<div className="content">
									<div className="value">
										{dcRow.value}
									</div>
								</div> 
							</div>
						</div>
						)
				})

				addons_rows = _.map(t.addOns, (addons, aid)=>{
					return (
						<div key={aid} className={'row-content row'}>
							<div className="col-xs-6">
								<div className="content">
									<div className="value">
										{addons.name}
									</div>
								</div>
							</div>
							<div className="col-xs-6">
								<div className="content">
									<div className="value">
										{addons.quantity}
									</div>
								</div> 
							</div>
						</div>
						)
				})
				content_row = <tr className='tr-detail-row' key={index}>
					<td colSpan={9}>
						<div className="row-detail">
							<div className="row-title row">
								<div className="col-xs-6 withDecorator">
									Contact Information
								</div>
								<div className="col-xs-6 withDecorator">
									Location
								</div>
							</div>
							<div className="div-spacing-20"/>
							<div className="row-content row">
								<div className="col-xs-3">
									<div className="content">
										<div className="field">
											<i className="fa fa-envelope" aria-hidden="true"></i> Email Address
										</div>
										<div className="value">
											{t.order.billingEmail}
										</div>
									</div>
								</div>
								<div className="col-xs-3">
									<div className="content">
										<div className="field">
											<i className="fa fa-phone-square" aria-hidden="true"></i> Phone Number
										</div>
										<div className="value">
											{t.order.billingPhone}
										</div>
									</div> 
								</div>
								<div className="col-xs-3">
									<div className="content">
										<div className="field">
											<i className="fa fa-map-marker" aria-hidden="true"></i> City
										</div>
										<div className="value">
											{t.order.billingCity}
										</div>
									</div> 
								</div>
								<div className="col-xs-3">
									<div className="content">
										<div className="field">
											<i className="fa fa-globe" aria-hidden="true"></i> Country
										</div>
										<div className="value">
											{t.order.billingCountry}
										</div>
									</div> 
								</div>
							</div>

							<div className="row-separator"/>

							{ (t.dataCapture.length > 0) && 	
								<div className="row-title row">
									<div className="col-xs-6 withDecorator">
										Data Capture
									</div>
								</div> 
							}
							{ (t.dataCapture.length > 0) && 
								<div className="div-spacing-20"/>
							}
							{ (t.dataCapture.length > 0) && 
								<div className="row-content row-ticket row">
									<div className="col-xs-6">
										<div className="content">
											<div className="field">
												Question
											</div>
										</div>
									</div>
									<div className="col-xs-6">
										<div className="content">
											<div className="field">
												Answer
											</div>
										</div> 
									</div>
								</div>
							}
							{ (t.dataCapture.length > 0) && 
								data_capture_rows
							}
							{ (t.dataCapture.length > 0) && 
								<div className="row-separator"/>
							}

							{ t.order.twitchChannel && 	
								<div className="row-title row">
									<div className="col-xs-6 withDecorator">
										Twitch Channel Information
									</div>
								</div> 
							}
							{ t.order.twitchChannel && 
								<div className="div-spacing-20"/>
							}
							{ t.order.twitchChannel && 
								<div className="row-content row">
									<div className="col-xs-4">
										<div className="content">
											<div className="field">
												<i className="fa fa-twitch" aria-hidden="true"></i> User ID
											</div>
											<div className="value">
												{t.order.twitchUserId}
											</div>
										</div>
									</div>
									<div className="col-xs-4">
										<div className="content">
											<div className="field">
												<i className="fa fa-twitch" aria-hidden="true"></i> Display Name
											</div>
											<div className="value">
												{t.order.twitchChannel.display_name}
											</div>
										</div> 
									</div>
									<div className="col-xs-4">
										<div className="content">
											<div className="field">
												<i className="fa fa-twitch" aria-hidden="true"></i> Broadcaster Type
											</div>
											<div className="value">
												{t.order.twitchChannel.broadcaster_type ? t.order.twitchChannel.broadcaster_type : 'Regular'}
											</div>
										</div> 
									</div>
								</div>
							}
							{ t.order.twitchChannel && 
								<div className="row-separator"/>
							}

							<div className="row-title row">
								<div className="col-xs-12 withDecorator">
									Tickets
								</div>
							</div>
							<div className="div-spacing-20"/>
							<div className="row-content row-ticket row">
								<div className="col-xs-2">
									<div className="content">
										<div className="field">
											&nbsp;&nbsp;&nbsp;&nbsp; Ticket ID
										</div>
									</div>
								</div>
								<div className="col-xs-3">
									<div className="content">
										<div className="field">
											Ticket Holder
										</div>
									</div> 
								</div>
								<div className="col-xs-3">
									<div className="content">
										<div className="field">
											Ticket Type
										</div>
									</div> 
								</div>
								<div className="col-xs-2">
									<div className="content">
										<div className="field">
											Status
										</div>
									</div> 
								</div>
								<div className="col-xs-2">
									<div className="content">
										<div className="field">
											Notes
										</div>
									</div> 
								</div>
							</div>
							<div>
								{ticket_rows}
							</div>									

							<div className="row-separator"/>

							<div className="row-title row">
								<div className="col-xs-12 withDecorator">
									Add-ons / Upgrades
								</div>
							</div>
							<div className="div-spacing-20"/>
							{t.addOns.length > 0 ?
								<div className="row-content row">
									<div className="col-xs-6">
										<div className="content">
											<div className="field">
												Add-on / Upgrade
											</div>
										</div>
									</div>
									<div className="col-xs-6">
										<div className="content">
											<div className="field">
												Quantity
											</div>
										</div> 
									</div>				
								</div>
							: 
								<div className="row-content row">
									<div className="col-xs-12">
										<div className="content">
											<div className="value">
												Not purchased
											</div>
										</div>
									</div>		
								</div>
							}
							{t.addOns.length > 0 &&
								<div>
									{addons_rows}
								</div>
							}
							{ t.order.discountCode && 
								<div className="row-separator"/>
							}
							{ t.order.discountCode && 
								<div className="row-title row">
									<div className="col-xs-12 withDecorator">
										Discount Code
									</div>
								</div>
							}
							{ t.order.discountCode && 
								<div className="div-spacing-20"/>
							}
							{ t.order.discountCode && 
								<div className="row-content row">
									<div className="col-xs-12">
										<div className="content">
											<div className="value">
												{t.order.discountCode}
											</div>
										</div>
									</div>		
								</div>
							}
						</div>
					</td>
				</tr>
			}
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
		let ret = ''
		ret += 'Order ID' + '\t' + 'Date' + '\t' + 'Status' + '\t' + 'Name' + '\t' + 'Email' + '\t' + 'Total' + '\n'
		_.map(rows_filtered, (t)=>{
			ret += t.id + '\t' + 
				moment(t.order.orderDate, 'YYYY-MM-DD').format('D MMM YYYY') + '\t' +
				t.order.status + '\t' +
				(t.order.billingFirstName + ' ' + t.order.billingLastName) + '\t' +
				t.order.billingEmail + '\t' +
				parseFloat(t.order.total).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + '\n'
		})
		return ret
	}

	onClickExportTickets(csvData, csvFileName){		
		DOWNLOAD_CSV(csvData, csvFileName)
	}

	refreshTable(){
		const {event} = this.props
		this.refs.JSONDatatable.forceRefresh(TYPE_FROM_URL, {url: `/api/events/${event.id}/relationships/orders/`, node: 'data.*'})
	}

	handleResend() {
		const {event, RESEND_ORDER} = this.props
		const {orderID, resendEmail} = this.state

		return Promise.resolve(RESEND_ORDER(event.id, {orderID, resendEmail}))
      .catch((err) => {
        Messenger().post({
          type: 'error',
          message: err,
          hideAfter: 5,
          showCloseButton: true
				})
				this.setState({showResend: false})
        return Promise.reject(_.result(err, 'toFieldErrors', err))
      })
      .then((v)=>{
        Messenger().post({
          type: 'success',
          message: 'Successfully Sent',
          hideAfter: 10,
          showCloseButton: true
				})
				this.setState({showResend: false})
        return v
      })
	}

	onClickResend(orderID, email) {
		this.setState({showResend: true, resendEmail: email, orderID: orderID})
	}

	closeResendDialog() {
		this.setState({showResend: false})
	}

	onResendEmailChanged(e) {
		this.setState({resendEmail: e.target.value})
	}

	render() {
		const {order_status, csvData, csvFileName, filter_types, filter_type, filter_addons, filter_addon, filter_compOrder} = this.state
		const {showResend, resendEmail} = this.state
		const {event} = this.props
		let tab_header = _.map([ORDER_STATUS_ALL, ORDER_STATUS_PAID, ORDER_STATUS_REFUNDED, ORDER_STATUS_PENDING], (s)=>{
			let title = ''
			switch(s){
				case ORDER_STATUS_ALL:
					title = 'All Orders'
					break
				case ORDER_STATUS_PAID:
					title = 'Paid Orders'
					break
				case ORDER_STATUS_REFUNDED:
					title = 'Refunded Orders'
					break
				case ORDER_STATUS_PENDING:
					title = 'Pending Orders'
					break
				default:
					break
			}
			return (
				<div key={s} className={'tab-title' + (s == order_status ? ' selected' : '')} onClick={() => this.onClickTab(s)}>
					{title}
				</div>
			)
		})
		let select_filter_types = [{value: '', label: 'All'}]
		_.map(filter_types, (e, i) => {
			select_filter_types.push({value: e, label: e})
		})
		let select_filter_addons = [{value: '', label: 'All'}]
		_.map(filter_addons, (e, i) => {
			select_filter_addons.push({value: e, label: e})
		})
		return (
			<div className="event-order">
				<div className="btn-toolbar export-tickets">
					{/*csvData && <Button className="btn-primary" onClick={this.onClickExportTickets.bind(this, csvData, csvFileName)}>Export Tickets</Button>*/}
					<a className="btn btn-primary btn-shadow" href={`https://www.theticketfairy.com/manage/event/export/tickets/${event.id}/`}><i className='fa fa-file-excel-o'/>Export Tickets</a>
					{/*
					<Button className="btn-default" onClick={::this.refreshTable}>Refresh</Button>*/}
				</div>
				<Modal
					className="modal-dialog modal-trans"
					style={modalStyle}
					isOpen={showResend}
					contentLabel="Modal"
					onRequestClose={::this.closeResendDialog}
					closeTimeoutMS={150}>
					<div className="modal-dialog">
						<div className="modal-content">
							<div>
								<div className="modal-header">
									<p className="h4 text-compact">Resend Order</p>
								</div>
								<div className="modal-body">
									<Field ref="resend_email" id="resend_email" value={resendEmail} label="Email Address" size="large" onChange={::this.onResendEmailChanged}/>
								</div>
								<div className="modal-footer">
									<div className="btn-toolbar btn-toolbar-right">
										<Button
											className="btn btn-danger btn-shadow"
											type="button"
											onClick={::this.handleResend}>Resend</Button>
										<Button
											className="btn btn-default btn-shadow" type="button"
											onClick={::this.closeResendDialog}>Cancel</Button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</Modal>
				<div className="row">
					<div className="col-xs-12">
						<JSONDatatable 
							ref='JSONDatatable'
							type={TYPE_FROM_URL}
							data={{url: `/api/events/${event.id}/relationships/orders/`, node: 'data.*'}}
							sort={{index: 1, asc: false}}
							fetchCallback={::this.fetchCallback}
							validateData={::this.validateData}
							getFilteredRows={::this.getFilteredRows}
							getSortedRows={::this.getSortedRows}
							getTableData={::this.getTableData}
							getCSVData={::this.getCSVData}
							getClipboardText={::this.getClipboardText}
							autoRefresh={10 * 60 * 1000}
							usePagination={true}
							loadingBarTitle={'Hold tight! We\'re getting your event\'s orders...'}
						>
							{/* It can give additional className to SEARCHBAR, DATATABLE, PAGINATIONBAR by specifying className="XXX" */}							
							<div 
								ref={SEARCHBAR}
								hasSearch 
								autoFocus 								
								labelTotalCount="Number of Matching Orders">								
							</div>
							<div className="card filter_row">
								<div className="row">
									<div className="filter-type col-xs-12 col-sm-4">
										<Select
											label='Filter by Ticket Type'
											value={filter_type}
											options={select_filter_types}
											onChange={::this.onFilterType}
											onBlur={::this.onFilterType} />										
									</div>
									<div className="filter-type col-xs-12 col-sm-4">
										<Select
											label='Filter by Add On'
											value={filter_addon}
											options={select_filter_addons}
											onChange={::this.onFilterAddon}
											onBlur={::this.onFilterAddon} />
									</div>
									<div className="filter-type guest-row guest-ticket-sm col-xs-12 col-sm-4">
										<div className="line">
											<div className="line-cell">
												<div className="checkbox-switch">
													<input type="checkbox" id="filter-guest-tickets" value={filter_compOrder} onChange={::this.onFilterCompOrder}/>
													<label htmlFor="filter-add-on"></label>
												</div>
											</div>
											<div className="line-cell">
												<label htmlFor="filter-guest-tickets">Only Show Guest Ticket Orders</label>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div className="tab-view">
								<div className="tab-header">
									<div className="tab-view-title">Show Orders:</div>
									{tab_header}
								</div>
							</div>							
							<div ref={DATATABLE}/> 
							<div ref={PAGINATIONBAR} hasCSVExport csvFileName={`orders_${event.id}.csv`}/>
						</JSONDatatable>
					</div>
				</div>
			</div>	
		)
	}
}