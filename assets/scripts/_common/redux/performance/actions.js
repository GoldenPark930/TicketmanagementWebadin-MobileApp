import {createAsyncAction} from '../actions'
import {fetchAPI} from '../../core/http'
import {ERROR} from '../notification/actions'

const fetchEventPerformance = createAsyncAction('FETCH_EVENT_PERFORMANCE', function(eid) {
  return (dispatch) => {
    return fetchAPI(`/api/events/${eid}/relationships/performance/`)
      .catch((err) => {
        dispatch(ERROR(...err.errors))
        dispatch(this.failed(err))
        throw err
      })
      .then((res) => {
        const out = {eid: eid, performance: res}
        dispatch(this.success(out))
        return res
      })
  }
})

const fetchEventDemographics = createAsyncAction('FETCH_EVENT_DEMOGRAPHICS', function(eid) {
  return (dispatch) => {
    return fetchAPI(`/api/events/${eid}/relationships/demographics/`)
      .catch((err) => {
        dispatch(ERROR(...err.errors))
        dispatch(this.failed(err))
        throw err
      })
      .then((res) => {
        const out = {eid: eid, performance: res}
        dispatch(this.success(out))
        return res
      })
  }
})

const fetchEventCheckIn = createAsyncAction('FETCH_EVENT_CHECKIN', function(eid) {
  return (dispatch) => {
    return fetchAPI(`/api/events/${eid}/relationships/check_in/`)
      .catch((err) => {
        dispatch(ERROR(...err.errors))
        dispatch(this.failed(err))
        throw err
      })
      .then((res) => {
        const out = {eid: eid, performance: res}
        dispatch(this.success(out))
        return res
      })
  }
})

export default {
  ...fetchEventPerformance,
  ...fetchEventDemographics,
  ...fetchEventCheckIn
}

