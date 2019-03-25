import _ from 'lodash'
import {handleAction, handleActions} from 'redux-actions'
import {fromJS, Map, OrderedMap, Set} from 'immutable'
import {get, set} from 'lodash'
import {createAsyncHandlers} from '../actions'

const initialState = Map({
  initial: true,
  loading: Set(),
  total: 0,
  skip: 0,
  events: OrderedMap(),
  selected: null,
  errors: Map(),
  ticketStats: Map(),
})

const FETCH_EVENTS = createAsyncHandlers('FETCH_EVENTS', {
  success(state, action) {
    const {total, skip, data} = action.payload

    return state.withMutations(map => {
      map
        .set('initial', false)
        .set('total', total)
        .set('skip', skip)
        .set('events', map.get('events').withMutations((es) => {
          _.each(data, e => {
            es.set(e.id, fromJS(e))
          })
        }))
    })
  }
})

const FETCH_EVENT = createAsyncHandlers('FETCH_EVENT', {
  success(state, action) {
    const {data} = action.payload
    return state.set('selected', fromJS(data))
  }
})

const CREATE_EVENT = createAsyncHandlers('CREATE_EVENT', {
  success(state, action) {
    const event = action.payload.data

    return state.withMutations(map => {
      map
        .set('initial', false)
        .set('total', map.get('total') + 1)
        .set('events', map.get('events').set(event.id, fromJS(event)))
    })
  }
})

const UPDATE_EVENT = createAsyncHandlers('UPDATE_EVENT', {
  success(state, action) {
    const event = fromJS(action.payload.data)

    return state.withMutations(map => {
      const sid = map.getIn(['selected', 'id'], null)
      const eid = event.get('id')
      map.set('events', map.get('events').set(eid, event))
      if (sid && sid === eid) {
        map.set('selected', event)
      }
    })
  }
})

const UPDATE_EVENT_TICKET_STATISTICS = handleAction('UPDATE_EVENT_TICKET_STATISTICS', (state, action) => {
  const stats = action.payload
  return state.withMutations(map => {
    const eid = stats.id
    map.set('ticketStats', map.get('ticketStats').set(eid, stats))
  })
}, initialState)

const CLEAR_SELECTED_EVENT = handleAction('CLEAR_SELECTED_EVENT', (state) => {
  return state.set('selected', null)
}, initialState)

export default handleActions({
  ...FETCH_EVENTS,
  ...FETCH_EVENT,
  ...CREATE_EVENT,
  ...UPDATE_EVENT,
  UPDATE_EVENT_TICKET_STATISTICS,
  CLEAR_SELECTED_EVENT,
}, initialState)
