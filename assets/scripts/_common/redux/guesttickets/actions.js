import {createAsyncAction} from '../actions'
import {fetchAPI} from '../../core/http'
import {ERROR} from '../notification/actions'

const uploadGuestTickets = createAsyncAction('UPLOAD_GUESTTICKETS', function(eid, recipients) {
	const body = {
		data: {
			recipients: recipients,
			relationships: {
				event: {
					data: {
						id: eid,
						type: 'event'
					}
				}
			}
		}
	}
	return (dispatch) => {
		return fetchAPI(`/api/guest_tickets`, {
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

export default {
	...uploadGuestTickets
}