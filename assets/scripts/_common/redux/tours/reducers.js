import _ from 'lodash'
import {handleAction, handleActions} from 'redux-actions'
import {fromJS, Map, OrderedMap, Set} from 'immutable'
import {get, set} from 'lodash'
import {createAsyncHandlers} from '../actions'

const initialState = Map({
  initial: true,
  loading: Set(),
  total: 0,
  skip: 0,
  tours: OrderedMap(),
  selected: null,
  errors: Map()
})

const FETCH_TOURS = createAsyncHandlers('FETCH_TOURS', {
  success(state, action) {
    const {total, skip, data} = action.payload

    return state.withMutations(map => {
      map
        .set('initial', false)
        .set('total', total)
        .set('skip', skip)
        .set('tours', map.get('tours').withMutations((es) => {
          _.each(data, e => {
            es.set(e.id, fromJS(e))
          })
        }))
    })
  }
})

const FETCH_TOUR = createAsyncHandlers('FETCH_TOUR', {
  success(state, action) {
    const {data} = action.payload
    return state.set('selected', fromJS(data))
  }
})

const CREATE_TOUR = createAsyncHandlers('CREATE_TOUR', {
  success(state, action) {
    const tour = action.payload.data

    return state.withMutations(map => {
      map
        .set('initial', false)
        .set('total', map.get('total') + 1)
        .set('tours', map.get('tours').set(tour.id, fromJS(tour)))
    })
  }
})

const UPDATE_TOUR = createAsyncHandlers('UPDATE_TOUR', {
  success(state, action) {
    const tour = fromJS(action.payload.data)

    return state.withMutations(map => {
      const sid = map.getIn(['selected', 'id'], null)
      const eid = tour.get('id')
      map.set('tours', map.get('tours').set(eid, tour))
      if (sid && sid === eid) {
        map.set('selected', tour)
      }
    })
  }
})

const CLEAR_SELECTED_TOUR = handleAction('CLEAR_SELECTED_TOUR', (state) => {
  return state.set('selected', null)
}, initialState)

export default handleActions({
  ...FETCH_TOURS,
  ...FETCH_TOUR,
  ...CREATE_TOUR,
  ...UPDATE_TOUR,
  CLEAR_SELECTED_TOUR,
}, initialState)
