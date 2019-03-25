import {createAsyncAction} from '../actions'
import {fetchAPI} from '../../core/http'
import {ERROR} from '../notification/actions'

const fetchEventInfluencers = createAsyncAction('FETCH_EVENT_INFLUENCERS', function(eid) {
  return (dispatch) => {
    return fetchAPI(`/api/events/${eid}/relationships/referrals/`)
      .catch((err) => {
        dispatch(ERROR(...err.errors))
        dispatch(this.failed(err))
        throw err
      })
      .then((res) => {
        const out = {eid: eid, influencers: res}
        dispatch(this.success(out))
        return res
      })
  }
})


export default {
  ...fetchEventInfluencers
}

