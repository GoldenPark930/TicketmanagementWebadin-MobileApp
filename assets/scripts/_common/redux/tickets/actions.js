import {createAsyncAction} from '../actions'
import {fetchAPI} from '../../core/http'
import {ERROR} from '../notification/actions'

const fetchEventTickets = createAsyncAction('FETCH_EVENT_TICKETS', function(eid) {
  return (dispatch) => {
    return fetchAPI(`/api/events/${eid}/relationships/tickets`)
      .catch((err) => {
        dispatch(ERROR(...err.errors))
        dispatch(this.failed(err))
        throw err
      })
      .then((res) => {
        const out = {eid: eid, tickets: res}
        dispatch(this.success(out))
        return res
      })
  }
})

const createTicket = createAsyncAction('CREATE_TICKET', function(eid, form) {
  const body = {
    data: {
      ...form,
      type: 'ticket',
      relationships: {
        event: {
          data: {type: 'event', id: eid}
        }
      }
    }
  }
  return (dispatch) => {
    return fetchAPI(`/api/tickets`, {
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

const updateTicket = createAsyncAction('UPDATE_TICKET', function(tid, form) {
  const body = {
    data: {
      ...form,
      id: tid,
      type: 'ticket',
    }
  }
  return (dispatch) => {
    return fetchAPI(`/api/tickets/${tid}`, {
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

export default {
  ...fetchEventTickets,
  ...createTicket,
  ...updateTicket,
}

