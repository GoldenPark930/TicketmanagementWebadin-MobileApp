import moment from 'moment-timezone'
import classNames from 'classnames'
import React from 'react'
import {Link} from 'react-router'
import _ from 'lodash'

import DateLabel from '../../_library/DateLabel'
import Address from '../../_library/Address'
import LazyLoad from 'react-lazyload'

import EventTicketStatistics from './EventTicketStatistics'

export default class EventRow extends React.Component {
	static propTypes = {
		event: React.PropTypes.object.isRequired,
		autoRefresh: React.PropTypes.number,
	}

	render() {
		const {event, autoRefresh} = this.props
		const address = !!event ? event.venue : null
		const organization = !!event? event.$relationships.owner.displayName : null

		let permission = !!event ? event.$relationships.self.role : ''
		let organization_link = !!event ? '/brand/' + event.$relationships.owner.id + '/details' : '/brands'		
		let redirectPath = '/performance'
		
		if (permission === 'onsite'){
			redirectPath = '/details'
		}
		if (permission === 'curator'){
			redirectPath = '/invitations'
		}
		
		let startDate = moment(new Date(event.startDate))
		let startDate_utc = moment.utc(new Date(event.startDate))
		const now = new Date()
		const cs = [
			startDate.isBefore(now) ? 'row-stale eventslist-row ' : 'eventslist-row'
		].join(' ')

		return (
			<tr className={cs}> 
				<td className="eventslist-details">
					<div className="react-table">
						<div className="eventslist-thumbs">
							<div className='LazyLoad'>
								<LazyLoad width={150} height={150} once>
									{!!event.imageURL ? <Link to={'/event/' + event.id + redirectPath}><img className="LazyLoadImg" src={event.imageURL} /></Link> : <div>Not set</div>}
								</LazyLoad>
							</div>
							<div className="event-details">
								<div className="event-brand">
									<Link to={organization_link}>{organization}</Link>
								</div>
								<div className="event-name">
									<Link to={'/event/' + event.id + redirectPath}>{event.displayName}</Link>
								</div>
								<div className="event-time">
									<img src={asset('/assets/resources/images/icon-clock.png')}/>
									<DateLabel className="starttime" value={startDate_utc} format="LLL" />
								</div>
								<div className="event-address">
									<img src={asset('/assets/resources/images/icon-location.png')}/>
									{!!address && <Address className="address-form" type="simple" {...address} />}
									{!address && <div className="address-notdefined">Not Defined</div>}
								</div>
							</div>
						</div>
						<div className="table-cell">
							<div className="eventslist-actions top_position">
								<div className="event-actions-container">
									{permission !== 'curator' &&
										<EventTicketStatistics event={event} autoRefresh={autoRefresh}/>
									}
									<div className="eventslist-status">{this.props.children}</div>
								</div>
							</div>
						</div>
					</div>
				</td>
			</tr>			
		)
	}
}