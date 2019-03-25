import _ from 'lodash'
import {connect} from 'react-redux'
import PropTypes from 'prop-types';
import React, {
  Component
} from 'react'

import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ListView,
} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import TagInput from 'react-native-tag-input'

import styles from '../styles/jsondatatable'

import {fetchAPI} from '../../_common/core/http'
import {HTTP_INIT, HTTP_LOADING, HTTP_LOADING_SUCCESSED, HTTP_LOADING_FAILED, CACHE_SIZE} from '../../_common/core/http'

//Librery
import LoadingBar from './LoadingBar'
import Button from './Button'
import Select from './Select'
import {Orders,events} from '../styles'
import DeviceInfo from 'react-native-device-info'

export const DOWNLOAD_CSV = (csvData, csvFileName) => {
  let data, filename, link
  let csv = convertToCSV({
    data: csvData
  })
  if (csv == null) return

  filename = csvFileName

  let blob = new Blob([csv], { type: 'text/csv' })
  let csvUrl = URL.createObjectURL(blob)

  link.setAttribute('href', csvUrl)
  link.setAttribute('download', filename)
  link.click()
}

export const SEARCHBAR = 'dt_searchbar'
export const DATATABLE = 'dt_table'
export const PAGINATIONBAR = 'dt_paginationbar'

export const TYPE_FROM_URL  = 'url'
export const TYPE_FROM_ARRAY= 'array'

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
  result += keys.join(columnDelimiter)
  result += lineDelimiter

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

export class JSONDatatable extends React.Component{

  static propType = {
    // required
    type: PropTypes.string.isRequired, // TYPE_FROM_URL('url') or TYPE_FROM_ARRAY('array')
    data: PropTypes.object.isRequired, // {url, node} or []

    validateData: PropTypes.func,
    getFilteredRows: PropTypes.func,
    getSortedRows: PropTypes.func.isRequired,
    getTableData: PropTypes.func.isRequired,
    labelTotalCount: PropTypes.string.isRequired,

    // not mandatory 	// ''
    fetchCallback: PropTypes.func,
    loadingBarTitle: PropTypes.string.isRequired,
    getCSVData: PropTypes.func,
    usePagination: PropTypes.bool,
    paginationPanelSize: PropTypes.number,
    paginationPageSize: PropTypes.number,
    sort: PropTypes.object, // default sort
    autoRefresh: PropTypes.number, // time interval for autoRefresh periodically
  }

  constructor(props) {
    super(props)

    this.tmp = []
    this.refreshFlag = false
    this.refreshTimer = null
    this.expandedRowID = null

    this.state = {
      http_status: HTTP_INIT,
      http_error: null,

      rows: [],
      rows_filtered: [],
      rows_displayed: [],
      csvData: [],
      sort: this.props.sort,
      search: [],
      searchDone: false,

      totalCount: 0,
      pn_activePage: 1,
      pn_panelSize: props.paginationPanelSize ? props.paginationPanelSize : 10,
      pn_pageSize: props.paginationPageSize ? props.paginationPageSize : 50,
    }
  }

  componentDidMount() {
    const {type, data, autoRefresh} = this.props
    this.init(type, data)
    let self = this
    if(autoRefresh && autoRefresh > 1000){
      self.refreshTimer = setInterval(()=>{
        if((self.state.http_status == HTTP_LOADING_SUCCESSED || self.state.http_status == HTTP_LOADING_FAILED) && !self.refreshFlag){
          self.refreshFlag = true
          self.init(type, data)
        }else{
          // console.log('autoRefresh is already in progress')
        }
      }, autoRefresh)
    }
  }

  componentWillUnmount() {
    this.refreshFlag = false
    this.expandedRowID = null
    if(this.refreshTimer)
      clearInterval(this.refreshTimer)
  }

  componentWillReceiveProps(nextProps) {
    if(JSON.stringify(this.props.data)!= JSON.stringify(nextProps.data)){
      console.log('JSONDatatable props changed, refresh called')
      this.forceRefresh(nextProps.type, nextProps.data)
    }else{
      this.refreshState(this.state.rows, this.state.http_status, null, this.state.sort, this.state.search, this.state.pn_activePage, this.state.pn_panelSize, this.state.pn_pageSize)
    }
  }

  // export function
  forceRefresh(type, data){
    this.refreshFlag = true
    this.init(type, data)
  }

