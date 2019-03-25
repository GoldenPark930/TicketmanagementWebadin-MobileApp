import {createAsyncAction} from '../actions'
import {fetchAPI} from '../../core/http'
import {ERROR} from '../notification/actions'

const fetchEventBuyerLocation = createAsyncAction('FETCH_EVENT_BUYERLOCATION', function(eid) {
  return (dispatch) => {
    return fetchAPI(`/api/events/${eid}/relationships/order_locations/`)
      .catch((err) => {
        dispatch(ERROR(...err.errors))
        dispatch(this.failed(err))
        throw err
      })
      .then((res) => {
        console.log('render = ', res)
        const out = {eid: eid, buyerlocation: res}
        dispatch(this.success(out))
        return res
      })
  }
})


export default {
  ...fetchEventBuyerLocation
}

