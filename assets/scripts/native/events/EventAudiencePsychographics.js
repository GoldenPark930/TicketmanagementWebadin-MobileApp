import _ from 'lodash'
import Immutable from 'immutable'
import {View, Text, ScrollView, Image, TouchableOpacity, Dimensions} from 'react-native'
import React from 'react'
import {connect} from 'react-redux'
import {Grid,LoadingBar} from '../_library'
import {fetchAPI} from '../../_common/core/http'
var vWidth = Dimensions.get('window').width;
import Icon from 'react-native-vector-icons/FontAwesome'
import {Orders as styles} from "../styles";
export const IS_FOUND = (value, keyword) => {
  if(!value)
    return 0
  return value.toLowerCase().indexOf(keyword) != -1 ? 1 : 0
}


class EventAudiencePsychographics extends React.Component {
  constructor(props) {
    super(props)
    this.unMounted = true
    this.state = {
      x: 0,
      showLoading: false,
      category: '_all',
      category_mapping:{'_all' : 'All'},
      widthCount: 2
    }
    this.entryCounts = {}
    this.activeSlideNumber = -1
    this.previousSlideNumber = 0
    this.totalSlideNumber = 0
    this.table = null
  }
  componentWillUnmount(){
    this.unMounted = true
  }

  getVisibleSlideCount() {
    let width = vWidth
    if(width < 376)	this.setState({widthCount: 2})
    else if(width < 641) this.setState({widthCount: 3})
    else if(width < 769) this.setState({widthCount: 4})
    else return 0
  }

