import {View, Text, Dimensions, Image, TouchableHighlight} from 'react-native'
import React from 'react'
import _ from 'lodash'
import MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';
import Icon from 'react-native-vector-icons/FontAwesome';
import {connect} from 'react-redux'
import {Panel, LoadingBar, EmptyBar, Map, Grid } from '../_library'
import session from "../../_common/redux/buyerlocation/actions";
import {HTTP_INIT, HTTP_LOADING, HTTP_LOADING_SUCCESSED} from "../../_common/core/http";
import {buyer_location, commonStyle} from '../styles'
var {height, width} = Dimensions.get('window');
class EventBuyerLocation extends React.Component {
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

  getCountryFlag(country){
    let flag = ''
    switch(country){
      case 'United States':
        flag = 'America.png'
        return (<Image source={require(`@nativeRes/images/flags/America.png`)} />)
        break
      case 'Australia':
        flag = 'Australia.png'
        return (<Image source={require(`@nativeRes/images/flags/Australia.png`)} />)
        break
      case 'New Zealand':
        flag = 'New-Zealand.png'
        return (<Image source={require(`@nativeRes/images/flags/New-Zealand.png`)} />)
        break
      default:
        flag = 'America.png'
        return (<Image source={require(`@nativeRes/images/flags/America.png`)} />)
        break
    }
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

  componentWillMount() {
    const {event, FETCH_EVENT_BUYERLOCATION} = this.props
    const loadingSetter_buyerlocation = (val) => () =>{
      this.setState({status: val})
    }
    Promise.resolve(FETCH_EVENT_BUYERLOCATION(event.id))
      .catch(loadingSetter_buyerlocation(HTTP_LOADING_SUCCESSED))
      .then(loadingSetter_buyerlocation(HTTP_LOADING_SUCCESSED))
    loadingSetter_buyerlocation(HTTP_LOADING)()
  }
  moveMap(rec) {
    _scrollView.scrollTo({y:150, x:0, animated:true})
    this.map.fitToCoordinates(rec.map(item => {
      return {
        latitude:item.lat,
        longitude:item.lng
      }
    }))
  }
  render() {
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
    if (this.state.status <= HTTP_LOADING) {
      return <LoadingBar title={'Hold tight! We\'re getting your geographics ...'} />
    }else if (filteredLocation.length == 0 ) {
      return <EmptyBar/>
    }
    return (
      <View>
        <Panel title={'Attendee Locations'} icon='globe'>
          <View style={{height: 900, width: width-60}}>
            <Map innerref={(map) => {this.map = map}} locations={venue} markers={filteredLocation} sortBy={cities}/>
            <View style={{alignItems: 'center', marginTop: 650}}>
              <View style={{flexDirection: 'row'}}>
                <Icon name="users" size={20} color="white" />
                <Text style={{color: 'white', marginLeft: 5}}>No. of Attendees</Text>
              </View>
              <View style={{flexDirection: 'row', marginTop:30}}>
                <View style={{width: 15, height:15, borderRadius: 2, backgroundColor: '#FD9758'}}/>
                <Text style={{color: 'white', marginLeft: 5}}>0-9</Text>
              </View>
              <View style={{flexDirection: 'row', marginTop:30}}>
                <View style={{width: 15, height:15, borderRadius: 2, backgroundColor: '#FF76A5'}}/>
                <Text style={{color: 'white', marginLeft: 5}}>10-99</Text>
              </View>
              <View style={{flexDirection: 'row', marginTop:30}}>
                <View style={{width: 15, height:15, borderRadius: 2, backgroundColor: '#02BAE8'}}/>
                <Text style={{color: 'white', marginLeft: 5}}>100-999</Text>
              </View>
              <View style={{flexDirection: 'row', marginTop:30}}>
                <View style={{width: 15, height:15, borderRadius: 2, backgroundColor: '#7D7BF4'}}/>
                <Text style={{color: 'white', marginLeft: 5}}>1000-9999</Text>
              </View>
              <View style={{flexDirection: 'row', marginTop:30}}>
                <View style={{width: 15, height:15, borderRadius: 2, backgroundColor: '#2DC280'}}/>
                <Text style={{color: 'white', marginLeft: 5}}>10000+</Text>
              </View>
            </View>
          </View>
        </Panel>
        <Panel icon={'bar-chart'} title={'Top Attendee Locations'} style={{ marginTop: 25 }}>
          <View style={{flexDirection: 'row', paddingBottom:10 ,alignItems: 'center'}}>
            <Icon name="map-marker" size={20} color="grey" />
            <Text style={{fontSize:18, color: '#fff', marginLeft:10}}>Top Cities</Text>
          </View>
          <Grid
            style={{marginTop:10}}
            columns={[{
              name: 'City',
              renderer: (rec, val) => (
                <TouchableHighlight onPress={()=>this.moveMap(rec)}>
                  <View>
                    <Text style={{fontSize: 14, color: '#fff'}}>
                      {rec[0].city}
                    </Text>
                    <View style={{alignItems: 'center', justifyCenter: 'center', paddingVertical: 8, paddingHorizontal: 20, backgroundColor: '#4d5261', borderRadius: 3, marginTop:10, width:52.58}}>
                      <Icon name="location-arrow" size={16} color="white" />
                    </View>
                  </View>
                </TouchableHighlight>
              ),
              sort: false,
            }, {
              name: '',
              renderer: (rec, val) => (
                <View style={{alignItems: 'flex-end', flex:1 }}>
                  <View style={{ marginTop: 30}}>
                    <Text style={{fontSize: 20, color: '#fff'}}>
                      {rec.length}
                    </Text>
                    <Text style={{fontSize: 13, color: '#fff'}}>
                      Attendees
                    </Text>
                  </View>
                </View>
              )
            }]}
            stripe
            data={_.slice(cities, 0, 25)}
            paging={false}
          />

          <View style={{flexDirection: 'row', paddingBottom:10 ,alignItems: 'center', paddingTop: 20}}>
            <Icon name="thumb-tack" size={20} color="grey" />
            <Text style={{fontSize:18, color: '#fff', marginLeft:10}}>Top Regions</Text>
          </View>
          <Grid
            style={{marginTop:10}}
            columns={[{
              name: 'Region',
              renderer: (rec, val) => (
                <TouchableHighlight onPress={()=>this.moveMap(rec)}>
                  <View>
                    <Text style={{fontSize: 14, color: '#fff'}}>
                      {rec[0].city}
                    </Text>
                    <View style={{alignItems: 'center', justifyCenter: 'center', paddingVertical: 8, paddingHorizontal: 20, backgroundColor: '#4d5261', borderRadius: 3, marginTop:10, width:52.58}}>
                      <Icon name="location-arrow" size={16} color="white" />
                    </View>
                  </View>
                </TouchableHighlight>
              ),
              sort: false,
            }, {
              name: '',
              renderer: (rec, val) => (
                <View style={{alignItems: 'flex-end', flex:1 }}>
                  <View style={{ marginTop: 30}}>
                    <Text style={{fontSize: 20, color: '#fff'}}>
                      {rec.length}
                    </Text>
                    <Text style={{fontSize: 13, color: '#fff'}}>
                      Attendees
                    </Text>
                  </View>
                </View>
              )
            }]}
            stripe
            data={_.slice(regions, 0, 25)}
            paging={false}
          />

          <View style={{flexDirection: 'row', paddingBottom:10 ,alignItems: 'center', paddingTop: 20}}>
            <Icon name="globe" size={20} color="grey" />
            <Text style={{fontSize:18, color: '#fff', marginLeft:10}}>Top Countries</Text>
          </View>
          <Grid
            style={{marginTop:10}}
            columns={[{
              name: 'Country',
              renderer: (rec, val) => (
                <TouchableHighlight onPress={()=>this.moveMap(rec)}>
                  <View>
                    <Text style={{fontSize: 14, color: '#fff'}}>
                      {rec[0].city}
                    </Text>
                    <View style={{alignItems: 'center', justifyCenter: 'center', paddingVertical: 8, paddingHorizontal: 20, backgroundColor: '#4d5261', borderRadius: 3, marginTop:10, width:52.58}}>
                      <Icon name="location-arrow" size={16} color="white" />
                    </View>
                  </View>
                </TouchableHighlight>
              ),
              sort: false,
            }, {
              name: '',
              renderer: (rec, val) => (
                <View style={{alignItems: 'flex-end', flex:1 }}>
                  <View style={{ marginTop: 30}}>
                    <Text style={{fontSize: 20, color: '#fff'}}>
                      {rec.length}
                    </Text>
                    <Text style={{fontSize: 13, color: '#fff'}}>
                      Attendees
                    </Text>
                  </View>
                </View>
              )
            }]}
            stripe
            data={_.slice(countries, 0, 25)}
            paging={false}
          />
        </Panel>
      </View>
    )
  }
}export default connect(
  (state) => {
    const event = state.events.get('selected').toJS()
    const buyerlocation = state.buyerlocation.get('buyerlocation').toJS()
    return {
      event,
      buyerlocation
    }
  },
  {FETCH_EVENT_BUYERLOCATION: session.FETCH_EVENT_BUYERLOCATION}
)(EventBuyerLocation)
