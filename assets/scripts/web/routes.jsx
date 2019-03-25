import _ from 'lodash'
import React from 'react'
import {IndexRoute, Redirect, Route} from 'react-router'

import {FETCH_SESSION} from './../_common/redux/auth/actions'

import Root from './Root'
import HomePage from './_theme/HomePage'
import LoginPage from './auth/LoginPage'
import LogoutPage from './auth/LogoutPage'
import SignupPage from './auth/SignupPage'
import AccountSettingsPage from './auth/AccountSettingsPage'
import NotFoundPage from './_library/NotFoundPage'

import BrandsPage from './brands/BrandsPage'
import NewBrandPage from './brands/NewBrandPage'
import BrandPage from './brands/BrandPage'
import BrandDashboard from './brands/BrandDashboard'
import BrandDetails from './brands/BrandDetails'
import BrandPayments from './brands/BrandPayments'
import BrandAudienceDemoGraphics from './brands/BrandAudienceDemoGraphics'
import BrandAudienceMusic from './brands/BrandAudienceMusic'
import BrandAudienceMusicStreaming from './brands/BrandAudienceMusicStreaming'
import BrandLikes from './brands/BrandLikes'
import BrandEventTemplates from './brands/BrandEventTemplates'

import EventsPage from './events/EventsPage'
import NewEventPage from './events/NewEventPage'
import EventPage from './events/EventPage'
import EventDashboard from './events/EventDashboard'
import EventPerformance from './events/EventPerformance'
import EventDetails from './events/EventDetails'
import Venues from './events/Venues'
import Tickets from './events/Tickets'
import Orders from './events/Orders'
import Inventory from './events/Inventory'
import EventMessaging from './events/EventMessaging'
import EventInvitation from './events/EventInvitation'
import CheckIn from './events/CheckIn'
import Influencers from './events/Influencers'
import GuestTickets from './events/GuestTickets'
import EventLikes from './events/EventLikes'
import EventGaming from './events/EventGaming'
import EventFAQ from './events/EventFAQ'
import EventPromotion from './events/EventPromotion'
import EventAudienceDemographics from './events/EventAudienceDemographics'
import EventAudienceMusic from './events/EventAudienceMusic'
import EventAudienceMusicStreaming from './events/EventAudienceMusicStreaming'
import EventAudiencePsychographics from './events/EventAudiencePsychographics'
import EventBuyerLocation from './events/EventBuyerLocation'
import EventDevices from './events/EventDevices'

import ToursPage from './tours/ToursPage'
import NewTourPage from './tours/NewTourPage'
import TourPage from './tours/TourPage'
import TourDetails from './tours/TourDetails'

export default function({dispatch, getState}) {
  const requireLogin = (nextState, replace, cb) => {
    const check = () => {
      const {auth} = getState()
      if (!auth.has('user')) {
        replace({pathname: '/signin', query: {next: '/events'}})
      }
      cb()
    }
    const auth = getState().auth
    if (auth.get('initialized')) {
      check()
    } else {
      dispatch(FETCH_SESSION()).then(check, check)
    }
  }

  const skipIfLoggedIn = (nextState, replace, cb) => {
    const check = () => {
      const {auth} = getState()
      const next = _.get(nextState, 'location.query.next', '/')
      if (auth.has('user')) {
        replace({pathname: next})
      }
      cb()
    }
    const auth = getState().auth
    if (auth.get('initialized')) {
      check()
    } else {
      dispatch(FETCH_SESSION()).then(check, check)
    }
  }

  return (
    <Route path="/" component={Root}>
      <IndexRoute component={HomePage} onEnter={requireLogin} />
      <Route path="signin" component={LoginPage} onEnter={skipIfLoggedIn} />
      <Route path="signup" component={SignupPage} onEnter={skipIfLoggedIn} />
      <Route path="signout" component={LogoutPage} />
      <Route onEnter={requireLogin}>
        <Route path="account" component={AccountSettingsPage} />
        <Route path="brands" component={BrandsPage}  />
        <Route path="brands/new" component={NewBrandPage} />
        <Route path="brand/:id" component={BrandPage}>
          <IndexRoute component={BrandDashboard} />          
          <Route path="details" component={BrandDetails} />
          <Route path="payments" component={BrandPayments} />
          <Route path="teams" component={NotFoundPage} />
          <Route path="demographics" component={BrandAudienceDemoGraphics} />
          <Route path="music" component={BrandAudienceMusic} />
          <Route path="musicstreaming" component={BrandAudienceMusicStreaming} />
          <Route path="likes" component={BrandLikes} />
          <Route path="templates" component={BrandEventTemplates} />
        </Route>
        <Route path="events" component={EventsPage}  />
        <Route path="events/new" component={NewEventPage} />
        <Route path="event/:id" component={EventPage}>
          <IndexRoute component={EventDashboard} />
          <Route path="details" component={EventDetails} />
          <Route path="venues" component={Venues} />
          <Route path="tickets" component={Tickets} />
          <Route path="performance" component={EventPerformance} />
          <Route path="influencers" component={Influencers} />
          <Route path="demographics" component={EventAudienceDemographics} />
          <Route path="psychographics" component={EventAudiencePsychographics} />
          <Route path="likes" component={EventLikes} />
          <Route path="music" component={EventAudienceMusic} />
          <Route path="musicstreaming" component={EventAudienceMusicStreaming} />
          <Route path="gaming" component={EventGaming} />          
          <Route path="messaging" component={EventMessaging} />          
          <Route path="invitations" component={EventInvitation} />
          <Route path="checkin" component={CheckIn} />          
          <Route path="orders" component={Orders} />
          <Route path="inventory" component={Inventory} />          
          <Route path="guest-tickets" component={GuestTickets} />         
          <Route path="faq" component={EventFAQ} />
          <Route path="promotions" component={EventPromotion} />
          <Route path="geographics" component={EventBuyerLocation} />
          <Route path="devices" component={EventDevices} />
        </Route>
        <Route path="tours" component={ToursPage}  />
        <Route path="tours/new" component={NewTourPage} />
        <Route path="tour/:id" component={TourPage}>
          <Route path="details" component={TourDetails} />
        </Route>
      </Route>
      <Route path="shortlinks" component={NotFoundPage} />      
      <Redirect from="event" to="events" />
    </Route>
  )
}
