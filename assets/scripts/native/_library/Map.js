import React from 'react'
import {View, Text, ImageBackground, Image} from 'react-native'
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps'
import Immutable from 'immutable'
import MAP_THEME from './map_themes/dark2'
import _ from 'lodash'
import {LoginStyle} from "../styles";
const MAP_ZOOM = 10
import PropTypes from 'prop-types';

function fitBounds(map, bounds) {
  if (bounds.getNorthEast().equals(bounds.getSouthWest())) {
    var extendPoint1 = new google.maps.LatLng(bounds.getNorthEast().lat() + 0.2, bounds.getNorthEast().lng() + 0.2)
    var extendPoint2 = new google.maps.LatLng(bounds.getNorthEast().lat() - 0.2, bounds.getNorthEast().lng() - 0.2)
    bounds.extend(extendPoint1)
    bounds.extend(extendPoint2)
  }
  map.fitBounds(bounds)
}

export default class Map extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      map: null,
      location: {
        latitude: this.props.locations.latitude,
        longitude: this.props.locations.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }
    }
    this.markers = Immutable.Map()
    this.timer = null
  }

  componentWillMount() {

  }
  _renderMarkers = (markerLen) => {
    if (markerLen > 0 && markerLen < 10) {
      return (
        <View>
          <ImageBackground style={{width: 32, height: 34, alignItems: 'center'}}
                           source={require('@nativeRes/images/geographics/p1.png')}>
            <Text style={{textAlign: 'center', color: 'white', marginTop: 10}}>{markerLen}</Text>
          </ImageBackground>
        </View>
      )
    }else if (markerLen < 9 && markerLen < 100) {
      return (
        <View>
          <ImageBackground style={{width: 38, height: 37, alignItems: 'center'}}
                           source={require('@nativeRes/images/geographics/p2.png')}>
            <Text style={{textAlign: 'center', color: 'white', marginTop: 12}}>{markerLen}</Text>
          </ImageBackground>
        </View>
      )
    }else if (markerLen < 99 && markerLen < 1000) {
      return (
        <View>
          <ImageBackground style={{width: 44, height: 43, alignItems: 'center'}}
                           source={require('@nativeRes/images/geographics/p3.png')}>
            <Text style={{textAlign: 'center', color: 'white', marginTop: 14}}>{markerLen}</Text>
          </ImageBackground>
        </View>
      )
    }else if (markerLen < 999 && markerLen < 10000) {
      return (
        <View>
          <ImageBackground style={{width: 48, height: 49, alignItems: 'center'}}
                           source={require('@nativeRes/images/geographics/p4.png')}>
            <Text style={{textAlign: 'center', color: 'white', marginTop: 16}}>{markerLen}</Text>
          </ImageBackground>
        </View>
      )
    }else{
      return (
        <View>
          <ImageBackground style={{width: 54, height: 52, alignItems: 'center'}}
                           source={require('@nativeRes/images/geographics/p5.png')}>
            <Text style={{textAlign: 'center', color: 'white', marginTop: 18}}>{markerLen}</Text>
          </ImageBackground>
        </View>
      )
    }
  }
  render() {
    const { locations, markers, sortBy, innerref} = this.props
    let rendermarkers
    return (
      <View>
        <MapView
          ref={innerref}
          provider={PROVIDER_GOOGLE}
          region={this.state.location}
          minZoomLevel = {1}
          customMapStyle={MAP_THEME}
          style={{position:'absolute', left:0, right:0, top:0, bottom:0, height: 600}}
        >
          <Marker coordinate={this.state.location} title={locations.displayName}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Image style={{width:30, height: 36}} source={require('@nativeRes/images/map_pin_default.png')}/>
            </View>
          </Marker>
          {sortBy && sortBy.map((marker, i)=>(
            <Marker key={i} coordinate={{latitude: marker[0].lat, longitude: marker[0].lng}}>
              {this._renderMarkers(marker.length)}
            </Marker>
          ))}
        </MapView>
      </View>
    )
  }

}
