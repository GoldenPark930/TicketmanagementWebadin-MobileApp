import React, { Component } from 'react'
import classNames from 'classnames'
import { MenuItem, EVENT_STATISTICS, EVENT_EDIT, EVENT_INTERACT, FUNC_CHECKPAGE } from './_Library.jsx'
import {connect} from 'react-redux'
import {routeActions} from 'react-router-redux'
import { Link } from 'react-router'
import {LOGOUT} from '../../_common/redux/auth/actions'
import _ from 'lodash'
import PerfectScrollbar from 'react-perfect-scrollbar'

@connect(
	(state) => {
		const event = state.events.get('selected')
		const brand = state.brands.get('selected')
		const u = state.auth.get('user')
		return {
			navigation: state.navigation.toJS(),
			user: u ? u.toJS() : null,
			event: event ? event.toJS() : null,
			brand: brand? brand : null
		}
	},
	{LOGOUT, push: routeActions.push, replace: routeActions.replace}
)
export default class Sidebar extends Component {
	constructor(props){
		super(props)
		this.unMounted = true
		this.state={
			width: $(window).width()
		}
	}

	componentDidMount(){
		this.unMounted = false
		window.addEventListener('resize', this.updateDimensions.bind(this))
	}

	componentWillUnmount(){
		this.unMounted = true
		window.removeEventListener('resize', this.updateDimensions.bind(this))
	}

	updateDimensions(){
		if(this.unMounted)
			return
		this.setState({width: $(window).width()})
	}

	onChangeLanguage(e) {
		Localize.setLanguage(e.target.value)
	}

	handleLogout() {
		const {LOGOUT, replace} = this.props
		return Promise.resolve(LOGOUT())
			.then(() =>
				replace('/signout')
			)
	}

