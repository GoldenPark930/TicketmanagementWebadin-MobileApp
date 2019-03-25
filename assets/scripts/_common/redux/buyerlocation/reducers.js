import _ from 'lodash'
import {handleAction, handleActions} from 'redux-actions'
import {fromJS, OrderedSet, Map, Set} from 'immutable'
import {createAsyncHandlers} from '../actions'

const initialState = Map({
  buyerlocation: Map()
})

const FETCH_EVENT_BUYERLOCATION = createAsyncHandlers('FETCH_EVENT_BUYERLOCATION', {
  success(state, action) {
  	const {eid, buyerlocation: {data}} = action.payload
    const ret = _.get(data, '$original')
    return state.set('buyerlocation', fromJS(ret))
  }
})

export default handleActions({
  ...FETCH_EVENT_BUYERLOCATION,
}, initialState)

