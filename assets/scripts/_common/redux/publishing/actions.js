import {ERROR} from '../notification/actions'
import {createAsyncAction} from '../actions'
import {fetchAPI} from '../../core/http'

const fetchPublishStatus = createAsyncAction('FETCH_PUBLISH_STATUS', function(eventId) {
  return (dispatch) => {
    return fetchAPI(`/api/publishing/${eventId}`)
      .catch((err) => {
        dispatch(this.ERROR(...err.errors))
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
  ...fetchPublishStatus
}
