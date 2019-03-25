import _ from 'lodash'
import Immutable from 'immutable'
import moment from 'moment-timezone'
import React from 'react'
import {makeURL} from '../../_common/core/http'
import {HTTP_INIT, HTTP_LOADING, HTTP_LOADING_SUCCESSED, HTTP_LOADING_FAILED, CACHE_SIZE} from '../../_common/core/http' 

import {CSVLink, CSVDownload} from 'react-csv'
import Pagination from 'react-js-pagination'
import SearchBox from './SearchBox'
import Select from './Select'
import LoadingBar from './LoadingBar'
import Button from './Button'
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger'
import Tooltip from 'react-bootstrap/lib/Tooltip'
import ClipboardButton from 'react-clipboard.js'

const select_panel_size = _.map([5, 10], (e, i) => {
	return {value: e, label: e}
})
const select_page_size = _.map([10, 50, 100, 250, 500, 1000], (e, i) => {
	return {value: e, label: e}
})
const convertToCSV = (args) => {
	var result, ctr, keys, columnDelimiter, lineDelimiter, data

	data = args.data || null
	if (data == null || !data.length) {
		return null
	}

	columnDelimiter = args.columnDelimiter || ','
	lineDelimiter = args.lineDelimiter || '\n'

	keys = Object.keys(data[0])

	result = ''
	// result += keys.join(columnDelimiter)
	// result += lineDelimiter

	data.forEach(function(item) {
		ctr = 0
		keys.forEach(function(key) {
			if (ctr > 0) result += columnDelimiter

			result += item[key]
			ctr++
		})
		result += lineDelimiter
	})

	return result
}

export const IS_FOUND = (value, keyword) => {
	if(!value)
		return 0
	return value.toLowerCase().indexOf(keyword) != -1 ? 1 : 0
}

export const DOWNLOAD_CSV = (csvData, csvFileName) => {
	let data, filename, link
	let csv = convertToCSV({
		data: csvData
	})
	if (csv == null) return

	filename = csvFileName

	// if (!csv.match(/^data:text\/csv/i)) {
	// 	csv = 'data:text/csv;charset=utf-8,' + csv
	// }
	// data = encodeURI(csv)
	let blob = new Blob([csv], { type: 'text/csv' })
	let csvUrl = URL.createObjectURL(blob)
	
	link = document.createElement('a')	
	link.setAttribute('href', csvUrl)	
	link.setAttribute('download', filename)	
	link.click()
}

export const SEARCHBAR = 'dt_searchbar'
export const DATATABLE = 'dt_table'
export const PAGINATIONBAR = 'dt_paginationbar'

export const TYPE_FROM_URL  = 'url'
export const TYPE_FROM_ARRAY= 'array'

export class JSONDatatable extends React.Component{
	static propType = {
		// required
		type: React.PropTypes.string.isRequired, // TYPE_FROM_URL('url') or TYPE_FROM_ARRAY('array')
		parent_http_status: React.PropTypes.number, // only used if type is array
		data: React.PropTypes.object.isRequired, // {url, node} or []
		
		validateData: React.PropTypes.func,
		getFilteredRows: React.PropTypes.func,
		getSortedRows: React.PropTypes.func.isRequired,
		getTableData: React.PropTypes.func.isRequired,
		labelTotalCount: React.PropTypes.string.isRequired,

		// not mandatory 	// ''
		stopOnInvisible: React.PropTypes.bool, // true: stop functioning when invisible
		fetchCallback: React.PropTypes.func,
		loadingBarTitle: React.PropTypes.string.isRequired,
		getCSVData: React.PropTypes.func,
		usePagination: React.PropTypes.bool,
		onlyOboe: React.PropTypes.bool, // true: don't apply table wrapper class, false: apply normal table class
		countInDownloading: React.PropTypes.number, // use this in downloading
		cacheSize: React.PropTypes.number, // if set, CACHE_SIZE will be override.
		paginationPanelSize: React.PropTypes.number,
		paginationPageSize: React.PropTypes.number,
		sort: React.PropTypes.object, // default sort
		autoRefresh: React.PropTypes.number, // time interval for autoRefresh periodically
		keepExpanded: React.PropTypes.string,
		saveSearchKey: React.PropTypes.string, // null or empty string will disable saveSearch
	}

