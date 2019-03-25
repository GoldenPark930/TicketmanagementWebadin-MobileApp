import React from 'react'
import _ from 'lodash'

import Button from '../../_library/Button'
import Field from '../../_library/Field'
import Select from '../../_library/Select'

import GuestTicketDelegateItem from './GuestTicketDelegateItem'

const EMPTY_TICKET_TYPE = {
	id: '',
	label: 'Select Ticket Type',
}

const QUANTITY_OPTIONS = _.map(new Array(100), (e, i) => ({ value: i+1, label: i+1} ))

export default class GuestTicketDelegate extends React.Component {
	constructor(props) {
		super(props)

		const {tickets} = props

		let ticketTypeOptions = _.map(tickets, t => ({ value: t.id, label: t.displayName }))
		ticketTypeOptions.unshift(EMPTY_TICKET_TYPE)
		
		this.state = {
			delegate: props.delegate,
			ticketTypeOptions: ticketTypeOptions,
			quantityOptions: QUANTITY_OPTIONS
		}
	}

	componentDidMount() {
	}

	componentWillReceiveProps(newProps) {
		const {tickets, delegate} = newProps

		let ticketTypeOptions = _.map(_.filter(tickets, t => !_.find(delegate.items, {ticketType: t.id})), t => ({ value: t.id, label: t.displayName }))
		ticketTypeOptions.unshift(EMPTY_TICKET_TYPE)

		this.setState({
			delegate: delegate,
			ticketTypeOptions: ticketTypeOptions
		})
	}

	expand() {
		this.props.onExpand()
	}

	collapse() {
		this.props.onCollapse()
	}

	delete() {
		this.props.onDelete()
	}

	changeName(val) {
		let {delegate} = this.state
		delegate.name = val
		this.props.onChange(delegate)
	}

	changeTicketType(val) {
		let {delegate} = this.state
		delegate.ticketType = val
		this.props.onChange(delegate)
	}

	changeQuantityLimit(val) {
		let {delegate} = this.state
		delegate.quantityLimit = val
		this.props.onChange(delegate)
	}

	addItem() {
		let {delegate} = this.state

		if(delegate.ticketType == '' || delegate.quantityLimit < 1) return
		
		let newItem = {
			id: new Date().valueOf(),
			ticketType: delegate.ticketType,
			quantityLimit: delegate.quantityLimit
		}
		delegate.items.push(newItem)
		this.props.onChange(delegate)

		this.changeTicketType('')
		this.changeQuantityLimit(1)
	}

	deleteItem(index) {
		let {delegate} = this.state

		delegate.items.splice(index, 1)
		this.props.onChange(delegate)
	}

	moveItem(dragIndex, hoverIndex) {
		let {delegate} = this.state

		let dragItem = delegate.items[dragIndex]
		delegate.items.splice(dragIndex, 1)
		delegate.items.splice(hoverIndex, 0, dragItem)
		this.props.onChange(delegate)
	}

	render() {
		const {delegate, ticketTypeOptions, quantityOptions} = this.state
		const {tickets} = this.props

		return (
			<div className="guest-ticket-delegate">
				<div className="guest-ticket-delegate-top">
					<div className="row">
						<div className="col-xs-10">
							{ delegate.expanded && 
								<div className="guest-ticket-delegate-caret" onClick={e => this.collapse()}>
									<i className="fa fa-caret-down" aria-hidden="true"></i>
								</div> 
							}
							{ !delegate.expanded && 
								<div className="guest-ticket-delegate-caret" onClick={e => this.expand()}>
									<i className="fa fa-caret-right" aria-hidden="true"></i>
								</div> 
							}
							<input id={delegate.id} type="text" value={delegate.name} className="guest-ticket-delegate-name form-control" placeholder="Enter 3rd Party Company Name" onChange={e => this.changeName(e.target.value)} />
						</div>
						<div className="col-xs-2 text-right">
							<Button className="btn btn-success btn-shadow guest-ticket-delegate-btn"><i className="fa fa-floppy-o" /></Button>
							<Button className="btn btn-danger btn-shadow guest-ticket-delegate-btn" onClick={::this.delete}><i className="fa fa-trash" /></Button>
						</div>
					</div>
				</div>
				{ delegate.expanded &&
					<div className="guest-ticket-delegate-content">
						<div className="guest-ticket-delegate-newitem">
							<div className="row">
								<div className="col-xs-5">
									<Select
										id="ticketType"
										label="Ticket Type"
										options={ticketTypeOptions}
										value={delegate.ticketType}
										onChange={e => this.changeTicketType(e.target.value)}
									/>
								</div>
								<div className="col-xs-5">
									<Select
										id="quantityLimit"
										label="Maximum Number of Tickets"
										options={quantityOptions}
										value={delegate.quantityLimit}
										onChange={e => this.changeQuantityLimit(e.target.value)}
									/>
								</div>
								<div className="col-xs-2 text-right">
									<Button className="btn btn-default btn-shadow" disabled={delegate.ticketType == '' || delegate.quantityLimit < 1} onClick={::this.addItem}><i className="fa fa-plus" aria-hidden="true"></i></Button>
								</div>
							</div>
						</div>
						<div className="guest-ticket-delegate-items">
						{ delegate.items.map((item, i) => (
							<GuestTicketDelegateItem
								key={item.id}
								id={item.id}
								delegateId={delegate.id}
								index={i}
								item={item}
								tickets={tickets}
								onDelete={() => this.deleteItem(i)}
								onMove={(dragIndex, hoverIndex) => this.moveItem(dragIndex, hoverIndex)}
							/>
						))}
						</div>
					</div>
				}
			</div>
		)
	}
}