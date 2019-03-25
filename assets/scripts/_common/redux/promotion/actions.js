import {createAsyncAction} from '../actions'
import {fetchAPI} from '../../core/http'
import {ERROR} from '../notification/actions'

const fetchPromotions = createAsyncAction('FETCH_PROMOTIONS', function(eid) {
  return (dispatch) => {
    return fetchAPI(`/api/events/${eid}/relationships/promotions`)
      .catch((err) => {
        dispatch(ERROR(...err.errors))
        dispatch(this.failed(err))
        throw err
      })
      .then((res) => {
        const out = {eid: eid, promotions: res}
        dispatch(this.success(out))
        return res
      })
  }
})

const createPromotion = createAsyncAction('CREATE_PROMOTION', function(eid, form) {
  const body = {
    data: {
      ...form,
      type: 'promotion',
      relationships: {
        event: {
          data: {type: 'event', id: eid}
        }
      }
    }
  }
  return (dispatch) => {
    return fetchAPI(`/api/promotions`, {
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

const updatePromotion = createAsyncAction('UPDATE_PROMOTION', function(pid, eid, form) {
  const body = {
    data: {
      ...form,
      id: pid,
      type: 'promotion',
      relationships: {
        event: {
          data: {type: 'event', id: eid}
        }
      }
    }
  }
  return (dispatch) => {
    return fetchAPI(`/api/promotions/${pid}`, {
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
  ...fetchPromotions,
  ...createPromotion,
  ...updatePromotion,
}

