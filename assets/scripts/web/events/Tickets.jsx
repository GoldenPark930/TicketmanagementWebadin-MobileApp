import _ from 'lodash'
import Immutable from 'immutable'
import React from 'react'
import {connect} from 'react-redux'
import Dropdown from 'react-bootstrap/lib/Dropdown'
import MenuItem from 'react-bootstrap/lib/MenuItem'
import Modal from 'react-modal'
import update from 'react/lib/update'

import modalStyle from '../../_common/core/modalStyle'
import Button from '../_library/Button'
import DateLabel from '../_library/DateLabel'
import Card from '../_library/Card'
import TicketsTable from './TicketsTable'
import TicketGuestForm from './TicketGuestForm'
import TicketForm from './TicketForm'
import TicketOptionsForm from './TicketOptionsForm'
import TicketAdvancedOptionsForm from './TicketAdvancedOptionsForm'
import AddOnRow from './addons/AddOnRow'
import AddOnForm from './addons/AddOnForm'
import {UPDATE_EVENT} from '../../_common/redux/events/actions'
import {FETCH_EVENT_TICKETS, CREATE_TICKET, UPDATE_TICKET} from '../../_common/redux/tickets/actions'
import {FETCH_EVENT_ADDONS, CREATE_ADDON, UPDATE_ADDON} from '../../_common/redux/addons/actions'

import { DragDropContext } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'

import {withRouter} from 'react-router'
import {routeActions} from 'react-router-redux'

const cloneObject= (src) => {return JSON.parse(JSON.stringify(src))}
const cloneArray = (src) => {return _.map(src, (t) => {return cloneObject(t)})}

@withRouter
@connect(
  (state) => {
    const col = state.tickets.get('collection')
    const event = state.events.get('selected').toJS()
    const tickets = state.tickets
      .getIn(['byEvent', event.id], Immutable.List())
      .map(tid => col.get(tid))
      .toJS()
    const col1 = state.addons.get('collection')
    const addons = state.addons
      .getIn(['byEvent', event.id], Immutable.List())
      .map(tid => col1.get(tid))
      .toJS()
    return {
      event,
      tickets,
      addons
    }
  },
  {FETCH_EVENT_TICKETS, CREATE_TICKET, UPDATE_TICKET, UPDATE_EVENT, push: routeActions.push, FETCH_EVENT_ADDONS, CREATE_ADDON, UPDATE_ADDON}
)
@DragDropContext(HTML5Backend)
export default class Tickets extends React.Component {  
  constructor(props) {
    super(props)
    this.state = {loadingFetch: false, editing: null, adding: false, editingFee: false, 
      ticketsDnD: [], dndHistory: [], dndHistoryCurrentPos: 0,
      saveSortDialogOpen:false, savingSort: false, savingSortTotal: 0, savingSortCurrent: 0,
      loadingAddon: false, addingAddon: false, editingAddon: null, deactivatingAddon: null}
    this.moveCard = this.moveCard.bind(this)
  }
  componentDidMount() {
    const {event, tickets} = this.props
    document.title = `Tickets - ${event.displayName} - The Ticket Fairy Dashboard`
    this.props.router.setRouteLeaveHook(this.props.route, this.routerWillLeave.bind(this))
    if (tickets.length) { return }
    this.refresh()
  }
  componentWillUnmount(){
    form_helper_reset()
  }
  routerWillLeave(nextLocation){
    if(form_helper_isEditted()){
      this.setState({
        hasEdittedFields: true,
        nextLocation: nextLocation.pathname
      })
      return false
    }
  }
  onClickOk(){
    form_helper_reset()
    const{nextLocation} = this.state
    const{push} = this.props
    push(nextLocation)
  }
  onClickCancel() {
    this.setState({hasEdittedFields: false})
  } 

