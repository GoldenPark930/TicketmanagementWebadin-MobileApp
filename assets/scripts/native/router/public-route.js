import React from 'react'
import PropTypes from 'prop-types'
import { Route } from 'react-router-native'
import TFStandardLayout from './Root'

const TFPublicRoute = ({
                           component, hideHeader, ...rest
                       }) => (
    <Route
        {...rest}
        render={
            props => (
                <TFStandardLayout
                    {...props}
                    hideHeader={hideHeader}
                    content={component}
                />
            )
        }
    />
)

TFPublicRoute.propTypes = {
    component: PropTypes.func,
    hideHeader: PropTypes.bool,
}
export default TFPublicRoute
