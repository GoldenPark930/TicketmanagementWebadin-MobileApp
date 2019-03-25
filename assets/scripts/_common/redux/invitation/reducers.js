import _ from 'lodash'
import {handleAction, handleActions} from 'redux-actions'
import {fromJS, OrderedSet, Map, Set} from 'immutable'
import {createAsyncHandlers} from '../actions'

const initialState = Map({
	invitations: Map()
})

const SEND_INVITATIONS = createAsyncHandlers('SEND_INVITATIONS', {
	success(state, action) {
		return state
	}
})

const FETCH_INVITATIONS = createAsyncHandlers('FETCH_INVITATIONS', {
  success(state, action) {
    const {eid, invitations: {data}} = action.payload
    const ret = _.get(data, '$original')
    return state.set('invitations', fromJS(ret))
  }
})

export default handleActions({
	...SEND_INVITATIONS,
	...FETCH_INVITATIONS
}, initialState)

