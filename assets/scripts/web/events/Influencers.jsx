import React from 'react'
import _ from 'lodash'

import {connect} from 'react-redux'
import LoadingBar from '../_library/LoadingBar'

import {makeURL, HTTP_INIT, HTTP_LOADING, HTTP_LOADING_SUCCESSED, HTTP_LOADING_FAILED, CACHE_SIZE} from '../../_common/core/http' 

import InfluencerShareRate from './influencers/InfluencerShareRate'
import InfluencerTiers from './influencers/InfluencerTiers'
import InfluencerPerformance from './influencers/InfluencerPerformance'
import InfluencerReferrers from './influencers/InfluencerReferrers'

@connect(
	(state) => {
		const event = state.events.get('selected').toJS()
		return {
			event
		}
	},
	{}
)
export default class Influencers extends React.Component {
	constructor(props) {
		super(props)		
		this.unMounted = true
		this.refreshTimer = null
		this.refreshFlag = false
		this.tmp = []
		this.state = {
			http_status: HTTP_INIT,
			rows: [],
		}
	}

	componentDidMount() {
		const {event, FETCH_EVENT_INFLUENCERS} = this.props
		document.title = `Influencers - ${event.displayName} - The Ticket Fairy Dashboard`

		let self = this
		self.unMounted = false
		self.init()
		self.refreshTimer = setInterval(()=>{
			if((self.state.http_status == HTTP_LOADING_SUCCESSED || 
				self.state.http_status == HTTP_LOADING_FAILED) && 
				!self.refreshFlag){
				self.refreshFlag = true
				self.init()
			}else{
				// console.log('autoRefresh is already in progress')
			}				
		}, 3 * 60 * 1000) // refresh every 3 mins
	}

	componentWillUnmount() {
		this.unMounted = true
		this.refreshFlag = false
		if(this.refreshTimer)
			clearInterval(this.refreshTimer)
	}

	init(){
		let self = this
		this.setState({http_status: HTTP_LOADING})

		const {event} = self.props
		let api = makeURL(`/api/events/${event.id}/relationships/referrals/`)
		this.tmp = []
		oboe({
			url: api,
			method: 'GET',
			headers: isDemoAccount() ? null : {
				'Accept': 'application/vnd.api+json',
				'Content-Type': 'application/vnd.api+json'
			},
			withCredentials: true
		}).node('!.data', function(record){
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
	
	render() {
		const {http_status, rows} = this.state
		const {event} = this.props
		const influencers = rows.length > 0 ? rows[0] : {}
		return (
			<div>
				<div className="row">
					<div className="col-xs-12">
						<InfluencerShareRate
							isLoading={false}
							statistics={influencers.statistics}
						/>
						<InfluencerTiers event={event} statistics={influencers.statistics}/>
						<InfluencerPerformance event={event} influencers={influencers}/>
						<InfluencerReferrers event={event} referrers={influencers.referrers}/>
					</div>
				</div>
			</div>
		)
	}
}

