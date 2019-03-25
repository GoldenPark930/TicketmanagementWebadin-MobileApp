import {createAsyncAction} from '../actions'
import {fetchAPI} from '../../core/http'
import {ERROR} from '../notification/actions'

const fetchMailChimpLists = createAsyncAction('FETCH_MC_LISTS', function(eid) {
	let url = `/api/events/${eid}/relationships/mailchimp_lists/`
	return (dispatch) => {
		return fetchAPI(url)
			.catch((err) => {
				dispatch(ERROR(...err.errors))
				dispatch(this.failed(err))
				throw err
			})
			.then((res) => {
				const out = {eid: eid, mailchimp: res}
				dispatch(this.success(out))
				return res
			})
	}
})

const connectToMailChimp = createAsyncAction('CONNECT_TO_MAILCHIMP', function(id, type, return_uri) {
	const body = {
		data: {
			id: id,
			return_uri: return_uri,
			provider: 'mailchimp',
			type: type,
		}
	}
	return (dispatch) => {
		return fetchAPI(`/api/connect_account`, {
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

const emailTicketHolders = createAsyncAction('EMAIL_TICKET_HOLDERS', function(eid, form) {
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
		return fetchAPI(`/api/messaging/send_email`, {
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
	...fetchMailChimpLists,
	...connectToMailChimp,
	...emailTicketHolders
}
