import {createAsyncAction} from '../actions'
import {fetchAPI} from '../../core/http'
import {ERROR} from '../notification/actions'

const fetchEventFAQs = createAsyncAction('FETCH_EVENT_FAQS', function(eid) {
  return (dispatch) => {
    return fetchAPI(`/api/events/${eid}/relationships/faqs/`)
      .catch((err) => {
        dispatch(ERROR(...err.errors))
        dispatch(this.failed(err))
        throw err
      })
      .then((res) => {
        const out = {eid: eid, faqs: res}
        dispatch(this.success(out))
        return res
      })
  }
})


export default {
  ...fetchEventFAQs
}

