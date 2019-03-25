import {createAsyncAction} from '../actions'
import {fetchAPI} from '../../core/http'
import {ERROR} from '../notification/actions'
import {isWeb, isNative} from '../../core/utils'
import { AsyncStorage } from 'react-native'

const fetchSession = createAsyncAction('FETCH_SESSION', function() {
  return (dispatch) => {
    return fetchAPI('/api/authenticate')
      .catch((err) => {
        dispatch(ERROR(...err.errors))
        dispatch(this.failed(err))
        throw err
      })
      .then((res) => {
        dispatch(this.success(res))
        return res
      })
  }
})

const login = createAsyncAction('LOGIN', function(form) {
  return (dispatch) => {
    return fetchAPI('/api/authenticate', {
      method: 'POST',
      body: JSON.stringify({data: {
        type: 'sessionrequest',
        ...form
      }})
    })
    .catch((err) => {
      dispatch(ERROR(...err.errors))
      dispatch(this.failed(err))
      throw err
    })
    .then((res) => {
      dispatch(this.success(res))
      return res
    })
  }
})

const fblogin = createAsyncAction('FACEBOOK_LOGIN', function(form) {
  return (dispatch) => {
    return fetchAPI('/api/fbauthenticate', {
      method: 'POST',
      body: JSON.stringify({data: {
        type: 'fbsessionrequest',
        ...form
      }})
    })
    .catch((err) => {
      dispatch(ERROR(...err.errors))
      dispatch(this.failed(err))
      throw err
    })
    .then((res) => {
      dispatch(this.success(res))
      return res
    })
  }
})

const logout = createAsyncAction('LOGOUT', function(form) {
  isWeb() ? localStorage.setItem('demoAccount', false) : AsyncStorage.setItem('demoAccount', 'false')
  return (dispatch) => {
    return fetchAPI('/api/authenticate', {
      method: 'DELETE'
    })
    .catch((err) => {
      dispatch(ERROR(...err.errors))
      dispatch(this.failed(err))
      throw err
    })
    .then((res) => {
      dispatch(this.success(res))
      return res
    })
  }
})

const register = createAsyncAction('REGISTER', function(form) {
  return (dispatch) => {
    return fetchAPI('/api/users', {
      method: 'POST',
      body: JSON.stringify({data: {type: 'user', ...form}})
    })
    .catch((err) => {
      dispatch(ERROR(...err.errors))
      dispatch(this.failed(err))
      throw err
    })
    .then((res) => {
      dispatch(this.success(res))
      return res
    })
  }
})

const update = createAsyncAction('UPDATE', function(form) {
  return (dispatch) => {
    return fetchAPI('/api/authenticate', {
      method: 'PATCH',
      body: JSON.stringify({data: {type: 'user', ...form}})
    })
    .catch((err) => {
      dispatch(ERROR(...err.errors))
      dispatch(this.failed(err))
      throw err
    })
    .then((res) => {
      dispatch(this.success(res))
      return res
    })
  }
})

export default {
  ...fetchSession,
  ...login,
  ...fblogin,
  ...logout,
  ...register,
  ...update,
}
