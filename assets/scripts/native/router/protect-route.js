import React from 'react'
import {connect} from 'react-redux'
import {routerActions} from 'react-router-redux'
import PropTypes from 'prop-types'
import { Route, Redirect } from 'react-router-native'
import TFStandardLayout from './Root'

const TFProtectRoute = ({
  component, hideHeader, hideFooter, hideSearchBar, ...rest
}) => {
  const render = (props) => {
    // if (auth.has('user')) return <Redirect to={{ pathname: '/', state: { from: props.location } }} />

    return <TFStandardLayout {...props} hideHeader={hideHeader} hideFooter={hideFooter} hideSearchBar={hideSearchBar} content={component} />
  }

  return (
    <Route
      {...rest}
      render={render}
    />
  )
}

TFProtectRoute.propTypes = {
  component: PropTypes.func,
  hideHeader: PropTypes.bool,
  hideFooter: PropTypes.bool,
  hideSearchBar: PropTypes.bool
}
// export default connect(state => {
//     console.log('=====auth', state.auth)
//     return {
//
//     }
// }, {push: routerActions.replace, replace: routerActions.replace})(TFProtectRoute)
export default TFProtectRoute
