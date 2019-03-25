import React from 'react'
import {compose, defaultProps, withProps, withState, withHandlers, withPropsOnChange} from 'recompose'
import GoogleMapReact from 'google-map-react'
import ClusterMarker from './markers/ClusterMarker'
import SimpleMarker from './markers/SimpleMarker'
import supercluster from 'points-cluster'
import MAP_THEME from '../../_library/map_themes/dark2'

const mapDefault = {
  center: {lat: 5, lng: -30},
  zoom: 3
}

export const gMap = ({
  style, hoverDistance, options,
  mapProps: { center, zoom },
  onChange, onChildClick, onChildMouseEnter, onChildMouseLeave,
  clusters,
}) => (
  <GoogleMapReact
    style={style}
    options={options}
    hoverDistance={hoverDistance}
    center={center}
    zoom={zoom}
    onChange={onChange}
    onChildClick={onChildClick}
    onChildMouseEnter={onChildMouseEnter}
    onChildMouseLeave={onChildMouseLeave}
  >
    {
      clusters
        .map(({ ...markerProps, id, numPoints }) => (
          numPoints === 1
            ? <SimpleMarker key={id} {...markerProps} />
            : <ClusterMarker key={id} {...markerProps} />
        ))
    }
  </GoogleMapReact>
)

export const gMapHOC = compose(
  defaultProps({
    clusterRadius: 60,
    hoverDistance: 30,
    options: {
      minZoom: 3,
      minZoomOverride: true,
      maxZoom: 15,
      styles: MAP_THEME
    },
    style: {
      position: 'relative',
      margin: 0,
      padding: 0,
      flex: 1,
    },
  }),
  // withState so you could change markers if you want
  // withState(
  //   'markers',
  //   'setMarkers',
  //   markersData
  // ),
  withState(
    'hoveredMarkerId',
    'setHoveredMarkerId',
    -1
  ),
  withState(
    'mapProps',
    'setMapProps',
    ({mapZoom}) => ({
      center: mapZoom.center,
      zoom: mapZoom.zoom,
    })
  ),
  // describe events
  withHandlers({
    onChange: ({ setMapProps }) => ({ center, zoom, bounds }) => {
      setMapProps({ center, zoom, bounds })
    },

    onChildClick: ({ onClick, hoveredMarkerId }) => (clickKey, { number }) => {
      let ids = hoveredMarkerId.split('_')
      let clusterIdentifier = parseInt(ids[0])
      if(clusterIdentifier == 1) // not cluster      
        onClick(number)
    },

    onChildMouseEnter: ({ setHoveredMarkerId }) => (hoverKey, { id }) => {
      setHoveredMarkerId(id)
    },

    onChildMouseLeave: ({ setHoveredMarkerId, setClickedMarkerId }) => (/* hoverKey, childProps */) => {
      setHoveredMarkerId(-1)
      // setClickedMarkerId(-1)
    },
  }),
  // precalculate clusters if markers data has changed
  withPropsOnChange(
    ['markers'],
    ({ markers = [], clusterRadius, options: { minZoom, maxZoom } }) => ({
      getCluster: supercluster(
        markers,
        {
          minZoom, // min zoom to generate clusters on
          maxZoom, // max zoom level to cluster the points on
          radius: clusterRadius, // cluster radius in pixels
        }
      ),
    })
  ),
  withPropsOnChange(
    ['mapZoom'],
    ({ mapZoom: { center, zoom }, setMapProps }) => {
      setMapProps({ center, zoom })
    }
  ),
  // get clusters specific for current bounds and zoom
  withPropsOnChange(
    ['mapProps', 'getCluster'],
    ({ mapProps, getCluster }) => ({
      clusters: mapProps.bounds
        ? getCluster(mapProps)
          .map(({ wx, wy, numPoints, points }, index) => ({            
            lat: wy,
            lng: wx,
            text: numPoints,
            detail: points[0],
            numPoints,
            id: `${numPoints}_${index}`,            
          }))
        : [],
    })
  ),
  // set hovered
  withPropsOnChange(
    ['clusters', 'hoveredMarkerId'],
    ({ clusters, hoveredMarkerId }) => ({
      clusters: clusters
        .map(({ ...cluster, id }) => ({
          ...cluster,
          hovered: id === hoveredMarkerId,
        })),
    })
  ),
)

export default gMapHOC(gMap)
