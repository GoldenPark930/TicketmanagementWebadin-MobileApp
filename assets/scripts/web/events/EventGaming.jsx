import _ from 'lodash'
import Immutable from 'immutable'
import React from 'react'
import {connect} from 'react-redux'

import {
	JSONDatatable, 
	TYPE_FROM_URL,
	SEARCHBAR, DATATABLE, PAGINATIONBAR, 
	IS_FOUND,
} from '../_library/JSONDatatable'
import EmptyBar from '../_library/EmptyBar'
import LazyLoad from 'react-lazyload'

@connect(
	(state) => {	
		const event = state.events.get('selected').toJS()
		return {
			event
		}
	}
)
export default class EventGaming extends React.Component {
	constructor(props) {
		super(props)
	}

	componentDidMount() {
		const {event} = this.props
		document.title = `Gaming - ${event.displayName} - The Ticket Fairy Dashboard`
	}

	validateData(data, index){
		// validate goes here
		if(!data.channel || !data.channel.display_name)
			return null
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
				found += IS_FOUND(item.channel.display_name, keyword)
				return found > 0
			})
		}
		return rows_filtered
	}

	getSortedRows(rows_filtered, sort){
		if(sort){
			let dir = sort.asc ? 'asc' : 'desc'
			switch(sort.index){
				case 1: // name
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return t.channel.display_name}, dir)
					break
				case 2: // followers
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return parseInt(t.channel.followers)}, dir)
					break
				case 3: // views
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return parseInt(t.channel.views)}, dir)
					break
				case 4: // partner
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return t.channel.partner}, dir)
					break
				default:
					break
			}
		}
		return rows_filtered
	}

	getTableData(datatable, rows_filtered, sort){
		let clipboard_text = this.getClipboardText(rows_filtered)
		let clipboard = datatable.getClipboardColumn(datatable, clipboard_text)

		const {event} = this.props
		let content_header = datatable.getHeaderRow(datatable, [
				{title: '', sort: false},
				{title: 'Channel Name', sort: true},
				{title: 'Followers', sort: true, className: 'text-center'},
				{title: 'Views', sort: true, className: 'text-center'},
				{title: 'Partner Status', sort: true, className: 'text-center'},
				{title: clipboard, sort: false, className: 'column-clipboard'},
			], sort)
		
		let number = 0
		let content_table = _.map(rows_filtered, (t, index)=>{
			let partner_color = t.channel.partner ? '#7d5bbe' : 'red'

			let content_row = <tr key={index} className={t.isExpanded ? ' tr-expanded-row' : (number++ % 2==0 ? 'table-stripe-row1' : 'table-stripe-row2')}>					
				<td>
					<div className="gaming-circle">
						{!!t.channel.logo && <a target="_blank" href={t.channel.url}><LazyLoad height={40} width={40} once><img className="LazyLoadImg" src={t.channel.logo}/></LazyLoad ></a>}
					</div>
				</td>				
				<td>
					<div className="gaming-name text-left">
						{!! t.channel.url && <a target="_blank" href={t.channel.url}>
							{t.channel.name}
						</a>}
						{!t.channel.url && t.channel.name}
					</div>
				</td>
				<td className='text-center'>{t.channel.followers.toLocaleString()}</td>
				<td className='text-center'>{t.channel.views.toLocaleString()}</td>
				<td className='text-center'>
					<div style={{color: partner_color}}><i className="fa fa-twitch" aria-hidden="true"></i></div>
				</td>
				<td></td>
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
		let ret = ''
		ret += 'Channel Name' + '\t' + 'Followers' + '\t' + 'Views' + '\n'
		_.map(rows_filtered, (t)=>{
			ret += t.channel.name + '\t' + t.channel.followers.toLocaleString() + '\t' + t.channel.views.toLocaleString() + '\n'
		})
		return ret
	}

	render() {		
		const {event} = this.props
		return (
			<div className="event-gaming">
				<div className="row">
					<div className="col-xs-12">
						<h3 className="heading_style"><i className="fa fa-twitch" aria-hidden="true"></i> Twitch Users</h3>
						<JSONDatatable 							
							type={TYPE_FROM_URL}
							data={{url: `/api/events/${event.id}/relationships/gaming/`, node: 'data.twitch_users.*'}}
							sort={{index: 2, asc: false}}
							validateData={::this.validateData}
							getFilteredRows={::this.getFilteredRows}
							getSortedRows={::this.getSortedRows}
							getTableData={::this.getTableData}
							getClipboardText={::this.getClipboardText}
							usePagination={false}
							loadingBarTitle={'Hold tight! We\'re getting your event\'s gaming statistics...'}
						>
							{/* It can give additional className to SEARCHBAR, DATATABLE, PAGINATIONBAR by specifying className="XXX" */}
							<div ref={SEARCHBAR} hasSearch autoFocus labelTotalCount="Number of Matching Channels" />
							<div ref={DATATABLE}/> 
							<div ref={PAGINATIONBAR}/>
						</JSONDatatable>
					</div>
				</div>
			</div>
		)
	}
}

