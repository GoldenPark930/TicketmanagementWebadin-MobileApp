import React, {PropTypes} from 'react'
import _ from 'lodash'
import {connect} from 'react-redux'
import { findDOMNode } from 'react-dom'
import { DragSource, DropTarget } from 'react-dnd'

import RichTextArea from '../../_library/RichTextArea'

const DISCOUNT_OPTIONS = {
	'fixed_discount': 'Fixed Discount',
	'fixed_price': 'Fixed Price',
	'percentage': 'Percentage Discount',
	'none': 'No Discount'
}

const cardSource = {
	beginDrag(props) {
		return {
			id: props.id,
			index: props.index
		}
	}
}

const cardTarget = {
	hover(props, monitor, component) {
		const dragIndex = monitor.getItem().index
		const hoverIndex = props.index

		if (dragIndex === hoverIndex) {
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

@DropTarget('PromotionItem', cardTarget, connect => ({
	connectDropTarget: connect.dropTarget()
}))
@DragSource('PromotionItem', cardSource, (connect, monitor) => ({
	connectDragSource: connect.dragSource(),
	connectDragPreview: connect.dragPreview(),
	isDragging: monitor.isDragging()
}))
@connect(
	(state) => {
		const u = state.auth.get('user')
		return {
			user: u ? u.toJS() : null,
			event: state.events.get('selected').toJS()
		}
	},
	{}
)
export default class PromotionItem extends React.Component {
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

	componentWillReceiveProps(newProps) {
		this.setState({
			item: newProps.item
		})
	}

	delete() {
		if(this.props.onDelete) {
			this.props.onDelete()
		}
	}

	render() {
		const { isDragging, connectDragSource, connectDropTarget, connectDragPreview, event } = this.props
		const opacity = isDragging ? 0 : 1
		const {item} = this.state
		let currency = getCurrencySymbol(event)

		// let selectTag = <select id="minimumAge" className="form-control">			
		//										 <option value={0}>Select minimum age</option>							
		//										 {_.map(range30, (e, i) => <option key={30-i} value={30-i}>{30-i}</option>)}
		//									 </select>

		return connectDragPreview(connectDropTarget(
				<tr className="eventpromotion-item" style={{ opacity }}>
					<td>{item.ticketName}</td>
					<td>{DISCOUNT_OPTIONS[item.discountType]}</td>
					<td>
						{item.discountType != 'none' && item.discountType == 'percentage' && <span>{item.discountValue}%</span>}
						{item.discountType != 'none' && item.discountType != 'percentage' && <span>{currency} {item.discountValue}</span>}
					</td>
					<td>
						{!!item.quantityLimit && <span>{item.quantityLimit}</span>}
					</td>
					<td className="align-right">
						{ connectDragSource(<div className="eventpromotion-item-button eventpromotion-item-button-drag"><i className="fa fa-arrows" aria-hidden="true"></i></div>) }
						<div className="eventpromotion-item-button eventpromotion-item-button-delete" onClick={e => this.delete()}><i className="fa fa-trash" aria-hidden="true"></i></div>				 
					</td>
				</tr>
			))
	}
}