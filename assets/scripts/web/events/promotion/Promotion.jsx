import React, {PropTypes} from 'react'
import Dropdown from 'react-bootstrap/lib/Dropdown'
import MenuItem from 'react-bootstrap/lib/MenuItem'
import { findDOMNode } from 'react-dom'
import { DragSource, DropTarget } from 'react-dnd'
import update from 'react/lib/update'
import _ from 'lodash'
import { DragDropContext } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import moment from 'moment-timezone'
import Select from 'react-select'

import Button from '../../_library/Button'
import TagsField from '../../_library/TagsField'
import DateTimePicker from '../../_library/DateTimePicker'
import Card from '../../_library/Card'
import Field from '../../_library/Field'
import PromotionItem from './PromotionItem'

const DISCOUNT_OPTIONS = [
	{
		value: '',
		title: 'Select Discount Type'
	},
	{
		value: 'fixed_discount',
		title: 'Fixed Discount'
	},
	{
		value: 'fixed_price',
		title: 'Fixed Price'
	},
	{
		value: 'percentage',
		title: 'Percentage Discount'
	},
	{
		value: 'none',
		title: 'No Discount'
	}
]

@DragDropContext(HTML5Backend)
export default class Promotion extends React.Component {
	constructor(props) {
		super(props)
		
		const {tickets} = props
		let ticketOptions = []
		_.map(tickets, (t, id)=>{
			ticketOptions.push(t)
		})

		this.state = {
			promotion: props.promotion,
			ticketOptions: ticketOptions,
			ticketTypes: [],
			discountOption: '',
			discountValueSymbol: props.currency,
			discountValue: null,
			quantityLimit: null,
			nameRequired: false,
			dateRequired: props.promotion.startDate || props.promotion.endDate,			
		}
	}

	componentDidMount() {
		
	}

	componentWillReceiveProps(newProps) {
		const {tickets} = this.props
		let ticketOptions = []
		_.map(tickets, (t, id)=>{
			let tSearched = _.find(newProps.promotion.items, {ticketTypeID: t.id})
			if(!tSearched)
				ticketOptions.push(t)
		})
		this.setState({
			promotion: newProps.promotion,
			ticketOptions: ticketOptions,
			ticketTypes: [],
			discountOption: '',
			discountValueSymbol: newProps.currency,
			discountValue: '',
			quantityLimit: ''
		})
	}

	deletePromotion() {
		if(this.props.onDelete) {
			this.props.onDelete()
		}
	}

	expand() {
		if(this.props.onExpand) {
			this.props.onExpand()
		}
	}

	collapse() {
		if(this.props.onCollapse) {
			this.props.onCollapse()
		}
	}

	changeName(val) {
		if(val!='') {
			this.setState({nameRequired: false})
		} else {
			this.setState({nameRequired: true})
		}
		if(this.props.onChangeName) {
			this.props.onChangeName(val)
		}
	}

	changePromoCodes(val) {
		if(this.props.onChangePromoCodes) {
			this.props.onChangePromoCodes(val)
		}
	}

	changeStartDate(val){
		this.setState({dateRequired: val || this.state.promotion.endDate})
		if(this.props.onChangePromoStartDate) {
			this.props.onChangePromoStartDate(val)
		}
	}

	changeEndDate(val){
		this.setState({dateRequired: this.state.promotion.startDate || val})
		if(this.props.onChangePromoEndDate) {
			this.props.onChangePromoEndDate(val)
		}
	}

	changeTicketTypes(v){
		this.setState({ticketTypes: v})
	}

	changeDiscount(e){
		const {event, currency} = this.props		
		let symbol = e.target.value == 'percentage' ? '%' : currency
		this.setState({discountOption: e.target.value, discountValueSymbol: symbol})
	}

	changeQuantityLimit(v) {
		this.setState({quantityLimit: v})
	}

	changeDiscountValue(v) {
		this.setState({discountValue: v})
	}

