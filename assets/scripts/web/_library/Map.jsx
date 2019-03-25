import React from 'react'
import Immutable from 'immutable'
import MAP_THEME from './map_themes/dark2'
import _ from 'lodash'
const MAP_ZOOM = 10

const locationPropType = React.PropTypes.shape({
	id: React.PropTypes.string,
	latitude: React.PropTypes.number,
	longitude: React.PropTypes.number,
})

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
	static propTypes = {
		locations: React.PropTypes.arrayOf(locationPropType)
	}

	constructor(props) {
		super(props)
		this.state = {
			map: null
		}
		this.markers = Immutable.Map()
		this.timer = null
	}

	detectGoogleSDK(successFunc) {
		if (global.google) { return successFunc(global.google) }
		this.timer = setTimeout(this.detectGoogleSDK.bind(this, successFunc), 3000)
	}

	componentDidMount() {    
		this.detectGoogleSDK(() => {
			// create new map
			const map = new google.maps.Map(this.refs.map, {
				zoom: MAP_ZOOM,
				minZoom: 1,
				maxZoom: 20,
				styles: MAP_THEME
			})
			// resize handler
			this.listener = google.maps.event.addDomListener(window, 'resize', () => {
				const center = map.getCenter()
				google.maps.event.trigger(map, 'resize')
				map.setCenter(center)
			})
			this.drawMap(map, this.props)
			this.setState({map: map})
		})
	}

	componentWillUnmount() {
		if (this.timer) { clearTimeout(this.timer) }
		if (this.listener) { google.maps.event.removeListener(this.listener) }
	}

	componentWillUpdate(nextProps, nextState) {
		this.drawMap(nextState.map, nextProps)
	}

	moveMap(positions){
		console.log('zoom = ', positions)
		if(!this.state.map)
			return
		let map = this.state.map
		// map.setCenter({lat: zoom.lat, lng: zoom.lng})
		// map.setZoom(zoom.zoom)
		const bounds = new google.maps.LatLngBounds()
		_.map(positions, (position, index) => {
			bounds.extend({lat: position.lat, lng: position.lng})
		})
		fitBounds(map, bounds)
	}

	drawMap(map, props){
		// locate center location
		this.placeMarkers(map, props.locations)
		// locate cluster markers
		if(props.markers)
			this.placeMarkersWithClustering(map, props.markers)
		// zoom
		// if(props.zoom){
		// 	let zoom = props.zoom
		// 	var listener = google.maps.event.addListener(map, 'idle', function(){
		// 		map.setZoom(zoom)
		// 		google.maps.event.removeListener(listener)
		// 	})
		// }
	}

	placeMarkers(map, locations) {
		if (!map) { return }
		const bounds = new google.maps.LatLngBounds()
		this.markers.forEach(m => m.setMap(null))

		var icon = {
			url: asset('/assets/resources/images/map_pin_default.png'), // url
			scaledSize: new google.maps.Size(30, 36), // scaled size      
			// origin: new google.maps.Point(0,0), // origin
			// anchor: new google.maps.Point(0, 0) // anchor
		}

		const newMarkers = Immutable.Map((locations || []).map(l => {
			if (!l.latitude || !l.longitude) { return }
			const m = new google.maps.Marker({
				map: map,
				position: {lat: l.latitude, lng: l.longitude},
				icon: icon,
				optimized: false,
				zIndex:99999999
			})
			var label = new MarkerWithLabel({
			 position: {lat: l.latitude, lng: l.longitude},
			 map: map,
			 labelContent: l.displayName || '',
			 labelClass: 'markerLabel', // the CSS class for the label
			 labelAnchor: new google.maps.Point(22, 0),
			 icon: {url: ''}
			})
			bounds.extend(m.getPosition())
			return [l.id, m]
		}).filter(Boolean))
		if (newMarkers.size) {
			fitBounds(map, bounds)
		}
		this.markers = newMarkers
	}

	placeMarkersWithClustering(map, locations){
		// Add some markers to the map.
		// Note: The code uses the JavaScript Array.prototype.map() method to
		// create an array of markers based on a given "locations" array.
		// The map() method here has nothing to do with the Google Maps API.
		var icon = {
			url: asset('/assets/resources/images/geographics/p1_1.png'), // url
			scaledSize: new google.maps.Size(32, 34), // scaled size
		}
		var markers = locations.map(function(location, i) {
			return new google.maps.Marker({
				position: location,
				icon: icon,
				optimized: false,
			})
		})

		var markerClusterOptions = {
			zoomOnClick: false,
			styles: [{
				textColor: 'white',
				width: 32,
				height: 34,
				url: asset('/assets/resources/images/geographics/p1.png'),
			},
			{
				textColor: 'white',
				width: 38,
				height: 37,
				url: asset('/assets/resources/images/geographics/p2.png'),      
			},
			{
				textColor: 'white',
				width: 44,
				height: 43,
				url: asset('/assets/resources/images/geographics/p3.png'),
			},
			{
				textColor: 'white',
				width: 48,
				height: 49,
				url: asset('/assets/resources/images/geographics/p4.png'),
			},
			{
				textColor: 'white',
				width: 54,
				height: 52,
				url: asset('/assets/resources/images/geographics/p5.png'),
			}]
		}
		// Add a marker clusterer to manage the markers.
		// var googleClusters = {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'}
		var markerCluster = new MarkerClusterer(map, markers, markerClusterOptions)
		// var markerCluster = new MarkerClusterer(map, markers, googleClusters)
	}

	render() { 
		return <div ref="map" style={{width: '100%', height: '100%'}} /> 
	}	
}
