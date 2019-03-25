import _ from 'lodash'
import {Map} from 'immutable'

import {handleActions} from 'redux-actions'
import {createAsyncHandlers} from '../actions'

const initialState = Map({
  events: Map()
})

const FETCH_PUBLISH_STATUS = createAsyncHandlers('FETCH_PUBLISH_STATUS', {
  success(state, action) {
    const eid = _.get(action, 'payload.data.id')
    const status = _.get(action, 'payload.data')
    return state.setIn(['events', eid], status)
  }
})

const UPDATE_EVENT = createAsyncHandlers('UPDATE_EVENT', {
  success(state, action) {
    return state.removeIn(['events', _.get(action, 'payload.data.id')])
  }
})

export default handleActions({
  ...FETCH_PUBLISH_STATUS,
  ...UPDATE_EVENT
}, initialState)
