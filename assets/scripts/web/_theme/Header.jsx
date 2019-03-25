import classNames from 'classnames'
import React from 'react'
import _ from 'lodash'
import { Link } from 'react-router'
import {connect} from 'react-redux'
import {routeActions} from 'react-router-redux'
import {LOGOUT} from '../../_common/redux/auth/actions'
import Slider from 'react-slick'

import { MenuItem, EVENT_STATISTICS, EVENT_EDIT, EVENT_INTERACT, FUNC_CHECKPAGE } from './_Library.jsx'

class HeaderNavigation extends React.Component{
	constructor(props){
		super(props)
		this.activeSlideNumber = -1
		this.previousSlideNumber = 0
		this.totalSlideNumber = 0
		this.state={
			width: $(window).width()
		}
	}	

	componentDidMount(){
		window.addEventListener('resize', this.updateDimensions.bind(this))
	}

	componentWillUnmount(){
		window.removeEventListener('resize', this.updateDimensions.bind(this))
	}

	componentWillMount() {
		this.updateDimensions.bind(this)
	}

	componentWillReceiveProps(nextProps) {
		this.autoSlide()
	}

	updateDimensions(){
		this.autoSlide()
		this.setState({width: $(window).width()})
	}

	getMenuGroup(){
		const activeItem = this.props.active || '' 
		const {event, navigation, brand} = this.props
		const type = navigation.sidebarType || 'main'
		const path = navigation.path
		const isEvent = path.indexOf('/event') >= 0
		const isBrand = path.indexOf('/brand') >= 0
		const isHome = !(isEvent || isBrand)
		let itemID = '', page = '', loading= false
		if(isEvent){
			if(path == '/events')
				itemID = ''
			else
				itemID = !!event ? event.id : ''
			page = itemID != '' ? path.replace(`/event/${itemID}/`, '') : ''
			loading = !event ? true : false
		}
		if(isBrand){
			if(path == '/brands')
				itemID = ''
			else
				itemID = !!brand ? brand.id : ''
			page = itemID != '' ? path.replace(`/brand/${itemID}/`, '') : ''
			loading = !brand ? true : false
		}

		const isEventsPage = navigation.path == '/events'
		const isNewEventPage = navigation.path == '/events/new'
		const isBrandsPage = navigation.path == '/brands'
		const isNewBrandPage = navigation.path == '/brands/new'

		let permission = null
		let enablePromotions = false
		if(isEvent && !isNewEventPage && itemID != '' && !loading){
			permission = event.$relationships.self.role
			enablePromotions = event.$original.enablePromotions
		}

		const ENABLEPROMOTIONS = enablePromotions
		const PERMISSION_ALL = true
		const PERMISSION_ADMIN = permission == 'admin'
		const PERMISSION_STATS = PERMISSION_ADMIN || permission == 'stats' || permission == 'limited_stats'
		const PERMISSION_ONSITE = PERMISSION_ADMIN || permission == 'onsite'
		const PERMISSION_CURATOR = PERMISSION_ADMIN || permission == 'curator'

		let menuGroup = []
		if(isEvent && page !== ''){
			if(FUNC_CHECKPAGE(EVENT_STATISTICS, `|${page}|`)){
				menuGroup.push({img: 'performance', title: 'Performance', href: `/event/${itemID}/performance`, active: path === `/event/${itemID}/performance`, visible: PERMISSION_STATS})
				menuGroup.push({img: 'influencers', title: 'Influencers', href: `/event/${itemID}/influencers`, active: path === `/event/${itemID}/influencers`, visible: PERMISSION_STATS})
				menuGroup.push({img: 'orders', title: 'Orders', href: `/event/${itemID}/orders`, active: path === `/event/${itemID}/orders`, visible: PERMISSION_STATS})
				menuGroup.push({img: 'check-in', title: 'Check-In', href: `/event/${itemID}/checkin`, active: path === `/event/${itemID}/checkin`, visible: PERMISSION_STATS})
				menuGroup.push({img: 'demographics', title: 'Demographics', href: `/event/${itemID}/demographics`, active: path === `/event/${itemID}/demographics`, visible: PERMISSION_STATS})
				menuGroup.push({img: 'geographics', title: 'Geographics', href: `/event/${itemID}/geographics`, active: path === `/event/${itemID}/geographics`, visible: PERMISSION_STATS})
				menuGroup.push({img: 'music', title: 'Music', href: `/event/${itemID}/music`, active: path === `/event/${itemID}/music`, visible: PERMISSION_STATS})
				menuGroup.push({img: 'streaming', title: 'Streaming', href: `/event/${itemID}/musicstreaming`, active: path === `/event/${itemID}/musicstreaming`, visible: PERMISSION_STATS})
				menuGroup.push({img: 'likes', title: 'Likes', href: `/event/${itemID}/likes`, active: path === `/event/${itemID}/likes`, visible: PERMISSION_STATS})
				menuGroup.push({img: 'psychographics', title: 'Psychographics', href: `/event/${itemID}/psychographics`, active: path === `/event/${itemID}/psychographics`, visible: PERMISSION_STATS})
				menuGroup.push({img: 'devices', title: 'Devices', href: `/event/${itemID}/devices`, active: path === `/event/${itemID}/devices`, visible: PERMISSION_STATS})
				menuGroup.push({img: 'games', title: 'Gaming', href: `/event/${itemID}/gaming`, active: path === `/event/${itemID}/gaming`, visible: PERMISSION_STATS})	
			}else if(FUNC_CHECKPAGE(EVENT_EDIT, `|${page}|`)){
				menuGroup.push({img: 'details', title: 'Details', href: `/event/${itemID}/details`, active: path === `/event/${itemID}/details`, visible: PERMISSION_ADMIN})
				menuGroup.push({img: 'venue', title: 'Venue', href: `/event/${itemID}/venues`, active: path === `/event/${itemID}/venues`, visible: PERMISSION_ADMIN})
				menuGroup.push({img: 'tickets', title: 'Tickets', href: `/event/${itemID}/tickets`, active: path === `/event/${itemID}/tickets`, visible: PERMISSION_ADMIN})
			}else if(FUNC_CHECKPAGE(EVENT_INTERACT, `|${page}|`)){
				menuGroup.push({img: 'messaging', title: 'Messaging', href: `/event/${itemID}/messaging`, active: path === `/event/${itemID}/messaging`, visible: PERMISSION_ADMIN})
				menuGroup.push({img: 'invitation', title: 'Invitations', href: `/event/${itemID}/invitations`, active: path === `/event/${itemID}/invitations`, visible: PERMISSION_CURATOR})
				menuGroup.push({img: 'guest-tickets', title: 'Guest Tickets', href: `/event/${itemID}/guest-tickets`, active: path === `/event/${itemID}/guest-tickets`, visible: PERMISSION_CURATOR })
				menuGroup.push({img: 'promotions', title: 'Promotions', href: `/event/${itemID}/promotions`, active: path === `/event/${itemID}/promotions`, visible: enablePromotions})
			}
		}
		if(isBrand && page !== ''){
			menuGroup.push({img: 'details', title: 'Details', href: `/brand/${itemID}/details`, active: path === `/brand/${itemID}/details`, visible: true})
			menuGroup.push({img: 'demographics', title: 'Demographics', href: `/brand/${itemID}/demographics`, active: path === `/brand/${itemID}/demographics`, visible: true})
			menuGroup.push({img: 'music', title: 'Music', href: `/brand/${itemID}/music`, active: path === `/brand/${itemID}/music`, visible: true})
			menuGroup.push({img: 'streaming', title: 'Streaming', href: `/brand/${itemID}/musicstreaming`, active: path === `/brand/${itemID}/musicstreaming`, visible: true})
			menuGroup.push({img: 'likes', title: 'Likes', href: `/brand/${itemID}/likes`, active: path === `/brand/${itemID}/likes`, visible: true})
			// menuGroup.push({icon: 'fa fa-envelope', title: 'Templates', href: `/brand/${itemID}/templates`, active: path === `/brand/${itemID}/templates`, visible: true})
		}

		this.totalSlideNumber = menuGroup.length
		return menuGroup
	}

