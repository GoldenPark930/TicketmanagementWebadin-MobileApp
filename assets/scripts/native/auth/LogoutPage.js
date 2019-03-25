import React, {
    Component, PropTypes
} from 'react'
import {connect} from 'react-redux'
import {routeActions} from 'react-router-redux'
class LogoutPage extends Component {
    componentDidMount() {
        this.props.replace('/')
    }
    render() {
        return null
    }
}

export default connect((state) => ({}),{replace: routeActions.replace})(LogoutPage)
