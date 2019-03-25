import React, { Component } from 'react'
import PropTypes from 'prop-types';
import {View, Image, Text} from 'react-native'
import {Link} from '../router/react-router-native'
import {sidebar} from '../../native/styles'
import Icon from 'react-native-vector-icons/FontAwesome'

export const EVENT_STATISTICS = '|performance|influencers|demographics|psychographics|checkin|music|musicstreaming|likes|orders|gaming|geographics|devices|'
export const EVENT_EDIT = '|details|venues|tickets|'
export const EVENT_INTERACT = '|messaging|invitations|guest-tickets|promotions|'

export const FUNC_CHECKPAGE = (pageGroup, page) => {return pageGroup.indexOf(page) !== -1}

export class MenuItem extends Component {
  static propType = {
    level: PropTypes.number,
    title: PropTypes.string,
    img: PropTypes.string,
    icon: PropTypes.string,
    active: PropTypes.bool,
    open: PropTypes.bool,
    visible: PropTypes.bool,
    href: PropTypes.string,
    className: PropTypes.string,
  }

  constructor(props) {
    super(props)
  }

  render() {
    const {title, img, icon, level, open, visible, active, href, className, onCloseDrawer, index, style} = this.props
    let image_source = ''
    switch (img) {
      case 'performance': active ? image_source = require('@nativeRes/images/system_icons/performance.png') : image_source = require('@nativeRes/images/system_icons/inactive/performance.png'); break
      case 'influencers': active ? image_source = require('@nativeRes/images/system_icons/influencers.png') : image_source = require('@nativeRes/images/system_icons/inactive/influencers.png'); break
      case 'check-in': active ? image_source = require('@nativeRes/images/system_icons/check-in.png') : image_source = require('@nativeRes/images/system_icons/inactive/check-in.png'); break
      case 'demographics': active ? image_source = require('@nativeRes/images/system_icons/demographics.png') : image_source = require('@nativeRes/images/system_icons/inactive/demographics.png'); break
      case 'geographics': active ? image_source = require('@nativeRes/images/system_icons/geographics.png') : image_source = require('@nativeRes/images/system_icons/inactive/geographics.png'); break
      case 'music': active ? image_source = require('@nativeRes/images/system_icons/music.png') : image_source = require('@nativeRes/images/system_icons/inactive/music.png'); break
      case 'streaming': active ? image_source = require('@nativeRes/images/system_icons/streaming.png') : image_source = require('@nativeRes/images/system_icons/inactive/streaming.png'); break
      case 'likes': active ? image_source = require('@nativeRes/images/system_icons/likes.png') : image_source = require('@nativeRes/images/system_icons/inactive/likes.png'); break
      case 'psychographics': active ? image_source = require('@nativeRes/images/system_icons/psychographics.png') : image_source = require('@nativeRes/images/system_icons/inactive/psychographics.png'); break
      case 'devices': active ? image_source = require('@nativeRes/images/system_icons/devices.png') : image_source = require('@nativeRes/images/system_icons/inactive/devices.png'); break
      case 'games': active ? image_source = require('@nativeRes/images/system_icons/games.png') : image_source = require('@nativeRes/images/system_icons/inactive/games.png'); break
      case 'details': active ? image_source = require('@nativeRes/images/system_icons/details.png') : image_source = require('@nativeRes/images/system_icons/inactive/details.png'); break
      case 'venue': active ? image_source = require('@nativeRes/images/system_icons/venue.png') : image_source = require('@nativeRes/images/system_icons/inactive/venue.png'); break
      case 'messaging': active ? image_source = require('@nativeRes/images/system_icons/messaging.png') : image_source = require('@nativeRes/images/system_icons/inactive/messaging.png'); break
      case 'invitation': active ? image_source = require('@nativeRes/images/system_icons/invitation.png') : image_source = require('@nativeRes/images/system_icons/inactive/invitation.png'); break
      case 'guest-tickets': active ? image_source = require('@nativeRes/images/system_icons/guest-tickets.png') : image_source = require('@nativeRes/images/system_icons/inactive/guest-tickets.png'); break
      case 'promotions': active ? image_source = require('@nativeRes/images/system_icons/promotions.png') : image_source = require('@nativeRes/images/system_icons/inactive/promotions.png'); break
      case 'edit': active ? image_source = require('@nativeRes/images/system_icons/edit.png') : image_source = require('@nativeRes/images/system_icons/inactive/edit.png'); break
      case 'interact': active ? image_source = require('@nativeRes/images/system_icons/interact.png') : image_source = require('@nativeRes/images/system_icons/inactive/interact.png'); break
      case 'orders' : active ? image_source = require('@nativeRes/images/system_icons/orders.png') : image_source = require('@nativeRes/images/system_icons/inactive/orders.png'); break
      case 'tickets' : active ? image_source = require('@nativeRes/images/system_icons/tickets.png') : image_source = require('@nativeRes/images/system_icons/inactive/tickets.png'); break
    }
    return (
      <View>
        {visible &&
        <Link index={index} to={href} onPress={()=>onCloseDrawer()}>
          <View style={[sidebar.navItem,{flexDirection:'column',justifyContent:'center',paddingLeft:5,paddingRight:5,
            backgroundColor: active ? 'rgba(0, 0, 0, .4)' : '#ffffff00', borderBottomWidth:1.5,borderBottomColor: active ? '#ffddb4' : '#ffffff00'}, style]}>
            {img && <View style={{height: 25, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}><Image style={[sidebar.itemIcon]} source={image_source}/></View>}
            {icon && <Icon name={icon} size={15} style={{marginLeft:15, marginRight:15}} color={active ? '#ffddb4' : '#B6C5CF'}/>}
            <Text numberOfLines={1} style={[sidebar.itemText,{marginTop:3,color:active ? '#ffddb4' : '#B6C5CF'}]}>{title}</Text>
          </View>
        </Link>}
      </View>
    )
  }
}
