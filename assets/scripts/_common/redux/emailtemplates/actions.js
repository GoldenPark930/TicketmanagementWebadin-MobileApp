import {createAsyncAction} from '../actions'
import {fetchAPI} from '../../core/http'
import {ERROR} from '../notification/actions'

const fetchEmailTemplates = createAsyncAction('FETCH_EMAIL_TEMPLATES', function(eid) {
  return (dispatch) => {
    return fetchAPI(`/api/events/${eid}/relationships/email_templates`)
      .catch((err) => {
        dispatch(ERROR(...err.errors))
        dispatch(this.failed(err))
        throw err
      })
      .then((res) => {
        const out = {eid: eid, emailtemplates: res}
        dispatch(this.success(out))
        return res
      })
  }
})

const createEmailTemplate = createAsyncAction('CREATE_EMAIL_TEMPLATE', function(eid, form) {
  const body = {
    data: {
      ...form,
      type: 'email_templates',
      relationships: {
        event: {
          data: {type: 'event', id: eid}
        }
      }
    }
  }
  return (dispatch) => {
    return fetchAPI(`/api/email_templates`, {
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

const updateEmailTemplate = createAsyncAction('UPDATE_EMAIL_TEMPLATE', function(pid, eid, form) {
  const body = {
    data: {
      ...form,
      id: pid,
      type: 'email_template',
      relationships: {
        event: {
          data: {type: 'event', id: eid}
        }
      }
    }
  }
  return (dispatch) => {
    return fetchAPI(`/api/email_templates/${pid}`, {
      method: 'PATCH',
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
  ...fetchEmailTemplates,
  ...createEmailTemplate,
  ...updateEmailTemplate
}

