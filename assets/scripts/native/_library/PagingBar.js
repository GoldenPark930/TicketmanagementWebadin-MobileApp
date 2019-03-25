import _ from 'lodash'
import React from 'react'
import {View, Text, TouchableWithoutFeedback} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import Select from './Select'
import PropTypes from 'prop-types';
import {commonStyle} from '../../native/styles'

export const DEFAULT_PAGESIZE = 10
export default class PagingBar extends React.Component {
  static propTypes = {
    tools: PropTypes.array,
    totalCount: PropTypes.number,
    maxPages: PropTypes.number,
    defaultPageSize: PropTypes.number,
    onSetPage: PropTypes.func
  }

  constructor(props) {
    super(props)

    this.pageSizeOptions = [{value: 10, label: '10'}, {value: 50, label: '50'}, {value: 100, label: '100'}, {
      value: 250,
      label: '250'
    }, {value: 500, label: '500'}, {value: 1000, label: '1000'}]

    this.maxPages = props.maxPages || 5

    this.state = {
      pageSize: props.defaultPageSize || DEFAULT_PAGESIZE,
      page: 1
    }
  }

  componentWillReceiveProps(newProps) {
    if(newProps.totalCount < this.props.totalCount) {
      this.setState({page:1})
      if (this.props.onSetPage) this.props.onSetPage(1, this.state.pageSize)
    }
  }

  setPage(page) {
    if (this.state.page != page) {
      this.setState({page})
      if (this.props.onSetPage) this.props.onSetPage(page, this.state.pageSize)
    }
  }

  onChangePageSize = (size) => {
    let {page} = this.state
    if(this.props.totalCount/size < page) page = 1
    this.setState({pageSize: size, page})
    if (this.props.onSetPage) this.props.onSetPage(page, size)
  }
  onPressFirstPage = () => {
    this.setPage(1)
  }
  onPressPrevPage = () => {
    this.setPage(this.state.page - 1)
  }
  onPressNextPage = () => {
    this.setPage(this.state.page + 1)
  }
  onPressLastPage = () => {
    this.setPage(parseInt((this.props.totalCount - 1) / this.state.pageSize) + 1)
  }

  renderPageButtons() {
    const {totalCount} = this.props
    const {pageSize, page} = this.state
    const totalPages = parseInt((totalCount - 1) / pageSize) + 1
    let disableFirst = false, disablePrev = false, disableNext = false, disableLast = false
    if (page == 1) disableFirst = disablePrev = true
    if (page == totalPages) disableNext = disableLast = true

    let startPage = parseInt((page - 1) / this.maxPages) * this.maxPages + 1
    let endPage = startPage + this.maxPages - 1
    if (endPage > totalPages) endPage = totalPages

    return (
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <TouchableWithoutFeedback onPress={this.onPressFirstPage} disabled={disableFirst}><View
          style={commonStyle.pageButtonContainer}><Text
          style={[commonStyle.pageButtonLabel, disableFirst && {color: '#777'}]}><Icon name='angle-double-left'
                                                                                       size={11}/></Text></View></TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={this.onPressPrevPage} disabled={disablePrev}><View
          style={commonStyle.pageButtonContainer}><Text
          style={[commonStyle.pageButtonLabel, disablePrev && {color: '#777'}]}><Icon name='angle-left'
                                                                                      size={11}/></Text></View></TouchableWithoutFeedback>
        {
          _.range(startPage, endPage + 1).map(p => <TouchableWithoutFeedback key={p}
                                                                             onPress={() => this.setPage(p)}><View
            style={[commonStyle.pageButtonContainer, page == p && {backgroundColor: '#4d5667'}]}><Text
            style={[commonStyle.pageButtonLabel, page == p && {color: 'white'}]}>{p}</Text></View></TouchableWithoutFeedback>)
        }
        <TouchableWithoutFeedback onPress={this.onPressNextPage} disabled={disableNext}><View
          style={commonStyle.pageButtonContainer}><Text
          style={[commonStyle.pageButtonLabel, disableNext && {color: '#777'}]}><Icon name='angle-right'/></Text></View></TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={this.onPressLastPage} disabled={disableLast}><View
          style={commonStyle.pageButtonContainer}><Text
          style={[commonStyle.pageButtonLabel, disableLast && {color: '#777'}]}><Icon name='angle-double-right'/></Text></View></TouchableWithoutFeedback>
      </View>
    )
  }

  render() {
    const {tools} = this.props
    const {pageSize} = this.state
    return (
      <View style={{flexDirection: 'row', flex: 1}}>
        <View style={{justifyContent: 'flex-start'}}></View>
        <View style={{justifyContent: 'center', flex: 1, alignItems: 'center'}}>
          {this.renderPageButtons()}
        </View>
        <View style={{justifyContent: 'flex-end', alignItems: 'flex-end'}}>
          <Select style={{width: 80}} options={this.pageSizeOptions} value={pageSize} onChange={this.onChangePageSize}/>
        </View>
      </View>
    )
  }
}
