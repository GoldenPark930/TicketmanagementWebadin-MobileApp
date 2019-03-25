import {createAsyncAction} from '../actions'
import {fetchAPI} from '../../core/http'
import {ERROR} from '../notification/actions'

const createBrand = createAsyncAction('CREATE_BRAND', function(form) {
  return (dispatch) => {
    return fetchAPI('/api/organizations', {
        method: 'POST',
        body: JSON.stringify({data: {...form, type: 'organization'}})
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

const updateBrand = createAsyncAction('UPDATE_BRAND', function(id, form) {
  const body = {
    data: {
      ...form,
      id: id,
      type: 'organization',
    }
  }
  return (dispatch) => {
    return fetchAPI(`/api/organizations/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body)
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

const updateBrand_payment = createAsyncAction('UPDATE_BRAND_PAYMENT', function(id, form) {
  const body = {
    data: {
      ...form,
      id: id,
      type: 'organization',
    }
  }
  return (dispatch) => {
    return fetchAPI(`/api/organizations/${id}`, {
        method: 'POST',
        body: JSON.stringify(body)
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

const fetchBrand = createAsyncAction('FETCH_BRAND', function(id) {
  return (dispatch) => {
    return fetchAPI(`/api/organizations/${id}`)
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
  ...createBrand,
  ...updateBrand,
  ...updateBrand_payment,
  ...fetchBrand
}
