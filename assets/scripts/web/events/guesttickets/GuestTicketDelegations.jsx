import React from 'react'
import _ from 'lodash'
import { DragDropContext } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'

import GuestTicketDelegate from './GuestTicketDelegate'

@DragDropContext(HTML5Backend)
export default class GuestTicketDelegations extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			delegates: []
		}
	}

	componentDidMount() {
	}

	componentWillReceiveProps(newProps) {
	}

	newDelegate() {
		let {delegates} = this.state
		delegates.push({
			id: new Date().valueOf(),
			name: '',
			items: [],
			expanded: true,
			ticketType: '',
			quantityLimit: 1
		})
		this.setState({
			delegates: delegates
		})
	}

	expandDelegate(index) {
		let {delegates} = this.state
		delegates[index].expanded = true
		this.setState({
			delegates: delegates
		})
	}

	collapseDelegate(index) {
		let {delegates} = this.state
		delegates[index].expanded = false
		this.setState({
			delegates: delegates
		})
	}

	changeDelegate(index, val) {
		let {delegates} = this.state
		delegates[index] = val
		this.setState({
			delegates: delegates
		})
	}

	deleteDelegate(index) {
		let {delegates} = this.state
		delegates.splice(index, 1)
		this.setState({
			delegates: delegates
		})
	}

	render() {
		const {tickets} = this.props
		const {delegates} = this.state

		return (
			<div className="guest-ticket-delegations">
				<div className="guest-ticket-delegations-buttons">
					<div className="btn btn-success btn-shadow" onClick={e => this.newDelegate()}>
						<i className="fa fa-plus" aria-hidden="true"></i>Create Delegate
					</div>
					<div className="btn btn-seablue btn-shadow">
						<i className="fa fa-fw fa-refresh"/>Refresh
					</div>
				</div>
				{ delegates.map((delegate, i) => (
					<GuestTicketDelegate
						key={delegate.id}
						tickets={tickets}
						delegate={delegate}
						onExpand={() => this.expandDelegate(i)}
						onCollapse={() => this.collapseDelegate(i)}
						onChange={(val) => this.changeDelegate(i, val)}
						onDelete={() => this.deleteDelegate(i)}
					/>
				))}
			</div>
		)
	}
}