import _ from 'lodash'
import {handleAction, handleActions} from 'redux-actions'
import {fromJS, OrderedSet, Map, Set} from 'immutable'
import {createAsyncHandlers} from '../actions'

const initialState = Map({
})

const UPLOAD_GUESTTICKETS = createAsyncHandlers('UPLOAD_GUESTTICKETS', {
	success(state, action) {
		return state
	}
})

export default handleActions({
	...UPLOAD_GUESTTICKETS
}, initialState)