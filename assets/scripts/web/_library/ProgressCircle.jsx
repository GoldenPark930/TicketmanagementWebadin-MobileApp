import React from 'react'
import _ from 'lodash'
import CircularProgressbar from 'react-circular-progressbar'

export default class ProgressCircle extends React.Component {
	constructor(props){
		super(props)

		this.unMounted = true

		this.state = {
			target: 0,
			uniqID: new Date().valueOf()
		}

		let self = this
		self.isVisible = !document.hidden

		$(window).focus(()=>{
			self.isVisible = true
			self.drawComponent()
		}).blur(()=>{
			self.isVisible = false
		})

		this.onWindowScroll = this.onWindowScroll.bind(this)
		this.onWindowResize = this.onWindowResize.bind(this)
	}

	componentWillReceiveProps(nextProps, nextState){
		if(JSON.stringify(this.props)!=JSON.stringify(nextProps)) {
			this.drawComponent(nextProps.value)
		}
		return true
	}

	componentDidMount() {
		this.unMounted = false
		window.addEventListener('resize', this.onWindowResize)
		window.addEventListener('scroll', this.onWindowScroll)
	}

	componentWillUnmount(){
		this.unMounted = true
		window.removeEventListener('resize', this.onWindowResize)
		window.removeEventListener('scroll', this.onWindowScroll)
	}

	onWindowResize(){
		this.drawComponent()
	}

	onWindowScroll(){
		this.drawComponent()
	}

	drawComponent(v){
		if(this.unMounted)
			return
		let target = !! v ? v : this.props.value
		
		const {uniqID} = this.state
		let ele = $('#' + uniqID).parent()
		if(!ele)
	        return
		let windowTop = $(window).scrollTop()
		let windowBottom = $(window).scrollTop() + $(window).height()
		let elementTop = ele.offset().top
		let elementBottom = ele.offset().top+ele.height()
		if(!(elementTop >= windowTop ? elementTop <= windowBottom : elementBottom >= windowTop)){
			return
		} else {
			if(this.isVisible)
				this.setState({target: target})
		}
	}

	render(){
		const {img, value, duration} = this.props
		const {target, uniqID} = this.state
		let isImgCentered = img != null

		return (
			<div id={uniqID} className='progressCircle'>
				<CircularProgressbar initialAnimation={false} percentage={target} strokeWidth={6}/>
				<div className='decoration'>
					<div className='innerCircle'/>
				</div>
				{!isImgCentered &&
					<div className='progrsssText'>
						{value}%
					</div>
				}
				{isImgCentered && 
					<img className='centerImage' src={img}/>
				}
			</div>
		)
	}
}