import _ from 'lodash'
import {Map} from 'immutable'

import {handleActions} from 'redux-actions'
import {createAsyncHandlers} from '../actions'

const initialState = Map({
  collection: Map(),
  selected : null
})

const addBrand = {
  success(state, action) {
    const brand = _.get(action, 'payload.data')
    const id = _.get(brand, 'id')

    return state.withMutations(map => {
      map
        .set('selected', brand)
        .setIn(['collection', id], brand)
    })
  }
}

const FETCH_BRAND = createAsyncHandlers('FETCH_BRAND', addBrand)
const CREATE_BRAND = createAsyncHandlers('CREATE_BRAND', addBrand)
const UPDATE_BRAND = createAsyncHandlers('UPDATE_BRAND', addBrand)
const UPDATE_BRAND_PAYMENT = createAsyncHandlers('UPDATE_BRAND_PAYMENT', addBrand)

export default handleActions({
  ...CREATE_BRAND,
  ...UPDATE_BRAND,
  ...UPDATE_BRAND_PAYMENT,
  ...FETCH_BRAND
}, initialState)