	addItem(){
		const {tickets} = this.props
		const {ticketTypes, discountOption, discountValue, quantityLimit} = this.state

		_.map(ticketTypes, (tt, i) => {
			let newItem = {
				id: new Date().valueOf()+i*100,
				ticketTypeID: tt.value,
				ticketName: tt.label,
				discountType: discountOption,
				discountValue: discountOption != 'none' && discountOption != '' ? discountValue : null,
				quantityLimit: quantityLimit
			}	

			if(this.props.onNewPromotionItem){
				this.props.onNewPromotionItem(newItem)
			}
		})
		
		if(discountOption != 'none' && discountOption != ''){
			this.setState({
				discountValue : null
			})
		}		
		this.setState({
			quantityLimit: null
		})
	}

	savePromotion(){
		const {promotion} = this.state
		if(promotion.name == ''){
			this.setState({ nameRequired: true})			
		}else if((promotion.startDate && !promotion.endDate) || (!promotion.startDate && promotion.endDate)){
			this.setState({ dateRequired: true})
		}else{
			if(this.props.onSavePromotion) {
				this.props.onSavePromotion()
			}	
		}			
	}

	deleteItem(index) {
		if(this.props.onDeleteItem) {
			this.props.onDeleteItem(index)
		}
	}

	moveItem(dragIndex, hoverIndex) {
		if(this.props.onMoveItemInsideSection) {
			this.props.onMoveItemInsideSection(dragIndex, hoverIndex)
		}
	}

