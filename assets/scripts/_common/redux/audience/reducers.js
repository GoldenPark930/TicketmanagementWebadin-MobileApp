import _ from 'lodash'
import {handleAction, handleActions} from 'redux-actions'
import {fromJS, OrderedSet, Map, Set} from 'immutable'
import {createAsyncHandlers} from '../actions'

const initialState = Map({
  event: Map(),
  brand: Map()
})

const FETCH_AUDIENCE = createAsyncHandlers('FETCH_AUDIENCE', {
  success(state, action) {    
  	const {eid, audience: {data}, type, section} = action.payload
    const ret = _.get(data, '$original')

    return state.withMutations(map =>{
      map.set(type, map.get(type).set(section, fromJS(ret)))
    })
  }
})

export default handleActions({
  ...FETCH_AUDIENCE,
}, initialState)

