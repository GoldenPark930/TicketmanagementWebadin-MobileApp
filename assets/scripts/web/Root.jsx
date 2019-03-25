import classNames from 'classnames'
import React from 'react'
import {connect} from 'react-redux'
import Modal from 'react-modal'

// import DevTools from './_library/DevTools'

import Header from './_theme/Header'
import Footer from './_theme/Footer'
import Sidebar from './_theme/Sidebar'

const debug = process.env.NODE_ENV !== 'production'
const SIDEBAR_THRESHOLD = 768
const IS_MOBILE_DEVICE = (width) => {return width <= SIDEBAR_THRESHOLD}

@connect((state) => {
	return {
		navigation: state.navigation.toJS()
	}
}, {})
class Root extends React.Component {
	constructor(props){		
		super(props)
		let isMobile = IS_MOBILE_DEVICE($(window).width())
		this.state ={
			isMenuOpen: !isMobile
		}
	}
	static contextTypes = {store: React.PropTypes.object.isRequired}

	componentWillReceiveProps(nextProps) {
		if(IS_MOBILE_DEVICE($(window).width())){
			this.setState({isMenuOpen: false})
		}
	}

	onClickToggle = () => {
		this.setState({isMenuOpen: !this.state.isMenuOpen})
	}

	onClickMain = (event) => {
		// let width = $(window).width()
		// if(width < SIDEBAR_THRESHOLD){
		// 	console.log('-------sidebar hide')
		// 	this.setState({isMenuOpen: false})
		// 	event.stopPropagation()
		// 	event.preventDefault()
		// }
	}

	render() {
		const {navigation} = this.props
		if(this.state.isMenuOpen)
			$('body').addClass('sidebar-open')
		else
			$('body').removeClass('sidebar-open')
		// const classes = classNames({
		// 	'sidebar-open': this.state.isMenuOpen
		// })
		return (
			<div id='container'>
				<Header onClickToggle={::this.onClickToggle}/>
				<Sidebar/>
				{this.props.children}
				<Footer/>
				{/*debug && <DevTools />*/}
			</div>
		)
	}
}


Root.contextTypes = {store: React.PropTypes.object.isRequired}

export default Root
