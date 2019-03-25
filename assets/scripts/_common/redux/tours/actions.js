import url from 'url'
import {createAction, createAsyncAction} from '../actions'
import {fetchAPI} from '../../core/http'
import {ERROR} from '../notification/actions'

const fetchTours = createAsyncAction('FETCH_TOURS', function() {
  return (dispatch) => {
    return fetchAPI('/api/tours')
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

const createTour = createAsyncAction('CREATE_TOUR', function(form) {
  return (dispatch) => {
    return fetchAPI('/api/tours', {
      method: 'POST',
      body: JSON.stringify({data: {...form, type: 'tour'}})
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

const fetchTour = createAsyncAction('FETCH_TOUR', function(id, query) {
  return (dispatch) => {
    return fetchAPI(url.format({pathname: `/api/tours/${id}`, query: query}))
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

const updateTour = createAsyncAction('UPDATE_TOUR', function(id, form) {
  const body = {
    data: {
      ...form,
      id: id,
      type: 'tour',
    }
  }
  return (dispatch) => {
    return fetchAPI(`/api/tours/${id}`, {
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

const CLEAR_SELECTED_TOUR = createAction('CLEAR_SELECTED_TOUR')

export default {
  ...fetchTours,
  ...fetchTour,
  ...createTour,
  ...updateTour,
  CLEAR_SELECTED_TOUR
}