	constructor(props) {
		super(props)
		
		this.tmp = []
		this.refreshFlag = false
		this.refreshTimer = null
		this.refreshEndTime = null
		this.backupRows = []
		this.unMounted = true
		this.expandedRowID = null
		this.everLoaded = false

		let savedSearch = null
		if(props.saveSearchKey && props.saveSearchKey.length > 0) {
			savedSearch = localStorage.getItem(props.saveSearchKey)
		}

		this.state = {
			http_status: HTTP_INIT, 
			http_error: null,

			rows: [], 
			rows_filtered: [],
			rows_displayed: [],
			csvData: [],
			sort: this.props.sort,
			search: savedSearch && savedSearch.length > 0 ? [savedSearch] : [],
			searchDone: false,

			totalCount: 0,
			pn_activePage: 1,
			pn_panelSize: props.paginationPanelSize ? props.paginationPanelSize : 10,
			pn_pageSize: props.paginationPageSize ? props.paginationPageSize : 50,

			clipboardCopied: false
		}
	}

	componentDidMount() {
		if(this.props.onRef)
			this.props.onRef(this)
		if(this.props.stopOnInvisible)
			window.addEventListener('scroll', this.handleScroll.bind(this))
		this.unMounted = false
		const {type, data, autoRefresh} = this.props
		this.init(this.props)
		let self = this
		if(autoRefresh && autoRefresh > 1000){
			self.refreshTimer = setInterval(()=>{
				if((self.state.http_status == HTTP_LOADING_SUCCESSED || self.state.http_status == HTTP_LOADING_FAILED) && !self.refreshFlag){
					self.refreshFlag = true
					self.init(this.props)
				}else{
					// console.log('autoRefresh is already in progress')
				}				
			}, autoRefresh)
		}
	}

	componentWillUnmount() {
		if(this.props.onRef)
			this.props.onRef(undefined)
		if(this.props.stopOnInvisible)
			window.removeEventListener('scroll', this.handleScroll.bind(this))
		this.refreshFlag = false
		this.expandedRowID = null
		this.unMounted = true
		if(this.refreshTimer)
			clearInterval(this.refreshTimer)
	}

	componentWillReceiveProps(nextProps) {
		let {type, isInvisible} = this.props
		if((type == TYPE_FROM_URL && JSON.stringify(this.props.data)!=JSON.stringify(nextProps.data)) 
		|| type == TYPE_FROM_ARRAY || isInvisible != nextProps.isInvisible){
			// console.log('JSONDatatable props changed, refresh called')
			this.forceRefresh(nextProps, nextProps.parent_http_status)
		}else{
			this.refreshState(this.state.rows, this.state.http_status, null, this.state.sort, this.state.search, this.state.pn_activePage, this.state.pn_panelSize, this.state.pn_pageSize)
		}	
	}

	handleScroll(){
		if(this.unMounted)
			return
		let isVisible = this.isInVisibleArea()
		if(isVisible && !this.everLoaded){
			const {type, data, autoRefresh} = this.props
			this.init(this.props)
		}
	}

	isInVisibleArea(){
		let ele = $(this.refs.JSONDatatable)
		if(!ele)
			return false
		let windowTop = $(window).scrollTop()
		let windowBottom = $(window).scrollTop() + $(window).height()
		let elementTop = ele.offset().top
		let elementBottom = ele.offset().top+ele.height()
		return elementTop >= windowTop ? elementTop <= windowBottom : elementBottom >= windowTop
	}

	// export function
	forceRefresh(props, parent_http_status){
		this.refreshFlag = true
		this.init(props, parent_http_status)
	}

