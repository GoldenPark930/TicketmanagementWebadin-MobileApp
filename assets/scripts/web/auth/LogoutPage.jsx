import {connect} from 'react-redux'
import React from 'react'
import {routeActions} from 'react-router-redux'

@connect(
  () => ({}),
  {replace: routeActions.replace}
)
export default class LogoutPage extends React.Component {
  componentDidMount() {
    this.props.replace('/')
  }
  render() {
    return null
  }
}