  componentDidMount() {
    this.getVisibleSlideCount()
    this.unMounted = false
    if(!this.unMounted)this.setState({showLoading:true})
    const {event} = this.props
    fetchAPI(`/api/audience/${event.id}/`, {
      method: 'GET',
      params :{
        type: 'event',
        section: 'psychographics',
      },
      withCredentials: true
    }).then(res => {
      if(!this.unMounted) this.setState({data:res.data.$original.audience.interests, showLoading:false})
      this.fetchCallback(res.data.$original.audience.interests)
    })
  }
  fetchCallback(rows){
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
    this.setState({category_mapping: category})
  }
  onClickTab(key){
    this.setState({category: key})
  }
  setNextPosition(){
    console.warn(this.activeSlideNumber)
      if(this.state.x < ((this.activeSlideNumber-2) * ((vWidth - 100)/this.state.widthCount))) {
      _psychograhicsHeaderScrollview.scrollTo({x: this.state.x + ((vWidth - 100)/this.state.widthCount), y: 0, animated: true})
      this.setState({x: this.state.x + ((vWidth - 100)/this.state.widthCount)})
    }
  }
  setPrePosition(){
    if(this.state.x > 0) {
      _psychograhicsHeaderScrollview.scrollTo({x: this.state.x - ((vWidth - 100)/this.state.widthCount), y: 0, animated: true})
      this.setState({x: this.state.x - ((vWidth - 100)/this.state.widthCount)})
    }
  }
  onScroll(event){
    let widthCount = this.state.widthCount
    var scrollX = event.nativeEvent.contentOffset.x
    if(scrollX % 100 < 55){
      var customX = scrollX - scrollX % ((vWidth - 100)/widthCount)
    }else{
      var customX = scrollX + ((vWidth - 100)/widthCount) - scrollX % ((vWidth - 100)/widthCount)
    }
    _psychograhicsHeaderScrollview.scrollTo({ x:customX, y:0, animated:true })
    this.setState({x:customX})
  }
  onStartScroll(e){
    if(e.nativeEvent.contentOffset.x == 0)
      this.setState({x:0})
  }
  getTabHeader(){
    const {category, category_mapping, widthCount} = this.state
    let tab_keys = Object.keys(category_mapping)
    tab_keys = _.orderBy(tab_keys, (key)=>this.entryCounts[key], 'desc')
    let tab_header = _.map(tab_keys, (key, index)=>{
      let title = category_mapping[key]
      let imageName = require('@nativeRes/images/psychographics/_Unknown.png')
      switch(title) {
        case 'All':
          imageName = require('@nativeRes/images/psychographics/All.png')
          break;
        case 'Artist':
          imageName = require('@nativeRes/images/psychographics/Artist.png')
          break;
        case 'Brand':
          imageName = require('@nativeRes/images/psychographics/Brand.png')
          break;
        case 'Celebrity':
          imageName = require('@nativeRes/images/psychographics/Celebrity.png')
          break;
        case 'Community':
          imageName = require('@nativeRes/images/psychographics/Community.png')
          break;
        case 'Event':
          imageName = require('@nativeRes/images/psychographics/Event.png')
          break;
        case 'Interest':
          imageName = require('@nativeRes/images/psychographics/Interest.png')
          break;
        case 'Nonprofit':
          imageName = require('@nativeRes/images/psychographics/Nonprofit.png')
          break;
        case 'Place':
          imageName = require('@nativeRes/images/psychographics/Place.png')
          break;
        case 'Publisher':
          imageName = require('@nativeRes/images/psychographics/Publisher.png')
          break;
        case 'Show':
          imageName = require('@nativeRes/images/psychographics/Show.png')
          break;
        case 'Team':
          imageName = require('@nativeRes/images/psychographics/Team.png')
          break;
        case 'Type of Person':
          imageName = require('@nativeRes/images/psychographics/Type-of-Person.png')
          break;
      }

      this.activeSlideNumber = index
      return (
        <TouchableOpacity style={{height: 70, alignItems: 'center', paddingHorizontal:5, paddingVertical:12, width: (vWidth-100)/widthCount, borderBottomWidth: 3, borderBottomColor: key == category ? '#ffa46b' : '#00000000'}} key={index} onPress={() => this.onClickTab(key)}>
          <View style={{height:31, alignItems:'center', justifyCenter: 'center', flexDirection: 'row'}}><Image style={{width: 29.16, resizeMode: 'contain'}} source={imageName}/></View>
          <Text style={{color: key == category ? '#fbcc8f' : 'white'}}>{title}</Text>
        </TouchableOpacity>
      )
    })

    return (
      <View style={{flexDirection: 'row', alignItems: 'center', backgroundColor:'#2f3138'}}>
        <TouchableOpacity style={{width: 30, height: 60, alignItems:'center', justifyContent: 'center'}} onPress={()=>this.setPrePosition()}><Icon name="arrow-left" size={15} color="#b5c5cf"/></TouchableOpacity>
          <ScrollView
            horizontal
            ref={scroll => {_psychograhicsHeaderScrollview = scroll}}
            decelerationRate={'fast'}
            onScroll = {e => this.onStartScroll(e)}
            onScrollEndDrag = {(event)=>this.onScroll(event)}
          >
            <View style={{flexDirection: 'row'}}>
              {tab_header}
            </View>
          </ScrollView>
        <TouchableOpacity style={{width:30, height:60, alignItems:'center', justifyContent:'center'}} onPress={()=>this.setNextPosition()}><Icon name="arrow-right" size={15} color="#b5c5cf"/></TouchableOpacity>
      </View>
    )
  }
  getFilteredRows = (rows, search) => {
    const {category} = this.state
    let rows_filtered = rows
    // filter by search
    if (search)
    {
      // let keyword = search.join('').trim().toLowerCase()
      let keyword = search
      if (keyword != '') {
        rows_filtered = _.filter(rows_filtered, (item) => {
          let found = 0
          found += IS_FOUND(item.name, keyword)
          found += IS_FOUND(item.category, keyword)
          return found > 0
        })
      }
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
  render(){
    const {showLoading} = this.state
    return(
      <View>
        {!showLoading ?
        <Grid
          columns={[{
              name:'Name',
              dataIndex:'name',
              sort:true
            },{
              name:'Weight',
              sort: true,
              renderer: (t, val) => {
                let average_score = t.scores.reduce((p, c) => {
                    return p + c
                  }) / t.scores.length
                let weight = parseInt(t.count, 10) * average_score
                return (
                  <Text style={{color:'#ffffff'}}>
                    {parseInt(weight)}
                  </Text>
                )
              }
            }]}
          searchable
          taginput
          data={this.state.data}
          stripe={true}
          paging={true}
          filterFunc={this.getFilteredRows}
          tbar={this.getTabHeader()}
        />:<LoadingBar title={'Hold tight! We\'re getting your event\'s psychographics.'} />}
      </View>
    )
  }
}export default connect(
  (state) => {
    const event = state.events.get('selected').toJS()
    return {
      event,
    }
  }
)(EventAudiencePsychographics)
