import _ from 'lodash'
import {handleAction, handleActions} from 'redux-actions'
import {fromJS, OrderedSet, Map, Set} from 'immutable'
import {createAsyncHandlers} from '../actions'

const initialState = Map({
  performance: Map()
})

const FETCH_EVENT_PERFORMANCE = createAsyncHandlers('FETCH_EVENT_PERFORMANCE', {
  success(state, action) {
  	// console.log('result = ', action.payload)
  	const {eid, performance: {data}} = action.payload
    const ret = _.get(data, '$original')
    return state.set('performance', fromJS(ret))
  }
})

const FETCH_EVENT_DEMOGRAPHICS = createAsyncHandlers('FETCH_EVENT_DEMOGRAPHICS', {
  success(state, action) {
  	// console.log('result = ', action.payload)
  	const {eid, performance: {data}} = action.payload
    const ret = _.get(data, '$original')
    return state.set('performance', fromJS(ret))
  }
})

const FETCH_EVENT_CHECKIN = createAsyncHandlers('FETCH_EVENT_CHECKIN', {
  success(state, action) {
  	// console.log('result = ', action.payload)
  	const {eid, performance: {data}} = action.payload
    const ret = _.get(data, '$original')
    return state.set('performance', fromJS(ret))
  }
})

export default handleActions({
  ...FETCH_EVENT_PERFORMANCE,
  ...FETCH_EVENT_DEMOGRAPHICS,
  ...FETCH_EVENT_CHECKIN,
}, initialState)