  // { for DragAndDrop Table
  componentWillReceiveProps(nextProps){
    const {tickets} = nextProps

    if( JSON.stringify(tickets) === JSON.stringify(this.props.tickets) ) {
      // console.log('---- tickets not updated!')      
      const {ticketsDnD} = this.state
      if(ticketsDnD.length == 0)
        this.initDnD(tickets, false)
    }else{
      // console.log('---- tickets updated!')
      this.initDnD(tickets, false)
    }
  }
  initDnD(tickets, ignoreSaving){
    let initDnD = ignoreSaving ? true : !this.state.savingSort
    if(initDnD){
      // console.log('initDnD called')

      // init ticketsDnD from props->tickets
      let ticketsDnD = cloneArray(tickets)
      for(let i = 0; i < ticketsDnD.length; i++)
        ticketsDnD[i].sortOrder = parseInt(ticketsDnD[i].sortOrder)
      ticketsDnD = _.orderBy(ticketsDnD, ['sortOrder', 'displayName'], ['asc', 'asc'])
      for(let i = 0; i < ticketsDnD.length; i++){
        ticketsDnD[i].sortOrder = i + 1
      }

      //add to history
      let newHistory = _.map(ticketsDnD, (t) => {return {id:t.id, sortOrder:t.sortOrder, displayName:t.displayName} })
      let dndHistory = []
      dndHistory.push(newHistory)
      this.setState({ticketsDnD: ticketsDnD, dndHistory: dndHistory, dndHistoryCurrentPos: 0})
    }else{
      // console.log('Currently savingSort, initDnD ignored')
    }
  }
  moveCard(dragIndex, hoverIndex) {
    let { ticketsDnD, savingSort } = this.state
    //let padToFour = number => number <= 9999 ? ('000' + number).slice(-4) : number
    if(savingSort)
      return
    ticketsDnD = _.orderBy(ticketsDnD, ['sortOrder', 'displayName'], ['asc', 'asc'])
    for(let i = 0; i < ticketsDnD.length; i++){
      ticketsDnD[i].sortOrder = i + 1
    }
    ticketsDnD[dragIndex].sortOrder = hoverIndex + 1
    ticketsDnD[hoverIndex].sortOrder = dragIndex + 1

    // add to history    
    let newHistory = _.map(ticketsDnD, (t) => {return {id:t.id, sortOrder:t.sortOrder, displayName:t.displayName} })
    let {dndHistory, dndHistoryCurrentPos} = this.state
    let dndHistoryCount = dndHistory.length
    if(dndHistoryCount != dndHistoryCurrentPos + 1){ //undo/redo executed
      // get sub-list of history from 0 to newPos, and set it as new history
      let tmpHistory = []
      for(let i = 0; i <= dndHistoryCurrentPos; i++){
        tmpHistory.push(cloneArray(dndHistory[i]))
      }
      dndHistory = tmpHistory
    }
    dndHistory.push(newHistory)
    dndHistoryCurrentPos++        
    // console.log('history = ', dndHistoryCurrentPos, dndHistory)
    this.setState({ticketsDnD: ticketsDnD, dndHistory: dndHistory, dndHistoryCurrentPos: dndHistoryCurrentPos})
  }
  processUndoRedo(newPos){
    let {dndHistory, ticketsDnD} = this.state
    let dndHistoryCount = dndHistory.length
    newPos = newPos < 0 ? 0 : (newPos >= dndHistoryCount ? dndHistoryCount - 1 : newPos)    
    
    // set ticketDnD from currentHistory
    let currentHistory = dndHistory[newPos]
    for(let i = 0; i < ticketsDnD.length; i++){
      let id = ticketsDnD[i].id
      // search from history
      for(let j = 0; j < currentHistory.length; j++){
        let hid = currentHistory[j].id
        let hsortOrder = currentHistory[j].sortOrder
        if(hid == id){
          // console.log('id', id , currentHistory[j])        
          ticketsDnD[i].sortOrder = hsortOrder
          break
        }
      }
    }
    this.setState({ticketsDnD: ticketsDnD, dndHistoryCurrentPos: newPos})
  }
  handleUndo(){
    let {dndHistoryCurrentPos} = this.state
    this.processUndoRedo(dndHistoryCurrentPos - 1)
  }
  handleRedo(){
    let {dndHistoryCurrentPos} = this.state
    this.processUndoRedo(dndHistoryCurrentPos + 1)
  }
  handleSaveSort() {
    if (this.state.loading) { return }
    const savingSort = (sortStarted, total) => () => {
      if(sortStarted){
        this.setState({savingSortCurrent: 0, savingSort: sortStarted, savingSortTotal: total})
      }else{
        let { savingSortCurrent, savingSortTotal } = this.state
        savingSortCurrent++
        // console.log('--- saving in progress --- ', savingSortCurrent, savingSortTotal)

        if(savingSortCurrent >= savingSortTotal){                
          // console.log('savingSortCompleted', savingSortTotal)
          const {tickets} = this.props
          this.initDnD(tickets, true)
          this.setState({savingSort: false, saveSortDialogOpen:false})
        }
        else{
          this.setState({savingSort: true, savingSortCurrent: savingSortCurrent})
        }
      }
    }
    let { ticketsDnD } = this.state
    const {UPDATE_TICKET} = this.props
    let total = ticketsDnD.length
    for(let i = 0; i < total; i++){
      let tid = ticketsDnD[i].id
      let sortOrder = ticketsDnD[i].sortOrder
      Promise.resolve(UPDATE_TICKET(tid, {attributes: {sortOrder: sortOrder}}))
        .catch(savingSort(false, total))
        .then(savingSort(false, total))
    }
    savingSort(true, total)()
  }
  handleCancelSave(){
    this.setState({saveSortDialogOpen:false})
  }
  handleCancelChanges(){
    const {tickets} = this.props
    this.initDnD(tickets, true)
  }

