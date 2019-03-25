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
import Slider from 'react-slick'

@connect(
	(state) => {
		const event = state.events.get('selected').toJS()
		return {
			event,
		}
	}
)
export default class EventAudiencePsychographics extends React.Component {
	constructor(props) {
		super(props)
		this.entryCounts = {}
		this.state = {
			category: '_all',
			width: $(window).width()
		}
		this.category_mapping = {'_all' : 'All'}
		this.activeSlideNumber = -1
		this.previousSlideNumber = 0
		this.totalSlideNumber = 0
		this.table = null
	}

	componentDidMount() {
		const {event} = this.props
		document.title = `Psychographics - ${event.displayName} - The Ticket Fairy Dashboard`
		window.addEventListener('resize', this.updateDimensions.bind(this))
	}

	componentWillMount() {
		this.updateDimensions.bind(this)
	}

	componentWillUnmount(){
		window.removeEventListener('resize', this.updateDimensions.bind(this))
	}

	updateDimensions(){
		this.autoSlide()
		this.setState({width: $(window).width()})
	}

	onDatatableUpdated(){
		// this is called after JSONDatatable has been updated.
		this.setState({category: this.state.category})
	}

	fetchCallback(rows, status){
		let category = {'_all' : 'All'}
		_.map(rows, (row)=>{
			if(row.category){
				category[row.category] = row.category
			}
		})
		// cateogry name conversion
		_.map(category, (cat, key)=>{
			switch(key){
				case 'default':
					category[key] = 'Interest'
					break
				case 'trait':
					category[key] = 'Type of Person'
					break				
				default:
					category[key] = cat.charAt(0).toUpperCase() + cat.slice(1)
					break
			}
		})
		this.category_mapping = category
	}

	validateData(data, index){
		// validate goes here
		// must set id!!!
		data.id = index
		return data
	}

	getFilteredRows(rows, search){
		const {category} = this.state
		let rows_filtered = rows		
		
		// filter by search
		let keyword = search.join('').trim().toLowerCase()
		if(keyword != ''){
			rows_filtered = _.filter(rows_filtered, (item) => {
				let found = 0
				found += IS_FOUND(item.name, keyword)
				found += IS_FOUND(item.category, keyword)
				return found > 0
			})
		}

		// calcuate counts per each category
		let self = this
		_.map(this.category_mapping, (cat, key)=>{
			let count = rows_filtered.length
			if(key != '_all')
				count = (_.filter(rows_filtered, {'category': key})).length
			self.entryCounts[key] = count
		})

		// filter by category
		if(category != '_all')
			rows_filtered = _.filter(rows_filtered, {'category': category})

		return rows_filtered
	}