	init(props, parent_http_status){
		const {type, data, keepExpanded, isInvisible} = props
		const self = this

		if(this.props.stopOnInvisible){
			let isVisible = this.isInVisibleArea()
			if(!isVisible){
				this.refreshFlag = false
				return
			}
			this.everLoaded = true
		}

		if(!!isInvisible){
			this.refreshFlag = false
			return
		}

		this.tmp = []

		switch(type){
			case TYPE_FROM_URL:
				let {url, param, node, path} = data
				
				oboe({
					url: makeURL(url, param),
					method: 'GET',
					headers: isDemoAccount() ? null : {
						'Accept': 'application/vnd.api+json',
						'Content-Type': 'application/vnd.api+json'
					},
					withCredentials: true
				}).node(node, (record, pathArray) => {
					if(!!path){
						record._key = pathArray[path]
					}					
					if(!self.unMounted){
						self.tmp.push(record)
						let cacheSize = this.props.cacheSize || CACHE_SIZE
						if(self.tmp.length === cacheSize && !self.refreshFlag){
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
				break
			case TYPE_FROM_ARRAY:
				let rows = []
				_.map(data, (o, index)=>{
					let newRow = this.props.validateData ? this.props.validateData(Object.assign({}, o), index) : Object.assign({}, o)
					if(newRow){
						if(!newRow.id)
							newRow.id = index
						newRow.isExpanded = newRow.id == keepExpanded
						newRow.isDetailRow = false
						if(Array.isArray(o)) {
							newRow.length = o.length
						}
						rows.push(newRow)
						if(newRow.isExpanded){
							let detail = Object.assign({}, newRow)
							detail.id = detail.id + '_detail'
							detail.isDetailRow = true
							rows.push(detail)
						}
					}
				})
				let status = HTTP_LOADING_SUCCESSED
				if(parent_http_status)
					status = parent_http_status
				if(status == HTTP_LOADING_SUCCESSED){
					this.refreshEndTime = Date.now()
					this.backupRows = rows.slice(0)
				}else{
					rows = this.backupRows
				}
				this.refreshState(rows, status, null, this.state.sort, this.state.search, this.state.pn_activePage, this.state.pn_panelSize, this.state.pn_pageSize)
				break
			default:
				break
		}
	}

	addToRow(cached, http_status, http_error){
		let rows = this.refreshFlag ? [] : this.state.rows

		let tmp = !!cached ? cached : this.tmp
		let start = rows.length
		_.map(tmp, (o, index)=>{
			// newRow.id = index
			let newRow = this.props.validateData ? this.props.validateData(Object.assign({}, o), start + index) : Object.assign({}, o)
			if(newRow){
				if(!newRow.id)
					newRow.id = index
				newRow.isExpanded = this.refreshFlag && newRow.id == this.expandedRowID
				newRow.isDetailRow = false					
				rows.push(newRow)
				if(newRow.isExpanded){
					let detail = Object.assign({}, newRow)
					detail.id = detail.id + '_detail'
					detail.isDetailRow = true
					rows.push(detail)
				}
			}
		})
		if(http_status == HTTP_LOADING_SUCCESSED || http_status == HTTP_LOADING_FAILED){
			if(http_status == HTTP_LOADING_SUCCESSED){				
				this.refreshEndTime = Date.now()
				this.backupRows = rows.slice(0)
			}else{
				rows = this.backupRows
			}
			if(this.props.fetchCallback)
				this.props.fetchCallback(rows, http_status, http_error)
		}
		if(this.refreshFlag){
			this.refreshFlag = false			
		}		
		this.tmp = []
		this.refreshState(rows, http_status, http_error, this.state.sort, this.state.search, this.state.pn_activePage, this.state.pn_panelSize, this.state.pn_pageSize)
	}

	onSort(index){
		let {sort} = this.state
		if(sort && index == sort.index){
			sort.asc = !sort.asc
		}else{
			sort = {index: index, asc: false}
		}
		this.refreshState(this.state.rows, this.state.http_status, this.state.http_error, sort, this.state.search, this.state.pn_activePage, this.state.pn_panelSize, this.state.pn_pageSize)
	}

	onClickDetail(id){
		let newRows = this.processDetail(this.state.rows, id)
		this.refreshState(newRows, this.state.http_status, this.state.http_error, this.state.sort, this.state.search, this.state.pn_activePage, this.state.pn_panelSize, this.state.pn_pageSize)
	}

	onSearchChange(value, focusAfter, triggerScroll){		
		let searchDone = value.join('').trim().length === 0 ? false : true
		if(focusAfter){
			$(focusAfter).parent().scrollLeft(0)
			setTimeout(()=>{
				let offset = $(focusAfter).offset() // Contains .top and .left
				let pOffset = $(focusAfter).parent().offset()
				$(focusAfter).parent().animate({
						scrollLeft: offset.left - pOffset.left
				})
			}, 200)				
		}
		if(triggerScroll){
			setTimeout(()=>{
				$('html, body').animate({
					scrollTop: $(window).scrollTop() + 1
			})
			}, 100)
		}
		if(this.props.saveSearchKey && this.props.saveSearchKey.length > 0) {
			localStorage.setItem(this.props.saveSearchKey, value.join('').trim())
		}
		this.setState({searchDone: searchDone})
		this.refreshState(this.state.rows, this.state.http_status, this.state.http_error, this.state.sort, value, this.state.pn_activePage, this.state.pn_panelSize, this.state.pn_pageSize)
	}

	onPageNumberChange(pageNumber) {
		let newRows = this.processDetail(this.state.rows, null) // remove detail row
		this.refreshState(newRows, this.state.http_status, this.state.http_error, this.state.sort, this.state.search, pageNumber, this.state.pn_panelSize, this.state.pn_pageSize)
	}

	onPanelSizeChanged(e){
		this.refreshState(this.state.rows, this.state.http_status, this.state.http_error, this.state.sort, this.state.search, this.state.pn_activePage, _.parseInt(e.target.value), this.state.pn_pageSize)
	}

	onPageSizeChanged(e){
		this.refreshState(this.state.rows, this.state.http_status, this.state.http_error, this.state.sort, this.state.search, this.state.pn_activePage, this.state.pn_panelSize, _.parseInt(e.target.value))
	}

	processDetail(rows, id){ // id for the row with details
		let newRows = []
		this.expandedRowID = null
		for(let i = 0; i< rows.length; i++){
			let row = rows[i]
			if(row.id == id && !row.isDetailRow){
				let isExpanded = row.isExpanded
				row.isExpanded = !isExpanded
				newRows.push(Object.assign({}, row))
				if(row.isExpanded){
					this.expandedRowID = row.id
					let detail = Object.assign({}, row)
					detail.id = detail.id + '_detail'
					detail.isDetailRow = true
					newRows.push(detail)
				}
			}else{
				if(!row.isDetailRow){
					let newRow = Object.assign({}, row)
					newRow.isExpanded = false
					newRows.push(newRow)
				}
			}
		}
		return newRows
	}

	refreshState(rows, http_status, http_error, sort, search, pageNumber, panelSize, pageSize){
		let rows_filtered = null, rows_filtered_detailRemoved = null, rows_displayed = null
		let csvData = null
		if(http_status == HTTP_LOADING){
			rows_filtered = rows
			rows_filtered_detailRemoved = rows
		}else{
			rows_filtered = this.props.getFilteredRows ? this.props.getFilteredRows(rows, search) : rows
			if(this.props.getSortedRows){
				rows_filtered = this.props.getSortedRows(rows_filtered, sort)
			}
			rows_filtered_detailRemoved = _.filter(rows_filtered, {'isDetailRow': false})
			if(this.props.getCSVData){
				csvData = this.props.getCSVData(rows_filtered_detailRemoved)
			}
		}

		let totalCount = rows_filtered_detailRemoved.length // remove detail rows
		if(this.props.usePagination){
			if((pageNumber - 1) * pageSize >= totalCount){
				pageNumber = 1
			}

			let startPos = (pageNumber - 1) * pageSize, endPos = pageNumber * pageSize
			rows_displayed = rows_filtered_detailRemoved.slice(startPos, endPos)
			let hasDetailRow = false
			_.map(rows_displayed, (row, index) => {
				if(row.isExpanded)
					hasDetailRow = true
			})
			if(hasDetailRow){		
				rows_displayed = rows_filtered.slice(startPos, endPos + 1)
			}
		}else{
			if(http_status == HTTP_LOADING){
				let count = this.props.countInDownloading ? this.props.countInDownloading + 1 : pageSize
				rows_displayed = rows_filtered_detailRemoved.slice(0, count)
			}else
				rows_displayed = rows_filtered
		}		

		if(this.props.setTotalCount)
			this.props.setTotalCount(totalCount)
		
		this.setState({
			http_status: http_status,
			http_error: http_error,

			rows: rows,
			rows_filtered: rows_filtered,
			rows_displayed: rows_displayed,
			csvData: csvData,
			sort: sort,
			search: search,

			totalCount: totalCount,
			pn_activePage: pageNumber,
			pn_panelSize: panelSize,
			pn_pageSize: pageSize,
		})
	}

	// drawing helper functions
	getHeaderRow(self, headers, sort){
		let tharray = _.map(headers, (h, index)=>{
			return h.sort ? (
				<th key={index} style={{cursor: 'pointer'}} onClick={self.onSort.bind(self, index)} className={h.className}>
					{h.title}
					{sort && sort.index == index && 
						<i className={'sort-direction ' + (sort.asc ? 'fa fa-caret-up' : 'fa fa-caret-down')} aria-hidden='true'/>
					}
				</th>
			): (
				<th key={index} className={h.className}>
					{h.title}
				</th>
			)
		})
		return (
			<tr>
				{tharray}
			</tr>
		)
	}

	getClipboardColumn(self, content) {
		let clipboard_html = (
			<div className="clipboard" onMouseLeave={self.clipboardOut.bind(self)}>
				<ClipboardButton component="span" data-clipboard-text={content} onSuccess={self.copyClipboardAfter.bind(self)}>
					<OverlayTrigger 
						placement="left" 
						overlay={
							this.state.clipboardCopied ? 
							<Tooltip id="clipboardCopied">Copied</Tooltip>:
							<Tooltip id="clipboardCopied">Copy</Tooltip>
						} 
						trigger={['hover']}
					>
						<i className="fa fa-clipboard" />
					</OverlayTrigger>
				</ClipboardButton>
			</div>
		)
		return clipboard_html
	}

	onClickExportCSV(csvData, csvFileName){
		DOWNLOAD_CSV(csvData, csvFileName)
	}

	copyClipboardAfter() {
    this.setState({
      clipboardCopied: true
    })
	}
	
  clipboardOut(e) {
    if(this.state.clipboardCopied) {
      setTimeout(() => {
        this.setState({
          clipboardCopied: false
        })  
      }, 500)
    }
	}

	render() {
		const {http_status, http_error, rows_filtered, rows_displayed, sort, search, totalCount, searchDone} = this.state
		const {type, data} = this.props
		// console.log('total: ' + totalCount + ', url: ' + (type == TYPE_FROM_URL ? data.url + data.node : ''))

		let self = this

		const {children} = this.props
		let childs = [], lastUpdated = null
		if(http_status == HTTP_INIT){
			childs.push(<LoadingBar key='loadingbar' title={this.props.loadingBarTitle} />)
		}else if(http_status == HTTP_LOADING){
			childs.push(<LoadingBar key='download' className='downloading' title={'Downloaded: ' + totalCount} />)
		}else if(http_status == HTTP_LOADING_FAILED){
			if(!this.refreshEndTime){
				console.log('http_error', http_error)
				childs.push(<LoadingBar key='error' title={'Error Occured!'} />)
			}else{
				lastUpdated = (
					<div key='offline_message' className="card text-center">
						<div className="card-block text-center text-muted">
							<div className="offline_message">
								<img src='data:image/png;base64,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'/>
								<div className="bold">You are working offline. </div>
								<div>Information last updated on {moment(this.refreshEndTime).format('D MMM YYYY')} at {moment(this.refreshEndTime).format('hh:mm:ss')}</div>
							</div>
						</div>
					</div>
				)				
			}			
		}

		if(http_status != HTTP_LOADING_FAILED || (http_status == HTTP_LOADING_FAILED && this.refreshEndTime != null)){
			// make child array evenif there is only one child.		
			let childArray = []
			if(!Array.isArray(children)){
				childArray.push(children)
			}else{
				childArray = children
			}

			// render 
			_.map(childArray, (c, index)=>{
				if(c == null){
				} else if (c.ref == SEARCHBAR) {
					if(http_status > HTTP_LOADING) {
						const {hasSearch, autoFocus, hasLeftSection, children, focusAfter, triggerScroll} = c.props
						let searchBar = null
						
						if(hasLeftSection){ // only used in `orders` section
							searchBar = <div key={index} className={'datatable-searchbar ' + c.props.className}>
								<div className="searchbar-left">
									{children}
								</div>
								<div className="searchbar-right">
									{hasSearch && (totalCount != 0 || searchDone) &&
										<SearchBox autoFocus={autoFocus} triggerScroll={triggerScroll} value={search} onChange={::this.onSearchChange} focusAfter={focusAfter}/>
									}
									{searchDone && <div className="search-result">{c.props.labelTotalCount}: <span className="total-count">{totalCount}</span></div>}
								</div>
							</div>
						}else{
							searchBar = <div key={index} className={'datatable-searchbar ' + c.props.className}>
								<div className="searchbar-left search-result">
									{searchDone && <div>{c.props.labelTotalCount}: {totalCount}</div>}
								</div>
								<div className="searchbar-right">
									{hasSearch && (totalCount != 0 || searchDone) &&
										<SearchBox autoFocus={autoFocus} triggerScroll={triggerScroll} value={search} onChange={::this.onSearchChange} focusAfter={focusAfter}/>
									}
								</div>
							</div>
						}
						childs.push(searchBar)
					}
				} else if (c.ref == DATATABLE) {
					if(http_status >= HTTP_LOADING) {
						let content_table = this.props.getTableData(this, rows_displayed, sort, totalCount)
						let className = this.props.onlyOboe ? '' : 'datatable-tablecontent table-responsive ' + c.props.className
						let div = <div key={index} className={className}>
							{content_table}
						</div>
						childs.push(div)
					}
				} else if (c.ref == PAGINATIONBAR) {
					if(http_status > HTTP_LOADING) {
						const {hasCSVExport, csvFileName} = c.props
						const {csvData, pn_activePage, pn_pageSize, pn_panelSize} = this.state
						let paginationBar = <div key={index} className={'row datatable-paginationbar ' + c.props.className}>
							<div className="col-xs-12 panigation-panel">
								<div className="pagination-select-panelsize">
									{hasCSVExport && csvData && 
										<Button className="btn btn-primary" onClick={this.onClickExportCSV.bind(this, csvData, csvFileName)}>Export To CSV</Button>
									}
									{/*<Select
										label="PanelSize"
										value={pn_panelSize}
										options={select_panel_size}
										onChange={::this.onPanelSizeChanged}
									onBlur={::this.onPanelSizeChanged} />*/}
								</div>
								<div className="text-center">
									{ totalCount > pn_pageSize && 
									<Pagination
										activePage={pn_activePage}
										pageRangeDisplayed={pn_panelSize}
										itemsCountPerPage={pn_pageSize}
										totalItemsCount={totalCount}
										onChange={::this.onPageNumberChange}
									/>
									}
								</div>
								<div className="pagination-select-pgsize">
									{ totalCount > pn_pageSize && 
									<Select
										label="Page Size"
										value={pn_pageSize}
										options={select_page_size}
										onChange={::this.onPageSizeChanged}
										onBlur={::this.onPageSizeChanged} />
									}
								</div>
							</div>
						</div>
						childs.push(paginationBar)
					}
				} else {
					// c.key = index
					if(http_status > HTTP_LOADING){
						if(c.props.getContent){
							childs.push(c.props.getContent(rows_filtered))
						}else{
							childs.push(c)
						}
					}
					if(http_status == HTTP_LOADING){
						if(c.props.getContent && c.props.showOnLoading)
							childs.push(c.props.getContent(rows_filtered))
					}
				}
			})

			if(lastUpdated != null) {
				childs.push(lastUpdated)
			}
		}

		return (
			<div ref="JSONDatatable" className="JSONDatatable">
				{childs}
			</div>
		)
	}
}