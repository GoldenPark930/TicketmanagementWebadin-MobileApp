import {applyMiddleware, compose, createStore, combineReducers} from 'redux'
import promise from 'redux-promise'
import {reducer as formReducer} from '../../native/router/redux-form'
import {nativeHistory} from 'react-router-native'
import {syncHistory, routeReducer} from 'react-router-redux'
import thunk from 'redux-thunk'

import {loadingReducer} from './actions'

const logger = store => next => action => {
    //console.group(action.type)
    let result = next(action)
    //console.groupEnd(action.type)
    return result
}

import auth from './auth/reducers'
import events from './events/reducers'
import publishing from './publishing/reducers'
import tickets from './tickets/reducers'
import navigation from './navigation/reducers'
import notifications from './notification/reducers'
import brands from './brands/reducers'
import performance from './performance/reducers'
import influencers from './influencers/reducers'
import audience from './audience/reducers'
import mailchimp from './mailchimp/reducers'
import promotions from './promotion/reducers'
import invitations from './invitation/reducers'
import emailtemplates from './emailtemplates/reducers'
import orders from './orders/reducers'
import buyerlocation from './buyerlocation/reducers'
import addons from './addons/reducers'
import tours from './tours/reducers'

const debug = process.env.NODE_ENV !== 'production'

const routerMiddleware = syncHistory(nativeHistory)

let enhancers = [
    applyMiddleware(...[thunk, debug && logger, promise, routerMiddleware].filter(Boolean)),
].filter(Boolean)

let factory = compose(...enhancers)(createStore)

const store = factory(combineReducers({
    loading: loadingReducer,
    routing: routeReducer,
    form: formReducer,
    navigation: navigation,
    notifications: notifications,
    auth: auth,
    brands: brands,
    events: events,
    tickets: tickets,
    publishing: publishing,
    performance: performance,
    influencers: influencers,
    audience: audience,
    mailchimp: mailchimp,
    promotions: promotions,
    invitations: invitations,
    emailtemplates: emailtemplates,
    orders: orders,
    buyerlocation: buyerlocation,
    addons: addons,
    tours: tours
}))

nativeHistory.push('/')
routerMiddleware.listenForReplays(store)

export default store
