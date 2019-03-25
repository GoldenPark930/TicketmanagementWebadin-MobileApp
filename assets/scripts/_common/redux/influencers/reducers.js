import _ from 'lodash'
import {handleAction, handleActions} from 'redux-actions'
import {fromJS, OrderedSet, Map, Set} from 'immutable'
import {createAsyncHandlers} from '../actions'

const initialState = Map({
  influencers: Map()
})

const FETCH_EVENT_INFLUENCERS = createAsyncHandlers('FETCH_EVENT_INFLUENCERS', {
  success(state, action) {
  	const {eid, influencers: {data}} = action.payload
    const ret = _.get(data, '$original')
    return state.set('influencers', fromJS(ret))
  }
})

export default handleActions({
  ...FETCH_EVENT_INFLUENCERS,
}, initialState)