	getVisibleSlideCount() {
		let width = $(window).width()
		if(width < 376)	return 2
		else if(width < 641) return 3
		else if(width < 769) return 4
		else if(width < 961) return 5
		else if(width < 1025) return 6
		else if(width < 1121) return 7
		else if(width < 1201) return 8
		else if(width < 1401) return 9
		else if(width < 10001) return 11
		else return 0
	}

	autoSlide(){
		if(this.activeSlideNumber != -1 && this.refs.slider){
			setTimeout(()=>{
				let visibleCount = this.getVisibleSlideCount()
				let old = this.previousSlideNumber
				if(this.previousSlideNumber > this.activeSlideNumber)
					this.previousSlideNumber = this.activeSlideNumber
				if(this.previousSlideNumber + visibleCount <= this.activeSlideNumber)
					this.previousSlideNumber = this.activeSlideNumber - visibleCount + 1
				if(this.previousSlideNumber >= this.totalSlideNumber - visibleCount && this.totalSlideNumber >= visibleCount)
					this.previousSlideNumber = this.totalSlideNumber - visibleCount
				if(old != this.previousSlideNumber && this.refs.slider){
					// save current position and move to it
					this.refs.slider.slickGoTo(this.previousSlideNumber)
				}
			}, 500)
		}else{
			this.previousSlideNumber = 0
			this.activeSlideNumber = -1
		}
	}

