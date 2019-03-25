import {createAsyncAction} from '../actions'
import {fetchAPI} from '../../core/http'
import {ERROR} from '../notification/actions'

const fetchEventOrders = createAsyncAction('FETCH_EVENT_ORDERS', function(eid) {console.log('Started FETCH_EVENT_ORDERS')
  return (dispatch) => {
    return fetchAPI(`/api/events/${eid}/relationships/orders/`)
      .catch((err) => {
        dispatch(ERROR(...err.errors))
        dispatch(this.failed(err))
        throw err
      })
      .then((res) => {console.log('FETCH_EVENT_ORDERS result', res)
        const out = {eid: eid, orders: res}
        dispatch(this.success(out))
        return res
      })
  }
})

const resendOrder = createAsyncAction('RESEND_ORDER', function(eid, form) {
  return (dispatch) => {
    return fetchAPI('/api/resend_order', {
      method: 'POST',
      body: JSON.stringify(
        {
          data: {
            ...form, 
            relationships: {
              event: {
                data: {
                  id: eid,
                  type: 'event'
                }
              }
            }
          }
        })
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
  ...fetchEventOrders,
  ...resendOrder
}

