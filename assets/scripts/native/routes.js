import _ from 'lodash'
import React from 'react'
import {IndexRoute, Redirect, Route, TabsRoute} from './router/react-router-native'

import {MainPage, LoginPage, HomePage, EventsPage,  EventPage, EventPerformance,
    LogoutPage, NewEventPage, Influencers, EventLikes, Inventory,
    Orders, CheckIn, EventAudienceDemographics, EventDetail, Tickets,  EventAudienceMusicStreaming, EventAudienceMusic,
    EventInvitation, GuestTickets, Venues, EventBuyerLocation, EventDevices,
     EventDashboard,
    EventMessaging, EventGaming, EventAudiencePsychographics,
    EventPromotion, NewBrandPage, BrandsPage, BrandDetails, BrandPage, BrandAudienceDemoGraphics, BrandAudienceMusic, BrandLikes, BrandAudienceMusicStreaming, AccountSettingsPage
} from './pages'

import fetchSession from '../_common/redux/auth/actions'

export default function ({dispatch, getState}) {
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
            dispatch(fetchSession.FETCH_SESSION()).then(check, check)
        }
    }

    const skipIfLoggedIn = (nextState, replace, cb) => {
        const check = () => {
            const {auth} = getState()
            const next = _.get(nextState, 'location.query.next', 'main/')
            if (auth.has('user')) {
                replace({pathname: next})
            }
            cb()
        }
        const auth = getState().auth
        if (auth.get('initialized')) {
            check()
        } else {
            dispatch(fetchSession.FETCH_SESSION()).then(check, check)
        }
    }
    return (
        <Route path='/' component={MainPage}>
            <IndexRoute component={HomePage} onEnter={requireLogin} />
            <TabsRoute path='signin' component={LoginPage} onEnter={skipIfLoggedIn} />
            <TabsRoute path='signout' component={LogoutPage} />
            <TabsRoute path='account' component={AccountSettingsPage} />
            <TabsRoute path='brands' component={BrandsPage} />
            <TabsRoute path='brands/new' component={NewBrandPage} />
            <Route path='brand/:id' component={BrandPage}>
                <TabsRoute path='details' component={BrandDetails} />
                <TabsRoute path='demographics' component={BrandAudienceDemoGraphics} />
                <TabsRoute path='music' component={BrandAudienceMusic} />
                <TabsRoute path='musicstreaming' component={BrandAudienceMusicStreaming} />
                <TabsRoute path='likes' component={BrandLikes} />
            </Route>
            <TabsRoute path='events' component={EventsPage} />
            <TabsRoute path='events/new' component={NewEventPage} />
            <Route path='event/:id' component={EventPage}>
                <IndexRoute component={EventDashboard} />
                <TabsRoute path='performance' component={EventPerformance} />
                <TabsRoute path='influencers' component={Influencers} />
                <TabsRoute path='orders' component={Orders} />
                <TabsRoute path='checkin' component={CheckIn} />
                <TabsRoute path='demographics' component={EventAudienceDemographics} />
                <TabsRoute path='details' component={EventDetail} />
                <TabsRoute path='tickets' component={Tickets} />
                <TabsRoute path='venues' component={Venues} />

                <TabsRoute path='music' combponent={EventAudienceMusic} />
                <TabsRoute path='musicstreaming' component={EventAudienceMusicStreaming} />
                <TabsRoute path='likes' component={EventLikes} />

                <TabsRoute path ='invitations' component={EventInvitation}/>
                <TabsRoute path='guest-tickets' component={GuestTickets} />
                <TabsRoute path='messaging' component={EventMessaging} />
                <TabsRoute path="geographics" component={EventBuyerLocation} />
                <TabsRoute path='psychographics' component={EventAudiencePsychographics} />
                <TabsRoute path="devices" component={EventDevices} />
                <TabsRoute path='gaming' component={EventGaming} />
                <TabsRoute path="promotions" component={EventPromotion} />
            </Route>
        </Route>
    )
}
