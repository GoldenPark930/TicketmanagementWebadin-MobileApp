import React from 'react'
import {connect} from 'react-redux'
import {View, Text} from 'react-native'
import _ from 'lodash'
import Immutable from 'immutable'
import {LoadingBar, Button,} from '../_library'
import session_ticket from '../../_common/redux/tickets/actions'
import session from '../../_common/redux/promotion/actions'
import Promotion from './promotion/promotion'

class EventPromotion extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      promotions: [],
      newPromotionIndex: 0,
      loadingTickets: false,
      loadingPromotions: false,
      creatingPromotions: false,
      updatingPromotions: false,
      workingIndex: -1,
    }
  }

  componentDidMount() {
    const {event, FETCH_EVENT_TICKETS, FETCH_PROMOTIONS} = this.props

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

    let newProp = []
    newProp = _.map(promotions, (p, index) => {
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
        updated: false,
        expanded: false,
      }
    })

    this.setState({
      promotions: newProp
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
    promotions.push({
      id: new Date().valueOf(),
      name: '',
      items: [],
      codes: [],
      startDate: null,
      endDate: null,
      isNew: true,
      updated: false,
      expanded: true,
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
    this.setState({workingIndex: index})
  }

  changePromotion(index, val) {
    let {promotions} = this.state
    promotions[index] = val
    this.setState({
      promotions: promotions
    })
  }

  deletePromotion(index) {
    let {promotions} = this.state
    promotions.splice(index, 1)
    this.setState({
      promotions: promotions
    })
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
    promotions[index].expanded = false
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
      this.expandItem(index, promotions[index].items.length-1)
    })
  }

  expandItem(indexPromotion, indexItem) {
    let {promotions} = this.state
    for (let i=0; i < promotions[indexPromotion].items.length; i++) {
      promotions[indexPromotion].items[i].expanded = (i===indexItem)
    }
    this.setState({
      promotions: promotions
    })
  }

  collapseItem(indexSection, indexItem) {
    let {promotions} = this.state
    promotions[indexSection].items[indexItem].expanded = false
    this.setState({
      promotions: promotions
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
    let currency = (event && event.currency && event.currency.symbol) ? event.currency.symbol : '$'
    let {promotions, loadingTickets, loadingPromotions, updatingPromotions, creatingPromotions, workingIndex} = this.state
    let isDoingSth = loadingTickets || loadingPromotions || updatingPromotions || creatingPromotions
    return (
      <View>
        {loadingTickets && <LoadingBar title={"Loading tickets..."} />}
        {loadingPromotions && <LoadingBar title={"Loading promotions..."} />}
        {creatingPromotions && <LoadingBar title={"Creating promotion..."} />}
        {updatingPromotions && <LoadingBar title={"Updating promotion..."} />}
        {promotions.length > 0 &&
          <View style={{paddingVertical:10, justifyContent: 'flex-end', flexDirection:'row'}}>
            <Button size='small' title='Create Promotion' icon='plus' onPress={e => this.newPromotion()} />
            <Button size='small' title='Refresh' icon='refresh' onP ress={e => this.refreshPromotions()} />
          </View>
        }
        {_.map(promotions, (promotion, i) => (
          <Promotion
            isDoingSth={isDoingSth}
            isWorking={i == workingIndex}
            id={promotion.id}
            key={promotion.id}
            index={i}
            tickets={tickets}
            currency={currency}
            promotion={promotion}
            onChange={(val) => this.changePromotion(i, val)}
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
            onExpandItem={(index) => this.expandItem(i, index)}
            onCollapseItem={(index) => this.collapseItem(i, index)}
          />
        ))}
      </View>
    )
  }

}export default connect(
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
  {
    FETCH_EVENT_TICKETS : session_ticket.FETCH_EVENT_TICKETS,
    FETCH_PROMOTIONS : session.FETCH_PROMOTIONS,
    CREATE_PROMOTION : session.CREATE_PROMOTION,
    UPDATE_PROMOTION : session.UPDATE_PROMOTION
  }
)(EventPromotion)