  componentDidMount() {
    const {event, tickets, addons} = this.props
    document.title = `Tickets - ${event.displayName} - The Ticket Fairy Dashboard`
    if (tickets.length && addons.length) { return }
    this.refresh()
    this.refreshAddons()
  }

  refresh() {
    const {dndHistoryCurrentPos} = this.state
    if(dndHistoryCurrentPos > 0){
      this.setState({saveSortDialogOpen:true})
    }else{
      const {event, FETCH_EVENT_TICKETS} = this.props
      if (this.state.loading) { return }
      const loadingSetter = (val) => () => this.setState({loadingFetch: val, dndHistoryCurrentPos: 0})
      Promise.resolve(FETCH_EVENT_TICKETS(event.id))
        .catch(loadingSetter(false))
        .then(loadingSetter(false))
      loadingSetter(true)()
    }
  }
  handleAdd() {
    const {dndHistoryCurrentPos} = this.state
    if(dndHistoryCurrentPos > 0){
      this.setState({saveSortDialogOpen:true})
    }else{
      this.setState({editing: null, adding: true})
    }
  }
  handleEdit(t) {
    const {dndHistoryCurrentPos} = this.state
    if(dndHistoryCurrentPos > 0){
      this.setState({saveSortDialogOpen:true})
    }else{
      this.setState({editing: t, adding: false})
    }    
  }  
  handleActivate(tid) {
    const {dndHistoryCurrentPos} = this.state
    if(dndHistoryCurrentPos > 0){
      this.setState({saveSortDialogOpen:true})
    }else{
      const {UPDATE_TICKET} = this.props
      Promise.resolve(UPDATE_TICKET(tid, {attributes: {active: true}}))
    }    
  }
  handleDeactivate(tid) {
    const {dndHistoryCurrentPos} = this.state
    if(dndHistoryCurrentPos > 0){
      this.setState({saveSortDialogOpen:true})
    }else{
      const {deleting} = this.state
      const {UPDATE_TICKET} = this.props
      const unsetRemoving = this.handleCancelDeactivate.bind(this)
      if (deleting && deleting === tid) {
        Promise.resolve(UPDATE_TICKET(tid, {attributes: {active: false}}))
          .catch(unsetRemoving)
          .then(unsetRemoving)
      } else {
        this.setState({deleting: tid})
      }
    }    
  }
  handleCancelDeactivate() {
    this.setState({deleting: null})
  }
  handleCancel() {
    this.setState({editing: null, adding: false})
  }
  receiveExposedMethod(exposedMethod) {
    this.exposedMethod = exposedMethod
  }
  exposedMethod(){}
  receiveExposedMethodAddOn(exposedMethod) {
    this.exposedMethodAddOn = exposedMethod
  }
  exposedMethodAddOn(){}
  handleSubmit(isNew, tid, form){
    const {event, CREATE_TICKET, UPDATE_TICKET} = this.props

    // filter submitted data
    let filtered = this.exposedMethod()
    form.attributes.description = filtered.description
    form.attributes.tags = filtered.tags
    if(event.$original.inventoryMode == 'stock'){
      delete form.attributes.maxInventory
    }

    // submit
    if(isNew){
      const unsetAdding = () => this.setState({adding: false, dndHistoryCurrentPos: 0})
      return Promise.resolve(CREATE_TICKET(event.id, form))
        .catch(err => Promise.reject(_.result(err, 'toFieldErrors', err)))
        .then(unsetAdding)
    }else{
      const unsetEditing = () => this.setState({editing: null})
      return Promise.resolve(UPDATE_TICKET(tid, form))
        .catch(err => Promise.reject(_.result(err, 'toFieldErrors', err)))
        .then(unsetEditing)
    }
  }
  handleUpdateEvent(form) {
    const {event, UPDATE_EVENT} = this.props
    console.log('form = ', form)
    return Promise.resolve(UPDATE_EVENT(event.id, form))
      .catch(err => Promise.reject(_.result(err, 'toFieldErrors', err)))
  }

