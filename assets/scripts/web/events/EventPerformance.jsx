import _ from 'lodash'
import Immutable from 'immutable'
import React from 'react'
import {connect} from 'react-redux'
import LoadingBar from '../_library/LoadingBar'
import EmptyBar from '../_library/EmptyBar'
import Button from '../_library/Button'
import PDF from '../_library/Pdf'
import {FETCH_EVENT_TICKETS} from '../../_common/redux/tickets/actions'

import {Tab, TabView} from '../_library/TabView'

import PerformanceSales from './performance/PerformanceSales'
import PerformanceReleaseBreakdown from './performance/PerformanceReleaseBreakdown'
import PerformanceCharges from './performance/PerformanceCharges'
import PerformanceDiscountCodeBreakdown from './performance/PerformanceDiscountCodeBreakdown'
import PerformancePromoterSales from './performance/PerformancePromoterSales'
import PerformancePasswordBreakdown from './performance/PerformancePasswordBreakdown'
import PerformanceAddOnBreakdown from './performance/PerformanceAddOnBreakdown'
import PerformanceWaitingList from './performance/PerformanceWaitingList'
import PerformanceResale from './performance/PerformanceResale'
import PerformanceBoxOfficeSales from './performance/PerformanceBoxOfficeSales'
import PerformancePreRegistration from './performance/PerformancePreRegistration'

@connect(
	(state) => {
		const event = state.events.get('selected').toJS()
		const u = state.auth.get('user')
		const col = state.tickets.get('collection')
		const tickets = state.tickets
			.getIn(['byEvent', event.id], Immutable.List())
			.map(tid => col.get(tid))
			.toJS()
		return {
			event,
			user: u ? u.toJS() : null,
			tickets
		}
	},
	{FETCH_EVENT_TICKETS}
)
export default class EventPerformance extends React.Component {
	constructor(props) {
		super(props)
	}

	componentDidMount() {
		const {event, FETCH_EVENT_TICKETS} = this.props
		document.title = `Performance - ${event.displayName} - The Ticket Fairy Dashboard`

		Promise.resolve(FETCH_EVENT_TICKETS(event.id))
	}

	render() {
		const {user, event, tickets} = this.props
		const brands = _.get(user, '$relationships.organizations', [])
		const isLimitedStats = !!event ? (event.$relationships.self.role == 'limited_stats' ? true : false) : false

		let title_sales = <div className="tab-title-content"><i className="fa fa-bar-chart"/>Ticket Sales</div>
		let title_releasebreakdown = <div className="tab-title-content"><i className="fa fa-pie-chart"/>Sales by Ticket Type</div>
		let title_addons = <div className="tab-title-content"><i className="fa fa-plus"/>Add ons</div>
		let title_preregistration = <div className="tab-title-content"><i className="fa fa-signing"/>Pre-Registration</div>
		let title_waitinglist = <div className="tab-title-content"><i className="fa fa-hourglass-half"/>Waiting List</div>
		let title_resale = <div className="tab-title-content"><i className="fa fa-usd"/>Ticket Resale</div>
		let title_discount = <div className="tab-title-content"><i className="fa fa-money"/>Sales by Discount Code</div>
		let title_promoter = <div className="tab-title-content"><i className="fa fa-bullhorn"/>Sales by Promoter</div>
		let title_boxofficesales = <div className="tab-title-content"><i className="fa fa-ticket"/>Box Office Sales</div>
		let title_additionalcharges = <div className="tab-title-content"><i className="fa fa-usd"/>Additional Charges</div>
		let title_password = <div className="tab-title-content"><i className="fa fa-key"/>Sales by Password</div>

		return isLimitedStats ? (
			<div className="performance">
				<PerformanceSales event={event} isLimited={isLimitedStats}/>
			</div>
		):(
			<div className="performance" id="performance">
				<PDF event={event} fileName={'performance_' + event.id} brands={brands}/>
				<TabView
					all={false}
					headerClassName="performance-tab-header"
					bodyClassName="performance-tab-body"
					passProps 
					hasBackground
					hasPerfectScrollBar
				>
					<Tab title={title_sales}>
						<PerformanceSales event={event}/>
					</Tab>
					<Tab title={title_releasebreakdown}>
						<PerformanceReleaseBreakdown event={event} tickets={tickets}/>
					</Tab>
					<Tab title={title_addons}>
						<PerformanceAddOnBreakdown event={event}/>
					</Tab>					
					<Tab title={title_preregistration}>
						<PerformancePreRegistration event={event}/>
					</Tab>
					<Tab title={title_waitinglist}>
						<PerformanceWaitingList event={event}/>
					</Tab>
					<Tab title={title_resale}>
						<PerformanceResale event={event}/>
					</Tab>
					<Tab title={title_discount}>
						<PerformanceDiscountCodeBreakdown event={event}/>
					</Tab>
					<Tab title={title_promoter}>
						<PerformancePromoterSales event={event}/>
					</Tab>
					<Tab title={title_boxofficesales}>
						<PerformanceBoxOfficeSales event={event}/>
					</Tab>
					<Tab title={title_additionalcharges}>
						<PerformanceCharges event={event}/>
					</Tab>
					<Tab title={title_password}>
						<PerformancePasswordBreakdown event={event}/>
					</Tab>
				</TabView>
			</div>
		)
	}
}

