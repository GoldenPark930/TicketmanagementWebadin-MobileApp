import React from 'react'
import {connect} from 'react-redux'
import _ from 'lodash'
import Immutable from 'immutable'

import LoadingBar from '../_library/LoadingBar'
import Button from '../_library/Button'
import modalStyle from '../../_common/core/modalStyle'
import Field from '../_library/Field'
import Promotion from './promotion/Promotion'
import Modal from 'react-modal'
import {FETCH_EVENT_TICKETS} from '../../_common/redux/tickets/actions'
import {FETCH_PROMOTIONS, CREATE_PROMOTION, UPDATE_PROMOTION} from '../../_common/redux/promotion/actions'

@connect(
	(state) => {
		const event = state.events.get('selected').toJS()
		const col = state.tickets.get('collection')		
		const tickets = state.tickets
			.getIn(['byEvent', event.id], Immutable.List())
			.map(tid => col.get(tid))
			.toJS()
		const pcol = state.promotions.get('collection')
		const promotions = state.promotions
			.getIn(['byEvent', event.id], Immutable.List())
			.map(pid => pcol.get(pid))
			.toJS()		
		const u = state.auth.get('user')
		return {
			user: u ? u.toJS() : null,
			event,
			tickets,
			promotions,
		}
	},
	{FETCH_EVENT_TICKETS, FETCH_PROMOTIONS, CREATE_PROMOTION, UPDATE_PROMOTION}
)

