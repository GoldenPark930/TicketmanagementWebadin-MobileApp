import React from 'react'
import {defaultProps, withPropsOnChange, pure, compose} from 'recompose'

export class clusterMarker extends React.Component {
	render(){
		const {styles, defaultMotionStyle, motionStyle, number, detail, numPoints} = this.props

		let circle = asset('/assets/resources/images/geographics/mc1.png')
		if(numPoints < 10) circle = asset('/assets/resources/images/geographics/mc1.png')
		else if(numPoints < 100) circle = asset('/assets/resources/images/geographics/mc2.png')
		else if(numPoints < 1000) circle = asset('/assets/resources/images/geographics/mc3.png')
		else if(numPoints < 10000) circle = asset('/assets/resources/images/geographics/mc4.png')
		else circle = asset('/assets/resources/images/geographics/mc5.png')
			
		let background = asset('/assets/resources/images/buyer_map_tooltip.png')
		// let circle = asset('/assets/resources/images/buyer_map_dot.png')


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

export const clusterMarkerHOC = compose(
	defaultProps({
		text: '0',
		hovered: false,
		stiffness: 320,
		damping: 7,
		precision: 0.001,
	}),
	// pure optimization can cause some effects you don't want,
	// don't use it in development for markers
	pure,
)

export default clusterMarkerHOC(clusterMarker)
