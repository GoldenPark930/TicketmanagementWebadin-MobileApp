import _ from 'lodash'
import Immutable from 'immutable'
import React from 'react'
import {connect} from 'react-redux'
import Card from '../_library/Card'
import EmptyBar from '../_library/EmptyBar'
import LoadingBar from '../_library/LoadingBar'
import PieChart from '../_library/PieChart'
import {Tab, TabView} from '../_library/TabView'
import NumberAnimation from '../_library/NumberAnimation'
import {
	JSONDatatable, 
	TYPE_FROM_ARRAY,
	SEARCHBAR, DATATABLE, PAGINATIONBAR, 
	IS_FOUND,
} from '../_library/JSONDatatable'
import {makeURL, HTTP_INIT, HTTP_LOADING, HTTP_LOADING_SUCCESSED, HTTP_LOADING_FAILED, CACHE_SIZE} from '../../_common/core/http' 

const convertFileName = (title) => {
	let str = title.toLowerCase()
	str = str.replace(/[^a-zA-Z0-9 \.]/g, '')
	str = str.replace(/\s/g, '-')
	return str
}
@connect(
	(state) => {
		const event = state.events.get('selected').toJS()
		return {
			event,
		}
	}
)
export default class EventDevices extends React.Component {
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
		const {event} = this.props
		document.title = `Devices - ${event.displayName} - The Ticket Fairy Dashboard`
		let self = this
		self.unMounted = false
		self.init()
		self.refreshTimer = setInterval(()=>{
			if((self.state.http_status == HTTP_LOADING_SUCCESSED || self.state.http_status == HTTP_LOADING_FAILED) && !self.refreshFlag){
				self.refreshFlag = true
				self.init()
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
  
	init(){		
    let self = this

		const {event} = self.props
		let api = makeURL(`/api/events/${event.id}/relationships/devices/`)
		this.tmp = []
		oboe({
			url: api,
			method: 'GET',
			headers: isDemoAccount() ? null : {
				'Accept': 'application/vnd.api+json',
				'Content-Type': 'application/vnd.api+json'
			},
			withCredentials: true
		}).node('data.*', function(record){
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
		const htmlDeviceHeader = <div className="header_row"><img src={asset('/assets/resources/images/event/devices/devices-names/_devices.svg')}/>Devices</div>
		const htmlNumberHeader = <div className="header_row text-center"><img src={asset('/assets/resources/images/event/devices/devices-names/_numberofusers.svg')}/>No of Users</div>
		let content_header = datatable.getHeaderRow(datatable, [
			{title: htmlDeviceHeader, sort: false},
			{title: htmlNumberHeader, sort: false},
			{title: htmlDeviceHeader, sort: false},
			{title: htmlNumberHeader, sort: false},
		], sort)

		let totalCount = rows_filtered.length
		let leftColumn = Math.ceil(totalCount / 2)
		let result = []
		if (totalCount > 0){
			for(let index = 0; index< leftColumn; index++ ){
				result.push((
					<tr key={index} className={index % 2== 0 ? 'row-stale' : ''}>
						<td>{rows_filtered[index].title}</td>
						<td className="text-center">{rows_filtered[index].value.toLocaleString()}</td>
						<td>{rows_filtered[index + leftColumn] ? rows_filtered[index + leftColumn].title : ''}</td>
						<td className="text-center">{rows_filtered[index + leftColumn] ? rows_filtered[index + leftColumn].value.toLocaleString() : ''}</td>
					</tr>
				))
			}
		}
		

		return ( totalCount != 0) ? (
			<table className="table tickets-table">
				<thead>
					{content_header}
				</thead>
				<tbody>
					{result}
				</tbody>
			</table>
		): null
	}

	getClipboardText(rows_filtered){
		let ret = ''
		ret += 'Title' + '\t' + 'Number' + '\n'
		_.map(rows_filtered, (t)=>{
			ret += t.title + '\t' + t.value.toLocaleString() + '\n'
		})
		return ret
	}

	handleImageError(obj){
		obj.target.src = asset('/assets/resources/images/event/devices/_unknown.svg')
	}

	render() {
		const {event, tickets} = this.props
		const {rows, http_status} = this.state
		
		let total = 0
    let showContents = http_status > HTTP_LOADING && rows.length > 0
    let rows_browser=[], rows_device_type=[], rows_device_name=[], rows_platform_description=[], rows_device_brand_name=[]
    if(showContents){
      let obj = rows[0]
      _.map(obj.browser, (value, key)=>{
        rows_browser.push({
          title: key,
          value: value
				})
				total += value				
			})
			rows_browser = _.orderBy(rows_browser, (t)=>{return t.value}, 'desc')

      _.map(obj.device_type, (value, key)=>{
        rows_device_type.push({
          title: key,
          value: value
        })        
			})
			rows_device_type = _.orderBy(rows_device_type, (t)=>{return t.value}, 'desc')

      _.map(obj.device_name, (value, key)=>{
        rows_device_name.push({
          title: key,
          value: value
        })        
			})
			rows_device_name = _.orderBy(rows_device_name, (t)=>{return t.value}, 'desc')

      _.map(obj.platform_description, (value, key)=>{
        rows_platform_description.push({
          title: key,
          value: value
        })        
			})
			rows_platform_description = _.orderBy(rows_platform_description, (t)=>{return t.value}, 'desc')

      _.map(obj.device_brand_name, (value, key)=>{
        rows_device_brand_name.push({
          title: key,
          value: value
        })        
			})
			rows_device_brand_name = _.orderBy(rows_device_brand_name, (t)=>{return t.value}, 'desc')
		}
		
		let tab_title1 = <div className="tab-title-category"><img src={asset('/assets/resources/images/event/devices/icon_tab_browser.svg')}/>Browsers</div>
		let tab_title2 = <div className="tab-title-category"><img src={asset('/assets/resources/images/event/devices/icon_tab_device_type.svg')}/>Device Types</div>
		let tab_title3 = <div className="tab-title-category"><img src={asset('/assets/resources/images/event/devices/icon_tab_os.svg')}/>Platforms</div>
		let tab_title4 = <div className="tab-title-category"><img src={asset('/assets/resources/images/event/devices/icon_tab_devices_brands.svg')}/>Device Brands</div>
		let tab_title5 = <div className="tab-title-category"><img src={asset('/assets/resources/images/event/devices/icon_tab_device_name.svg')}/>Device Names</div>
		
		// Tab-1. Browsers
		let browser_top5 = rows_browser.slice(0, 5)
		let browser_rest = rows_browser.slice(6, rows_browser.length)
		let getTiles_browser = (items, showRank) => {
			return _.map(items, (item, index)=>{
				let imgName = convertFileName(item.title)
				let imgSrc = asset('/assets/resources/images/event/devices/browser/' + imgName + '.svg')
				return (
					<div key={index} className='tile'>
						<div className='content'>
							{showRank && <div className='rank'>{index + 1}</div>}
							<img onError={this.handleImageError} className='icon' src={imgSrc}/>
							<div className='value'>
								<div className='numbers'>{item.value.toLocaleString()}</div>
								<div className='title'>{item.title}</div>
							</div>
						</div>
					</div>
				)
			})
		}
		let tab_content1 = (
			<div className="tab_content_browsers">
				<div className="top5">{getTiles_browser(browser_top5, true)}</div>
				<div className="tickets">
					<div className="decoration-icon">
						<div className="decoration"/>
						<img src={asset('/assets/resources/images/event/devices/icon_tickets.svg')}/>
						<div className="decoration"/>
					</div>
					<div className="decoration-text">Other Browsers</div>
				</div>
				<div className="lists">{getTiles_browser(browser_rest, false)}</div>
			</div>
		)

		// Tab-2. Devices Type
		let getTiles_device_types = (items) => {
			return _.map(items, (item, index)=>{
				let imgName = convertFileName(item.title)
				let imgSrc = asset('/assets/resources/images/event/devices/devices-types/' + imgName + '.svg')
				return (
					<div key={index} className='tile'>
						<div className='content'>
							<img onError={this.handleImageError} className='icon' src={imgSrc}/>
							<div className='numbers'>{item.value.toLocaleString()}</div>
							<div className='decoration'/>
							<div className='title'>{item.title}</div>
						</div>
					</div>
				)
			})
		}
		let tab_content2 = (
			<div className="tab_content_device_types">
				<div className="top5">{getTiles_device_types(rows_device_type)}</div>				
			</div>
		)

		// Tab-3. Platforms
		let getTiles_platform = (items) => {
			return _.map(items, (item, index)=>{
				let imgName = convertFileName(item.title)
				let imgSrc = asset('/assets/resources/images/event/devices/os-platforms/' + imgName + '.svg')
				return (
					<div key={index} className='tile'>
						<div className='content'>
							<img onError={this.handleImageError} className='icon' src={imgSrc}/>
							<div className='numbers'>{item.value.toLocaleString()}</div>
							<div className='title'>{item.title}</div>
						</div>
					</div>
				)
			})
		}
		let tab_content3 = (
			<div className="tab_content_device_types">
				<div className="top5">{getTiles_platform(rows_platform_description)}</div>				
			</div>
		)

		// Tab-4. Devices Brands
		let brands_top5 = rows_device_brand_name.slice(0, 5)
		let brands_rest = rows_device_brand_name.slice(6, rows_device_brand_name.length)
		let getTiles_brands = (items) => {
			return _.map(items, (item, index)=>{
				let imgName = convertFileName(item.title)
				let imgSrc = asset('/assets/resources/images/event/devices/devices-brands/' + imgName + '.svg')
				return (
					<div key={index} className="tile-brands">
						<div className="content">
							<div className="content-top">
								<img onError={this.handleImageError} className='icon' src={imgSrc}/>
								
							</div>
							<div className='value'>
								<div className='numbers'>{item.value.toLocaleString()}</div>
								<div className='title'>{item.title}</div>
							</div>
						</div>
					</div>
				)
			})
		}
		let getTiles_brands_rest = (items, showRank) => {
			return _.map(items, (item, index)=>{
				let imgName = convertFileName(item.title)
				let imgSrc = asset('/assets/resources/images/event/devices/devices-brands/' + imgName + '.svg')
				return (
					<div key={index} className='tile'>
						<div className='content'>
							{showRank && <div className='rank'>{index + 1}</div>}
							<img onError={this.handleImageError} className='icon' src={imgSrc}/>
							<div className='value'>
								<div className='numbers'>{item.value.toLocaleString()}</div>
								<div className='title'>{item.title}</div>
							</div>
						</div>
					</div>
				)
			})
		}
		let tab_content4 = (
			<div className="tab_content_device_brands">				
				<div className="top5">{getTiles_brands(brands_top5)}</div>
				<div className="tickets">
					<div className="decoration-icon">
						<div className="decoration"/>
						<img src={asset('/assets/resources/images/event/devices/icon_tickets.svg')}/>
						<div className="decoration"/>
					</div>
					<div className="decoration-text">Other Brands</div>
				</div>
				<div className="lists">{getTiles_brands_rest(brands_rest)}</div>
			</div>
		)

		// Tab-5. Devices Name
		let device_name_top5 = rows_device_name.slice(0, 5)
		let device_name_rest = rows_device_name.slice(6, rows_device_name.length)
		let getTiles_device_name = (items) => {
			return _.map(items, (item, index)=>{
				let imgName = convertFileName(item.title)
				let imgSrc = asset('/assets/resources/images/event/devices/devices-names/' + imgName + '.svg')
				return (
					<div key={index} className='tile'>
						<div className='content'>
							<img onError={this.handleImageError} className='icon' src={imgSrc}/>
							<div className='numbers'>{item.value.toLocaleString()}</div>
							<div className='title'>{item.title}</div>
						</div>
					</div>
				)
			})
		}
		let tab_content5 = (
			<div className="tab_content_device_types">
				<div className="top5">{getTiles_device_name(device_name_top5)}</div>
				<JSONDatatable 
					type={TYPE_FROM_ARRAY}
					parent_http_status={http_status}
					data={device_name_rest}
					sort={{index: 1, asc: false}}
					getTableData={::this.getTableData}
					usePagination={false}
				>
					<div ref={DATATABLE}/> 
				</JSONDatatable>
			</div>
		)
		
		return (
			<div ref="cardContainer" className="event-devices">
				<div className="total-buyers">
					<img className="total-image" src={asset('/assets/resources/images/event/devices/icon_top.svg')}/>
					<div className="total-number">
						<NumberAnimation 
							localeString={true}
							isLoading={false} 
							initValue={0} 
							target={total} 
							duration={3000} 
							decimals={0} 
							useGroup={false} 
							animation={'up'}/>
					</div>
					<div className="total-description">Total Ticket Buyers</div>
				</div>
				{http_status <= HTTP_LOADING && 
					<LoadingBar title={'Hold tight! We\'re getting your ticket buyers\' devices...'} />
        }
        {http_status > HTTP_LOADING && rows.length == 0 &&
          <EmptyBar />
				}
				{showContents && 
					<TabView all={false}>
						<Tab title={tab_title1}>
							{tab_content1}
						</Tab>
						<Tab title={tab_title2}>
							{tab_content2}
						</Tab>
						<Tab title={tab_title3}>
							{tab_content3}
						</Tab>
						<Tab title={tab_title4}>
							{tab_content4}
						</Tab>
						<Tab title={tab_title5}>
							{tab_content5}
						</Tab>
					</TabView>
				}
			</div>
		)
	}
}

