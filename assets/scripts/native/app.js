import React from 'react'
import {Provider} from 'react-redux'
import {Router, nativeHistory} from './router/react-router-native'

import store from '../_common/redux/store_native'
import getRoutes from './routes'

export default () => (
    <Provider store={store}>
        <Router history={nativeHistory}>{getRoutes(store)}</Router>
    </Provider>
)