  refreshAddons() {
    const {event, FETCH_EVENT_ADDONS} = this.props
    if (this.state.loadingAddon) { return }
    const loadingSetter = (val) => () => this.setState({loadingAddon: val})
    Promise.resolve(FETCH_EVENT_ADDONS(event.id))
      .catch(loadingSetter(false))
      .then(loadingSetter(false))
    loadingSetter(true)()
  }
  handleAddAddon() {
    this.setState({addingAddon: true})
  }
  handleSubmitNewAddon(form) {
    const {event, CREATE_ADDON} = this.props

    // filter submitted data
    let filtered = this.exposedMethodAddOn()
    form.attributes.description = filtered
    if(!form.attributes.ticketTypeNeeded) {
      form.attributes.prerequisiteTicketTypeIds = null
    }
    delete form.attributes.ticketTypeNeeded
    if(form.attributes.stockUnlimited) {
      form.attributes.stock = null
    }
    delete form.attributes.stockUnlimited

    // submit
    const unsetAdding = () => this.setState({addingAddon: false})
    return Promise.resolve(CREATE_ADDON(event.id, form))
      .catch(err => Promise.reject(_.result(err, 'toFieldErrors', err)))
      .then(unsetAdding)
  }
  handleSubmitEditAddon(aid, form) { 
    const {UPDATE_ADDON} = this.props

    // filter submitted data
    let filtered = this.exposedMethodAddOn()
    form.attributes.description = filtered
    if(!form.attributes.ticketTypeNeeded) {
      form.attributes.prerequisiteTicketTypeIds = null
    }
    delete form.attributes.ticketTypeNeeded
    if(form.attributes.stockUnlimited) {
      form.attributes.stock = null
    }
    delete form.attributes.stockUnlimited

    // submit
    const unsetEditing = () => this.setState({editingAddon: null})
    return Promise.resolve(UPDATE_ADDON(aid, form))
      .catch(err => Promise.reject(_.result(err, 'toFieldErrors', err)))
      .then(unsetEditing)
  }
  handleCancelAddon() {
    this.setState({addingAddon: false, editingAddon: null})
  }
  handleEditAddon(ao) {
    this.setState({editingAddon: ao, addingAddon: false})
  }
  handleActivateAddon(ao) {
    const {UPDATE_ADDON} = this.props
    // submit    
    return Promise.resolve(UPDATE_ADDON(ao.id, {attributes: {active: true}}))
      .catch(err => Promise.reject(_.result(err, 'toFieldErrors', err)))
  }
  handleDeactivateAddonOpenModal(ao) {
    this.setState({deactivatingAddon: ao})
  }
  handleDeactivateAddon(ao) {
    const {UPDATE_ADDON} = this.props
    // submit
    const unsetDeactivating = () => this.setState({deactivatingAddon: null})
    return Promise.resolve(UPDATE_ADDON(ao.id, {attributes: {active: false}}))
      .catch(err => Promise.reject(_.result(err, 'toFieldErrors', err)))
      .then(unsetDeactivating)
  }
  handleDeactivateAddonCancel() {
    this.setState({deactivatingAddon: null})
  }

  
  render() {
    const {loadingFetch, adding, editing, deleting, editingFee, addingAddon, editingAddon, deactivatingAddon} = this.state
    const {savingSort, saveSortDialogOpen} = this.state
    const {dndHistory, dndHistoryCurrentPos} = this.state
    const {event, tickets, addons} = this.props

    let dndHistoryCount = dndHistory.length
    //console.log('history count = %d, current = %d', dndHistoryCount, dndHistoryCurrentPos)

    let {ticketsDnD} = this.state
    ticketsDnD = _.orderBy(ticketsDnD, ['sortOrder', 'displayName'], ['asc', 'asc'])    
    const nodes = _.map(ticketsDnD, (t, index) => {
      return (
        <TicketsTable.Row {...t} key={t.id} index={index} moveCard={this.moveCard} event={event}>
          <div className="btn-toolbar2">
            <Button className="btn btn-primary" type="button" onClick={e => this.handleEdit(t)}>
              <i className="fa fa-pencil fa-fw" /> Edit
            </Button>
            {t.active&&
              <Button className="btn btn-seablue" type="button" onClick={e => this.handleDeactivate(t.id)}>
              <i className="fa fa-ban" /> Deactivate
            </Button>
            }
            {!t.active&&
              <Button className="btn btn-ok" type="button" onClick={e => this.handleActivate(t.id)}>
              <i className="fa fa-cog" /> Activate
            </Button>
            }
          </div>
          {/*<div className="btn-toolbar-dropdown">
            <Dropdown id={'tadd-' + t.id} pullRight dropup={index == (ticketsDnD.length - 1) ? true: false}>
              <Dropdown.Toggle><i className="fa fa-cog" /></Dropdown.Toggle>
              <Dropdown.Menu>
                <MenuItem onClick={e => this.handleEdit(t)}><i className="fa fa-pencil fa-fw" /><span>Edit ticket details</span></MenuItem>
                {t.active && <MenuItem onClick={e => this.handleDeactivate(t.id)}><i className="fa fa-trash fa-fw" /><span>Deactivate ticket</span></MenuItem>}
                {!t.active && <MenuItem onClick={e => this.handleActivate(t.id)}><i className="fa fa-trash fa-fw" /><span>Activate ticket</span></MenuItem>}
              </Dropdown.Menu>
            </Dropdown>
          </div>*/}
        </TicketsTable.Row>
      )
    })

    const {hasEdittedFields} = this.state
    let contentEdittedFields = null
    if(hasEdittedFields){
      contentEdittedFields = _.map(form_helper_get(), (field, index)=>{
        let field_title = ''
        switch(field){
          case 'attributes.displayName':  // Ticket Form
            field_title = 'Ticket Name' 
            break
          case 'attributes.stock':
            field_title = 'Ticket Stock'
            break
          case 'attributes.maxInventory':
            field_title = 'Ticket Maximum Number of Sales'
            break
          case 'attributes.price':
            field_title = 'Ticket Price'
            break
          case 'attributes.description':
            field_title = 'Ticket Description'
            break
          case 'attributes.tags':
            field_title = 'Ticket Tags'
            break
          case 'attributes.flagAlwaysAvailable':
            field_title = 'Ticket Always Available'
            break
          case 'attributes.active':
            field_title = 'Ticket Enabled'
            break
          case 'attributes.flagHidden':
            field_title = 'Ticket Hidden'
            break
          case 'attributes.checkInStart':
            field_title = 'Doors Open Time'
            break
          case 'attributes.checkInEnd':
            field_title = 'Last entry time'
            break
          case 'attributes.quantityIncrement':
            field_title = 'Ticket must be bought in multiplies of'
            break
          case 'attributes.pagePixels': // Ticket Advanced Options
            field_title = 'View of Event Page'
            break
          case 'attributes.checkoutPixels':
            field_title = 'Start of Checkout'
            break
          case 'attributes.conversionPixels':
            field_title = 'Completion of Purchase'
            break
          case 'attributes.feeMode': // Ticket Options Form
            field_title = 'Booking Fees'
            break
          case 'attributes.minOrder':
            field_title = 'Minimum ticket quantity per order'
            break
          case 'attributes.maxOrder':
            field_title = 'Maximum ticket quantity per order'
            break
          case 'attributes.flagDisableReferral':
            field_title = 'Disable referral system'
            break
          case 'attributes.referralTier1Sales':
            field_title = 'Referral Tier 1 Sales Target'
            break
          case 'attributes.referralTier1Percentage':
            field_title = 'Referral Tier 1 Rebate Percentage'
            break
          case 'attributes.referralTier2Sales':
            field_title = 'Referral Tier 2 Sales Target'
            break
          case 'attributes.referralTier2Percentage':
            field_title = 'Referral Tier 2 Rebate Percentage'
            break
          case 'attributes.referralTier3Sales':
            field_title = 'Referral Tier 3 Sales Target'
            break
          case 'attributes.referralTier3Percentage':
            field_title = 'View of Event Page'
            break
          case 'attributes.salesStartDate':
            field_title = 'Sales Start'
            break
          case 'attributes.salesEndDate':
            field_title = 'Sales End'
            break
          case 'attributes.minimumAge':
            field_title = 'Minimum Age'
            break
          case 'attributes.flagCollectNames':
            field_title = 'Names required for each ticket'
            break
          case 'attributes.flagIDRequired':
            field_title = 'ID is required'
            break
          case 'attributes.flagResaleEnabled':
            field_title = 'Ticket resale system enabled'
            break
          case 'attributes.flagNameChecks':
            field_title = 'Name checks enforced'
            break
          case 'attributes.flagEnableWaitingList':
            field_title = 'Enable waiting list after sell-out'
            break
          case 'attributes.flagRequirePhone':
            field_title = 'Require buyer to enter their phone number'
            break
          case 'attributes.flagTaxesIncluded':
            field_title = 'Show ticket prices including taxes'
            break
          case 'attributes.flagValidateAge':
            field_title = 'Collect and validate DOB against a minimum age'
            break
          case 'attributes.flagNameChanges':
            field_title = 'Name changes allowed'
            break
          case 'attributes.flagTicketSwaps':
            field_title = 'Ticket swaps allowed'
            break
          default:
            field_title = field
            break
        }
        return (
          <div key={index}><i className="fa fa-info-circle" aria-hidden="true"></i> {field_title}</div>
        )
      })
    }

    return (
      <div>
        <Modal
          className="modal-dialog modal-trans"
          style={modalStyle}
          isOpen={!!saveSortDialogOpen}
          contentLabel="Modal"
          onRequestClose={::this.handleCancelSave}
          closeTimeoutMS={150}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div>
                <div className="modal-header">
                  <p className="h4 text-compact">Are you sure?</p>
                </div>
                <div className="modal-body">
                  <p>Tickets table has been modified. Save current changes?</p>
                </div>
                <div className="modal-footer">
                  <div className="btn-toolbar btn-toolbar-right">
                    <Button
                      className="btn btn-primary"
                      type="button"
                      onClick={e => this.handleSaveSort()}>Save</Button>
                    <Button
                      className="btn btn-default" type="button"
                      onClick={::this.handleCancelSave}>Cancel</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
        <Modal
          className="modal-dialog modal-trans"
          style={modalStyle}
          isOpen={!!deleting}
          contentLabel="Modal"
          onRequestClose={::this.handleCancelDeactivate}
          closeTimeoutMS={150}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div>
                <div className="modal-header">
                  <p className="h4 text-compact">Are you sure?</p>
                </div>
                <div className="modal-body">
                  <p>Deactivating the ticket will prevent users from buying it and will trigger the next available ticket type to go live.</p>
                </div>
                <div className="modal-footer">
                  <div className="btn-toolbar btn-toolbar-right">
                    <Button
                      className="btn btn-danger"
                      type="button"
                      onClick={e => this.handleDeactivate(deleting)}>Delete</Button>
                    <Button
                      className="btn btn-default" type="button"
                      onClick={::this.handleCancelDeactivate}>Cancel</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
        <Modal
          className="modal-dialog modal-trans"
          style={modalStyle}
          isOpen={!!editing}
          contentLabel="Modal"
          onRequestClose={::this.handleCancel}
          closeTimeoutMS={150}>
          <div className="modal-dialog">
            <div className="modal-content">
              {<TicketForm
                inModal={true}
                ref='ticketForm'
                event={event}
                isEditing={editing? true: false}
                formKey={editing ? editing.id : ''}
                initialValues={editing ? editing.$original : null}
                getExposedMethod={::this.receiveExposedMethod}
                onSubmit={this.handleSubmit.bind(this, false, editing ? editing.id : null)}
                onCancel={::this.handleCancel} />}
            </div>
          </div>
        </Modal>
        <Modal
          className="modal-dialog modal-trans"
          style={modalStyle}
          isOpen={!!editingAddon}
          contentLabel="Modal"
          onRequestClose={::this.handleCancelAddon}
          closeTimeoutMS={150}>
          <div className="modal-dialog">
            <div className="modal-content">
              <AddOnForm 
                event={event} 
                tickets={tickets}
                isEditing = {editingAddon? true: false}
                formKey={editingAddon ? editingAddon.id : ''}
                initialValues={editingAddon ? _.merge({attributes: {ticketTypeNeeded: editingAddon.$original.attributes.prerequisiteTicketTypeIds!=null, stockUnlimited: editingAddon.$original.attributes.stock===null}}, editingAddon.$original) : null}
                onSubmit={this.handleSubmitEditAddon.bind(this, editingAddon ? editingAddon.id : null)} 
                onCancel={::this.handleCancelAddon} 
                getExposedMethod={::this.receiveExposedMethodAddOn}
              />
            </div>
          </div>
        </Modal>
        <Modal
          className="modal-dialog modal-trans"
          style={modalStyle}
          isOpen={!!deactivatingAddon}
          contentLabel="Modal"
          onRequestClose={::this.handleDeactivateAddonCancel}
          closeTimeoutMS={150}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div>
                <div className="modal-header">
                  <p className="h4 text-compact">Are you sure?</p>
                </div>
                <div className="modal-body">
                  <p>Deactivating the add-on will prevent users from buying it and will trigger the next available ticket type to go live.</p>
                </div>
                <div className="modal-footer">
                  <div className="btn-toolbar btn-toolbar-right">
                    <Button
                      className="btn btn-danger"
                      type="button"
                      onClick={e => this.handleDeactivateAddon(deactivatingAddon)}>Delete</Button>
                    <Button
                      className="btn btn-default" type="button"
                      onClick={::this.handleDeactivateAddonCancel}>Cancel</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
        <Modal
          className="modal-dialog modal-trans"
          style={modalStyle}
          isOpen={hasEdittedFields}
          contentLabel="Modal"
          onRequestClose={::this.onClickCancel}
          closeTimeoutMS={150}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-confirm-switch">
                <div className="modal-header">
                  Confirm Switch
                </div>
                <div className="modal-body">
                  <div className="msg-confirm">Are you sure you want to switch to a new section without saving your changes?</div>
                  <div className="msg-desc">You’ve made changes to the following settings:</div>
                  <div className="edited-fields">
                    {contentEdittedFields}
                  </div>
                </div>
                <div className="modal-footer">
                  <div className="btn-toolbar btn-toolbar-right">
                    <Button
                      className="btn btn-success btn-shadow"
                      type="button"
                      onClick={::this.onClickOk}>Ok</Button>
                    <Button
                      className="btn btn-default btn-shadow" type="button"
                      onClick={::this.onClickCancel}>Cancel</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>        
        <div className="row">
          <div className="col-xs-12">
            <TicketOptionsForm initialValues={event.$original} onSubmit={::this.handleUpdateEvent} />
          </div>
        </div>
        {/*<div className="row">
          <div className="col-xs-12">
            <div className="card">
              <div className="card-block card-header">
                <h4>Guest Tickets</h4>
              </div>
              <div className="card-block">
                <TicketGuestForm tickets={tickets} onSubmit={::this.handleSubmitNew} onCancel={::this.handleCancel}/>
              </div>
            </div>
          </div>
        </div>*/}
        <br />
        <br />
        <div className="row">
          <div className="col-xs-12">
            <Card icon={'fa-ticket'} title={'Ticket Types'} className="ticket-types">
              {!adding && <div className="btn-toolbar btn_holder">
                <Button className="btn btn-ok" type="button" onClick={::this.handleAdd}>
                  <i className={"fa fa-fw fa-plus"} />Add ticket type
                </Button>
                <Button className="btn btn-seablue" type="button" onClick={::this.refresh} loading={loadingFetch}>
                  <i className={"fa fa-fw fa-refresh"} />Refresh
                </Button>
                <Button className="btn btn-seablue" type="button" onClick={::this.handleUndo} disabled={!(dndHistoryCount > dndHistoryCurrentPos && dndHistoryCurrentPos > 0)}>
                  <i className={"fa fa-fw fa-undo"} /> Undo
                </Button>
                 {dndHistoryCurrentPos > 0 && 
                <Button className="btn btn-seablue" type="button" onClick={::this.handleSaveSort} loading={savingSort}>
                  <i className={"fa fa-fw fa-floppy-o"} /> Save
                </Button>}
                <Button className="btn btn-primary" type="button" onClick={::this.handleRedo} disabled={!(dndHistoryCount > (dndHistoryCurrentPos + 1) && dndHistoryCurrentPos >= 0)}>
                  <i className={"fa fa-fw fa-repeat"} /> Redo
                </Button>
               
                {
                //  dndHistoryCurrentPos > 0 &&
                // <Button className="btn btn-primary" type="button" onClick={::this.handleCancelChanges}>
                //   <i className={"fa fa-fw fa-undo"} /> Cancel Changes
                // </Button>
                } 
              </div>}
              {adding && 
              <TicketForm
                inModal={false}
                ref='ticketForm'
                event={event} 
                onSubmit={this.handleSubmit.bind(this, true, null)} 
                onCancel={::this.handleCancel}
                getExposedMethod={::this.receiveExposedMethod}
              />}                
              <TicketsTable event={event}>
                {nodes}
              </TicketsTable>
            </Card>
          </div>
        </div>
        <div className="row">
          <div className="col-xs-12">
            <Card icon={'fa-book'} title={'Add-Ons'}>
              {/*!addingAddon && <div className="btn-toolbar btn_holder">
                <Button className="btn btn-ok" type="button" onClick={::this.handleAddAddon}>
                  <i className={"fa fa-fw fa-plus"} />Add Add-On
                </Button>
              </div>*/}
              {addingAddon &&
                <AddOnForm 
                  event={event} 
                  tickets={tickets}
                  onSubmit={::this.handleSubmitNewAddon} 
                  onCancel={::this.handleCancelAddon} 
                  getExposedMethod={::this.receiveExposedMethodAddOn}
                />
              }
              <div className="table-responsive">
                <table className="table addons-table">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Name</th>
                      <th>Group</th>
                      <th>Cost</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {_.map(addons, (ao, idx) => (
                      <AddOnRow 
                        key={ao.id} 
                        event={event} 
                        addon={ao} 
                        last={idx===addons.length-1}
                        handleEdit={() => this.handleEditAddon(ao)}
                        handleActivate={() => this.handleActivateAddon(ao)}
                        handleDeactivate={() => this.handleDeactivateAddonOpenModal(ao)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
        <div className="row">
          <div className="col-xs-12">
            <Card icon={'fa-clipboard'} title={'Advanced Options'}>
              <TicketAdvancedOptionsForm initialValues={event.$original} onSubmit={::this.handleUpdateEvent} />
            </Card>
          </div>
        </div>
      </div>
    )
  }
}

