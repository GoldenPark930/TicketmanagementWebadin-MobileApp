import _ from 'lodash'
import React from 'react'
import {connect} from 'react-redux'

import Card from '../_library/Card'
import Select from '../_library/Select'

import GMap from './buyerlocation/GMap'
import LoadingBar from '../_library/LoadingBar'
import EmptyBar from '../_library/EmptyBar'
import Map from '../_library/Map'
import scrollToComponent from 'react-scroll-to-component'

import {FETCH_EVENT_BUYERLOCATION} from '../../_common/redux/buyerlocation/actions'
import {HTTP_INIT, HTTP_LOADING, HTTP_LOADING_SUCCESSED, HTTP_LOADING_FAILED} from '../../_common/core/http'

import {
	JSONDatatable, 
	TYPE_FROM_ARRAY,
	SEARCHBAR, DATATABLE, PAGINATIONBAR, 
	IS_FOUND,
} from '../_library/JSONDatatable'

class MapNarrator extends React.Component{
	constructor(props){
		super (props)
		this.state = {
			text: '',
			doAniMapNarrator: false,
		}
	}

	doAnimation(text) {
		this.setState({doAniMapNarrator: false, text: ''})
		let self = this
		setTimeout(function (){
			self.setState({doAniMapNarrator: true, text: text})
		}, 100)
	}

	render(){
		let classMapNarrator = this.state.doAniMapNarrator ? 'mapNarrator ani' : 'mapNarrator'
		return (
			<div className={classMapNarrator}>
				{this.state.text}
			</div>
		)
	}
}

@connect(
	(state) => {
		const event = state.events.get('selected').toJS()
		const buyerlocation = state.buyerlocation.get('buyerlocation').toJS()
		return {
			event,
			buyerlocation
		}
	},
	{FETCH_EVENT_BUYERLOCATION}
)
export default class EventBuyerLocation extends React.Component {
	constructor(props) {
		super (props)

		const {event} = props
		let currency = (event && event.currency && event.currency.currency) ? event.currency.currency : 'GLOBAL'
		let mapZoom = this.getMapZoom(currency)

		this.state = {
			mapData: [],
			mapZoom: mapZoom,
			status: HTTP_INIT,
		}
	}

	componentDidMount() {
		const {event, FETCH_EVENT_BUYERLOCATION} = this.props
		document.title = `Geographics - ${event.displayName} - The Ticket Fairy Dashboard`
		const loadingSetter_buyerlocation = (val) => () =>{
			this.setState({status: val})
		}
		Promise.resolve(FETCH_EVENT_BUYERLOCATION(event.id))
			.catch(loadingSetter_buyerlocation(HTTP_LOADING_SUCCESSED))
			.then(loadingSetter_buyerlocation(HTTP_LOADING_SUCCESSED))
		loadingSetter_buyerlocation(HTTP_LOADING)()
	}

	onClickDropdown(e){
		e.preventDefault()
		e.stopPropagation()
	}

	getMapZoom(code){
		switch(code){
			case 'GLOBAL':
				return {
					center: {lat: 5, lng: -30},
					zoom: 3
				}
				break
			case 'USD':
				return {
					center: {lat: 36, lng: -90},
					zoom: 4
				}
				break
			case 'NZD':
				return {
					center: {lat: -42, lng: 172},
					zoom: 5
				}
				break
			default:
				return {
					center: {lat: 5, lng: -30},
					zoom: 3
				}
				break
		}
	}

	onChangeLocationType(e){
		// console.log('location = ', e.target.value)
		// let mapZoom = this.getMapZoom(e.target.value)
		// return this.setState({mapZoom: mapZoom})
	}

	onChangePeriod(e){
		console.log('selected = ', e.target.value)	
	}

	onClickMap(e){

	}

	getCountryFlag(country){
		let flag = ''
		switch(country){
			case 'United States':
				flag = 'America.png'
				break
			case 'Australia':
				flag = 'Australia.png'
				break
			case 'New Zealand':
				flag = 'New-Zealand.png'
				break
			default:
				flag = 'America.png'
				break
		}
		let url = asset(`/assets/resources/images/flags/${flag}`)
		return (<img src = {url} className='countryFlag'/>)
	}

	moveMap(positionArray, narrator) {
		if(!this.refs.map)
			return
		scrollToComponent(this.refs.map)
		this.refs.map.moveMap(positionArray)
		if(this.refs.mapNarrator)
			this.refs.mapNarrator.doAnimation(narrator)
	}

