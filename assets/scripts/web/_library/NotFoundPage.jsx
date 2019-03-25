import React from 'react'

export default class NotFoundPage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
    document.title = 'The Ticket Fairy Dashboard'
  }
  render() {
    return (
      <div className="hold-transition skin-ttf sidebar-collapse">
        <div className="wrapper">
          <div className="content-wrapper">
            <div className="container-fluid">
              <div className="row">
                <div className="col-sm-6 col-sm-offset-3">
                  <h1>Page Not Found</h1>
                  <p>The page you requested does not exist</p>
                </div>
              </div>
            </div>
          </div>
          <footer className="main-footer">
            Copyright © 2018 <a href="https://www.theticketfairy.com">The Ticket Fairy</a>. All rights reserved.
          </footer>
        </div>
      </div>
    )
  }
}
