import React from 'react'

export default class LoadingPage extends React.Component {
  render() {
    return (
      <div className="jumbotron text-center">
        <h1>Loading...<br/><i className="fa fa-circle-o-notch fa-spin" /></h1>
      </div>
    )
  }
}
