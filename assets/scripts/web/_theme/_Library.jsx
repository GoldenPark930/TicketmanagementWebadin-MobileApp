import React, { Component } from 'react'
import classNames from 'classnames'
import _ from 'lodash'
import { Link } from 'react-router'
import Collapsible from 'react-collapsible'

export const EVENT_STATISTICS = '|performance|influencers|demographics|psychographics|checkin|music|musicstreaming|likes|orders|gaming|geographics|devices|'
export const EVENT_EDIT = '|details|venues|tickets|'
export const EVENT_INTERACT = '|messaging|invitations|guest-tickets|promotions|'

export const FUNC_CHECKPAGE = (pageGroup, page) => {return pageGroup.indexOf(page) !== -1}	

export class MenuItem extends Component {
	static propType = {
		isMobile: React.PropTypes.bool,
		level: React.PropTypes.number,
		title: React.PropTypes.string,
		img: React.PropTypes.string,
		icon: React.PropTypes.string,		
		active: React.PropTypes.bool,
		open: React.PropTypes.bool,
		visible: React.PropTypes.bool,
		href: React.PropTypes.string,
		className: React.PropTypes.string,
	}

	constructor(props) {
		super(props)
		this.state = {
			isExpanded: false,
			isOnHover: false,
			childIndex: -1,
		}
	}

	onMouseEnterChild(index){
		this.setState({
			childIndex: index
		})
	}

	onMouseLeaveChild(index){
		this.setState({
			childIndex: -1
		})
	}

	onMouseEnter() {
		const {title, level, href, isMobile, active, img} = this.props
		this.setState({
			isOnHover: true
		})
		if(isMobile)
			return
		if(level == 2){
			this.setState({isExpanded: true})
		}
	}

	onMouseLeave() {
		const {title, level, href, isMobile} = this.props
		this.setState({
			isOnHover: false
		})
		if(isMobile)
			return
		if(level == 2){
			this.setState({isExpanded: false})
		}
	}

	onMouseClick() {
		const {title, level, href, isMobile} = this.props
		if(!isMobile)
			return
		if(level == 2){
			this.setState({isExpanded: !this.state.isExpanded})
		}
	}

	render() {
		const {isExpanded, isOnHover, childIndex} = this.state
		const {title, img, icon, level, open, visible, active, href, className, childGroup, isMobile} = this.props

		let iconObj = null, iconObj_inActive = null
		if(img) {
			let zIndex_active = active || isOnHover ? 100 : 99
			let zIndex_inActive = active || isOnHover ? 99 : 100
			iconObj = <img src = {asset('/assets/resources/images/system_icons/' + img + '.svg')} style={{zIndex: zIndex_active}}/>
			iconObj_inActive = <img src = {asset('/assets/resources/images/system_icons/inactive/' + img + '.svg')} style={{zIndex: zIndex_inActive}}/>
		}
		if(icon) {
			iconObj = <i className={icon} aria-hidden='true'/>
		}

		let classes = classNames({
			'menuitem': true,
			'level2': level === 2,
			'active': active,
			'hover': isOnHover,
			'open': open || isExpanded,
		}, className)

		let subMenu = null
		if(level == 2){
			if(!!childGroup){
				subMenu = _.map(childGroup, (child, index) => {					
					let childClasses = classNames({
						'menuitem': true,
						'level3': true,
						'active2': child.active || childIndex == index
					})
					let zIndex_active = child.active || childIndex == index ? 100 : 99
					let zIndex_inActive = child.active || childIndex == index ? 99 : 100
					return (<Link key={index} className={childClasses} to={child.href} onMouseEnter={this.onMouseEnterChild.bind(this,index)} onMouseLeave={this.onMouseLeaveChild.bind(this, index)} style={{display: child.visible ? 'block': 'none'}}>
						<img src = {asset('/assets/resources/images/system_icons/' + child.img + '.svg')} style={{zIndex: zIndex_active}}/>
						<img src = {asset('/assets/resources/images/system_icons/inactive/' + child.img + '.svg')} style={{zIndex: zIndex_inActive}}/>						
						<div className='title'>{child.title}</div>
					</Link>)
				})
			}
		}

		return (
			<div onMouseEnter={::this.onMouseEnter} onMouseLeave={::this.onMouseLeave} onClick={::this.onMouseClick} className={level == 2 ? 'level2_container' : ''}>
				<Link to={isMobile && level ===2 ? null : href} className={classes} style={{display: visible ? 'block' : 'none'}}>
					{iconObj}
					{iconObj_inActive}
					<div className='title'>{title}</div>
				</Link>

				{level === 2 && isMobile &&
					<Collapsible open={isExpanded}>
						{subMenu}
					</Collapsible>
				}
				{level === 2 && isExpanded && !isMobile &&
					<div className="level2_submenu">
						{subMenu}
					</div>
				}
			</div>
		)
	}
}
