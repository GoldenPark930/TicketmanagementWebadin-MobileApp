import React from 'react'
import Lottie from 'react-lottie'

const animationData = require('./LoadingBarAni.js')

export default class LoadingBar extends React.Component {
	static propTypes = {
		title: React.PropTypes.string
	}
	constructor(props) {
		super(props)

		this.state = {
			lottieOptions: {
				loop: true,
				autoplay: true, 
				animationData: animationData
			}
		}		
	}
	render() {
		const {title} = this.props
		const {lottieOptions} = this.state
		return (
			<div className={'card text-center ' + this.props.className}>
				<div className="card-block text-center text-muted">
					<Lottie options={lottieOptions} height={200} width={200} />
					{title || 'Loading...'}
				</div>
			</div>
		)
	}
}
