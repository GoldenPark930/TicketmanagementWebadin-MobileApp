import React from 'react'
import PropTypes from 'prop-types';
import {View, Image, Text} from 'react-native'
import {routeActions} from 'react-router-redux'
import {connect} from 'react-redux'
import LinearGradient from 'react-native-linear-gradient'
import {Link} from 'react-router-native'
import {sidebar} from '../../native/styles'
import Icon from 'react-native-vector-icons/FontAwesome'
import session from "../../_common/redux/auth/actions";

class SidebarItem extends React.Component {
    static propTypes = {
        href: PropTypes.string.isRequired,
        active: PropTypes.bool,
        img: PropTypes.string,
        name: PropTypes.string.isRequired,
        onPress: PropTypes.func,
        icon: PropTypes.string
    }

    constructor(props) {
        super(props)
    }

    render() {
        const {active, href, name, img, children, icon, level, isActive, isEvent, isBrands, isHome} = this.props
        let image_source = ''

        switch (img) {
            case 'home':isHome ? image_source = require('@nativeRes/images/system_icons/home.png') : image_source = require('@nativeRes/images/system_icons/inactive/home.png'); break
            case 'events': isEvent? image_source = require('@nativeRes/images/system_icons/events.png') : image_source = require('@nativeRes/images/system_icons/inactive/events.png'); break
            case 'performance': isActive || active ? image_source = require('@nativeRes/images/system_icons/performance.png') : image_source = require('@nativeRes/images/system_icons/inactive/performance.png'); break
            case 'influencers': isActive || active ? image_source = require('@nativeRes/images/system_icons/influencers.png') : image_source = require('@nativeRes/images/system_icons/inactive/influencers.png'); break
            case 'check-in': isActive || active ? image_source = require('@nativeRes/images/system_icons/check-in.png') : image_source = require('@nativeRes/images/system_icons/inactive/check-in.png'); break
            case 'demographics': isActive || active ? image_source = require('@nativeRes/images/system_icons/demographics.png') : image_source = require('@nativeRes/images/system_icons/inactive/demographics.png'); break
            case 'geographics': isActive || active ? image_source = require('@nativeRes/images/system_icons/geographics.png') : image_source = require('@nativeRes/images/system_icons/inactive/geographics.png'); break
            case 'music': isActive || active ? image_source = require('@nativeRes/images/system_icons/music.png') : image_source = require('@nativeRes/images/system_icons/inactive/music.png'); break
            case 'streaming': isActive || active ? image_source = require('@nativeRes/images/system_icons/streaming.png') : image_source = require('@nativeRes/images/system_icons/inactive/streaming.png'); break
            case 'likes': isActive || active ? image_source = require('@nativeRes/images/system_icons/likes.png') : image_source = require('@nativeRes/images/system_icons/inactive/likes.png'); break
            case 'psychographics': isActive || active ? image_source = require('@nativeRes/images/system_icons/psychographics.png') : image_source = require('@nativeRes/images/system_icons/inactive/psychographics.png'); break
            case 'devices': isActive || active ? image_source = require('@nativeRes/images/system_icons/devices.png') : image_source = require('@nativeRes/images/system_icons/inactive/devices.png'); break
            case 'games': isActive || active ? image_source = require('@nativeRes/images/system_icons/games.png') : image_source = require('@nativeRes/images/system_icons/inactive/games.png'); break
            case 'details': isActive || active ? image_source = require('@nativeRes/images/system_icons/details.png') : image_source = require('@nativeRes/images/system_icons/inactive/details.png'); break
            case 'venue': isActive || active ? image_source = require('@nativeRes/images/system_icons/venue.png') : image_source = require('@nativeRes/images/system_icons/inactive/venue.png'); break
            case 'messaging': isActive || active ? image_source = require('@nativeRes/images/system_icons/messaging.png') : image_source = require('@nativeRes/images/system_icons/inactive/messaging.png'); break
            case 'invitation': isActive || active ? image_source = require('@nativeRes/images/system_icons/invitation.png') : image_source = require('@nativeRes/images/system_icons/inactive/invitation.png'); break
            case 'guest-tickets': isActive || active ? image_source = require('@nativeRes/images/system_icons/guest-tickets.png') : image_source = require('@nativeRes/images/system_icons/inactive/guest-tickets.png'); break
            case 'promotions': isActive || active ? image_source = require('@nativeRes/images/system_icons/promotions.png') : image_source = require('@nativeRes/images/system_icons/inactive/promotions.png'); break
            case 'edit': isActive || active ? image_source = require('@nativeRes/images/system_icons/edit.png') : image_source = require('@nativeRes/images/system_icons/inactive/edit.png'); break
            case 'interact': isActive || active ? image_source = require('@nativeRes/images/system_icons/interact.png') : image_source = require('@nativeRes/images/system_icons/inactive/interact.png'); break
            case 'orders' : isActive || active ? image_source = require('@nativeRes/images/system_icons/orders.png') : image_source = require('@nativeRes/images/system_icons/inactive/orders.png'); break
            case 'tickets' : isActive || active ? image_source = require('@nativeRes/images/system_icons/tickets.png') : image_source = require('@nativeRes/images/system_icons/inactive/tickets.png'); break
            case 'brands': isBrands ? image_source = require('@nativeRes/images/system_icons/brands.png'):image_source = require('@nativeRes/images/system_icons/inactive/brands.png'); break
        }

        let toggleIcon
        if (children) {
            toggleIcon = <Icon name='chevron-down' size={13} color='#B6C5CF'/>
        }
        return (
            <View>
              {level === 2 ?
                <View style={[sidebar.navItem, {backgroundColor: isActive ? 'rgba(0, 0, 0, .2)' : '#4d5257', borderBottomWidth: 0.5, borderBottomColor: 'grey'}]}>
                  {
                    active && (
                      <LinearGradient colors={['rgba(255,103,123,1)', 'rgba(255,191,100,1)']}
                                      style={sidebar.navLinear}>
                        <View style={sidebar.navlinearGradient}/>
                      </LinearGradient>
                    )
                  }
                  {img && <Image style={[sidebar.sideItemIcon, {marginLeft:10}]} source={image_source}/>}
                  {icon && <Icon name={icon} size={15} style={{marginLeft: 15, marginRight: 15}}
                                 color={active ? '#ffddb4' : '#B6C5CF'}/>}
                  <Text style={[sidebar.itemText, {color: active ? '#ffddb4' : '#B6C5CF'}]}>{name}</Text>
                  <View style={{flex: 1, alignItems: 'flex-end'}}>{toggleIcon}</View>
                </View>
                :
                <Link to={href} onPress={this.props.onPress}>
                  <View style={[sidebar.navItem, {backgroundColor: level != 3 && (isEvent || active) ? 'rgba(0, 0, 0, .3)' : '#ffffff00'}]}>
                    {
                      level != 3 &&active && (
                        <LinearGradient colors={['rgba(255,103,123,1)', 'rgba(255,191,100,1)']}
                                        style={sidebar.navLinear}>
                          <View style={sidebar.navlinearGradient}/>
                        </LinearGradient>
                      )
                    }
                    {img && <Image style={[sidebar.sideItemIcon, {marginLeft: level == 3 ? 20 : 0}]} source={image_source}/>}
                    {icon && <Icon name={icon} size={15} style={{marginLeft: 15, marginRight: 15}}
                                   color={active ? '#ffddb4' : '#B6C5CF'}/>}
                    <Text style={[sidebar.itemText, {color: active ? '#ffddb4' : '#B6C5CF'}]}>{name}</Text>
                    <View style={{flex: 1, alignItems: 'flex-end'}}>{toggleIcon}</View>
                  </View>
                </Link>
              }
            </View>
        )
    }
}export default connect((state) => {
    return {
      navigation: state.navigation.toJS(),
    }
  },
  {push: routeActions.push, replace: routeActions.replace, LOGOUT:session.LOGOUT})(SidebarItem)
