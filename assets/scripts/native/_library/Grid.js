import _ from 'lodash'
import React from 'react'
import {View, Text, Image, TouchableWithoutFeedback, TextInput, ScrollView} from 'react-native'
import PropTypes from 'prop-types';
import RNFB from 'react-native-fetch-blob'
import Icon from 'react-native-vector-icons/FontAwesome'
import {fetchAPI, HTTP_LOADING_SUCCESSED, makeURL} from '../../_common/core/http'
import {commonStyle} from '../../native/styles'
import {isFloat, isInt} from '../../_common/core/utils'
import SearchBox from './SearchBox'
import PagingBar, {DEFAULT_PAGESIZE} from './PagingBar'
import LoadingBar from './LoadingBar'
import DeviceInfo from 'react-native-device-info'

const CELL_MIN_WIDTH = 120
export default class Grid extends React.Component {
  static propTypes = {
    columns: PropTypes.array,
    data: PropTypes.array,
    style: PropTypes.any,
    stripe: PropTypes.bool,
    summary: PropTypes.bool,
    title: PropTypes.bool,
    searchable: PropTypes.bool,
    matchText: PropTypes.string,
    paging: PropTypes.bool,
    headerStyle: PropTypes.any,
    expandedRows: PropTypes.array,// expanded data records
    detailViewRender: PropTypes.func,
    tbar: PropTypes.element,
    filterFunc: PropTypes.func,
    hideHeader: PropTypes.bool,
    loadingTitle: PropTypes.string,
    filterComponent : PropTypes.any,
  }

  constructor(props) {
    super(props)
    this.unMounted = true
    this.state = {
      viewWidth: 0,
      expandedRows: props.expandedRows,
      data: props.data || [],
      keyword: ''
    }

    const sortColumn = _.find(props.columns, {sort: true})
    if (sortColumn) {
      this.state.sort = {
        column: sortColumn,
        asc: true
      }
    }

    if (props.paging) {
      this.state.paging = {
        no: 1,
        size: DEFAULT_PAGESIZE
      }
    }
  }

  componentWillUnmount() {
    this.unMounted = true
  }
  componentDidMount() {
    this.unMounted = false
    const {store} = this.props
    // if(store && typeof store === 'object') {
    //   const self = this
    //   const data = []
    //
    //   const {url, params, node} = store
    //
    //   this.setState({loading:true})
    //   // const Fetch = RNFB.polyfill.Fetch
    //   RNFB.JSONStream({
    //     url: makeURL(url, params),
    //     method: 'GET',
    //     headers: {
    //       'Accept': 'application/vnd.api+json',
    //       'Content-Type': 'application/vnd.api+json'
    //     },
    //     withCredentials: true
    //   }).node(node, (record) => {
    //     console.log('Oboe node', record)
    //     //if(!self.unmounted) {
    //       data.push(record)
    //       //if (data.length == 1000) {
    //         this.setState({data, loading:false})
    //       //}
    //     //}
    //   }).done(() => {
    //     if(!self.unmounted){
    //       this.setState({data, loading:false})
    //     }
    //     if(this.props.fetchCallback)
    //       this.props.fetchCallback(data)
    //   }).fail((errorReport) => {
    //     if(!self.unmounted) this.setState({data, loading:false})
    //   })
    // }
    let self = this
    if (store && typeof store === 'object') {
      const {url, params, node} = store
      this.setState({loading:true})
      fetch(makeURL(url, params), {
        method: 'GET',
        headers: {
          'Accept': 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json'
        },
        withCredentials: true
      }).then((response) => response.json())
        .then((responseJson) => {
          if(!self.unMounted) {
            let data = responseJson.data
            let dataarray = []
            for (dataElement in data) {
              dataarray.push(data[dataElement])
            }
            if(this.props.fetchCallback)
              this.props.fetchCallback(dataarray)
            if (node == 'data.twitch_users.*') {
              this.setState({data: dataarray[0], loading: false})
            }
            else
              this.setState({data: dataarray, loading:false})
          }
        })
    }
  }
  /*componentWillReceiveProps(newProps) {
    if(newProps.expandedRows && !_.isEqual(this.props.expandedRows != newProps.expandedRows)) {
      this.setState({expandedRows:newProps.expandedRows})
    }
  }*/

