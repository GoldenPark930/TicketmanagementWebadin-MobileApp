import React, {
    Component, PropTypes
} from 'react'
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Image,
    ListView,
    Dimensions
} from 'react-native'
import {connect} from 'react-redux'
import {routeActions} from 'react-router-redux'
import {header} from '../../native/styles'
import Icon from 'react-native-vector-icons/FontAwesome'
import DeviceInfo from 'react-native-device-info'
import _ from 'lodash'

import session from '../../_common/redux/auth/actions'
import { MenuItem, EVENT_STATISTICS, EVENT_EDIT, EVENT_INTERACT, FUNC_CHECKPAGE } from './MenuItem'
const {height, width} = Dimensions.get('window')
const deviceWidth = width

class HeaderNavigation extends Component {
    constructor(props){
        super(props)
        this.activeSlideNumber = -1
        this.totalSlideNumber = 0
        this.scrollDrag = false
        this.state={
          x: 0,
          getWidth: 0
        }
    }
    componentWillMount() {
      this.getVisibleSlideCount()
    }
    getVisibleSlideCount() {
      let width = deviceWidth
      if(width < 376)	return 2
      else if(width < 641) return 3
      else if(width < 769) return 4
      else return 0
    }
    getMenuGroup(){
      const activeItem = this.props.active || ''
      const {event, navigation, brand} = this.props
      const type = navigation.sidebarType || 'main'
      const path = navigation.path
      const isEvent = path.indexOf('/event') >= 0
      const isBrand = path.indexOf('/brand') >= 0
      const isHome = !(isEvent || isBrand)
      let itemID = '', page = '', loading= false
      if(isEvent){
        if(path == '/events')
          itemID = ''
        else
          itemID = !!event ? event.id : ''
        page = itemID != '' ? path.replace(`/event/${itemID}/`, '') : ''
        loading = !event ? true : false
      }
      if(isBrand){
        if(path == '/brands')
          itemID = ''
        else
          itemID = !!brand ? brand.id : ''
        page = itemID != '' ? path.replace(`/brand/${itemID}/`, '') : ''
        loading = !brand ? true : false
      }

      const isEventsPage = navigation.path == '/events'
      const isNewEventPage = navigation.path == '/events/new'
      const isBrandsPage = navigation.path == '/brands'
      const isNewBrandPage = navigation.path == '/brands/new'

      let permission = null
      let enablePromotions = false
      if(isEvent && !isNewEventPage && itemID != '' && !loading){
        permission = event.$relationships.self.role
        enablePromotions = event.$original.enablePromotions
      }

      const ENABLEPROMOTIONS = enablePromotions
      const PERMISSION_ALL = true
      const PERMISSION_ADMIN = permission == 'admin'
      const PERMISSION_STATS = PERMISSION_ADMIN || permission == 'stats' || permission == 'limited_stats'
      const PERMISSION_ONSITE = PERMISSION_ADMIN || permission == 'onsite'
      const PERMISSION_CURATOR = PERMISSION_ADMIN || permission == 'curator'

      let menuGroup = []
      if(isEvent && page !== ''){
        if(FUNC_CHECKPAGE(EVENT_STATISTICS, `|${page}|`)){
          menuGroup.push({img: 'performance', title: 'Performance', href: `/event/${itemID}/performance`, active: path === `/event/${itemID}/performance`, visible: PERMISSION_STATS})
          menuGroup.push({img: 'influencers', title: 'Influencers', href: `/event/${itemID}/influencers`, active: path === `/event/${itemID}/influencers`, visible: PERMISSION_STATS})
          menuGroup.push({img: 'orders', title: 'Orders', href: `/event/${itemID}/orders`, active: path === `/event/${itemID}/orders`, visible: PERMISSION_STATS})
          menuGroup.push({img: 'check-in', title: 'Check-In', href: `/event/${itemID}/checkin`, active: path === `/event/${itemID}/checkin`, visible: PERMISSION_STATS})
          menuGroup.push({img: 'demographics', title: 'Demographics', href: `/event/${itemID}/demographics`, active: path === `/event/${itemID}/demographics`, visible: PERMISSION_STATS})
          menuGroup.push({img: 'geographics', title: 'Geographics', href: `/event/${itemID}/geographics`, active: path === `/event/${itemID}/geographics`, visible: PERMISSION_STATS})
          menuGroup.push({img: 'music', title: 'Music', href: `/event/${itemID}/music`, active: path === `/event/${itemID}/music`, visible: PERMISSION_STATS})
          menuGroup.push({img: 'streaming', title: 'Streaming', href: `/event/${itemID}/musicstreaming`, active: path === `/event/${itemID}/musicstreaming`, visible: PERMISSION_STATS})
          menuGroup.push({img: 'likes', title: 'Likes', href: `/event/${itemID}/likes`, active: path === `/event/${itemID}/likes`, visible: PERMISSION_STATS})
          menuGroup.push({img: 'psychographics', title: 'Psychographics', href: `/event/${itemID}/psychographics`, active: path === `/event/${itemID}/psychographics`, visible: PERMISSION_STATS})
          menuGroup.push({img: 'devices', title: 'Devices', href: `/event/${itemID}/devices`, active: path === `/event/${itemID}/devices`, visible: PERMISSION_STATS})
          menuGroup.push({img: 'games', title: 'Gaming', href: `/event/${itemID}/gaming`, active: path === `/event/${itemID}/gaming`, visible: PERMISSION_STATS})
        }else if(FUNC_CHECKPAGE(EVENT_EDIT, `|${page}|`)){
          menuGroup.push({img: 'details', title: 'Details', href: `/event/${itemID}/details`, active: path === `/event/${itemID}/details`, visible: PERMISSION_ADMIN})
          menuGroup.push({img: 'venue', title: 'Venue', href: `/event/${itemID}/venues`, active: path === `/event/${itemID}/venues`, visible: PERMISSION_ADMIN})
          menuGroup.push({img: 'tickets', title: 'Tickets', href: `/event/${itemID}/tickets`, active: path === `/event/${itemID}/tickets`, visible: PERMISSION_ADMIN})
        }else if(FUNC_CHECKPAGE(EVENT_INTERACT, `|${page}|`)){
          menuGroup.push({img: 'messaging', title: 'Messaging', href: `/event/${itemID}/messaging`, active: path === `/event/${itemID}/messaging`, visible: PERMISSION_ADMIN})
          menuGroup.push({img: 'invitation', title: 'Invitations', href: `/event/${itemID}/invitations`, active: path === `/event/${itemID}/invitations`, visible: PERMISSION_CURATOR})
          menuGroup.push({img: 'guest-tickets', title: 'Guest Tickets', href: `/event/${itemID}/guest-tickets`, active: path === `/event/${itemID}/guest-tickets`, visible: PERMISSION_CURATOR })
          menuGroup.push({img: 'promotions', title: 'Promotions', href: `/event/${itemID}/promotions`, active: path === `/event/${itemID}/promotions`, visible: enablePromotions})
        }
      }
      if(isBrand && page !== ''){
        menuGroup.push({img: 'details', title: 'Details', href: `/brand/${itemID}/details`, active: path === `/brand/${itemID}/details`, visible: true})
        menuGroup.push({img: 'demographics', title: 'Demographics', href: `/brand/${itemID}/demographics`, active: path === `/brand/${itemID}/demographics`, visible: true})
        menuGroup.push({img: 'music', title: 'Music', href: `/brand/${itemID}/music`, active: path === `/brand/${itemID}/music`, visible: true})
        menuGroup.push({img: 'streaming', title: 'Streaming', href: `/brand/${itemID}/musicstreaming`, active: path === `/brand/${itemID}/musicstreaming`, visible: true})
        menuGroup.push({img: 'likes', title: 'Likes', href: `/brand/${itemID}/likes`, active: path === `/brand/${itemID}/likes`, visible: true})
        // menuGroup.push({icon: 'fa fa-envelope', title: 'Templates', href: `/brand/${itemID}/templates`, active: path === `/brand/${itemID}/templates`, visible: true})
      }

      this.totalSlideNumber = menuGroup.length
      return menuGroup
    }

