import {applyMiddleware, compose, createStore, combineReducers} from 'redux'
import promise from 'redux-promise'
import {reducer as formReducer} from 'redux-form'
import {browserHistory} from 'react-router'
import {syncHistory, routeReducer} from 'react-router-redux'
import thunk from 'redux-thunk'

import {loadingReducer} from './actions'
// import DevTools from '../web/_library/DevTools'

const logger = store => next => action => {
  console.group(action.type)
  console.info('dispatching', action)
  let result = next(action)
  console.log('next state', store.getState())
  console.groupEnd(action.type)
  return result
}

const reduxForm = store => next => action => {
  let result = next(action)
  let state = store.getState()
  if(action.type == 'redux-form/CHANGE'){
    let fields = form_helper_get()
    fields[action.field] = action.field
    form_helper_set(fields)    
  }else if(action.type == 'redux-form/STOP_SUBMIT'){
    if(action.errors == undefined || action.errors == null){
      form_helper_reset()
    }
  }else if(action.type == 'redux-form/DESTROY'){
    form_helper_reset()
  }
  return result
}

const debug = process.env.NODE_ENV !== 'production'

const routerMiddleware = syncHistory(browserHistory)
let enhancers = [
  applyMiddleware(...[thunk, debug && logger, reduxForm, promise, routerMiddleware].filter(Boolean)),
  null,
].filter(Boolean)

let factory = compose(...enhancers)(createStore)

const store = factory(combineReducers({
  loading: loadingReducer,
  routing: routeReducer,
  form: formReducer,
  navigation: require('./navigation/reducers'),
  notifications: require('./notification/reducers'),
  auth: require('./auth/reducers'),
  brands: require('./brands/reducers'),
  events: require('./events/reducers'),
  tickets: require('./tickets/reducers'),
  addons: require('./addons/reducers'),
  publishing: require('./publishing/reducers'),
  performance: require('./performance/reducers'),
  influencers: require('./influencers/reducers'),
  buyerlocation: require('./buyerlocation/reducers'),
  audience: require('./audience/reducers'),
  mailchimp: require('./mailchimp/reducers'),
  promotions: require('./promotion/reducers'),
  invitations: require('./invitation/reducers'),
  emailtemplates: require('./emailtemplates/reducers'),
  tours: require('./tours/reducers')
}))

routerMiddleware.listenForReplays(store)

export default store
