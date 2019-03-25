import url from 'url'
import {createAction, createAsyncAction} from '../actions'
import {fetchAPI} from '../../core/http'
import {ERROR} from '../notification/actions'

const fetchEvents = createAsyncAction('FETCH_EVENTS', function() {
  return (dispatch) => {
    return fetchAPI('/api/events')
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

const createEvent = createAsyncAction('CREATE_EVENT', function(form) {
  return (dispatch) => {
    return fetchAPI('/api/events', {
      method: 'POST',
      body: JSON.stringify({data: {...form, type: 'event'}})
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

const fetchEvent = createAsyncAction('FETCH_EVENT', function(id, query) {
  return (dispatch) => {
    return fetchAPI(url.format({pathname: `/api/events/${id}`, query: query}))
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

const updateEvent = createAsyncAction('UPDATE_EVENT', function(id, form) {
  const body = {
    data: {
      ...form,
      id: id,
      type: 'event',
    }
  }
  return (dispatch) => {
    return fetchAPI(`/api/events/${id}`, {
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

const UPDATE_EVENT_TICKET_STATISTICS = createAction('UPDATE_EVENT_TICKET_STATISTICS', stats => stats)

const CLEAR_SELECTED_EVENT = createAction('CLEAR_SELECTED_EVENT')

export default {
  ...fetchEvents,
  ...fetchEvent,
  ...createEvent,
  ...updateEvent,
  UPDATE_EVENT_TICKET_STATISTICS,
  CLEAR_SELECTED_EVENT
}

