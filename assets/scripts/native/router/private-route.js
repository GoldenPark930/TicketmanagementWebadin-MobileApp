import React from 'react'
import PropTypes from 'prop-types'
import { Route, Redirect } from 'react-router-native'
import CPStandardLayout from './Root'

const TFPrivateRoute = ({
  component, hideHeader, hideFooter, hideSearchBar, ...rest
}) => {
  const render = (props) => {
    // if (auth.has('user')) {
      return <CPStandardLayout {...props} hideHeader={hideHeader} hideFooter={hideFooter} hideSearchBar={hideSearchBar} content={component} />
    // }
    return <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
  }

  return (
    <Route
      {...rest}
      render={render}
    />
  )
}

TFPrivateRoute.propTypes = {
  component: PropTypes.func,
  hideHeader: PropTypes.bool,
  hideFooter: PropTypes.bool,
  hideSearchBar: PropTypes.bool
}

export default TFPrivateRoute
