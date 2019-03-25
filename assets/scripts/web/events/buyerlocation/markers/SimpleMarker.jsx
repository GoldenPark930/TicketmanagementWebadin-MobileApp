import React from 'react'
import { defaultProps, compose } from 'recompose'
import { clusterMarkerHOC } from './ClusterMarker'

export class simpleMarker extends React.Component{
	render(){
		const {styles, defaultMotionStyle, motionStyle, number, detail} = this.props
		// console.log('render = ', detail)
		let background = asset('/assets/resources/images/buyer_map_tooltip.png')
		let circle = asset('/assets/resources/images/buyer_map_dot.png')
		// background = '/assets/resources/images/buyer_map_tooltip.png'
		// circle = '/assets/resources/images/buyer_map_dot.png'    
		return (      
			<div className="location_circle" style={{backgroundImage:`url(${circle})`}}>
				{this.props.hovered && 
					<div className="detail_box" style={{backgroundImage:`url(${background})`}}>
						<div className="texts">
							<div>
								{detail.type}
							</div>
							<div>
								{this.props.numPoints.toLocaleString()}
							</div>
						</div>
					</div>
				}
			 </div>
		)
	}
}

// export const simpleMarker = ({
//   styles,
//   defaultMotionStyle, motionStyle,
// }) => (
	
// )

export const simpleMarkerHOC = compose(
	defaultProps({
		initialScale: 0.3,
		defaultScale: 0.6,
		hoveredScale: 0.7,
	}),
	// resuse HOC
	clusterMarkerHOC
)

export default simpleMarkerHOC(simpleMarker)
