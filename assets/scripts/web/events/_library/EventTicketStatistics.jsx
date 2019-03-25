import _ from 'lodash'
import React from 'react'
import moment from 'moment-timezone'
import {makeURL} from '../../../_common/core/http'
import {HTTP_INIT, HTTP_LOADING, HTTP_LOADING_SUCCESSED, HTTP_LOADING_FAILED, CACHE_SIZE} from '../../../_common/core/http' 
import NumberAnimation from '../../_library/NumberAnimation'

import {connect} from 'react-redux'
import {UPDATE_EVENT_TICKET_STATISTICS} from '../../../_common/redux/events/actions'

const ANIMATION_DURATION = 3000
@connect(
	(store) => ({
		ticketStats: store.events.get('ticketStats').toList().toJS()		
	}),
	{UPDATE_EVENT_TICKET_STATISTICS}
)
export default class EventTicketStatistics extends React.Component{
	static propType = {
		event: React.PropTypes.object.isRequired,		
	}

	constructor(props) {
		super(props)

		this.tmp = []
		this.refreshFlag = false
		this.refreshTimer = null
		this.unMounted = true

		this.everLoaded = false

		this.isFirstTime = true
		this.yesterdaySold = 0
		this.initSold = 0
		this.initRevenue = 0
		this.initTotal = 0

		this.state = {
			http_status: HTTP_INIT,
			http_error: null,
			rows: [],
		}
	}

	componentDidMount() {
		window.addEventListener('scroll', this.handleScroll.bind(this))
		const {autoRefresh} = this.props
		this.unMounted = false
		this.init(true)
		let self = this
		if(autoRefresh && autoRefresh > 1000){
			self.refreshTimer = setInterval(()=>{
				if((self.state.http_status == HTTP_LOADING_SUCCESSED || self.state.http_status == HTTP_LOADING_FAILED) && !self.refreshFlag){
					const {event} = this.props
					if(!!event.salesEndDate && moment().isBefore(moment(event.salesEndDate))){
						self.refreshFlag = true
						self.init(false)
					}
					// self.setState({http_status: self.state.http_status})
				}
			}, autoRefresh)
		}		
	}

	componentWillUnmount() {
		window.removeEventListener('scroll', this.handleScroll.bind(this))
		this.unMounted = true
		this.refreshFlag = false
		if(this.refreshTimer)
			clearInterval(this.refreshTimer)
	}

	handleScroll(){
		if(this.unMounted)
			return
		let isVisible = this.isInVisibleArea()
		if(isVisible && !this.everLoaded){
			this.init(true)
		}
	}

	isInVisibleArea(){
		let ele = $(this.refs.statContainer)
		if(!ele)
			return false
		let windowTop = $(window).scrollTop()
		let windowBottom = $(window).scrollTop() + $(window).height()
		let elementTop = ele.offset().top
		let elementBottom = ele.offset().top+ele.height()
		return elementTop >= windowTop ? elementTop <= windowBottom : elementBottom >= windowTop
	}

	init(isInitial){
		const self = this
		const {event, ticketStats} = this.props

		let isVisible = this.isInVisibleArea()
		if(!isVisible){
			if(isInitial)
				this.everLoaded = false
			else
				this.refreshFlag = false
			return
		}

		this.everLoaded = true

		let isFoundFromRedux = false
		if(isInitial){			
			_.map(ticketStats, (ts) => {
				if(ts.id == event.id){
					this.setState({
						ysold: ts.ysold,
						sold: ts.sold,
						total: ts.total,
						revenue: ts.revenue,
						http_status: HTTP_LOADING_SUCCESSED
					})
					isFoundFromRedux = true
				}
			})
		}
		if(isFoundFromRedux){
			// this.animationSpeed = 0
			return
		}

		this.tmp = []

		const url = `/api/events/${event.id}/relationships/performance/`
		const param = {'section': 'sales'}
		const node = 'data.sales.*'

		oboe({
			url: makeURL(url, param),
			method: 'GET',
			headers: isDemoAccount() ? null : {
				'Accept': 'application/vnd.api+json',
				'Content-Type': 'application/vnd.api+json'
			},
			withCredentials: true
		}).node(node, (record) => {
			if(!self.unMounted) {
				self.tmp.push(record)
				if(self.tmp.length === CACHE_SIZE && !self.refreshFlag){
					self.addToRow(self.tmp, HTTP_LOADING, null)
				}
			}
		}).done(() => {
			if(!self.unMounted)
				self.addToRow(null, HTTP_LOADING_SUCCESSED, null)
		}).fail((errorReport) => {
			if(!self.unMounted)
				self.addToRow(null, HTTP_LOADING_FAILED, errorReport)
		})
	}