	render() {
		let width = $(window).width()
		let height = $(window).height()
		let min = Math.min(width, height)
		let isMobile = width < 768

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
		const redirectPath_stat = permission == 'onsite' ? 'guest-tickets' : 'performance'
		const redirectPath_interact = permission == 'curator' ? 'invitations' : 'performance'

		let menuGroup = []
		menuGroup.push({img: 'home', title: 'Home', href: `/`, active: isHome, visible: true})
		menuGroup.push({img: 'events', title: 'Events', href: `/events`, active: isEventsPage || isNewEventPage, visible: true, open: isEvent && page !== ''})
		if(isEvent && page !== ''){
			let childGroup_stat = []
			childGroup_stat.push({img: 'performance', title: 'Performance', href: `/event/${itemID}/performance`, active: path === `/event/${itemID}/performance`, visible: PERMISSION_STATS})
			childGroup_stat.push({img: 'influencers', title: 'Influencers', href: `/event/${itemID}/influencers`, active: path === `/event/${itemID}/influencers`, visible: PERMISSION_STATS})
			childGroup_stat.push({img: 'orders', title: 'Orders', href: `/event/${itemID}/orders`, active: path === `/event/${itemID}/orders`, visible: PERMISSION_STATS})
			childGroup_stat.push({img: 'check-in', title: 'Check-In', href: `/event/${itemID}/checkin`, active: path === `/event/${itemID}/checkin`, visible: PERMISSION_STATS})
			childGroup_stat.push({img: 'demographics', title: 'Demographics', href: `/event/${itemID}/demographics`, active: path === `/event/${itemID}/demographics`, visible: PERMISSION_STATS})
			childGroup_stat.push({img: 'geographics', title: 'Geographics', href: `/event/${itemID}/geographics`, active: path === `/event/${itemID}/geographics`, visible: PERMISSION_STATS})
			childGroup_stat.push({img: 'music', title: 'Music', href: `/event/${itemID}/music`, active: path === `/event/${itemID}/music`, visible: PERMISSION_STATS})
			childGroup_stat.push({img: 'streaming', title: 'Streaming', href: `/event/${itemID}/musicstreaming`, active: path === `/event/${itemID}/musicstreaming`, visible: PERMISSION_STATS})
			childGroup_stat.push({img: 'likes', title: 'Likes', href: `/event/${itemID}/likes`, active: path === `/event/${itemID}/likes`, visible: PERMISSION_STATS})
			childGroup_stat.push({img: 'psychographics', title: 'Psychographics', href: `/event/${itemID}/psychographics`, active: path === `/event/${itemID}/psychographics`, visible: PERMISSION_STATS})
			childGroup_stat.push({img: 'devices', title: 'Devices', href: `/event/${itemID}/devices`, active: path === `/event/${itemID}/devices`, visible: PERMISSION_STATS})
			childGroup_stat.push({img: 'games', title: 'Gaming', href: `/event/${itemID}/gaming`, active: path === `/event/${itemID}/gaming`, visible: PERMISSION_STATS})					
			
			let childGroup_edit = []
			childGroup_edit.push({img: 'details', title: 'Details', href: `/event/${itemID}/details`, active: path === `/event/${itemID}/details`, visible: PERMISSION_ADMIN})
			childGroup_edit.push({img: 'venue', title: 'Venue', href: `/event/${itemID}/venues`, active: path === `/event/${itemID}/venues`, visible: PERMISSION_ADMIN})
			childGroup_edit.push({img: 'tickets', title: 'Tickets', href: `/event/${itemID}/tickets`, active: path === `/event/${itemID}/tickets`, visible: PERMISSION_ADMIN})
			
			let childGroup_inter = []
			childGroup_inter.push({img: 'messaging', title: 'Messaging', href: `/event/${itemID}/messaging`, active: path === `/event/${itemID}/messaging`, visible: PERMISSION_ADMIN})
			childGroup_inter.push({img: 'invitation', title: 'Invitations', href: `/event/${itemID}/invitations`, active: path === `/event/${itemID}/invitations`, visible: PERMISSION_CURATOR})
			childGroup_inter.push({img: 'guest-tickets', title: 'Guest Tickets', href: `/event/${itemID}/guest-tickets`, active: path === `/event/${itemID}/guest-tickets`, visible: PERMISSION_CURATOR})
			childGroup_inter.push({img: 'promotions', title: 'Promotions', href: `/event/${itemID}/promotions`, active: path === `/event/${itemID}/promotions`, visible: enablePromotions})
			
			menuGroup.push({level: 2, img: 'demographics', title: 'Statistics', href: `/event/${itemID}/${redirectPath_stat}`, active: FUNC_CHECKPAGE(EVENT_STATISTICS, `|${page}|`), visible: PERMISSION_STATS || PERMISSION_ONSITE, childGroup: childGroup_stat})
			menuGroup.push({level: 2, img: 'edit', title: 'Edit', href: `/event/${itemID}/details`, active: FUNC_CHECKPAGE(EVENT_EDIT, `|${page}|`), visible: PERMISSION_ADMIN, childGroup: childGroup_edit})
			menuGroup.push({level: 2, img: 'interact', title: 'Interact', href: `/event/${itemID}/${redirectPath_interact}`, active: FUNC_CHECKPAGE(EVENT_INTERACT, `|${page}|`), visible: PERMISSION_CURATOR, childGroup: childGroup_inter})
		}		
		menuGroup.push({img: 'brands', title: 'Brands', href: `/brands`, active: isBrandsPage || isNewBrandPage || (isBrand && page !== ''), visible: true})
		
		let menuBar = _.map(menuGroup, (menu, index)=>{
			return (
				<div key={index}>
					<MenuItem isMobile={isMobile} level={menu.level} title={menu.title} open={menu.open} img={menu.img} icon={menu.icon} href={menu.href} active={menu.active} visible={menu.visible} childGroup={menu.childGroup}/>
				</div>
			)
		})

		const {user} = this.props
		const displayName = !!user ? ([user.firstName, user.lastName].filter(Boolean).join(' ')) : ''
		const abbName = !!user ? user.firstName.charAt(0).toUpperCase() + user.lastName.charAt(0).toUpperCase() : ''

		let bottomPart = (<div className="sidebar-bottom">
			<Link className="account-settings-link" to="/account">
				<div className="account-settings-link-ab">{abbName}</div>
				<div className="account-settings-link-name">Account Settings</div>
			</Link>
			<div className='logout' onClick={::this.handleLogout}>
				<i className="fa fa-power-off" />
				Log out
			</div>
			<select className="form-control language-switcher"
				onChange={::this.onChangeLanguage}
				defaultValue={Localize.getLanguage()}
			>
				<option value={"en"}>EN</option>
				<option value={'es'}>ES</option>
			</select>
		</div>)

		return isMobile ? (
			<div className="sidebar mobile">				
				<PerfectScrollbar>
					{menuBar}
				</PerfectScrollbar>
				{bottomPart}
			</div>
		) : (
			<div className="sidebar">
				{menuBar}
				{bottomPart}
			</div>
		)
	}
}

