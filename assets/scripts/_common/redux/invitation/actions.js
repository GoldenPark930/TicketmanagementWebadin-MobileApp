import {createAsyncAction} from '../actions'
import {fetchAPI} from '../../core/http'
import {ERROR} from '../notification/actions'

const sendInvitations = createAsyncAction('SEND_INVITATIONS', function(eid, form) {
	const body = {
		data: {
			...form,
			relationships: {
				event: {
				data: {type: 'event', id: eid}
				}
			}
		}
	}
	return (dispatch) => {
		return fetchAPI(`/api/invitations`, {
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

const fetchInvitations = createAsyncAction('FETCH_INVITATIONS', function(eid) {
  return (dispatch) => {
    return fetchAPI(`/api/events/${eid}/relationships/invitations`)
      .catch((err) => {
        dispatch(ERROR(...err.errors))
        dispatch(this.failed(err))
        throw err
      })
      .then((res) => {
        const out = {eid: eid, invitations: res}
        dispatch(this.success(out))
        return res
      })
  }
})

export default {
	...sendInvitations,
	...fetchInvitations
}
