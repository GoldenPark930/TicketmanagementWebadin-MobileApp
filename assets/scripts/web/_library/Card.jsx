import React from 'react'
import Collapsible from 'react-collapsible'

export default class Card extends React.Component {
	static propTypes = {
		title: React.PropTypes.string,
		icon: React.PropTypes.string,
		icon2: React.PropTypes.string,
		addition: React.PropTypes.object,
		className: React.PropTypes.string,
		closed: React.PropTypes.bool,
	}
	render() {
		const {children, icon, icon2, className, title, closed, addition} = this.props
		let additionalClassName = className ? className : ''
		let titleObj = title ? (
			<div className="card-title">
				{icon && <i className={`fa ${icon}`} aria-hidden="true">&nbsp;</i>}
				{icon2 && <i className={`fa ${icon2}`} aria-hidden="true">&nbsp;</i>}
				{title}
				{addition}
			</div>
		) : null
		return (
			<Collapsible trigger={titleObj} open={!closed} openedClassName={`card ${additionalClassName}`} className={`card ${additionalClassName}`}>
				{children}
			</Collapsible>
		)
	}
}