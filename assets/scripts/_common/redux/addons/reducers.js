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

const FETCH_EVENT_ADDONS = createAsyncHandlers('FETCH_EVENT_ADDONS', {
  success(state, action) {
    const {eid, addons: {data}} = action.payload
    const ids = _.map(data, 'id')
    const addonsById = _.keyBy(data, 'id')
    return state
      .mergeIn(['collection'], addonsById)
      .setIn(['byEvent', eid], OrderedSet(ids))
  }
})

const CREATE_ADDON = createAsyncHandlers('CREATE_ADDON', {
  success(state, action) {
    const {data} = action.payload
    const tid = data.id
    const eid = _.get(data, '$relationships.event.id')
    return state
      .setIn(['collection', tid], data)
      .updateIn(['byEvent', eid], OrderedSet(), ts => ts.add(tid))
  }
})

const UPDATE_ADDON = createAsyncHandlers('UPDATE_ADDON', {
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
  ...FETCH_EVENT_ADDONS,
  ...CREATE_ADDON,
  ...UPDATE_ADDON,
}, initialState)