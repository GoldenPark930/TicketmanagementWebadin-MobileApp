import classNames from 'classnames'
import React from 'react'
import CountUp from './AnimationCount/component/CountUp'
import CountRoll from './AnimationCount/component/CountRoll'
import CountSlide from './AnimationCount/component/CountSlide'

export default class NumberAnimation extends React.Component {
	static propTypes = {
		isLoading: React.PropTypes.bool,
		initValue: React.PropTypes.number,
		target: React.PropTypes.number,
		duration: React.PropTypes.number,
		decimals: React.PropTypes.number,
		useGroup: React.PropTypes.bool,
		prefix: React.PropTypes.string,
		subfix: React.PropTypes.string,
		linear: React.PropTypes.bool,
		animation: React.PropTypes.string, // up/roll/slide
	}

	render() {
		const setting = {
			isLoading: this.props.isLoading || false,
			start: this.props.initValue || 0,
			count: this.props.target || 0,
			duration: this.props.duration || 3000,
			decimals: this.props.decimals || 0,
			useGroup: this.props.useGroup || false,
			animation: this.props.animation || 'up',
			prefix: this.props.prefix || '',
			subfix: this.props.subfix || '',
			localeString: this.props.localeString || false,
			linear: this.props.linear || false,
		}
		let countDiv = null

		switch (setting.animation) {
			case 'up':
				countDiv = <CountUp ref='countObj' {...setting} />
				break
			case 'roll':
				countDiv = <CountRoll ref='countObj' {...setting} />
				break
			case 'slide':
				countDiv = <CountSlide ref='countObj' {...setting} />
				break
			default:
				countDiv = null	
				break
		}

		return this.props.isLoading ? (
				<i className="fa fa-circle-o-notch fa-spin loading_spinner"></i>
			) : (
				<div className="count-animation-container">
					{countDiv}
				</div>
			)
	}
}