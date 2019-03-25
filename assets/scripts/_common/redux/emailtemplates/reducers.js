import _ from 'lodash'
import {handleAction, handleActions} from 'redux-actions'
import {fromJS, OrderedSet, Map, Set} from 'immutable'
import {createAsyncHandlers} from '../actions'

const initialState = Map({
  emailtemplates: Map()
})

const FETCH_EMAIL_TEMPLATES = createAsyncHandlers('FETCH_EMAIL_TEMPLATES', {
  success(state, action) {
    const {eid, emailtemplates: {data}} = action.payload
    const ret = _.get(data, '$original')
    return state.set('emailtemplates', fromJS(ret))
  }
})

const CREATE_EMAIL_TEMPLATE = createAsyncHandlers('CREATE_EMAIL_TEMPLATE', {
  success(state, action) {
    return state
  }
})

const UPDATE_EMAIL_TEMPLATE = createAsyncHandlers('UPDATE_EMAIL_TEMPLATE', {
  success(state, action) {
    return state
  }
})

export default handleActions({
  ...FETCH_EMAIL_TEMPLATES,
  ...CREATE_EMAIL_TEMPLATE,
  ...UPDATE_EMAIL_TEMPLATE
}, initialState)