export default class EventPromotion extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			promotions: [],
			loadingTickets: false,
			loadingPromotions: false,
			creatingPromotions: false,
			updatingPromotions: false,
			deletingPromotions: false
		}
	}

	componentDidMount() {
		const {event, FETCH_EVENT_TICKETS, FETCH_PROMOTIONS} = this.props
		document.title = `Promotions - ${event.displayName} - The Ticket Fairy Dashboard`

		const loadingSetter = (val) => () => {
			this.setState({loadingTickets: val})
			if(!val){
				const loadingSetter2 = (val) => () => this.setState({loadingPromotions: val})
				Promise.resolve(FETCH_PROMOTIONS(event.id))
					.catch(loadingSetter2(false))
					.then(loadingSetter2(false))
				loadingSetter2(true)()
			}			
		}
		Promise.resolve(FETCH_EVENT_TICKETS(event.id))
			.catch(loadingSetter(false))
			.then(loadingSetter(false))
		loadingSetter(true)()
	}

	componentWillReceiveProps(newProps) {
		const {promotions, tickets} = newProps
		
		let newProms = _.map(promotions, (p, index) => {
			let items = p.items
			_.map(items, (item, index) => {
				let tSelected = _.find(tickets, {id: item.ticketTypeID})
				item.ticketName = tSelected ? tSelected.displayName : ''
			})
			return {
				id: p.id,
				name: p.name,
				items: items,
				codes: p.codes,
				startDate: p.startDate,
				endDate: p.endDate,
				isNew: false,
				expanded: false
			}
		})

		this.setState({
			promotions: newProms
		})
	}

	refreshPromotions() {
		const {event, FETCH_PROMOTIONS} = this.props		
		const loadingSetter2 = (val) => () => this.setState({loadingPromotions: val})
		Promise.resolve(FETCH_PROMOTIONS(event.id))
			.catch(loadingSetter2(false))
			.then(loadingSetter2(false))
		loadingSetter2(true)()
		this.setState({promotions: []})
	}

	newPromotion() {
		let {promotions} = this.state
		if(promotions.find(p => (p.isNew))) {
			return
		}
		_.map(promotions, (p, no) => {
			p.expanded = false
		})
		promotions.unshift({
			id: new Date().valueOf(),
			name: '',
			items: [],
			codes: [],
			startDate: null,
			endDate: null,
			isNew: true,
			expanded: true
		})
		this.setState({
			promotions: promotions
		})
	}

	savePromotion(index){
		let {promotions} = this.state
		const {tickets, CREATE_PROMOTION, UPDATE_PROMOTION, FETCH_PROMOTIONS, event} = this.props

		// get promotion object
		let promotion = promotions[index]

		// filter item
		let items = []
		_.map(promotion.items, (item, no)=>{
			let newItem = {
				ticketTypeID: item.ticketTypeID,
				discountType: item.discountType,
				discountValue: item.discountValue,
			}
			// optional
			if(item.quantityLimit != null && item.quantityLimit != '')
				newItem.quantityLimit = item.quantityLimit
			if(!promotion.isNew)
				newItem.id = item.id
			items.push(newItem)
		})

		let form = {
			name: promotion.name,
			items: items,
			codes: promotion.codes,
		}
		if(promotion.startDate != null && promotion.startDate != '')
			form.startDate = promotion.startDate
		if(promotion.endDate != null && promotion.endDate != '')
			form.endDate = promotion.endDate

		// submit
		if(promotion.isNew){			
			const creatingSetter = (val) => () => {
				this.setState({creatingPromotions: val})
				if(!val){ // Creating promotion done!
					const loadingSetter2 = (val) => () => this.setState({loadingPromotions: val})
					Promise.resolve(FETCH_PROMOTIONS(event.id))
						.catch(loadingSetter2(false))
						.then(loadingSetter2(false))
					loadingSetter2(true)()
				}
			}
			Promise.resolve(CREATE_PROMOTION(event.id, form))
				.catch(creatingSetter(false))
				.then(creatingSetter(false))
			creatingSetter(true)()
		}else{
			const updatingSetter = (val) => () => {
				this.setState({updatingPromotions: val})
				if(!val){ // Updating promotion done!
					const loadingSetter2 = (val) => () => this.setState({loadingPromotions: val})
					Promise.resolve(FETCH_PROMOTIONS(event.id))
						.catch(loadingSetter2(false))
						.then(loadingSetter2(false))
					loadingSetter2(true)()
				}
			}
			Promise.resolve(UPDATE_PROMOTION(promotion.id, event.id, form))
				.catch(updatingSetter(false))
				.then(updatingSetter(false))
			updatingSetter(true)()
		}
	}

	deletePromotion(index) {
		let {promotions} = this.state
		const {tickets, CREATE_PROMOTION, UPDATE_PROMOTION, FETCH_PROMOTIONS, event} = this.props

		// get promotion object
		let promotion = promotions[index]

		// filter item
		let items = []
		_.map(promotion.items, (item, no)=>{
			let newItem = {
				ticketTypeID: item.ticketTypeID,
				discountType: item.discountType,
				discountValue: item.discountValue,
			}
			// optional
			if(item.quantityLimit != null && item.quantityLimit != '')
				newItem.quantityLimit = item.quantityLimit
			if(!promotion.isNew)
				newItem.id = item.id
			items.push(newItem)
		})

		let form = {
			name: promotion.name,
			items: items,
			codes: promotion.codes,
			enabled: false
		}
		if(promotion.startDate != null && promotion.startDate != '')
			form.startDate = promotion.startDate
		if(promotion.endDate != null && promotion.endDate != '')
			form.endDate = promotion.endDate

		const deletingSetter = (val) => () => {
			this.setState({deletingPromotions: val})
			if(!val){ // Updating promotion done!
				const loadingSetter2 = (val) => () => this.setState({loadingPromotions: val})
				Promise.resolve(FETCH_PROMOTIONS(event.id))
					.catch(loadingSetter2(false))
					.then(loadingSetter2(false))
				loadingSetter2(true)()
			}
		}
		Promise.resolve(UPDATE_PROMOTION(promotion.id, event.id, form))
			.catch(deletingSetter(false))
			.then(deletingSetter(false))
		deletingSetter(true)()
	}

	expandPromotion(index) {
		let {promotions} = this.state
		_.map(promotions, (p, order) => {
			p.expanded = order == index
		})
		this.setState({
			promotions: promotions
		})
	}

	collapsePromotion(index) {
		let {promotions} = this.state
		if(promotions[index].isNew) {
			promotions.splice(index, 1)
		} else {
			promotions[index].expanded = false	
		}
		this.setState({
			promotions: promotions
		})
	}

	changePromotionName(index, val) {
		let {promotions} = this.state
		promotions[index].name = val
		this.setState({
			promotions: promotions
		})
	}

	changePromotionCodes(index, val) {
		let {promotions} = this.state
		let uniqedVal = _.uniq(val) // remove duplicated value

		// get all codes across the event, except for current promotion
		let merged = []
		_.map(promotions, (p, order)=>{
			if(order != index){
				_.map(p.codes, (code)=>{
						merged.push(code)
				})	
			}			 
		})

		// add current promotion without duplication
		let newVal = []
		_.map(uniqedVal, (code) => {
			let found = merged.indexOf(code)
			if(found == -1){
				newVal.push(code)
			}
		})

		promotions[index].codes = newVal
		this.setState({
			promotions: promotions
		})
	}

	changePromotionStartDate(index, val){
		let {promotions} = this.state
		promotions[index].startDate = val
		this.setState({
			promotions: promotions
		})
	}

	changePromotionEndDate(index, val){
		let {promotions} = this.state
		promotions[index].endDate = val
		this.setState({
			promotions: promotions
		})
	}

	newPromotionItem(index, item) {
		let {promotions} = this.state
		const {tickets} = this.props

		promotions[index].items.push(item)
		this.setState({
			promotions: promotions
		}, () => {
			this.expandPromotion(index)
		})		
	}

	deleteItem(indexSection, indexItem) {
		let {promotions} = this.state
		promotions[indexSection].items.splice(indexItem, 1)
		this.setState({
			promotions: promotions
		})
	}

	moveItemInsideSection(indexSection, dragIndex, hoverIndex) {
		let {promotions} = this.state
		let dragItem = promotions[indexSection].items[dragIndex]
		promotions[indexSection].items.splice(dragIndex, 1)
		promotions[indexSection].items.splice(hoverIndex, 0, dragItem)
		this.setState({
			promotions: promotions
		})
	}

	render() {
		const {event, tickets} = this.props
		let currency = getCurrencySymbol(event)

		let {promotions, loadingTickets, loadingPromotions, updatingPromotions, creatingPromotions, deletingPromotions} = this.state
		let isDoingSth = loadingTickets || loadingPromotions || updatingPromotions || creatingPromotions || deletingPromotions
		return (
			<div className="eventpromotion">
				{loadingTickets && <LoadingBar title={"Loading tickets..."} />}
				{loadingPromotions && <LoadingBar title={"Loading promotions..."} />}
				{creatingPromotions && <LoadingBar title={"Creating promotion..."} />}
				{updatingPromotions && <LoadingBar title={"Updating promotion..."} />}
				{deletingPromotions && <LoadingBar title={"Deleting promotion..."} />}
				{promotions.length == 0 && !isDoingSth && 
					<div className="newscreen">
						<img src={asset('/assets/resources/images/promotion-empty.png')}/><br/>
						<Button className="btn btn-success btn-shadow eventpromotion-newpromotion" type="button" onClick={e => this.newPromotion()}>
							<i className="fa fa-plus" aria-hidden="true"></i>Create Promotion
						</Button>
						<div className="newpromotion_text">
							<div className="np_heading">
								New Promotion
							</div>
							<div className="np_description">
								You are not offering any promotion or discount
							</div>
						</div>
					</div>
				}
				{promotions.length > 0 && 
				<div className="eventpromotion-buttons">
					<Button className="btn btn-success btn-shadow eventpromotion-newpromotion" type="button" onClick={e => this.newPromotion()}>
						<i className="fa fa-plus" aria-hidden="true"></i>Create Promotion
					</Button>
					<Button className="btn btn-seablue btn-shadow eventpromotion-newpromotion" type="button" onClick={e => this.refreshPromotions()}>
	                	<i className="fa fa-fw fa-refresh"/>Refresh
	                </Button>
				</div>
				}				
				{_.map(promotions, (promotion, i) => (
					<Promotion						
						id={promotion.id}
						key={promotion.id}
						tickets={tickets}
						currency={currency}
						promotion={promotion}
						onChangeName={(val) => this.changePromotionName(i, val)}
						onChangePromoCodes={(val) => this.changePromotionCodes(i, val)}
						onChangePromoStartDate={(val) => this.changePromotionStartDate(i, val)}
						onChangePromoEndDate={(val) => this.changePromotionEndDate(i, val)}
						onNewPromotionItem={(item) => this.newPromotionItem(i, item)}
						onSavePromotion={() => this.savePromotion(i)}
						onDeleteItem={(index) => this.deleteItem(i, index)}
						onMoveItemInsideSection={(dragIndex, hoverIndex) => this.moveItemInsideSection(i, dragIndex, hoverIndex)}
						onDelete={() => this.deletePromotion(i)}
						onExpand={() => this.expandPromotion(i)}
						onCollapse={() => this.collapsePromotion(i)}
					/>
				))}
			</div>
		)
	}
}