    setNextPosition(){
      if(this.state.x < ((this.totalSlideNumber-2) * ((deviceWidth - 110)/this.getVisibleSlideCount()))) {
        _headerScrollView.scrollTo({x: this.state.x + ((deviceWidth - 110)/this.getVisibleSlideCount()), y: 0, animated: true})
        this.setState({x: this.state.x + ((deviceWidth - 110)/this.getVisibleSlideCount())})
      }
    }
    setPrePosition(){
      if(this.state.x > 0) {
        _headerScrollView.scrollTo({x: this.state.x - ((deviceWidth - 110)/this.getVisibleSlideCount()), y: 0, animated: true})
        this.setState({x: this.state.x - ((deviceWidth - 110)/this.getVisibleSlideCount())})
      }
    }
    onScroll(event){
      this.scrollDrag  = true
      var scrollX = event.nativeEvent.contentOffset.x
      if(scrollX%100 < 55){
        var customX = scrollX - scrollX % ((deviceWidth - 110)/this.getVisibleSlideCount())
      }else{
        var customX = scrollX + ((deviceWidth - 110)/this.getVisibleSlideCount()) - scrollX % ((deviceWidth - 110)/this.getVisibleSlideCount())
      }
      _headerScrollView.scrollTo({ x:customX, y:0, animated:true })
      this.setState({x:customX})
    }
    onStartScroll(e){
      if(e.nativeEvent.contentOffset.x == 0)
        this.setState({x:0})
    }