  getFilteredData = () => {
    let data = this.state.data || []

    const {sort, keyword} = this.state
    if (sort) {
      data = this.getSortData(data, sort.column, sort.asc)
    }
    if(this.props.filterFunc) {
      data = this.props.filterFunc(data, keyword)
    }else if (keyword && keyword != '') {
      data = _.filter(data, item =>
        Object.keys(item).some((key) => {
          const val = item[key]
          return val && typeof val === 'string' && val.toLowerCase().indexOf(keyword.trim().toLowerCase()) != -1
        })
      )
    }

    return data
  }

  getSortData = (data, column, asc = true) => {
    if (column.dataIndex) {
      return _.orderBy(data, t => {
        const val = t[column.dataIndex]
        if (isInt(val)) {
          return parseInt(val)
        } else if (isFloat(val)) {
          return parseFloat(val)
        } else {
          return val
        }
      }, asc ? 'asc' : 'desc')
    } else if (column.sortFunc) {
      return _.orderBy(data, column.sortFunc, asc ? 'asc' : 'desc')
    } else {
      return data
    }
  }

  sortDataBy = (column) => {
    const sort = {
      column: column,
      asc: this.state.sort && _.isEqual(this.state.sort.column, column) ? !this.state.sort.asc : true
    }
    this.setState({
      sort
    })
  }

  searchData = (keyword) => {
    this.setState({keyword})
  }

  filterDataByFunc = (filterFunc) => {
    if(!filterFunc || typeof filterFunc !== 'function') return

    this.setState({filterFunc:filterFunc})
  }

  getPageData = (data, page = 1, pageSize = DEFAULT_PAGESIZE) => {
    return data.slice((page - 1) * pageSize, page * pageSize)
  }

  setPage = (page, pageSize) => {
    this.setState({paging: {no:page, size:pageSize}})
  }

  onLayout = (e) => {
    const {width} = e.nativeEvent.layout

    if (width != this.state.viewWidth) this.setState({viewWidth: width})
  }

  shouldBeScroll() {
    const {viewWidth} = this.state
    if (viewWidth == 0) return false

    const {columns} = this.props
    if (!columns || columns.length == 0) return false

    const width = _.sumBy(columns, c => c.width ? c.width : CELL_MIN_WIDTH * (c.flex || 1))
    if (viewWidth < width) return true
    return false
  }

