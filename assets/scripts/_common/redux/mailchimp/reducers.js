import _ from 'lodash'
import {handleAction, handleActions} from 'redux-actions'
import {fromJS, OrderedSet, Map, Set} from 'immutable'
import {createAsyncHandlers} from '../actions'

const initialState = Map({
	mailchimp: Map(),
	redirect_uri: Map(),
})

const FETCH_MC_LISTS = createAsyncHandlers('FETCH_MC_LISTS', {
	success(state, action) {
		const {eid, mailchimp: {data}} = action.payload
		const ret = _.get(data, '$original')
		return state.set('mailchimp', fromJS(ret))
	}
})

const CONNECT_TO_MAILCHIMP = createAsyncHandlers('CONNECT_TO_MAILCHIMP', {
	success(state, action) {
		const {data} = action.payload
		
		const uri = _.get(data, '$original')
		return state.set('redirect_uri', fromJS(uri))
	}
})

const EMAIL_TICKET_HOLDERS = createAsyncHandlers('EMAIL_TICKET_HOLDERS', {
	success(state, action) {
		return state
	}
})

export default handleActions({
	...FETCH_MC_LISTS,
	...CONNECT_TO_MAILCHIMP,
	...EMAIL_TICKET_HOLDERS,
}, initialState)