	addToRow(cached, http_status, http_error){
		let rows = this.refreshFlag ? [] : this.state.rows

		let tmp = !!cached ? cached : this.tmp
		let start = rows.length
		_.map(tmp, (o, index)=>{
			// newRow.id = index
			let newRow = Object.assign({}, o)
			if(newRow){
				rows.push(newRow)
			}
		})
		if(this.refreshFlag){
			this.refreshFlag = false			
		}		
		this.tmp = []
		const {event} = this.props

		if(http_status > HTTP_LOADING && !this.refreshFlag){
			let currentDate = !!event.timezone ? moment().tz(event.timezone).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD')
			let yesterday = !!event.timezone ? moment().add(-1, 'days').tz(event.timezone).format('YYYY-MM-DD') : moment().add(-1, 'days').format('YYYY-MM-DD')
			let sold=0, revenue=0, total=0, ysold = 0
			_.each(rows, (s, index) => {
				if(s.order_date == yesterday){
					ysold = !s.quantity || isNaN(s.quantity) ? 0 : parseInt(s.quantity)
				}
				if(s.order_date == currentDate){
					sold = !s.quantity || isNaN(s.quantity) ? 0 : parseInt(s.quantity)
				}
				total += !s.quantity || isNaN(s.quantity) ? 0 : parseInt(s.quantity)
				revenue += !s.income || isNaN(s.income) ? 0 : parseFloat(s.income)
			})
			this.props.UPDATE_EVENT_TICKET_STATISTICS({
				id: this.props.event.id,
				ysold: ysold,
				sold: sold,
				total: total,
				revenue: revenue
			})
		}
		this.setState({
			http_status: http_status,
			http_error: http_error,
			rows: rows,			
		})
	}

	render() {		
		const {http_status} = this.state
		const {event, ticketStats} = this.props
		const isLimitedStats = !!event ? (event.$relationships.self.role == 'limited_stats' ? true : false) : false		
		let currency = getCurrencySymbol(event)

		let sold = 0, revenue = 0, total = 0, ysold = 0
		const isLoading = http_status <= HTTP_LOADING && !this.refreshFlag
		_.map(ticketStats, (ts) => {
			if(ts.id == event.id){
				ysold = ts.ysold
				sold = ts.sold
				total = ts.total
				revenue = ts.revenue
			}
		})
		if(this.isFirstTime){
			this.yesterdaySold = ysold
			this.initSold = sold
			this.initRevenue = revenue
			this.initTotal = total
			this.isFirstTime = false
		}
		return (		
			<div ref="statContainer" className="events-quickstat">				
				<ul className="clearfix">		
				<div className="quick-event-stat tickets-sold-stat">
				<span className="tictets-state-title"><i className="fa fa-ticket"></i>Tickets Sold</span>			
					<li>
						<div className="eventlist-stat tickets-stat-content">
							<div className="stat_number">
								<NumberAnimation 
									isLoading={isLoading} 
									initValue={this.initSold} 
									target={sold} 
									duration={ANIMATION_DURATION} 
									decimals={0} 
									useGroup={false} 
									animation={'up'}/>
							</div>
							<div className="legend-text">Today</div>
						</div>
					</li>
					<li>
						<div className="eventlist-stat tickets-stat-content">
							<div className="stat_number">
								<NumberAnimation 
									isLoading={isLoading} 
									initValue={this.yesterdaySold} 
									target={ysold} 
									duration={ANIMATION_DURATION} 
									decimals={0} 
									useGroup={false} 
									animation={'up'}/>
							</div>
							<div className="legend-text">Yesterday</div>
						</div>
					</li>
					<li>
						<div className="eventlist-stat tickets-stat-content">
							<div className="stat_number">
								<NumberAnimation 
									isLoading={isLoading} 
									initValue={this.initTotal} 
									target={total} 
									duration={ANIMATION_DURATION} 
									decimals={0} 
									useGroup={false} 
									animation={'up'}/>
							</div>
							<div className="legend-text">Total</div>
						</div>
					</li>
					</div>
					<div className="quick-event-stat mobile-revenue-title">
					<span className="tictets-state-title"><i className="fa fa-money"></i>Revenue</span>	
					{!isLimitedStats &&
					<li>
						
						<div className="eventlist-stat tickets-stat-content">
							<div className="stat_number">
								<NumberAnimation 
									isLoading={isLoading} 
									initValue={this.initRevenue} 
									target={revenue} 
									duration={ANIMATION_DURATION} 
									decimals={2} 
									useGroup={true} 
									animation={'up'} 
									prefix={currency + ' '}/>
							</div>
							<div className="legend-text">Total</div>
						</div>
					</li>
					}
					</div>				
				</ul>
			</div>
		)
	}
}