  render() {

    const {columns, style, headerCellStyle, headerStyle,loadingTitle, stripe, summary, title, searchable, matchText, paging, detailViewRender, tbar, hideHeader, filterComponent, taginput} = this.props
    if (this.state.loading) return <LoadingBar title={loadingTitle ? loadingTitle: 'Hold tight! We\'re getting your event\'s statistics...'}/>

    const columnWidth = (c) => {
      if (c.flex) return {flex: c.flex}
      else if (c.width) return {width: c.width}
      else return {flex: 1}
    }
    const columnAlign = (c) => {
      let align = 'flex-start'
      if (c.align == 'center') {
        align = 'center'
      } else if (c.align == 'right') {
        align = 'flex-end'
      }
      return {justifyContent: align}
    }

    let data
    const filteredData = this.getFilteredData()
    if(paging && this.state.paging) {
      data = this.getPageData(filteredData, this.state.paging.no, this.state.paging.size)
    } else {
      data = filteredData
    }
    const shouldBeScroll = this.shouldBeScroll()
    return (
      <View style={style} onLayout={this.onLayout}>
        {searchable && (
          <View style={{flexDirection: shouldBeScroll || !DeviceInfo.isTablet() ? 'column' : 'row', marginBottom: 10}}>
            {this.state.keyword!=null && this.state.keyword.length>0 && <Text
              style={commonStyle.searchMatchText}>{`${matchText ? matchText : 'Number of Matching Results'}: ${data.length}`}</Text>}
            <SearchBox onSearch={this.searchData} align={shouldBeScroll ? 'flex-start' : 'flex-end'}/>
          </View>)}
        {filterComponent}
        {tbar}
        <ScrollView horizontal={shouldBeScroll}>
          <View style={[shouldBeScroll && {width: columns.length * CELL_MIN_WIDTH}]}>
            {!hideHeader &&
              <View style={[commonStyle.gridHeaderContainer, headerStyle]}>
                {
                  columns.map((c, index) => {
                    const headerContent = (icon = null) => (
                      <View key={`header-cell-${index}`}
                            style={[commonStyle.gridHeaderCell, columnWidth(c), columnAlign(c), c.style]}>
                        <Text style={[commonStyle.gridHeaderCellLabel, headerCellStyle]}>{c.name}</Text>
                        {icon && <Icon name={icon} style={{marginLeft: 5}} size={15} color='#ffffff'/>}
                      </View>
                    )
                    if (c.sort) {
                      const {sort} = this.state
                      let sortIcon = null
                      if (sort && _.isEqual(sort.column, c)) {
                        sortIcon = sort.asc ? 'caret-up' : 'caret-down'
                      }
                      return (
                        <TouchableWithoutFeedback key={`header-cell-touchable-${index}`}
                                                  onPress={() => this.sortDataBy(c)}>{headerContent(sortIcon)}</TouchableWithoutFeedback>
                      )
                    } else {
                      return (
                        headerContent()
                      )
                    }
                  })
                }
              </View>
            }
            {
              (!data || data.length == 0) && (
                <View style={{flex: 1, alignItems: 'center', padding: 10}}>
                  <Image style={commonStyle.noDataIcon} source={require('@nativeRes/images/no_data_icon_new.png')}/>
                </View>
              )
            }
            {
              data && data.length > 0 && data.map((record, index) => {
                return (<TouchableWithoutFeedback key={index}>
                  <View>
                    <View
                      style={[commonStyle.gridBodyContainer, {backgroundColor: stripe && index % 2 == 1 ? '#2429355A' : 'transparent'}]}>
                      {
                        columns.map((c, index) => {
                          let el

                          if (c.renderer && typeof c.renderer === 'function') el = c.renderer(record, c.dataIndex ? record[c.dataIndex] : null)
                          else if (c.dataIndex) el =
                            <Text style={commonStyle.gridBodyCellLabel}>{record[c.dataIndex]}</Text>
                          else el = null

                          return <View key={index}
                                       style={[commonStyle.gridBodyCell, columnWidth(c), columnAlign(c), c.style]}>{el}</View>
                        })
                      }
                    </View>
                    {detailViewRender && typeof detailViewRender === 'function' && _.findIndex(this.state.expandedRows, {...record}) > -1 && detailViewRender(record)}
                  </View>
                </TouchableWithoutFeedback>)
              })
            }
            {
              summary && data && data.length > 0 && (
                <View style={commonStyle.gridSummaryContainer}>
                  {
                    columns.map((c, index) => {
                      let el = null

                      if (c.summaryRenderer && typeof c.summaryRenderer === 'function') {
                        el = c.summaryRenderer(filteredData)
                      } else if (c.summaryValue) {
                        el = <Text style={commonStyle.gridSummaryCellLabel}>{c.summaryValue}</Text>
                      } else if (c.summaryType && c.dataIndex) {
                        if (c.summaryType == 'sum') {
                          let sum = 0
                          filteredData.forEach((record) => {
                            sum += parseFloat(record[c.dataIndex])
                          })
                          el = <Text style={commonStyle.gridSummaryCellLabel}>{sum}</Text>
                        }
                      }

                      return <View key={index} style={[commonStyle.gridSummaryCell, columnWidth(c), columnAlign(c)]}>{el}</View>
                    })
                  }
                </View>
              )
            }
          </View>
        </ScrollView>
        {
          paging && (
            <PagingBar totalCount={filteredData.length} onSetPage={this.setPage}/>
          )
        }
      </View>
    )
  }
}