    render(){
        let menuGroup = this.getMenuGroup()
        let getwidth = this.getVisibleSlideCount()
        let headerBar = _.map(menuGroup, (menu, index)=>{
          return (
            <MenuItem  key={index} style={{width: (deviceWidth - 110)/getwidth}} title={menu.title} img={menu.img} href={menu.href} active={menu.active} visible={menu.visible} onCloseDrawer={this.props.onCloseDrawer}/>
          )
        })

        if (menuGroup.length == 0)
        headerBar = <View></View>
        return (
          <View style={{flexDirection:'row', flex:1, }}>
            {menuGroup.length > 0 &&
            <TouchableOpacity style={{width:30, height:60, alignItems:'center', justifyContent:'center'}} onPress={()=>this.setPrePosition()}><Icon name="arrow-left" size={15} color="#b5c5cf"/></TouchableOpacity>}
            <ScrollView ref={scroll => {_headerScrollView = scroll}} style={{width:230}} horizontal={true}
                        decelerationRate={'fast'}
                        onScroll = {e => this.onStartScroll(e)}
                        onScrollEndDrag = {(event)=>this.onScroll(event)}
            >
                {headerBar}
            </ScrollView>
            {menuGroup.length > 0 && <TouchableOpacity style={{width:30, height:60, alignItems:'center', justifyContent:'center'}} onPress={()=>this.setNextPosition()}><Icon name="arrow-right" size={15} color="#b5c5cf"/></TouchableOpacity>}
            <TouchableOpacity/>
          </View>
        )
    }
}
class Header extends Component {

    handleLogout() {
        const {LOGOUT, replace} = this.props
        return Promise.resolve(LOGOUT())
            .then(() =>
                replace('/signout')
            )
    }
    render() {
        const {user} = this.props
        const displayName = !!user ? ([user.firstName, user.lastName].filter(Boolean).join(' ')) : ''
        const abbName = !!user ? user.firstName.charAt(0).toUpperCase() + user.lastName.charAt(0).toUpperCase() : ''
        return (
            <View style={header.header_bar}>
              {DeviceInfo.isTablet() &&
                <TouchableOpacity style={header.avatar}>
                  <Image style={header.logo_img} source={require('@nativeRes/images/ttf-logo.png')}/>
                </TouchableOpacity>}
                <TouchableOpacity style={header.header_bar_left} onPress={this.props.onOpenDrawer}>
                    <Icon name="navicon" size={20} color="#B6C5CF" />
                </TouchableOpacity>
                <HeaderNavigation {...this.props}/>
            </View>
        )
    }
}

export default connect((state) => {
    const u = state.auth.get('user')
    const event = state.events.get('selected')
    const brand = state.brands.get('selected')
    return {
        navigation: state.navigation.toJS(),
        user: u ? u.toJS() : null,
        event: event ? event.toJS() : null,
        brand: brand? brand : null
    }},{LOGOUT:session.LOGOUT,push: routeActions.push, replace: routeActions.replace})(Header)
