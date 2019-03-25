import React, {PropTypes} from 'react'
import _ from 'lodash'

import { findDOMNode } from 'react-dom'
import { DragSource, DropTarget } from 'react-dnd'

const itemSource = {
	beginDrag(props) {
		return {
			id: props.id,
			index: props.index,
			delegateId: props.delegateId
		}
	}
}

const itemTarget = {
	hover(props, monitor, component) {
		const dragIndex = monitor.getItem().index
		const hoverIndex = props.index

		if (dragIndex === hoverIndex) {
			return
		}

		if (monitor.getItem().delegateId != props.delegateId) {
			return
		}

		const hoverBoundingRect = findDOMNode(component).getBoundingClientRect()
		const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
		const clientOffset = monitor.getClientOffset()
		const hoverClientY = clientOffset.y - hoverBoundingRect.top

		if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
			return
		}
		if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
			return
		}
		props.onMove(dragIndex, hoverIndex)
		monitor.getItem().index = hoverIndex
	}
}

@DropTarget('GuestTicketDelegateItem', itemTarget, connect => ({
	connectDropTarget: connect.dropTarget()
}))
@DragSource('GuestTicketDelegateItem', itemSource, (connect, monitor) => ({
	connectDragSource: connect.dragSource(),
	connectDragPreview: connect.dragPreview(),
	isDragging: monitor.isDragging()
}))

export default class GuestTicketDelegateItem extends React.Component {
	static propTypes = {
		connectDragSource: PropTypes.func.isRequired,
		connectDropTarget: PropTypes.func.isRequired,
		connectDragPreview: PropTypes.func.isRequired,
		index: PropTypes.number.isRequired,
		isDragging: PropTypes.bool.isRequired,
		id: PropTypes.any.isRequired,
		onMove: PropTypes.func.isRequired
	}

	constructor(props) {
		super(props)
		
		this.state = {
			item: props.item
		}
	}

	componentDidMount() {
	}

	componentWillReceiveProps(newProps) {
		this.setState({
			item: newProps.item
		})
	}

	getTicketTypeDisplayName(ticketTypeID) {
		const {tickets} = this.props
		const ticketType = _.find(tickets, {id: ticketTypeID})
		return ticketType && ticketType.displayName
	}

	delete() {
		this.props.onDelete()
	}

	render() {
		const {isDragging, connectDragSource, connectDropTarget, connectDragPreview} = this.props
		const {item} = this.state

		const opacity = isDragging ? 0 : 1

		return connectDragPreview(connectDropTarget(
			<div className="guest-ticket-delegate-item" style={{ opacity }}>
				<div className="row">
					<div className="col-xs-4">
						Ticket Type: {this.getTicketTypeDisplayName(item.ticketType)}
					</div>
					<div className="col-xs-4">
						Maximum Quantity Limit: {item.quantityLimit}
					</div>
					<div className="col-xs-4 text-right">
						{ connectDragSource(<div className="guest-ticket-delegate-item-btn guest-ticket-delegate-item-btn-move"><i className="fa fa-arrows" aria-hidden="true"></i></div>) }
						<div className="guest-ticket-delegate-item-btn" onClick={e => this.delete()}><i className="fa fa-trash" aria-hidden="true"></i></div>				 
					</div>
				</div>
			</div>
		))
	}
}