	render() {
		const {promotion, discountOption, discountValue, discountValueSymbol, quantityLimit, ticketOptions, ticketTypes, nameRequired, dateRequired} = this.state

		let items = _.map(promotion.items, (item, j) =>
			<PromotionItem
				id={item.id}
				key={item.id}
				index={j}
				item={item}
				onDelete={() => this.deleteItem(j)}
				onMove={(dragIndex, hoverIndex) => this.moveItem(dragIndex, hoverIndex)}
			/>
		)
		return (
			<div className="eventpromotion-promotion">
				{ !promotion.isNew && !promotion.expanded && 
				<div className="eventpromotion-promotion-top">
					<div className="eventpromotion-promotion-caret" onClick={e => this.expand()}><i className="fa fa-plus-square-o" aria-hidden="true"></i></div>
					<div className="eventpromotion-promotion-name">{promotion.name}</div>
					{promotion.startDate && <div className="eventpromotion-promotion-startdate"><i className="fa fa-clock-o" aria-hidden="true"></i> {moment(promotion.startDate).format('MM/DD/YYYY')}</div>}
				</div> }
				{ !promotion.isNew && promotion.expanded &&
				<div className="eventpromotion-promotion-top">
					<div className="eventpromotion-promotion-caret" onClick={e => this.collapse()}><i className="fa fa-minus-square-o" aria-hidden="true"></i></div>
					<div className="eventpromotion-promotion-name">{promotion.name}</div>
					{promotion.startDate && <div className="eventpromotion-promotion-startdate"><i className="fa fa-clock-o" aria-hidden="true"></i> {moment(promotion.startDate).format('MM/DD/YYYY')}</div>}
				</div>}
				{ ((!promotion.isNew && promotion.expanded) || promotion.isNew) && 
				<div className={promotion.isNew? 'eventpromotion-promotion-new' : 'eventpromotion-promotion-edit'}>
					<div className="row">
						<div className="col-xs-12 responsive-labeling">
							<Field
								id={'promotion-name'+promotion.id}
								value={promotion.name}
								label="Promotion Description (for your reference)"
								error={nameRequired ? 'Required' : null}
								touched={true}
								onChange={e => this.changeName(e.target.value)}
								autoFocus={true}
							/>
						</div>
					</div>
					<div className="eventpromotion-promotion-itemform">
						<div className="row multiselect-tickets col-xl-12">
							<div className="col-xs-12">
								<label htmlFor={'promotion-ticketType'+promotion.id}>Ticket Type</label>
								<Select
									id={'promotion-ticketType'+promotion.id}
									value={ticketTypes}
									multi={true}
									onChange={this.changeTicketTypes.bind(this)}
									options={_.map(ticketOptions, (t, i) => ({value: t.id, label: t.displayName}))}
								/>
							</div>
							
						</div>
						<div className="row">
						<div className="col-xs-12 col-sm-6">
								<label htmlFor={'promotion-discount'+promotion.id}>Pricing Adjustment</label>
								<select id={'promotion-discount'+promotion.id} className="form-control" onChange={::this.changeDiscount} value={discountOption}>
									{_.map(DISCOUNT_OPTIONS, (e, i) => <option key={i} value={e.value}>{e.title}</option>)}
								</select>
							</div>
						
							<div className="col-xs-12 col-sm-6" style={{marginTop:'17px'}}>
								<Field
									id={'promotion-quantitylimit'+promotion.id}
									value={quantityLimit}
									type="number"
									label="Maximum Tickets (optional)"
									onChange={e => this.changeQuantityLimit(e.target.value)}
								/>
							</div>
							{discountOption != '' && discountOption != 'none' &&
							<div className="col-xs-12 col-sm-6" style={{marginTop:'17px'}}>
								<Field
									id={'promotion-discountvalue'+promotion.id}
									value={discountValue}
									type="number"
									label={(discountOption == 'fixed_price' ? 'New Price in ' : 'Discount Amount in ') + discountValueSymbol}
									onChange={e => this.changeDiscountValue(e.target.value)}
								/>
							</div>}
						</div>
						<div className="row">
							<div className="col-xs-12 text-center top-btn-spacing">
								<Button className="btn btn-primary btn-shadow" disabled={discountOption == '' || ticketTypes.length == 0} onClick={::this.addItem}>Add Ticket</Button>
							</div>
						</div>
					</div>
					<div className="row">
						<div className="col-xs-12">
							<table className="eventpromotion-promotion-items-table table">
								{ promotion.items.length > 0 &&
								<thead>
									<tr>
										<td>Ticket</td>
										<td>Discount</td>
										<td>Value</td>
										<td>Quantity Limit</td>
										<td className="align-right">Actions</td>
									</tr>
								</thead> }
								<tbody>
									{items}
								</tbody>
							</table>
						</div>
						<div className="col-xs-12 col-sm-6 row-bottom-spacing">
							<DateTimePicker 
								initialValue={promotion.startDate} 
								label="Start Date" 
								id={'promotion-startDate'+promotion.id}
								placeholder="D MMM YYYY H:M AM" 
								onChange={::this.changeStartDate}
								error = {dateRequired && !promotion.startDate ? 'Required' : null}
								touched = {true}
							/>
						</div>
						<div className="col-xs-12 col-sm-6">
							 <DateTimePicker
							 	initialValue={promotion.endDate}
							 	label="End Date" 
							 	id={'promotion-endDate'+promotion.id}
							 	placeholder="D MMM YYYY H:M AM" 
							 	onChange={::this.changeEndDate}
							 	error = {dateRequired && !promotion.endDate ? 'Required' : null}
								touched = {true}
							 />
						</div>
						<div className="col-xs-12">
							<div className="eventpromotion-promotion-tag-label">Enter valid codes for unlocking this promotion (press <strong>space</strong> or <strong>enter</strong> after each one):</div>
							<TagsField isPromotion={true} value={promotion.codes} onChange={::this.changePromoCodes} controlOutside/>
						</div>
					</div>
				</div>}
				{ ((!promotion.isNew && promotion.expanded) || promotion.isNew) &&
				<div className="eventpromotion-promotion-buttons">
					<Button className="btn btn-success btn-shadow" onClick={e => this.savePromotion()}><i className={promotion.isNew ? 'fa fa-floppy-o' : 'fa fa-pencil'} /><span>{promotion.isNew ? 'Create' : 'Update'}</span></Button>
					{!promotion.isNew && <Button className='btn btn-danger btn-shadow' onClick={e => this.deletePromotion()}><i className='fa fa-trash' /><span>Delete</span></Button>}
					<Button className="btn btn-cancel btn-shadow" onClick={e => this.collapse()}><span>Cancel</span></Button>
				</div>}
			</div>
		)
	}
}