  init(type, data){
    const self = this

    this.tmp = []
    switch(type){
      case TYPE_FROM_URL:
        let {url, param, node} = data
        fetchAPI(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/vnd.api+json',
            'Content-Type': 'application/vnd.api+json'
          },
          withCredentials: true
        }).then(res => {
          console.warn(JSON.stringify(res))
          self.tmp = res.data.$original
          self.addToRow(self.tmp, HTTP_LOADING_SUCCESSED, null)
        })
        break
      case TYPE_FROM_ARRAY:
        let rows = []
        _.map(data, (o, index)=>{
          let newRow = this.props.validateData ? this.props.validateData(Object.assign({}, o), index) : Object.assign({}, o)
          if(newRow){
            if(!newRow.id)
              newRow.id = index
            newRow.isExpanded = false
            newRow.isDetailRow = false
            rows.push(newRow)
          }
        })
        this.refreshState(rows, HTTP_LOADING_SUCCESSED, null, this.state.sort, this.state.search, this.state.pn_activePage, this.state.pn_panelSize, this.state.pn_pageSize)
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
        newRow.isExpanded = this.refreshFlag && newRow.id == this.expandedRowID ? true : false
        newRow.isDetailRow = false
        rows.push(newRow)
        if(this.refreshFlag && newRow.id == this.expandedRowID){
          let detail = Object.assign({}, newRow)
          detail.id = detail.id + '_detail'
          detail.isDetailRow = true
          rows.push(detail)
        }
      }
    })
    if(http_status == HTTP_LOADING_SUCCESSED || http_status == HTTP_LOADING_FAILED){
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

  onSearchChange(value){
    let searchDone = value.join('').trim().length === 0 ? false : true
    this.setState({searchDone: searchDone})
    this.refreshState(this.state.rows, this.state.http_status, this.state.http_error, this.state.sort, value, this.state.pn_activePage, this.state.pn_panelSize, this.state.pn_pageSize)
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

    let totalCount = rows_filtered_detailRemoved.length // remove detail row
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

  getHeaderRow(self, headers, sort){
    let tharray = _.map(headers, (h, index)=>{

      return h.sort ? (
        <TouchableOpacity key={index} onPress={self.onSort.bind(self, index)} style={{flexDirection:'row', flex:h.flex, alignItems:'center'}}>
          <Text style={Orders.tab_title_text}>{h.title}</Text>
          {sort && sort.index == index &&
            <Icon name={sort.asc ? 'caret-up' : 'caret-down'} size={10} color='#ffffff' style={{marginLeft:5}}/>
          }
        </TouchableOpacity>
      ): (
        <TouchableOpacity key={index} style={{flexDirection:'row', flex:h.flex, paddingVertical:15}}>
          <Text style={Orders.tab_title_text}>{h.title}</Text>
        </TouchableOpacity>
      )
    })
    return (
      <View style={Orders.table_stripe_row2}>
        {tharray}
      </View>
    )
  }

  render(){
    const {http_status, http_error, rows_displayed, sort, search, totalCount, searchDone} = this.state
    const {type, data} = this.props

    let self = this

    const {children} = this.props
    let childs = []
    if(http_status == HTTP_INIT){
      childs.push(<LoadingBar key='loadingbar' title={this.props.loadingBarTitle} />)
    }else if(http_status == HTTP_LOADING){
      childs.push(<LoadingBar key='download' title={'Downloaded: ' + totalCount} />)
    }else if(http_status == HTTP_LOADING_FAILED){
      console.log('http_error', http_error)
      childs.push(<LoadingBar key='error' title={'Error Occured!'} />)
    }

    if(http_status != HTTP_LOADING_FAILED){
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
            const {hasSearch, autoFocus} = c.props
            let searchBar =
              <View key={index} style={[styles.datatable_searchbar]}>
                <View style={styles.searchbar_left}>
                  {searchDone && <Text style={{color:'#ffffff',}}>{c.props.labelTotalCount}: {totalCount}</Text>}
                </View>
                <View style={events.searchbar_right}>
                  <View style={{width:250, height:37, marginTop:3, borderRadius:3, backgroundColor: '#232732', borderWidth:0.3, justifyContent:'center', paddingLeft:10, paddingRight:10, borderColor:'#638a94'}}>
                    <TagInput
                      ref='tag'
                      inputProps={{placeholder: ''}}
                      inputColor='#ffffff'
                      tagTextStyle={{fontSize:10, color:'#ffffff'}} tagTextColor='#ffffff'
                      value={search} onChange={(e)=>this.onSearchChange(e)}
                      tagColor='#373E4C' />
                  </View>
                  <TouchableOpacity
                    style={events.searchbar_button}
                    onPress={()=>this.saveTag()}
                  >
                    <Text style={{fontSize:12,fontFamily:'OpenSans-ExtraBold',marginLeft:15,marginRight:15, color:'#ffffff'}}>Search</Text>
                  </TouchableOpacity>
                </View>
              </View>
            childs.push(searchBar)
          }
        } else if (c.ref == DATATABLE) {
          if(http_status >= HTTP_LOADING) {
            let content_table = this.props.getTableData(this, rows_displayed, sort)

            let div =
              <ScrollView horizontal={DeviceInfo.isTablet() ? false:true}>
                <View key={index} style={DeviceInfo.isTablet() ?styles.datatable_tablecontent:[styles.datatable_tablecontent,{width:1000} ]}>
                  {content_table}
                </View>
              </ScrollView>
            childs.push(div)
          }
        } else if (c.ref == PAGINATIONBAR) {
          if(http_status > HTTP_LOADING) {
            const {hasCSVExport, csvFileName} = c.props
            const {csvData, pn_activePage, pn_pageSize, pn_panelSize} = this.state
            let paginationBar = <View key={index} style={[styles.datatable_paginationbar,c.props.className]}>
              <View style={{flexDirection:'row',}}>
                <View style={styles.pagination_select_panelsize}>
                  {hasCSVExport && csvData &&
                    <Button style='btn-primary' onPress={this.onClickExportCSV.bind(this, csvData, csvFileName)} title='Export To CSV' />
                  }
                </View>
                <View style={styles.text_center}>
                  {/* totalCount > pn_pageSize &&
                    <Pagination
                      activePage={pn_activePage}
                      pageRangeDisplayed={pn_panelSize}
                      itemsCountPerPage={pn_pageSize}
                      totalItemsCount={totalCount}
                      onChange={::this.onPageNumberChange}
                    />
                   */}
                </View>
                <View style={styles.pagination_select_pgsize}>
                  {/* totalCount > pn_pageSize &&
                    <Select
                      label='Page Size'
                      value={pn_pageSize}
                      options={select_page_size}
                      onChange={::this.onPageSizeChanged}
                      onBlur={::this.onPageSizeChanged} />
                  */}
                </View>
              </View>
            </View>
            childs.push(paginationBar)
          }
        } else {
          // c.key = index
          if(http_status > HTTP_LOADING){
            childs.push(c)
          }
        }
      })
    }
    return (
      <View style={styles.JSONDatatable}>
        {childs}
      </View>
    )
  }
}
