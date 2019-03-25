import _ from 'lodash'
import {handleAction, handleActions} from 'redux-actions'
import {fromJS, OrderedSet, Map, Set} from 'immutable'
import {createAsyncHandlers} from '../actions'

const initialState = Map({
  loading: Set(),
  byEvent: Map(),
  collection: Map(),
  errors: Map()
})

const FETCH_EVENT_TICKETS = createAsyncHandlers('FETCH_EVENT_TICKETS', {
  success(state, action) {
    const {eid, tickets: {data}} = action.payload
    const ids = _.map(data, 'id')
    const ticketsById = _.keyBy(data, 'id')
    return state
      .mergeIn(['collection'], ticketsById)
      .setIn(['byEvent', eid], OrderedSet(ids))
  }
})

const CREATE_TICKET = createAsyncHandlers('CREATE_TICKET', {
  success(state, action) {
    const {data} = action.payload
    const tid = data.id
    const eid = _.get(data, '$relationships.event.id')
    return state
      .setIn(['collection', tid], data)
      .updateIn(['byEvent', eid], OrderedSet(), ts => ts.add(tid))
  }
})

const UPDATE_TICKET = createAsyncHandlers('UPDATE_TICKET', {
  success(state, action) {
    const {data} = action.payload
    const tid = data.id
    const eid = _.get(data, '$relationships.event.id')
    return state
      .setIn(['collection', tid], data)
      .updateIn(['byEvent', eid], OrderedSet(), ts => ts.add(tid))
  }
})

export default handleActions({
  ...FETCH_EVENT_TICKETS,
  ...CREATE_TICKET,
  ...UPDATE_TICKET,
}, initialState)