	onClickSlide(slideNumber){
		this.previousSlideNumber = slideNumber
	}
	
	render(){
		let menuGroup = this.getMenuGroup()
		let headerBar = _.map(menuGroup, (menu, index)=>{
			if(menu.active){
				this.activeSlideNumber = index
			}
			return menu.visible ? (
				<div key={index} className='header-bar-menuitem'>
					<MenuItem title={menu.title} img={menu.img} href={menu.href} active={menu.active} visible={menu.visible}/>
				</div>
			) : null
		})

		if(menuGroup.length == 0)
			headerBar = <div></div>

		let settings = {
			dots: false,
			infinite: false,
			speed: 500,
			draggable: false,
			swipeToSlide: false,
			slidesToShow: this.getVisibleSlideCount(),
			afterChange: this.onClickSlide.bind(this)
		}
		return (
			<div className='header-bar-center'>
				<div className='header-bar-slide'>
					{menuGroup.length !=0 &&
					<Slider ref='slider' {...settings}>
						{headerBar}
					</Slider>
					}
				</div>
			</div>
		)
	}
}

@connect(
	(state) => {
		const u = state.auth.get('user')
		const event = state.events.get('selected')
		const brand = state.brands.get('selected')
		return {
			navigation: state.navigation.toJS(),
			user: u ? u.toJS() : null,
			event: event ? event.toJS() : null,
			brand: brand? brand : null
		}
	},
	{LOGOUT, push: routeActions.push, replace: routeActions.replace}
)
export default class Header extends React.Component {
	constructor(props) {
		super(props)
	}

	handleLogo() {
		const {LOGOUT, replace} = this.props
		replace('/')
	}

	handleSidebarStateChange() {
		this.props.onClickToggle()
	}

	render() {
		const {user} = this.props
		const displayName = !!user ? ([user.firstName, user.lastName].filter(Boolean).join(' ')) : ''
		const abbName = !!user ? user.firstName.charAt(0).toUpperCase() + user.lastName.charAt(0).toUpperCase() : ''
		return (
			<div className='header-bar'>
				<div className='header-bar-left'>
					<div className="res_logo" onClick={::this.handleLogo}>
						<img src={asset('/assets/resources/images/ttf-logo.png')}/>
					</div>
					<div onClick={::this.handleSidebarStateChange} className='sidebar-btn'>
						<i className="fa fa-bars" />
					</div>						
				</div>
				<HeaderNavigation {...this.props}/>
			</div>
		)
	}
}
