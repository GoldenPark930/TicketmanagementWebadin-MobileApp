import {createHistory} from 'history'
import React from 'react'
import ReactDOM from 'react-dom'
import {Provider} from 'react-redux'
import {Router, Route, browserHistory} from 'react-router'

import './../_common/core/fb'
import './../_common/core/magics'
import './../_common/core/form_helper'
import store from './../_common/redux/store'
import getRoutes from './routes'

import './_library/Preloader'

Pace.once('hide', () => {
  $('#pace-loader').removeClass('pace-big').addClass('pace-small')
})

ReactDOM.render(
  <Provider store={store}>
    <Router history={browserHistory} onUpdate={() => window.scrollTo(0, 0)}>{getRoutes(store)}</Router>
  </Provider>
, document.getElementById('app'))
