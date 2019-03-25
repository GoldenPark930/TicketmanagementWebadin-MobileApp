import _ from 'lodash'
import Immutable from 'immutable'
import React from 'react'
import {connect} from 'react-redux'

import {FETCH_AUDIENCE} from '../../_common/redux/audience/actions'
import {FETCH_EVENT_DEMOGRAPHICS} from '../../_common/redux/performance/actions'
import LoadingBar from '../_library/LoadingBar'
import LazyLoad from 'react-lazy-load'
import EmptyBar from '../_library/EmptyBar'
import BarChart from '../_library/BarChart'
import PieChart from '../_library/PieChart'
import Card from '../_library/Card'
import ProgressCircle from '../_library/ProgressCircle'
import {
	JSONDatatable, 
	TYPE_FROM_ARRAY,
	SEARCHBAR, DATATABLE, PAGINATIONBAR, 
	IS_FOUND,
} from '../_library/JSONDatatable'

const STATE_STATUS_INIT = 0
const STATE_STATUS_LOADING = 1
const STATE_STATUS_SUCCESSED = 2
const STATE_STATUS_FAILED = 3

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
		const audience = state.audience.get('event').toJS()
		const audience_gender = audience.gender
		const audience_psychographics = audience.psychographics
		const performance = state.performance.get('performance').toJS()
		return {
			event,
			audience_gender,
			audience_psychographics,
			performance
		}
	},
	{FETCH_AUDIENCE, FETCH_EVENT_DEMOGRAPHICS}
)
export default class EventAudienceDemographics extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			status_audience_gender: STATE_STATUS_INIT,
			status_audience_psychographics: STATE_STATUS_INIT,
			status_performance_demographics: STATE_STATUS_INIT
		}
	}
	componentDidMount() {
		const {event, FETCH_AUDIENCE, FETCH_EVENT_DEMOGRAPHICS} = this.props
		document.title = `Demographics - ${event.displayName} - The Ticket Fairy Dashboard`
		const loadingSetter = (type, val) => () =>{
			switch(type){
				case 1:
					this.setState({status_audience_gender: val})
					break
				case 2:
					this.setState({status_audience_psychographics: val})
					break
				case 3:
					this.setState({status_performance_demographics: val})
					break
				default:
					break
			}			
		}
		// audience_gender
		Promise.resolve(FETCH_AUDIENCE(event.id, 'event', 'gender'))
			.catch(loadingSetter(1, STATE_STATUS_FAILED))
			.then(loadingSetter(1, STATE_STATUS_SUCCESSED))
		loadingSetter(1, STATE_STATUS_LOADING)()
		// audience_psychographics
		Promise.resolve(FETCH_AUDIENCE(event.id, 'event', 'psychographics'))
			.catch(loadingSetter(2, STATE_STATUS_FAILED))
			.then(loadingSetter(2, STATE_STATUS_SUCCESSED))
		loadingSetter(2, STATE_STATUS_LOADING)()
		// performance_demographics
		Promise.resolve(FETCH_EVENT_DEMOGRAPHICS(event.id))
			.catch(loadingSetter(3, STATE_STATUS_FAILED))
			.then(loadingSetter(3, STATE_STATUS_SUCCESSED))
		loadingSetter(3, STATE_STATUS_LOADING)()
	}

	getSortedRows(rows_filtered, sort){
		if(sort){
			let dir = sort.asc ? 'asc' : 'desc'
			switch(sort.index){
				case 0:
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return t.title}, dir)
					break
				case 1:
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return parseInt(t.value)}, dir)
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

		let content_header = datatable.getHeaderRow(datatable, [
			{title: 'Title', sort: true},
			{title: 'Number', sort: true},
			{title: clipboard, sort: false, className: 'column-clipboard'},
		], sort)

		let total = 0
		_.map(rows_filtered, (row, index)=>{
			total += row.value
		})

		return (rows_filtered.length != 0) ? (
			<table className="table tickets-table">
				<thead>
					{content_header}
				</thead>
				<tbody>
				{
					rows_filtered.map((row, index) => {
						return (
							<tr key={index} className={index % 2== 0 ? 'row-stale' : ''}>
								<td>{row.title}</td>
								<td>{row.value.toLocaleString()}</td>
								<td>&nbsp;</td>
							</tr>
						)
					})
				}
				</tbody>
			</table>
		): (
			<EmptyBar/>
		)
	}

	getClipboardText(rows_filtered){
		let ret = ''
		ret += 'Title' + '\t' + 'Number' + '\n'
		_.map(rows_filtered, (t)=>{
			ret += t.title + '\t' + t.value.toLocaleString() + '\n'
		})
		return ret
	}

	render() {
		const {status_audience_gender, status_audience_psychographics, status_performance_demographics} = this.state
		const {audience_gender, audience_psychographics, performance, event} = this.props
		let content_gender = null
		let content_age_breakdown = null
		let content_age_range = null
		let content_job_title = null

		// Gender Breakdown
		let gender = {male: 0, female: 0, male_percent: 0, female_percent: 0}
		if(status_audience_gender > STATE_STATUS_LOADING && audience_gender && audience_gender.audience && audience_gender.audience.gender){
			gender.male = audience_gender.audience.gender.male
			gender.female = audience_gender.audience.gender.female
			let sum = gender.male+gender.female
			sum = sum < 1 ? 1 : sum
			gender.female_percent = parseInt(gender.female / sum * 100)
			gender.male_percent = 100 - gender.female_percent
		}
		let pieChart = {'FEMALE': gender.female, 'MALE': gender.male}
		content_gender = 
			<div className="row gender-breakdown">
				<div className="col-xs-12 col-sm-4 pie-component">
					<PieChart 
						data={{method: 'local', data: pieChart}}
						options={{size: 200, legends: false, pieLabel: true, colors:['#FB52AE', '#5876FF']}}
					/>
					<div className="pie-component-bar">
						<div className="pie-component-bar-left">
							<div>MALE</div>
						</div>
						<div className="pie-component-bar-center">
							<div>OVERALL</div>
						</div>
						<div className="pie-component-bar-right">
							<div>FEMALE</div>
						</div>
					</div>
				</div>
				<div className="col-xs-12 col-sm-4 female-circle">
					<ProgressCircle img={asset('/assets/resources/images/icon-female.png')} value={gender.female_percent}/>					
					<div className="circle-info">
						<div className="circle-description">
							<div className="description1">
								<div className="circle-value">
									{gender.female}
								</div>
								<div className="circle-type">
									FEMALE
								</div>
							</div>							
							<div className="description2">
								Ticket Buyers
							</div>
						</div>			
					</div>
				</div>
				<div className="col-xs-12 col-sm-4 male-circle">
					<ProgressCircle img={asset('/assets/resources/images/icon-male.png')} value={gender.male_percent}/>					
					<div className="circle-info">
						<div className="circle-description">
							<div className="description1">
								<div className="circle-value">
									{gender.male}
								</div>
								<div className="circle-type">
									MALE
								</div>
							</div>							
							<div className="description2">
								Ticket Buyers
							</div>
						</div>			
					</div>
				</div>
			</div>
				
		// Age Breakdown
		if(status_performance_demographics > STATE_STATUS_LOADING && performance && performance.age_breakdown){
			let json = {}
			_.map(performance.age_breakdown, (age, index) => {
				return json[age.age] = parseInt(age.number)
			})
			let ages = Object.keys(json).map((t) => parseInt(t))
			let age_min = ages.reduce((a, b) => Math.min(a,b))
			let age_max = ages.reduce((a, b) => Math.max(a,b))
			let age = age_min
			while(age<age_max) {
				if(!json[age.toString()]) {
					json[age.toString()] = 0
				}
				age++
			}
			content_age_breakdown = <BarChart data={{method: 'local', data: json}} options={{barMinWidth: false}}/>
		}

		// Age Range
		let datum = [['< 18', 0, 0], ['18-20', 0, 0], ['21-25', 0, 0], ['26-30', 0, 0], ['31-40', 0, 0], ['41+', 0, 0]]
		let total = 0, highest = 0, max = 0, min = 0, lowest = 5
		if(performance && performance.age_breakdown){
			_.map(performance.age_breakdown, (t) => {
				const age = parseInt(t.age)
				const number = parseInt(t.number)
				total += number
				if(age <= 17){
					datum[0][1] += number
				}else if(age<=20){
					datum[1][1] += number
				}else if(age<=25){
					datum[2][1] += number
				}else if(age<=30){
					datum[3][1] += number
				}else if(age<=40){
					datum[4][1] += number
				}else{
					datum[5][1] += number
				}
			})
			_.map(datum, (t, index) => {
				if(max < t[1]){
					max = t[1]
					highest = index
				}
				if(min > t[1]){
					min = t[1]
					lowest = index
				}
				t[2] = parseInt(Math.round(t[1] / (total == 0 ? 1 : total) * 100))
			})			
		}
		let age_range = _.map(datum, (t, index)=>{
			return (
				<div key={index} className={`col-xs-12 col-sm-2 range-${index}`}>
					<div className="range-info-decoration"/>
					<div className={`age-range-circle`}>
						<ProgressCircle key={index} value={t[2]}/>						
					</div>
					<div className="range-info-bg"/>
					<div className="range-info text-center">
						<div className="ticket-count">
							{t[1].toLocaleString('en-US')}
						</div>
						<hr/>
						<div className="age-group">
							{t[0]}
						</div>
					</div>
					{index == 0 &&
					<div className="range-info-note">
						<div className="ticket-count">
							TICKET<br/>BUYERS
						</div>
						<div className="age-group">
							AGE<br/>GROUPS
						</div>
					</div>
					}
				</div>
			)
		})
		content_age_range = 
			<div className="row age-range">
				{age_range}
				<div className="age-range-sumup">
					<div className="age-range-sumup-panel col-12 row">
						<div className="col-xs-12 col-sm-4 total-sold text-center">
							<div className="description1">
								<div className="icon">
									<img src={asset('/assets/resources/images/demographics-star.png')}/>
								</div>
								<div className="number">
									{total.toLocaleString('en-US')}
								</div>
							</div>							
							<div className="description2">
								TOTAL TICKET BUYERS
							</div>
						</div>
						<div className="col-xs-12 col-sm-4 highest-group text-center">
							<div className="description1">
								<div className="icon">
									<img src={asset('/assets/resources/images/demographics-highest.png')}/>
								</div>
								<div className="number">
									{datum[highest][0]}
								</div>
							</div>							
							<div className="description2">
								HIGHEST AGE GROUP
							</div>
						</div>
						<div className="col-xs-12 col-sm-4 lowest-group text-center">
							<div className="description1">
								<div className="icon">
									<img src={asset('/assets/resources/images/demographics-lowest.png')}/>
								</div>
								<div className="number">
									{datum[lowest][0]}
								</div>
							</div>							
							<div className="description2">
								LOWEST AGE GROUP
							</div>
						</div>
					</div>
				</div>
			</div>
		
		// Job title
		let total_titles = 0, profile_count = 0
		if(status_audience_psychographics > STATE_STATUS_LOADING && audience_psychographics && audience_psychographics.audience && audience_psychographics.audience.jobs && audience_psychographics.audience.jobs.titles){
			profile_count = audience_psychographics.audience.jobs.profile_count
			let job_titles = audience_psychographics.audience.jobs.titles
			// test case
			// job_titles['ALead Developer'] = 1
			// job_titles['ALead developer'] = 2
			
			// filter titles
			let rows_job_titles = [], filtered_titles = {}
			_.map(job_titles, (value, key)=>{
				let isFound = false, found_value = null, found_key = null
				_.map(filtered_titles, (f_value, f_key)=>{
					if(key.toLowerCase() == f_key.toLowerCase()){
						isFound = true
						found_value = f_value
						found_key = f_key
					}
				})
				if(isFound){
					if(found_value < value){
						delete filtered_titles[found_key]
						filtered_titles[key] = Math.max(found_value, value)
					}
				}else{
					filtered_titles[key] = value	
				}
			})
			_.map(filtered_titles, (value, key)=>{
        rows_job_titles.push({
          title: key,
          value: value
				})
				total_titles += value
			})
			
			content_job_title = (
				<JSONDatatable 
					type={TYPE_FROM_ARRAY}
					data={rows_job_titles}
					sort={{index: 1, asc: false}}
					getSortedRows={::this.getSortedRows}
					getTableData={::this.getTableData}
					getClipboardText={::this.getClipboardText}
					usePagination={false}
				>
					<div ref={DATATABLE}/> 
				</JSONDatatable>)
		}
		return (
			<div className="demographics">
				<Card icon={'fa-male'} icon2={'fa-female'} title={'Gender Breakdown'}>
					<div className="card-block-title">
						<div className="highlight">
							Ticket Buyers by<strong className="left-space">Gender</strong>
						</div>
					</div>
					{content_gender}
				</Card>
				<Card icon={'fa-sliders'} title={'Age Breakdown'}>
					<div className="card-block-title">
						<div className="highlight">
							Tickets buyers by<strong className="left-space">AGE</strong>
						</div>
					</div>
					{content_age_breakdown}
				</Card>
				<Card icon={'fa-dot-circle-o'} title={'Age Ranges'}>
					<div className="card-block-title">
						<div className="highlight">
							Tickets Buyers by<strong className="left-space">AGE RANGE</strong>
						</div>
					</div>
					{content_age_range}
				</Card>
				<Card icon={'fa-briefcase'} title={'Professions'}>
					<div className="card-block-title">
						<div className="highlight">

						<div className="profession_stat">
							<img src={asset('/assets/resources/images/system_icons/profession.svg')} className="profession_icons"/>
							<div className="profession_count">
							<span>{total_titles}</span><div className="profession_count_title"><sup>Job Titles</sup></div>
							</div>
							</div> 

							<span className="across">ACROSS</span>



							<div className="profession_stat">
							<img src={asset('/assets/resources/images/system_icons/tickets.svg')} className="profession_icons"/>

							<div className="profession_count">
							<span>{profile_count}</span><div className="profession_count_title"><sup>Ticket Buyers</sup></div>
							</div>
							</div>




						</div>
					</div>
					<div className="div-spacing-20"/>
					{content_job_title}
				</Card>
			</div>
		)
	}
}

