import React from 'react'
import {Link} from 'react-router'

import Notifications from './../_library/notifications/Notifications'

import classNames from 'classnames'
import {connect} from 'react-redux'
import {routeActions} from 'react-router-redux'

@connect(
  (state) => {
    const u = state.auth.get('user')
    return {
      user: u ? u.toJS() : null
    }
  },
  {push: routeActions.push}
)
export default class HomePage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {isBrand: false}
    document.title = 'Home - The Ticket Fairy Dashboard'
  }
  gotoAction(url, e) {
    e.preventDefault()
    e.stopPropagation()
    const {push} = this.props
    push(url)
  }
  onSelectType(e) {
    var id = e.target.id
    this.setState({isBrand: id == 'brands'})
  }
  goToBrands(e) {

    const {push} = this.props
    push('/brands')
  }
  goToBrandNew(e) {
    e.stopPropagation()
    const {push} = this.props
    push('/brands/new')
  }
  goToEvents(e) {
    const {push} = this.props
    push('/events')
  }
  goToEventNew(e){
    e.stopPropagation()
    const {push} = this.props
    push('/events/new')
  }
  render() {
    const {user} = this.props
    const displayName = !!user ? user.firstName : ''
    let {isBrand} = this.state
    return (
      <div className='body-main'> 
        <Notifications />
        <div className='body-panel-spacing res'/>
        <div className='text-center'>
          <h2 style={{color:'white'}}>Welcome to THE<strong>TICKET</strong>FAIRY</h2>
          <h4>What would you like to do today, {displayName}?</h4>
          <div className="res" style={{height:80}}/>
          <div className='accordion'>
            <div className="manage_brands" onClick={::this.goToBrands}>
              <div className="tab_content">
                <div className='tab_button' onClick={::this.goToBrandNew}>
                  <img src = {asset('/assets/resources/images/btn-add.png')}/>
                </div>
                <div className='tab_label'>
                  <div className='type'> Manage Brands</div>
                  <div className='description'> Create and manage your brands</div>
                </div>
              </div>
              <div className="tab_icon">
                <img src = {asset('/assets/resources/images/icon-main-brand.png')}/>
              </div>
            </div>
            {/*
            <div className="manage_team_members">
              <div className="tab_content">
                <div className='tab_button'>
                  <img src = {asset('/assets/resources/images/btn-add.png')}/>
                </div>
                <div className='tab_label'>
                  <div className='type'> Manage Team Members</div>
                  <div className='description'> Create and manage your team</div>
                </div>
              </div>
              <div className="tab_icon">
                <img src = {asset('/assets/resources/images/icon-main-team.png')}/>
                <div className='icon_label'>
                  <div className='type'> Not Just Yet...</div>
                  <div className='description'> But soon!</div>
                </div>
              </div>
            </div>
            <div className="manage_ad_accounts">
              <div className="tab_content">
                <div className='tab_button'>
                  <img src = {asset('/assets/resources/images/btn-add.png')}/>
                </div>
                <div className='tab_label'>
                  <div className='type'> Manage Ad Accounts</div>
                  <div className='description'> Create and manage your ad accounts</div>
                </div>
              </div>
              <div className="tab_icon">
                <img src = {asset('/assets/resources/images/icon-main-ads.png')}/>
                <div className='icon_label'>
                  <div className='type'> Not Just Yet...</div>
                  <div className='description'> But soon!</div>
                </div>
              </div>
            </div>
            <div className="manage_tours">
              <div className="tab_content">
                <div className='tab_button'>
                  <img src = {asset('/assets/resources/images/btn-add.png')}/>
                </div>
                <div className='tab_label'>
                  <div className='type'> Manage Tours</div>
                  <div className='description'> Create and manage your tours</div>
                </div>
              </div>
              <div className="tab_icon">
                <img src = {asset('/assets/resources/images/icon-main-tour.png')}/>
                <div className='icon_label'>
                  <div className='type'> Not Just Yet...</div>
                  <div className='description'> But soon!</div>
                </div>
              </div>
            </div>
            */}
            <div className="manage_events" onClick={::this.goToEvents}>
              <div className="tab_content">
                <div className='tab_button' onClick={::this.goToEventNew}>
                  <img src = {asset('/assets/resources/images/btn-add.png')}/>
                </div>
                <div className='tab_label'>
                  <div className='type'> Manage Events</div>
                  <div className='description'> Create and manage your events</div>
                </div>
              </div>
              <div className='tab_icon'>
                <img src = {asset('/assets/resources/images/icon-main-event.png')}/>
              </div>
            </div>            
          </div>
        </div>
      </div>
    )
  }
}