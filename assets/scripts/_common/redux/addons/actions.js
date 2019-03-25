import {createAsyncAction} from '../actions'
import {fetchAPI} from '../../core/http'
import {ERROR} from '../notification/actions'

const fetchEventAddons = createAsyncAction('FETCH_EVENT_ADDONS', function(eid) {
  return (dispatch) => {
    return fetchAPI(`/api/events/${eid}/relationships/add_ons`)
      .catch((err) => {
        dispatch(ERROR(...err.errors))
        dispatch(this.failed(err))
        throw err
      })
      .then((res) => {
        const out = {eid: eid, addons: res}
        dispatch(this.success(out))
        return res
      })
  }
})

const createAddon = createAsyncAction('CREATE_ADDON', function(eid, form) {
  const body = {
    data: {
      ...form,
      type: 'add_on',
      relationships: {
        event: {
          data: {type: 'event', id: eid}
        }
      }
    }
  }
  return (dispatch) => {
    return fetchAPI(`/api/add_ons`, {
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

const updateAddon = createAsyncAction('UPDATE_ADDON', function(tid, form) {
  const body = {
    data: {
      ...form,
      id: tid,
      type: 'add_on',
    }
  }
  return (dispatch) => {
    return fetchAPI(`/api/add_ons/${tid}`, {
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
  ...fetchEventAddons,
  ...createAddon,
  ...updateAddon,
}