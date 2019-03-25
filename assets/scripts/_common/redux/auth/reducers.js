import _ from 'lodash'
import {handleActions} from 'redux-actions'
import {fromJS, List, Map, OrderedMap, Set} from 'immutable'
import {AsyncStorage} from 'react-native'
import {isWeb, isNative} from '../../core/utils'

import {createAsyncHandlers} from '../actions'

const initialState = Map({
  initialized: false,
  loading: Set(),
  errors: Map(),
})

const loadUser = (state, action) => {
  let data = _.get(action, 'payload.data')
  let user = fromJS(data)  
  if (user) {
    if (isNative()){
      AsyncStorage.setItem('demoAccount', data.demoAccount.toString())
    }else {
      localStorage.setItem('demoAccount', !!data.demoAccount)
    }
    user = user.updateIn(
      ['$relationships', 'organizations'],
      List(),
      l => l.sortBy(e => e.get('displayName')))
  }
  let next = initialState
    .set('initialized', true)
  if (user) {
    next = next.set('user', user)    
  }
  return next
}

const FETCH_SESSION = createAsyncHandlers('FETCH_SESSION', {
  success: loadUser
})

const LOGIN = createAsyncHandlers('LOGIN', {
  success: loadUser
})

const FACEBOOK_LOGIN = createAsyncHandlers('FACEBOOK_LOGIN', {
  success: loadUser
})

const LOGOUT = createAsyncHandlers('LOGOUT', {
  success: loadUser
})

const REGISTER = createAsyncHandlers('REGISTER', {
  success: loadUser
})

const UPDATE = createAsyncHandlers('UPDATE', {
  success: loadUser
})

export default handleActions({
  ...FETCH_SESSION,
  ...LOGIN,
  ...FACEBOOK_LOGIN,
  ...LOGOUT,
  ...REGISTER,
  ...UPDATE,
}, initialState)
