import _ from 'lodash'
import React from 'react'
import {connect} from 'react-redux'
import Immutable from 'immutable'
import {View, Text, ScrollView} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import {MenuOption} from 'react-native-popup-menu'
import {commonStyle, styleConstant, menu} from '../../native/styles'
import TicketOptionsForm from './TicketOptionsForm'
import TicketForm from './TicketForm'
import TicketAdvancedOptionsForm from './TicketAdvancedOptionsForm'
import {Panel, Button, Grid, DropdownButton, Dialog}  from '../_library'
import eventActions from '../../_common/redux/events/actions'
import ticketActions from '../../_common/redux/tickets/actions'
import {LoadingBar, EmptyBar} from '../_library'
import DeviceInfo from 'react-native-device-info'
import AddOnRow from './addons/AddonRow'
import session_addon from "../../_common/redux/addons/actions";
import {routeActions} from 'react-router-redux'
import AddOnForm from './addons/AddOnForm'

const cloneObject = (src) => {
    return JSON.parse(JSON.stringify(src))
}
const cloneArray = (src) => {
    return _.map(src, (t) => {
        return cloneObject(t)
    })
}

class Tickets extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            loadingFetch: false,
            editing: null,
            adding: false,
            editingFee: false,
            ticketsDnD: [],
            dndHistory: [],
            dndHistoryCurrentPos: 0,
            saveSortDialogOpen: false,
            savingSort: false,
            savingSortTotal: 0,
            savingSortCurrent: 0,
            renderShow:false,
            loadingAddon: false,
            addingAddon: false,
            editingAddon: null,
            deactivatingAddon: null
        }

    }

    componentDidMount() {
        const {event, tickets, addons} = this.props
        //document.title = `Tickets - ${event.displayName} - The Ticket Fairy Dashboard`
        setTimeout(
          () => this.setState({renderShow: true}),
          500
        )
        if (tickets.length && addons.length) { return }
        this.refresh()
        this.refreshAddons()
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
    componentWillReceiveProps(nextProps) {
        const {tickets} = nextProps

        if (JSON.stringify(tickets) === JSON.stringify(this.props.tickets)) {
            // console.log('---- tickets not updated!')
            const {ticketsDnD} = this.state
            if (ticketsDnD.length == 0)
                this.initDnD(tickets, false)
        } else {
            // console.log('---- tickets updated!')
            this.initDnD(tickets, false)
        }
    }

    initDnD(tickets, ignoreSaving) {
        let initDnD = ignoreSaving ? true : !this.state.savingSort
        if (initDnD) {
            // console.log('initDnD called')

            // init ticketsDnD from props->tickets
            let ticketsDnD = cloneArray(tickets)
            for (let i = 0; i < ticketsDnD.length; i++)
                ticketsDnD[i].sortOrder = parseInt(ticketsDnD[i].sortOrder)
            ticketsDnD = _.orderBy(ticketsDnD, ['sortOrder', 'displayName'], ['asc', 'asc'])
            for (let i = 0; i < ticketsDnD.length; i++) {
                ticketsDnD[i].sortOrder = i + 1
            }

            //add to history
            let newHistory = _.map(ticketsDnD, (t) => {
                return {id: t.id, sortOrder: t.sortOrder, displayName: t.displayName}
            })
            let dndHistory = []
            dndHistory.push(newHistory)
            this.setState({ticketsDnD: ticketsDnD, dndHistory: dndHistory, dndHistoryCurrentPos: 0})
        } else {
            // console.log('Currently savingSort, initDnD ignored')
        }
    }

    refresh = () => {
        const {dndHistoryCurrentPos} = this.state
        if (dndHistoryCurrentPos > 0) {
            this.setState({saveSortDialogOpen: true})
        } else {
            const {event, FETCH_EVENT_TICKETS} = this.props
            const loadingSetter = (val) => () => this.setState({loadingFetch: val, dndHistoryCurrentPos: 0})
            Promise.resolve(FETCH_EVENT_TICKETS(event.id))
                .catch(loadingSetter(false))
                .then(loadingSetter(false))
            loadingSetter(true)()
        }
    }
    refreshAddons = () => {
      const {event, FETCH_EVENT_ADDONS} = this.props
      const loadingSetter = (val) => () => this.setState({loadingAddon: val})
      Promise.resolve(FETCH_EVENT_ADDONS(event.id))
        .catch(loadingSetter(false))
        .then((result)=>{
          console.warn('sucess')
          console.warn(result)
          loadingSetter(false)
        })
      loadingSetter(true)()
    }
    handleAdd = () => {
        const {dndHistoryCurrentPos} = this.state
        if (dndHistoryCurrentPos > 0) {
            this.setState({saveSortDialogOpen: true})
        } else {
            this.setState({editing: null, adding: true})
        }
    }
    handleCancelAddon() {
      this.setState({addingAddon: false, editingAddon: null})
    }
    handleEditAddon(ao) {
      this.setState({editingAddon: ao, addingAddon: false})
    }
    receiveExposedMethodAddOn(exposedMethod) {
      this.exposedMethodAddOn = exposedMethod
    }
    handleActivateAddon(ao) {
      const {UPDATE_ADDON} = this.props
      // submit
      return Promise.resolve(UPDATE_ADDON(ao.id, {attributes: {active: true}}))
        .catch(err => Promise.reject(_.result(err, 'toFieldErrors', err)))
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
    handleCancelDeactivate = () => {
        this.setState({deleting: null})
    }
    handleUpdateEvent = (form) => {
        const {event, UPDATE_EVENT} = this.props
        return Promise.resolve(UPDATE_EVENT(event.id, form))
            .catch(err => Promise.reject(_.result(err, 'toFieldErrors', err)))
    }
    handleUndo = () => {
        let {dndHistoryCurrentPos} = this.state
        this.processUndoRedo(dndHistoryCurrentPos - 1)
    }
    handleRedo = () => {
        let {dndHistoryCurrentPos} = this.state
        this.processUndoRedo(dndHistoryCurrentPos + 1)
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
    handleSaveSort = () => {
        if (this.state.loading) {
            return
        }
        const savingSort = (sortStarted, total) => () => {
            if (sortStarted) {
                this.setState({savingSortCurrent: 0, savingSort: sortStarted, savingSortTotal: total})
            } else {
                let {savingSortCurrent, savingSortTotal} = this.state
                savingSortCurrent++
                // console.log('--- saving in progress --- ', savingSortCurrent, savingSortTotal)

                if (savingSortCurrent >= savingSortTotal) {
                    // console.log('savingSortCompleted', savingSortTotal)
                    const {tickets} = this.props
                    this.initDnD(tickets, true)
                    this.setState({savingSort: false, saveSortDialogOpen: false})
                }
                else {
                    this.setState({savingSort: true, savingSortCurrent: savingSortCurrent})
                }
            }
        }
        let {ticketsDnD} = this.state
        const {UPDATE_TICKET} = this.props
        let total = ticketsDnD.length
        for (let i = 0; i < total; i++) {
            let tid = ticketsDnD[i].id
            let sortOrder = ticketsDnD[i].sortOrder
            Promise.resolve(UPDATE_TICKET(tid, {attributes: {sortOrder: sortOrder}}))
                .catch(savingSort(false, total))
                .then(savingSort(false, total))
        }
        savingSort(true, total)()
    }
    handleCancelSave = () => {
        this.setState({saveSortDialogOpen:false})
    }

    handleSubmitNew = (form) => {
        const {event, CREATE_TICKET} = this.props
        //const description = this.exposedMethod()
        //form.attributes.description = description

        const unsetAdding = () => this.setState({adding: false, dndHistoryCurrentPos: 0})
        return Promise.resolve(CREATE_TICKET(event.id, form))
            .catch(err => {
                Promise.reject(_.result(err, 'toFieldErrors', err))
            })
            .then(unsetAdding)
    }
    handleSubmitEdit(tid, form) {
        if (!tid) { return }
        const {UPDATE_TICKET} = this.props
        //const description = this.exposedMethod()
        //form.attributes.description = description
        const unsetEditing = () => this.setState({editing: null})
        return Promise.resolve(UPDATE_TICKET(tid, form))
            .catch(err => Promise.reject(_.result(err, 'toFieldErrors', err)))
            .then(unsetEditing)
    }
    handleCancel = () => {
        this.setState({editing: null, adding: false})
    }
    receiveExposedMethod = (exposedMethod) => {
        this.exposedMethod = exposedMethod
    }


    handleDeactivateAddonOpenModal(ao) {
        console.warn(ao)
        this.setState({deactivatingAddon: ao})
    }
    handleDeactivateAddon(ao) {
      const {UPDATE_ADDON} = this.props
      // submit
      const unsetDeactivating = () => this.setState({deactivatingAddon: null})
      console.warn(this.state.deactivatingAddon)
      return Promise.resolve(UPDATE_ADDON(ao.id, {attributes: {active: false}}))
        .catch(err => Promise.reject(_.result(err, 'toFieldErrors', err)))
        .then(unsetDeactivating)
    }
    handleDeactivateAddonCancel() {
      this.setState({deactivatingAddon: null})
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
    exposedMethodAddOn(){}
    exposedMethod(){}
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
    handleSubmitEditAddon(aid, form) {
      const {UPDATE_ADDON} = this.props

      // filter submitted data
      // let filtered = this.exposedMethodAddOn()
      form.attributes.description = {}
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
    render() {

        const {loadingFetch, adding, editing, deleting} = this.state
        const {savingSort, saveSortDialogOpen, addingAddon, editingAddon, deactivatingAddon} = this.state
        const {dndHistory, dndHistoryCurrentPos} = this.state
        const {event, tickets, addons} = this.props

        let dndHistoryCount = dndHistory.length
        console.log('history count = %d, current = %d', dndHistoryCount, dndHistoryCurrentPos)
        let {ticketsDnD} = this.state
        ticketsDnD = _.orderBy(ticketsDnD, ['sortOrder', 'displayName'], ['asc', 'asc'])
        if(editing) console.log('ticket edit',JSON.stringify(editing.$original))
        if (!this.state.renderShow ) return <LoadingBar title={'Hold tight! We\'re getting your event\'s statistics...'} />

        return (
            <View>
              <Dialog
                title='Are you sure?'
                isOpen={!!saveSortDialogOpen}
                onClose={this.handleCancelSave}
                footer={
                  <View style={{flexDirection:'row'}}>
                    <Button title='Save' style={commonStyle.buttonPrimary} size='small' onPress={this.handleSaveSort}/>
                    <Button title='Cancel' style={commonStyle.buttonSecondary} size='small' onPress={this.handleCancelSave}/>
                  </View>
                }>
                <Text style={{textAlign:'center',color:'white'}}>Tickets table has been modified. Save current changes?</Text>
              </Dialog>
              <Dialog
                title='Are you sure?'
                isOpen={!!deleting}
                onClose={this.handleCancelDeactivate}
                footer={
                  <View style={{flexDirection:'row'}}>
                    <Button title='Delete' style={commonStyle.buttonDanger} size='small' onPress={()=>this.handleDeactivate(deleting)}/>
                    <Button title='Cancel' style={commonStyle.buttonSecondary} size='small' onPress={this.handleCancelDeactivate}/>
                  </View>
                }>
                <Text style={{textAlign:'center',color:'white'}}>Deactivating the ticket will prevent users from buying it and will trigger the next available ticket type to go live.</Text>
              </Dialog>
              <Dialog
                isOpen={!!editing}
                onClose={this.handleCancel}>
                <TicketForm
                  event={event}
                  isEditing = {editing? true: false}
                  formKey={editing ? editing.id : ''}
                  initialValues={editing ? editing.$original : null}
                  onSubmit={this.handleSubmitEdit.bind(this, editing ? editing.id : null)}
                  onCancel={this.handleCancel}
                  getExposedMethod={this.receiveExposedMethod}/>
              </Dialog>
              <Dialog
                isOpen={!!editingAddon}
                onClose={() => this.handleCancelAddon()}>
                <AddOnForm
                  event={event}
                  tickets={tickets}
                  isEditing = {editingAddon? true: false}
                  formKey={editingAddon ? editingAddon.id : ''}
                  initialValues={editingAddon ? _.merge({attributes: {ticketTypeNeeded: editingAddon.$original.attributes.prerequisiteTicketTypeIds!=null, stockUnlimited: editingAddon.$original.attributes.stock===null}}, editingAddon.$original) : null}
                  onSubmit={(form) => this.handleSubmitEditAddon(editingAddon ? editingAddon.id : null, form)}
                  onCancel={() => this.handleCancelAddon()}
                  getExposedMethod={() => this.receiveExposedMethodAddOn()}
                />
              </Dialog>
              <Dialog
                isOpen = {!!deactivatingAddon}
                onClose = {()=>this.handleDeactivateAddonCancel()}
                title = 'Are you sure?'
                footer={
                  <View style={{flexDirection:'row'}}>
                    <Button title='Delete' style={commonStyle.buttonDanger} size='small' onPress={e => this.handleDeactivateAddon(deactivatingAddon)}/>
                    <Button title='Cancel' style={commonStyle.buttonSecondary} size='small' onPress={e => this.handleDeactivateAddonCancel(e)}/>
                  </View>
                }>
              >
                <Text style={{textAlign:'center',color:'white'}}>Deactivating the add-on will prevent users from buying it and will trigger the next available ticket type to go live.</Text>
              </Dialog>
              <TicketOptionsForm initialValues={event.$original} onSubmit={this.handleUpdateEvent}/>
              <Panel title='Ticket Types' icon='ticket' style={{marginBottom: 25}}>
                <View>
                  {!adding && <View style={[commonStyle.rowContainer,{flexDirection: DeviceInfo.isTablet() ?'row':'column',}]}>
                    <Button size={DeviceInfo.isTablet() ?'small':'large'}
                            onPress={this.handleAdd} title='Add ticket type'
                            style={{marginBottom:DeviceInfo.isTablet() ? 0:5}}
                            icon='plus'/>
                    <Button style={[commonStyle.buttonSecondary,{marginBottom:DeviceInfo.isTablet() ? 0:5}]} size={DeviceInfo.isTablet() ?'small':'large'}
                            onPress={this.refresh}
                            loading={loadingFetch} title='Refresh' icon='refresh'/>
                    <Button style={[commonStyle.buttonSecondary,{marginBottom:DeviceInfo.isTablet() ? 0:5}]}
                            size={DeviceInfo.isTablet() ?'small':'large'}
                            onPress={this.handleUndo}
                            disabled={!(dndHistoryCount > dndHistoryCurrentPos && dndHistoryCurrentPos > 0)}
                            title='Undo' icon='undo'/>
                    {dndHistoryCurrentPos > 0 &&
                    <Button style={[commonStyle.buttonSecondary,{marginBottom:DeviceInfo.isTablet() ? 0:5}]}
                            size={DeviceInfo.isTablet() ?'small':'large'}
                            onPress={this.handleSaveSort}
                            loading={savingSort} title='Save' icon='floppy-o'/>}
                    <Button style={[commonStyle.buttonSecondary,{marginBottom:DeviceInfo.isTablet() ? 0:5}]}
                            size={DeviceInfo.isTablet() ?'small':'large'}
                            onPress={this.handleRedo}
                            disabled={!(dndHistoryCount > (dndHistoryCurrentPos + 1) && dndHistoryCurrentPos >= 0)}
                            title='Redo' icon='repeat'/>
                  </View>}
                  {adding &&
                  <TicketForm
                    onSubmit={this.handleSubmitNew}
                    onCancel={this.handleCancel}
                    getExposedMethod={this.receiveExposedMethod}
                  />}
                  {ticketsDnD.length > 0 &&
                  <Grid
                    columns={[{
                      renderer: (record) => {
                        return (
                          <View style={{width:'100%'}}>
                            <View style={{flexDirection: 'row', width:'100%'}}>
                              <View style={{flexDirection: 'row', alignSelf: 'flex-start', width:'20%'}}>
                                <Text
                                  style={{color: record.active ? styleConstant.colors.success : styleConstant.colors.danger}}><Icon
                                  name='circle'/></Text>
                                {record.flagAlwaysAvailable &&
                                <Text style={{marginLeft: 5, color: 'white'}}><Icon name='eye'/></Text>}
                              </View>
                              <View style={{flexDirection: 'row', flexWrap: 'wrap', width:'80%'}}>
                                <View style={{width:'100%'}}>
                                  <Text style={commonStyle.gridBodyCellLabel}>Ticket Name</Text>
                                  <Text style={commonStyle.gridBoryCellValue}>
                                    {record.displayName}
                                  </Text>
                                </View>
                                <View style={{width:'50%'}}>
                                  <Text style={commonStyle.gridBodyCellLabel}>Face Value</Text>
                                  <Text style={commonStyle.gridBoryCellValue}>
                                    {record.currency ? `${record.currency} ` : ''}{(record.price / 100).toFixed(2)}
                                  </Text>
                                </View>
                                <View style={{width: '50%'}}>
                                  <Text style={[commonStyle.gridBodyCellLabel, {fontSize: 12}]}>Price (Incl.Fees)</Text>
                                  <Text style={commonStyle.gridBoryCellValue}>
                                    {record.currency ? `${record.currency} ` : ''}{(record.price / 100).toFixed(2)}
                                  </Text>
                                </View>
                                <View style={{width: '50%'}}>
                                  <Text style={[commonStyle.gridBodyCellLabel, {fontSize: 12}]}>Stock</Text>
                                  <Text style={commonStyle.gridBoryCellValue}>
                                    {record.stock}
                                  </Text>
                                </View>
                              </View>
                            </View>
                            <Button size={DeviceInfo.isTablet() ?'small':'large'}
                                    onPress={()=>this.handleEdit(record)} title='Edit'
                                    style={{marginBottom:DeviceInfo.isTablet() ? 0:5, backgroundColor:'#337ab7'}}
                                    icon='pencil'/>
                            {record.active &&
                              <Button size={DeviceInfo.isTablet() ?'small':'large'}
                                      onPress={() => this.handleDeactivate(record.id)} title='Deactivate'
                                      style={[commonStyle.buttonSecondary, {marginBottom:DeviceInfo.isTablet() ? 0:5}]}
                                      icon='ban'/>
                            }
                            {!record.active &&
                              <Button size={DeviceInfo.isTablet() ?'small':'large'}
                                      onPress={() => this.handleActivate(record.id)} title='Activate'
                                      style={[commonStyle.buttonSecondary, {marginBottom:DeviceInfo.isTablet() ? 0:5}]}
                                      icon='cog'/>
                            }
                          </View>
                        )
                      }
                    }]}
                    stripe={true}
                    hideHeader
                    data={ticketsDnD}
                  />
                  }
                </View>
              </Panel>
              <Panel title='Add-Ons' icon='book'>
                <View>
                  {addingAddon &&
                    <AddOnForm
                      event={event}
                      tickets={tickets}
                      onSubmit={(form) => this.handleSubmitNewAddon(form)}
                      onCancel={() => this.handleCancelAddon()}
                      getExposedMethod={(exposedMethod) => this.receiveExposedMethodAddOn(exposedMethod)}
                    />
                  }
                  <View>
                    <Grid
                      columns={[{
                        renderer: (ao) => {
                          return (
                            <AddOnRow
                              key={ao.id}
                              event={event}
                              addon={ao}
                              handleEdit={() => this.handleEditAddon(ao)}
                              handleActivate={() => this.handleActivateAddon(ao)}
                              handleDeactivate={() => this.handleDeactivateAddonOpenModal(ao)}
                            />
                          )
                        }
                      }]}
                      stripe={true}
                      hideHeader
                      data={addons}
                    />
                  </View>
                </View>
              </Panel>
              <Panel title='Advanced Options' style={{marginTop: 20}}>
                <TicketAdvancedOptionsForm initialValues={event.$original} onSubmit={this.handleUpdateEvent}/>
              </Panel>
            </View>
        )
    }
}

export default connect(
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
    {
        FETCH_EVENT_TICKETS: ticketActions.FETCH_EVENT_TICKETS,
        CREATE_TICKET: ticketActions.CREATE_TICKET,
        UPDATE_TICKET: ticketActions.UPDATE_TICKET,
        UPDATE_EVENT: eventActions.UPDATE_EVENT,
        push: routeActions.push,
        FETCH_EVENT_ADDONS: session_addon.FETCH_EVENT_ADDONS,
        CREATE_ADDON: session_addon.CREATE_ADDON,
        UPDATE_ADDON: session_addon.UPDATE_ADDON
    }
)(Tickets)