	getSortedRows(rows_filtered, sort){
		if(sort){
			let dir = sort.asc ? 'asc' : 'desc'
			switch(sort.index){
				case 0: // name
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return t.name.toLowerCase()}, dir)
					break
				case 1: // weight
					rows_filtered = _.orderBy(rows_filtered, (t)=>{						
						let average_score = t.scores.reduce((p, c)=>{return p + c}) / t.scores.length
						let weight = parseInt(t.count, 10) * average_score
						return parseFloat(weight)
					}, dir)
					break
				case 2: // category
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return t.category}, dir)
					break
				default:
					break
			}
		}
		return rows_filtered
	}

	getClipboardText(rows_filtered){
		let ret = ''
		ret += 'Name' + '\t' + 'Weight' + '\n'
		_.map(rows_filtered, (t)=>{
			let average_score = t.scores.reduce((p, c)=>{return p + c}) / t.scores.length
			let weight = parseInt(t.count, 10) * average_score
			ret += t.name + '\t' + parseInt(weight) + '\n'
		})
		return ret
	}

	getTableData(datatable, rows_filtered, sort){
		const {event} = this.props
		let clipboard_text = this.getClipboardText(rows_filtered)
		let clipboard = datatable.getClipboardColumn(datatable, clipboard_text)
		let content_header = datatable.getHeaderRow(datatable, [
				{title: 'Name', sort: true},
				{title: 'Weight', sort: true, className: 'column-weight'},
				{title: clipboard, sort: false, className: 'column-clipboard'},
			], sort)		
			
		let number = 0
		let content_table = _.map(rows_filtered, (t, index)=>{
			let average_score = t.scores.reduce((p, c)=>{return p + c}) / t.scores.length
			let weight = parseInt(t.count, 10) * average_score
			let category = this.category_mapping[t.category] ? this.category_mapping[t.category] : t.category

			let content_row = <tr key={index} className={t.isExpanded ? ' tr-expanded-row' : (number++ % 2==0 ? 'table-stripe-row1' : 'table-stripe-row2')}>					
				<td>{t.name}</td>
				<td className='column-weight'>{parseInt(weight)}</td>
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

	onClickTab(key){
		this.setState({category: key})
	}

	getVisibleSlideCount() {
		let width = $(window).width()
		if(width < 376)	return 1
		else if(width < 641) return 2
		else if(width < 769) return 3
		else if(width < 961) return 4
		else if(width < 1025) return 5
		else if(width < 1121) return 6
		else if(width < 1201) return 7
		else if(width < 1401) return 8
		else if(width < 10001) return 10
		else return 0
	}

	autoSlide(){
		let slider = null
		if(this.table && this.table.refs.slider_category){
			slider = this.table.refs.slider_category
		}
		if(this.activeSlideNumber != -1 && slider){
			setTimeout(()=>{
				let visibleCount = this.getVisibleSlideCount()
				let old = this.previousSlideNumber
				if(this.previousSlideNumber > this.activeSlideNumber)
					this.previousSlideNumber = this.activeSlideNumber
				if(this.previousSlideNumber + visibleCount <= this.activeSlideNumber)
					this.previousSlideNumber = this.activeSlideNumber - visibleCount + 1
				if(this.previousSlideNumber >= this.totalSlideNumber - visibleCount && this.totalSlideNumber >= visibleCount)
					this.previousSlideNumber = this.totalSlideNumber - visibleCount
				if(old != this.previousSlideNumber && slider){
					// save current position and move to it
					slider.slickGoTo(this.previousSlideNumber)
				}
			}, 500)
		}else{
			this.previousSlideNumber = 0
			this.activeSlideNumber = -1
		}
	}

	onClickSlide(slideNumber){
		this.previousSlideNumber = slideNumber
	}

	getTabHeader(){
		const {category} = this.state
		let tab_keys = Object.keys(this.category_mapping)
		const images = ['All', 'Artist', 'Brand', 'Celebrity', 'Community', 'Event', 'Game', 'Interest', 'Nonprofit', 'Place', 'Publisher', 'Show', 'Team', 'Type of Person']
		tab_keys = _.orderBy(tab_keys, (key)=>this.entryCounts[key], 'desc')		
		let tab_header = _.map(tab_keys, (key, index)=>{
			let title = this.category_mapping[key]
			let imageName = images.indexOf(title) == -1 ? '_Unknown' : title
			if(key == category){
				this.activeSlideNumber = index
			}
			return (
				<div key={index} className={'tab-title' + (key == category ? ' selected' : '')} onClick={() => this.onClickTab(key)}>					
					<img src={asset('/assets/resources/images/psychographics/' + imageName + '.svg')}/>
					{title}					
				</div>
			)
		})

		let settings = {
			dots: false,
			infinite: false,
			speed: 500,
			draggable: false,
			swipeToSlide: false,
			slidesToShow: this.getVisibleSlideCount(),
			afterChange: this.onClickSlide.bind(this)
		}
		return (
			<div key='slider' className='psychographics-slider'>
				<Slider ref='slider_category' {...settings}>
					{tab_header}
				</Slider>
			</div>
		)
	}

	render() {
		const {event} = this.props

		return (
			<div className="event-psychographics">
				<div className="row">
					<div className="col-xs-12">
						<JSONDatatable
							onRef={ref => (this.table = ref)}
							type={TYPE_FROM_URL}
							data={{url: `/api/audience/${event.id}/`, node: 'data.audience.interests.*', param: {type:'event', section: 'psychographics'}}}
							sort={{index: 1, asc: false}}
							fetchCallback={::this.fetchCallback}
							validateData={::this.validateData}
							getFilteredRows={::this.getFilteredRows}
							getSortedRows={::this.getSortedRows}
							getTableData={::this.getTableData}
							getClipboardText={::this.getClipboardText}
							usePagination={true}
							loadingBarTitle={'Hold tight! We\'re getting your event\'s psychographics...'}
						>
							{/* It can give additional className to SEARCHBAR, DATATABLE, PAGINATIONBAR by specifying className="XXX" */}
							<div ref={SEARCHBAR} hasSearch autoFocus labelTotalCount="Number of Matching Categories" focusAfter=".tab-title.selected" />
							<div getContent={::this.getTabHeader}/>
							<div ref={DATATABLE}/> 
							<div ref={PAGINATIONBAR}/>
						</JSONDatatable>
					</div>
				</div>
			</div>
		)
	}
}

