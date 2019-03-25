import React from 'react'
export default class Footer extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      version: 0
    }
  }
  componentDidMount() {
    this.setState({
      version: document.getElementsByTagName('body')[0].getAttribute('data-version')
    })
  }
  render() {
    return (
      <div className='footer-bar'>
        <div>Copyright &copy; 2018 <a href="https://www.theticketfairy.com">THE<strong>TICKET</strong>FAIRY</a></div>
        <div>
          <a href='https://www.facebook.com/theticketfairy' target='_blank' style={{marginRight:15}}>
            <img src={asset('/assets/resources/images/icon-facebook.png')} width='20' height='20'/>
          </a>
          <a href='https://twitter.com/theticketfairy' target='_blank'>
            <img src={asset('/assets/resources/images/icon-twitter.png')} width='20' height='20'/>
          </a>
          {/*
          <a href='#'>
            <img src={asset('/assets/resources/images/icon-google.png')} width='20' height='20'/>
          </a>
          */
          }
        </div>
      </div>
    )
  }
}
