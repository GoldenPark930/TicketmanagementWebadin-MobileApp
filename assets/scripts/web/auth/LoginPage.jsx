import _ from 'lodash'
import classNames from 'classnames'
import {connect} from 'react-redux'
import React from 'react'
import {routeActions} from 'react-router-redux'
import {Link} from 'react-router'

import Notifications from '../_library/notifications/Notifications'
import {LOGIN, FACEBOOK_LOGIN} from '../../_common/redux/auth/actions'
import FacebookAuthButton from './FacebookAuthButton'
import LoginForm from './LoginForm'


@connect(
	(state) => {return {nextLocation: _.get(state, 'routing.location.query.next', '/')}},
	{LOGIN, FACEBOOK_LOGIN, push: routeActions.push}
)
export default class LoginPage extends React.Component {
	constructor(props) {
		super(props)
		this.state={
			width: $(window).width()
		}
		document.title = 'Log In - The Ticket Fairy Dashboard'
	}

	componentDidMount() {
		$('html').addClass('authentication')
		window.addEventListener('resize', this.updateDimensions.bind(this))
	}

	componentWillUnmount() {
		$('html').removeClass('authentication')
		window.removeEventListener('resize', this.updateDimensions.bind(this))
	}

	componentWillMount() {
		this.updateDimensions.bind(this)
	}

	updateDimensions(){
		this.setState({width: $(window).width()})
	}

	handleFacebookToken(auth) {
		const {FACEBOOK_LOGIN, push, nextLocation} = this.props
		return FACEBOOK_LOGIN({attributes: auth})
			.then(res => {
				push(nextLocation)
				return res
			})
	}

	handleSubmit(form) {
		const {LOGIN, push, nextLocation} = this.props
		return Promise.resolve(LOGIN(form))
			.catch((err) => {
				return Promise.reject(_.result(err, 'toFieldErrors'))
			})
			.then((v) => {
				push(nextLocation)
				return v
			})
	}

	render() {
		const {fbLoading} = this.state

		let width = $(window).width()
		let height = $(window).height()
		let isLandscape = width >= height
		let video = 'landscape/1280x720.mp4', image='landscape/landscape-desktop.jpg'
		if(isLandscape){
			if(width <= 668){
				video = 'landscape/668x376.mp4'
				image = 'landscape/landscape-iphone.jpg'
			}else if(width <= 1024){
				video = 'landscape/1024x768.mp4'
				image = 'landscape/landscape-ipad.jpg'
			}else if(width <= 1280){
				video = 'landscape/1280x720.mp4'
				image = 'landscape/landscape-desktop.jpg'
			}else{
				video = 'landscape/1920x1080.mp4'
				image = 'landscape/landscape-desktop.jpg'
			}
		}else{
			if(width < 768){
				video = 'portrait/376x668.mp4'
				image = 'portrait/portrait-iphone.jpg'
			}else{
				video = 'portrait/768x1024.mp4'
				image = 'portrait/portrait-ipad.jpg'
			}
		}

		return (
			<div className='loginpage'>
				<div className='bg_video'>
					<video poster={asset('/assets/resources/videos/login/' + image)} id="bgvid" playsInline autoPlay muted loop>
						<source src={asset('/assets/resources/videos/login/' + video)} type="video/mp4"/>
					</video>
				</div>
				<Notifications />
				<LoginForm onSubmit={::this.handleSubmit} />
			</div>
		)
	}
}