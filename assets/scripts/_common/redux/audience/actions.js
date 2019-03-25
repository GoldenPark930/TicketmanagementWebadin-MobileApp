import {createAsyncAction} from '../actions'
import {fetchAPI} from '../../core/http'
import {ERROR} from '../notification/actions'

const fetchAudience = createAsyncAction('FETCH_AUDIENCE', function(eid, type, section) {
  let url = `/api/audience/${eid}/`
  return (dispatch) => {
    return fetchAPI(url, { params : { type : type, section: section } })
      .catch((err) => {
        dispatch(ERROR(...err.errors))
        dispatch(this.failed(err))
        throw err
      })
      .then((res) => {
        const out = {eid: eid, audience: res, type: type, section: section}
        dispatch(this.success(out))
        return res
      })      
  }
})


export default {
  ...fetchAudience
}

