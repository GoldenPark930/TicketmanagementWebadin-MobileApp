import _ from 'lodash'
import {handleAction, handleActions} from 'redux-actions'
import {fromJS, OrderedSet, Map, Set} from 'immutable'
import {createAsyncHandlers} from '../actions'

const initialState = Map({
  loading: Set(),
  byEvent: Map(),
  collection: Map(),
  errors: Map()
})

const FETCH_PROMOTIONS = createAsyncHandlers('FETCH_PROMOTIONS', {
  success(state, action) {    
    const {eid, promotions} = action.payload
    const data = promotions.data.$original.promotions
    const ids = _.map(data, 'id')
    const promotionsById = _.keyBy(data, 'id')    
    return state
      .mergeIn(['collection'], promotionsById)
      .setIn(['byEvent', eid], OrderedSet(ids))
  }
})

const CREATE_PROMOTION = createAsyncHandlers('CREATE_PROMOTION', {
  success(state, action) {
    // const {data} = action.payload
    // const pid = data.id    
    // const eid = _.get(data, '$relationships.event.id')
    // return state
    //   .setIn(['collection', pid], data)
    //   .updateIn(['byEvent', eid], OrderedSet(), ps => ps.add(pid))
    return state
  }
})

const UPDATE_PROMOTION = createAsyncHandlers('UPDATE_PROMOTION', {
  success(state, action) {
    // const {data} = action.payload
    // const pid = data.id    
    // const eid = _.get(data, '$relationships.event.id')
    // return state
    //   .setIn(['collection', pid], data)  
    //   .updateIn(['byEvent', eid], OrderedSet(), ps => ps.add(pid))    
    return state
  }
})
export default handleActions({
  ...FETCH_PROMOTIONS,
  ...CREATE_PROMOTION,
  ...UPDATE_PROMOTION,
}, initialState)

