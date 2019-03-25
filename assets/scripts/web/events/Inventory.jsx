import _ from 'lodash'
import Immutable from 'immutable'
import React from 'react'
import {connect} from 'react-redux'
import Dropdown from 'react-bootstrap/lib/Dropdown'
import MenuItem from 'react-bootstrap/lib/MenuItem'
import Modal from 'react-modal'

import modalStyle from '../../_common/core/modalStyle'
import Button from '../_library/Button'
import Currency from '../_library/Currency'
import DateLabel from '../_library/DateLabel'
import Field from '../_library/Field'
import {UPDATE_EVENT} from '../../_common/redux/events/actions'
import {FETCH_EVENT_TICKETS, UPDATE_TICKET} from '../../_common/redux/tickets/actions'

@connect(
  (state) => {
    const col = state.tickets.get('collection')
    const event = state.events.get('selected').toJS()
    const tickets = state.tickets
      .getIn(['byEvent', event.id], Immutable.List())
      .map(tid => col.get(tid))
      .toJS()
    return {
      event,
      tickets
    }
  },
  {FETCH_EVENT_TICKETS, UPDATE_TICKET}
)
export default class Inventory extends React.Component {
  constructor(props) {
    super(props)
    this.state = {loadingFetch: false, editing: null, adding: false, editingFee: false}
  }
  componentDidMount() {
    const {event, tickets} = this.props
    document.title = `Inventory - ${event.displayName} - The Ticket Fairy Dashboard`
    if (tickets.length) { return }
    this.refresh()
  }
  refresh() {
    const {event, FETCH_EVENT_TICKETS} = this.props
    if (this.state.loading) { return }
    const loadingSetter = (val) => () => this.setState({loadingFetch: val})
    Promise.resolve(FETCH_EVENT_TICKETS(event.id))
      .catch(loadingSetter(false))
      .then(loadingSetter(false))
    loadingSetter(true)()
  }
  handleSubmitEdit(tid, form) {
    if (!tid) { return }
    const {UPDATE_TICKET} = this.props
    const description = this.exposedMethod()
    form.attributes.description = description
    const unsetEditing = () => this.setState({editing: null})
    return Promise.resolve(UPDATE_TICKET(tid, form))
      .catch(err => Promise.reject(_.result(err, 'toFieldErrors', err)))
      .then(unsetEditing)
  }
  handleUpdateEvent(form) {
    const {event, UPDATE_EVENT} = this.props
    return Promise.resolve(UPDATE_EVENT(event.id, form))
      .catch(err => Promise.reject(_.result(err, 'toFieldErrors', err)))
  }
  render() {
    const {loadingFetch, adding, editing, deleting, editingFee} = this.state
    const {event, tickets} = this.props
    let currency = getCurrencySymbol(event)
    const defaultTicket = _.head(tickets)

    const convertToCurrency = (val) =>{

    }

    return (
      <div className="card">
        <div className = "row">
          <div className="col-xs-12">                                
            <div className="table_reponsive">
              <table className="table tickets-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Price (excl. fees)</th>
                    <th>Price (incl. fees)</th>
                    <th>In stock</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {_.map(tickets, function(ticket, index){
                    let price1 = parseFloat(ticket.price) / 1.1
                    let price2 = parseFloat(ticket.price)

                    return (
                      <tr key={index} className={index++ % 2== 0 ? 'row-stale' : ''}>
                        <td>{ticket.displayName}</td>
                        <td><Currency code={currency} value={price1} /></td>
                        <td><Currency code={currency} value={price2} /></td>
                        <td><Field id="stock" type="number" label="Stock" value={ticket.stock}
                        onBlur={e => this.handleStockChange('onBlur', e)}
                        onChange={e => this.handleStockChange('onChange', e)} /></td>
                        <td><Button id={'btnUpdate'+index} className="btn btn-primary btn-shadow" type="button" >Update</Button></td>
                      </tr>
                      )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>                  
      </div>
    )
  }
}

