import _ from 'lodash'
import {handleAction, handleActions} from 'redux-actions'
import {fromJS, OrderedSet, Map, Set} from 'immutable'
import {createAsyncHandlers} from '../actions'

const initialState = Map({
  orders: Map()
})

const FETCH_EVENT_ORDERS = createAsyncHandlers('FETCH_EVENT_ORDERS', {
  success(state, action) {
  	// console.log('result = ', action.payload)
  	const {eid, orders: {data}} = action.payload
    const ret = _.get(data, '$original')
    return state.set('orders', fromJS(ret))
  }
})

const RESEND_ORDER = createAsyncHandlers('RESEND_ORDER', {
  success(state, action) {
		return state
	}
})

export default handleActions({
  ...FETCH_EVENT_ORDERS,
  ...RESEND_ORDER,
}, initialState)

