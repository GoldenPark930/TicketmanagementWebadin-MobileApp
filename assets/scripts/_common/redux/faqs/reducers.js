import _ from 'lodash'
import {handleAction, handleActions} from 'redux-actions'
import {fromJS, OrderedSet, Map, Set} from 'immutable'
import {createAsyncHandlers} from '../actions'

const initialState = Map({
  influencers: Map()
})

const FETCH_EVENT_FAQS = createAsyncHandlers('FETCH_EVENT_FAQS', {
  success(state, action) {
  	const {eid, faqs: {data}} = action.payload
    const ret = _.get(data, '$original')
    return state.set('faqs', fromJS(ret))
  }
})

export default handleActions({
  ...FETCH_EVENT_FAQS,
}, initialState)