	getTableDataCities(datatable, rows_filtered, sort){
		let clipboard_text = this.getClipboardTextCities(rows_filtered)
		let clipboard = datatable.getClipboardColumn(datatable, clipboard_text)

		let content_header = datatable.getHeaderRow(datatable, [
			{title: <div><div className="title-city">City</div><div className="title-counts">No. of Attendees</div></div>, sort: false},
			{title: clipboard, sort: false, className: 'column-clipboard'},
		], sort)

		return (rows_filtered.length != 0) ? (
			<table className="table top-attendees-tbl">
				<thead>
					{content_header}
				</thead>
				<tbody>
				{
					rows_filtered.map((city, index) => {
						return (
							<tr key={index}>
								<td colSpan="2">
									<div className="value-loc value-loc-mobile">{city[0].city}</div>
									<div className="go-to-loc"><i className="fa fa-location-arrow" onClick={this.moveMap.bind(this, city, city[0].city)}></i></div>
									<div className="value-loc value-loc-desktop">{city[0].city}</div>
									<div className="value-counts">{city.length}<div>Attendees</div></div>
								</td>
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

	getClipboardTextCities(rows_filtered){
		let ret = ''
		ret += 'City' + '\t' + 'No.of Attendees' + '\n'
		_.map(rows_filtered, (city)=>{
			ret += city[0].city + '\t' + city.length + '\n'
		})
		return ret
	}

	getTableDataRegions(datatable, rows_filtered, sort){
		let clipboard_text = this.getClipboardTextRegions(rows_filtered)
		let clipboard = datatable.getClipboardColumn(datatable, clipboard_text)

		let content_header = datatable.getHeaderRow(datatable, [
			{title: <div><div className="title-city">Region</div><div className="title-counts">No. of Attendees</div></div>, sort: false},
			{title: clipboard, sort: false, className: 'column-clipboard'},
		], sort)

		return (rows_filtered.length != 0) ? (
			<table className="table top-attendees-tbl">
				<thead>
					{content_header}
				</thead>
				<tbody>
				{
					rows_filtered.map((region, index) => {
						return (
							<tr key={index}>
								<td colSpan="2">
									<div className="value-loc value-loc-mobile">{region[0].region}</div>
									<div className="go-to-loc"><i className="fa fa-location-arrow" onClick={this.moveMap.bind(this, region, region[0].region)}></i></div>
									<div className="value-loc value-loc-desktop">{region[0].region}</div>
									<div className='value-counts'>{region.length}<div>Attendees</div></div>
								</td>
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

	getClipboardTextRegions(rows_filtered){
		let ret = ''
		ret += 'City' + '\t' + 'No.of Attendees' + '\n'
		_.map(rows_filtered, (region)=>{
			ret += region[0].region + '\t' + region.length + '\n'
		})
		return ret
	}

	getTableDataCountries(datatable, rows_filtered, sort){
		let clipboard_text = this.getClipboardTextCountries(rows_filtered)
		let clipboard = datatable.getClipboardColumn(datatable, clipboard_text)

		let content_header = datatable.getHeaderRow(datatable, [
			{title: <div><div className="title-city">Country</div><div className="title-counts">No. of Attendees</div></div>, sort: false},
			{title: clipboard, sort: false, className: 'column-clipboard'},
		], sort)

		return (rows_filtered.length != 0) ? (
			<table className="table top-attendees-tbl">
				<thead>
					{content_header}
				</thead>
				<tbody>
				{
					rows_filtered.map((country, index) => {
						return (
							<tr key={index}>
								<td colSpan="2">
									<div className="value-loc value-loc-mobile">{country[0].country}</div>
									<div className="go-to-loc"><i className="fa fa-location-arrow" onClick={this.moveMap.bind(this, country, country[0].country)}></i></div>
									<div className="value-loc value-loc-desktop">{country[0].country}</div>
									<div className='value-counts'>{country.length}<div>Attendees</div></div>
								</td>
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

	getClipboardTextCountries(rows_filtered){
		let ret = ''
		ret += 'City' + '\t' + 'No.of Attendees' + '\n'
		_.map(rows_filtered, (country)=>{
			ret += country[0].country + '\t' + country.length + '\n'
		})
		return ret
	}

	render () {
		const {buyerlocation, event} = this.props
		const {venue} = event
		let self = this
		let country = !!venue ? venue.country : 'Unknown'
		let countryTag = this.getCountryFlag(country)
		let currency = (event && event.currency && event.currency.currency) ? event.currency.currency : 'GLOBAL'
		let filteredLocation = _.compact(buyerlocation.order_locations) // remove null, undefined, ''

		// - get statistics
		let totalBuyers = filteredLocation.length
		let cityFiltered = _.filter(filteredLocation, loc=>loc.city !== undefined)
		let cities = _.sortBy(_.groupBy(cityFiltered, loc=>loc.city), city => city.length).reverse()

		let regionFiltered = _.filter(filteredLocation, loc=>loc.region !== undefined)
		let regions = _.sortBy(_.groupBy(regionFiltered, loc=>loc.region), region => region.length).reverse()

		let countryFiltered = _.filter(filteredLocation, loc=>loc.country !== undefined)
		let countries = _.sortBy(_.groupBy(countryFiltered, loc=>loc.country), country => country.length).reverse()

		let dropdown_locationType = (<div className="dropdown_locationType">
			<div className="text">Location</div>
			<div className="dropdown">
				<select id="locationType"
					className="form-control"
					onClick={::this.onClickDropdown} 
					onChange={::this.onChangeLocationType}
					defaultValue={currency}
					>
					<option value={'GLOBAL'}>Globally</option>
					<option value={'USD'}>United States</option>
					<option value={'NZD'}>New Zealand</option>
				</select>
			</div>
		</div>)
		let dropdown_period = (<div className="dropdown_period">
			<select id="dropdown_period" 
				className="form-control"
				onClick={::this.onClickDropdown} 
				onChange={::this.onChangeLocationType}
				defaultValue={'30'}
				>
				<option value={'30'}>Last 30 days</option>
				<option value={'60'}>Last 60 days</option>
			</select>
		</div>)

		return this.state.status <= HTTP_LOADING ? (
			<LoadingBar title={'Hold tight! We\'re getting your geographics ...'} />
		) :	filteredLocation.length == 0 ? (
			<EmptyBar/>
		) : (
			<div className="buyerlocation">
				<Card icon={'fa-globe'} title={'Attendee Locations'}>
					<div className="map">
						<Map ref='map' locations={[venue]} markers={filteredLocation} />
						<MapNarrator ref='mapNarrator'/>
					</div>
					<div className="numberOfBuyers">
						<div className="row">
							<div className="col-sm-2 col-xs-12 title text-center"><i className="fa fa-fw fa-users" />No. of Attendees</div>
							<div className="col-sm-2 col-xs-12 title text-center"><div className='range'><div className='color p1'/>0-9</div></div>
							<div className="col-sm-2 col-xs-12 title text-center"><div className='range'><div className='color p2'/>10-99</div></div>
							<div className="col-sm-2 col-xs-12 title text-center"><div className='range'><div className='color p3'/>100-999</div></div>
							<div className="col-sm-2 col-xs-12 title text-center"><div className='range'><div className='color p4'/>1000-9999</div></div>
							<div className="col-sm-2 col-xs-12 title text-center"><div className='range'><div className='color p5'/>10000+</div></div>
						</div>
					</div>
				</Card>
				<Card icon={'fa-bar-chart'} title={'Top Attendee Locations'}>
					<div className="row">
						<div className="col-xs-12 col-sm-4 buyerCard">
							<div className="title">
								<i className="fa fa-map-marker grey"></i>Top Cities
							</div>
							<div className="table-responsive">
								<JSONDatatable 
									type={TYPE_FROM_ARRAY}
									data={_.slice(cities, 0, 25)}
									getTableData={::this.getTableDataCities}
									getClipboardText={::this.getClipboardTextCities}
									usePagination={false}
								>
									<div ref={DATATABLE}/> 
								</JSONDatatable>
							</div>
						</div>
						<div className="col-xs-12 col-sm-4 buyerCard">
							<div className="title">
								<i className="fa fa-thumb-tack grey"></i>Top Regions
							</div>							
							<div className="table-responsive">
								<JSONDatatable 
									type={TYPE_FROM_ARRAY}
									data={_.slice(regions, 0, 25)}
									getTableData={::this.getTableDataRegions}
									getClipboardText={::this.getClipboardTextRegions}
									usePagination={false}
								>
									<div ref={DATATABLE}/> 
								</JSONDatatable>
							</div>
						</div>
						<div className="col-xs-12 col-sm-4 buyerCard">
							<div className="title">
								<i className="fa fa fa-globe grey"></i>Top Countries
							</div>							
							<div className="table-responsive">
								<JSONDatatable 
									type={TYPE_FROM_ARRAY}
									data={_.slice(countries, 0, 25)}
									getTableData={::this.getTableDataCountries}
									getClipboardText={::this.getClipboardTextCountries}
									usePagination={false}
								>
									<div ref={DATATABLE}/> 
								</JSONDatatable>
							</div>
						</div>
					</div>
				</Card>
			</div>
		)
	}
}