import _ from 'lodash'
import Immutable from 'immutable'
import React from 'react'
import {connect} from 'react-redux'
import {View, Text, Image, TouchableOpacity} from 'react-native'
import {LoadingBar, Counter} from "../_library";
import {fetchAPI, HTTP_LOADING_SUCCESSED, makeURL} from '../../_common/core/http'
import Triangle from 'react-native-triangle';
import {event_devices} from '../styles'

export const BROWSER = 0
export const DEVICE_TYPE = 1
export const DEVICE_NAME = 2
export const DESCRIPTION = 3
export const BRAND_NAME = 4

const convertFileName = (title) => {
  let str = title.toLowerCase()
  str = str.replace(/[^a-zA-Z0-9 \.]/g, '')
  str = str.replace(/\s/g, '-')
  return str
}
class EventDevices extends React.Component {
  constructor(props) {
    super(props)
    this.unMounted = true
    this.refreshTimer = null
    this.refreshFlag = false
    this.tmp = []
    this.state = {
      loading: false,
      rows: [],
      rows_browser: [],
      rows_device_type: [],
      rows_device_name: [],
      rows_platform_description: [],
      rows_device_brand_name: [],
      total: 0,
      select_category: 0
    }
  }

  componentDidMount() {
    const {event} = this.props
    this.setState({loading: true})
    const url = `/api/events/${event.id}/relationships/devices/`
    this.unMounted = false
    fetch(makeURL(url), {
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json'
      },
      withCredentials: true
    }).then((response) => response.json())
      .then((responseJson) => {
        this.setState({loading:false})

        if(!this.unMounted) {
          let total = 0
          let data = responseJson.data.devices
          let rows_browser=[], rows_device_type=[], rows_device_name=[], rows_platform_description=[], rows_device_brand_name=[]
          let obj = data
          _.map(obj.browser, (value, key)=>{
            rows_browser.push({
              title: key,
              value: value
            })
            total += value
          })
          rows_browser = _.orderBy(rows_browser, (t)=>{return t.value}, 'desc')

          _.map(obj.device_type, (value, key)=>{
            rows_device_type.push({
              title: key,
              value: value
            })
          })
          rows_device_type = _.orderBy(rows_device_type, (t)=>{return t.value}, 'desc')

          _.map(obj.device_name, (value, key)=>{
            rows_device_name.push({
              title: key,
              value: value
            })
          })
          rows_device_name = _.orderBy(rows_device_name, (t)=>{return t.value}, 'desc')

          _.map(obj.platform_description, (value, key)=>{
            rows_platform_description.push({
              title: key,
              value: value
            })
          })
          rows_platform_description = _.orderBy(rows_platform_description, (t)=>{return t.value}, 'desc')

          _.map(obj.device_brand_name, (value, key)=>{
            rows_device_brand_name.push({
              title: key,
              value: value
            })
          })
          rows_device_brand_name = _.orderBy(rows_device_brand_name, (t)=>{return t.value}, 'desc')
          this.setState({rows_browser, rows_device_type, rows_device_name, rows_platform_description, rows_device_brand_name, total})
        }
      })
      .catch((error) => {
        this.setState({loading:false})
        console.log('=====error',error);
      });
  }

  componentWillUnmount() {
    this.unMounted = true
    this.refreshFlag = false
    if(this.refreshTimer)
      clearInterval(this.refreshTimer)
  }

  _renderTapContent = () => {
    const {select_category} = this.state
    return (
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <TouchableOpacity style={[select_category == 0 ? event_devices.tab_titile_active_category : event_devices.tab_titile_category]} onPress={()=>this.setState({select_category: 0})}>
          <View style={event_devices.tab_title_category_img_view}>
            <Image style={[select_category == 0 ? event_devices.tab_title_active_img : event_devices.tab_titile_category_img]} source={require('@nativeRes/images/event/devices/icon_tab_browser.png')}/>
          </View>
          <Text style={[select_category == 0 ? event_devices.tab_title_category_active_text : event_devices.tab_title_category_text]}>Browsers</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[select_category == 1 ? event_devices.tab_titile_active_category : event_devices.tab_titile_category]} onPress={()=>this.setState({select_category: 1})}>
          <View style={event_devices.tab_title_category_img_view}>
            <Image style={[select_category == 1 ? event_devices.tab_title_active_img : event_devices.tab_titile_category_img]} source={require('@nativeRes/images/event/devices/icon_tab_device_type.png')}/>
          </View>
          <Text style={[select_category == 1 ? event_devices.tab_title_category_active_text : event_devices.tab_title_category_text]}>Device Types</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[select_category == 2 ? event_devices.tab_titile_active_category : event_devices.tab_titile_category]} onPress={()=>this.setState({select_category: 2})}>
          <View style={event_devices.tab_title_category_img_view}>
            <Image style={[select_category == 2 ? event_devices.tab_title_active_img : event_devices.tab_titile_category_img]} source={require('@nativeRes/images/event/devices/icon_tab_os.png')}/>
          </View>
          <Text style={[select_category == 2 ? event_devices.tab_title_category_active_text : event_devices.tab_title_category_text]}>Platforms</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[select_category == 3 ? event_devices.tab_titile_active_category : event_devices.tab_titile_category]} onPress={()=>this.setState({select_category: 3})}>
          <View style={event_devices.tab_title_category_img_view}>
            <Image style={[select_category == 3 ? event_devices.tab_title_active_img : event_devices.tab_titile_category_img]} source={require('@nativeRes/images/event/devices/icon_tab_devices_brands.png')}/>
          </View>
          <Text style={[select_category == 3 ? event_devices.tab_title_category_active_text : event_devices.tab_title_category_text]}>Device Brands</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[select_category == 4 ? event_devices.tab_titile_active_category : event_devices.tab_titile_category]} onPress={()=>this.setState({select_category: 4})}>
          <View style={event_devices.tab_title_category_img_view}>
            <Image style={[select_category == 4 ? event_devices.tab_title_active_img : event_devices.tab_titile_category_img]} source={require('@nativeRes/images/event/devices/icon_tab_device_name.png')}/>
          </View>
          <Text style={[select_category == 4 ? event_devices.tab_title_category_active_text : event_devices.tab_title_category_text]}>Device Names</Text>
        </TouchableOpacity>
      </View>
    )
  }

  _renderTapBrowser = () => {
    const {rows_browser} = this.state
    let browser_top5 = rows_browser.slice(0, 5)
    let browser_rest = rows_browser.slice(6, rows_browser.length)

    let getTiles_browser = (items, showRank) => {
      return _.map(items, (item, index)=>{
        let imgName = convertFileName(item.title)
        let imgSrc = require('@nativeRes/images/event/devices/browser/chrome.png');
        switch (imgName) {
          case 'chrome':
            imgSrc = require('@nativeRes/images/event/devices/browser/chrome.png');
            break;
          case 'safari':
            imgSrc = require('@nativeRes/images/event/devices/browser/safari.png');
            break;
          case 'firefox':
            imgSrc = require('@nativeRes/images/event/devices/browser/firefox.png');
            break;
          case 'android':
            imgSrc = require('@nativeRes/images/event/devices/browser/android.png');
            break;
          case 'android-appview':
            imgSrc = require('@nativeRes/images/event/devices/browser/android-appview.png');
            break;
          case 'dragon':
            imgSrc = require('@nativeRes/images/event/devices/browser/dragon.png');
            break;
          case 'edge':
            imgSrc = require('@nativeRes/images/event/devices/browser/edge.png');
            break;
          case 'facebook-app':
            imgSrc = require('@nativeRes/images/event/devices/browser/facebook-app.png');
            break;
          case 'facebook-messenger':
            imgSrc = require('@nativeRes/images/event/devices/browser/facebook-messenger.png');
            break;
          case 'firefox-focus':
            imgSrc = require('@nativeRes/images/event/devices/browser/firefox-focus.png');
            break;
          case 'google-app':
            imgSrc = require('@nativeRes/images/event/devices/browser/google-app.png');
            break;
          case 'ie':
            imgSrc = require('@nativeRes/images/event/devices/browser/ie.png');
            break;
          case 'instagram-app':
            imgSrc = require('@nativeRes/images/event/devices/browser/instagram-app.png');
            break;
          case 'internet-mobile':
            imgSrc = require('@nativeRes/images/event/devices/browser/internet-mobile.png');
            break;
          case 'miui-browser':
            imgSrc = require('@nativeRes/images/event/devices/browser/miui-browser.png');
            break;
          case 'opera':
            imgSrc = require('@nativeRes/images/event/devices/browser/opera.png');
            break;
          case 'opera-mobile':
            imgSrc = require('@nativeRes/images/event/devices/browser/opera-mobile.png');
            break;
          case 'puffin':
            imgSrc = require('@nativeRes/images/event/devices/browser/puffin.png');
            break;
          case 'safari-mobile':
            imgSrc = require('@nativeRes/images/event/devices/browser/safari-mobile.png');
            break;
          case 'samsung-browser':
            imgSrc = require('@nativeRes/images/event/devices/browser/samsung-browser.png');
            break;
          case 'samsung-crossapp':
            imgSrc = require('@nativeRes/images/event/devices/browser/samsung-crossapp.png');
            break;
          case 'silk':
            imgSrc = require('@nativeRes/images/event/devices/browser/silk.png');
            break;
          case 'uc-browser':
            imgSrc = require('@nativeRes/images/event/devices/browser/uc-browser.png');
            break;
          case 'waterfox':
            imgSrc = require('@nativeRes/images/event/devices/browser/waterfox.png');
            break;
        }
        return (
          <View key={index} style={{flexDirection: 'row', alignItems: 'center', padding: 10}}>
            {showRank && <Text style={event_devices.rank}>{index + 1}</Text>}
            <Image style={event_devices.icon} source={imgSrc}/>
            <View style={event_devices.value}>
              <Text style={event_devices.numbers}>{item.value.toLocaleString()}</Text>
              <Text style={event_devices.title}>{item.title}</Text>
            </View>
          </View>
        )
      })
    }
    return (
      <View>
        <View style={event_devices.top5}>{getTiles_browser(browser_top5, true)}</View>
        {this._renderBottom()}
        <View>{getTiles_browser(browser_rest, false)}</View>
      </View>
    )
  }
  _renderBottom = () => (
    <View>
      <View style={event_devices.decoration_icon}>
        <View style={event_devices.decoration}/>
        <Image style={event_devices.decoration_image} source={require('@nativeRes/images/event/devices/icon_tickets.png')}/>
        <View style={event_devices.decoration}/>
      </View>
      <View style={event_devices.decoration_text}>Other Browsers</View>
    </View>
  )

  //Device tiye tap view
  getTiles_device_types = (items) => {
    return _.map(items, (item, index)=>{
      let imgName = convertFileName(item.title)
      let imgSrc = require('@nativeRes/images/event/devices/devices-types/desktop.png');
      switch (imgName) {
        case 'desktop':
          imgSrc = require('@nativeRes/images/event/devices/devices-types/desktop.png');
          break;
        case 'ebook-reader':
          imgSrc = require('@nativeRes/images/event/devices/devices-types/ebook-reader.png');
          break;
        case 'mobile-device':
          imgSrc = require('@nativeRes/images/event/devices/devices-types/mobile-device.png');
          break;
        case 'mobile-phone':
          imgSrc = require('@nativeRes/images/event/devices/devices-types/mobile-phone.png');
          break;
        case 'tablet':
          imgSrc = require('@nativeRes/images/event/devices/devices-types/tablet.png');
          break;
      }
      return (
        <View key={index} style={event_devices.device_type_tile}>
          <Image style={{height:60, resizeMode: 'contain', marginBottom: 20}} source={imgSrc}/>
          <Text style={event_devices.numbers}>{item.value.toLocaleString()}</Text>
          <View style={event_devices.decoration}/>
          <Text style={event_devices.title}>{item.title}</Text>
        </View>
      )
    })
  }
  _renderTapDeviceType = () => {
    return(
      <View style={event_devices.tab_content_device_types}>
        <View style={event_devices.top5}>{this.getTiles_device_types(this.state.rows_device_type)}</View>
      </View>
    )
  }

  //platform tap view
  getTiles_platform = (items) => {
    return _.map(items, (item, index)=>{
      let imgName = convertFileName(item.title)
      let imgSrc = require('@nativeRes/images/event/devices/os-platforms/android-os.png');
      switch (imgName) {
        case 'android-os':
          imgSrc = require('@nativeRes/images/event/devices/os-platforms/android-os.png');
          break;
        case 'google-chrome-os':
          imgSrc = require('@nativeRes/images/event/devices/os-platforms/google-chrome-os.png');
          break;
        case 'ipod-iphone--ipad':
          imgSrc = require('@nativeRes/images/event/devices/os-platforms/ipod-iphone--ipad.png');
          break;
        case 'linux':
          imgSrc = require('@nativeRes/images/event/devices/os-platforms/linux.png');
          break;
        case 'macos':
          imgSrc = require('@nativeRes/images/event/devices/os-platforms/macos.png');
          break;
        case 'mac-os-x':
          imgSrc = require('@nativeRes/images/event/devices/os-platforms/mac-os-x.png');
          break;
        case 'ubuntu-linux':
          imgSrc = require('@nativeRes/images/event/devices/os-platforms/ubuntu-linux.png');
          break;
        case 'windows-7':
          imgSrc = require('@nativeRes/images/event/devices/os-platforms/windows-7.png');
          break;
        case 'windows-8.1':
          imgSrc = require('@nativeRes/images/event/devices/os-platforms/windows-8.1.png');
          break;
        case 'windows-8':
          imgSrc = require('@nativeRes/images/event/devices/os-platforms/windows-8.png');
          break;
        case 'windows-10':
          imgSrc = require('@nativeRes/images/event/devices/os-platforms/windows-10.png');
          break;
        case 'windows-phone':
          imgSrc = require('@nativeRes/images/event/devices/os-platforms/windows-phone.png');
          break;
        case 'windows-xp':
          imgSrc = require('@nativeRes/images/event/devices/os-platforms/windows-xp.png');
          break;
      }
      return (
        <View key={index} style={event_devices.device_type_tile}>
          <Image style={{height:60, resizeMode: 'contain', marginBottom: 20}} source={imgSrc}/>
          <Text style={event_devices.numbers}>{item.value.toLocaleString()}</Text>
          <View style={event_devices.decoration}/>
          <Text style={event_devices.title}>{item.title}</Text>
        </View>
      )
    })
  }

  _renderTapPlateForm = () => {
    return(
      <View style={event_devices.tab_content_device_types}>
        <View style={event_devices.top5}>{this.getTiles_platform(this.state.rows_platform_description)}</View>
      </View>
    )
  }

  //Device tiye tap view
  getTiles_brands = (items) => {
    return _.map(items, (item, index)=>{
      let imgName = convertFileName(item.title)
      let imgSrc = require('@nativeRes/images/event/devices/devices-brands/amazon.png');
      switch (imgName) {
        case 'apple':
          imgSrc = require('@nativeRes/images/event/devices/devices-brands/apple.png');
          break;
        case 'google':
          imgSrc = require('@nativeRes/images/event/devices/devices-brands/google.png');
          break;
        case 'htc':
          imgSrc = require('@nativeRes/images/event/devices/devices-brands/htc.png');
          break;
        case 'huawei':
          imgSrc = require('@nativeRes/images/event/devices/devices-brands/huawei.png');
          break;
        case 'lg':
          imgSrc = require('@nativeRes/images/event/devices/devices-brands/lg.png');
          break;
        case 'oneplus':
          imgSrc = require('@nativeRes/images/event/devices/devices-brands/oneplus.png');
          break;
        case 'samsung':
          imgSrc = require('@nativeRes/images/event/devices/devices-brands/samsung.png');
          break;
        case 'sony':
          imgSrc = require('@nativeRes/images/event/devices/devices-brands/sony.png');
          break;
      }
      return (
        <View key={index} style={event_devices.device_type_tile}>
          <Image style={{height:60, resizeMode: 'contain', marginBottom: 20}} source={imgSrc}/>
          <View style={{flex:1, width:100}}>
            <Text style={event_devices.numbers}>{item.value.toLocaleString()}</Text>
            <View style={{paddingLeft: 5, borderLeftWidth:2, borderLeftColor: '#ff677b'}}>
              <Text style={{fontSize: 12, color: 'white'}}>{item.title}</Text>
            </View>
          </View>
        </View>
      )
    })
  }

  _renderTapDeviceBrand = () => {
    let brands_top5 = this.state.rows_device_brand_name.slice(0, 5)
    let brands_rest = this.state.rows_device_brand_name.slice(6, this.state.rows_device_brand_name.length)
    return (
      <View style={event_devices.tab_content_device_types}>
        <View style={event_devices.top5}>{this.getTiles_brands(brands_top5)}</View>
        {this._renderBottom()}
      </View>
    )
  }

  //Device Name tap view
  getTiles_device_name = (items) => {
    return _.map(items, (item, index)=>{
      let imgName = convertFileName(item.title)
      let imgSrc = require('@nativeRes/images/event/devices/devices-names/_devices.png');
      switch (imgName) {
        case '_devices':
          imgSrc = require('@nativeRes/images/event/devices/devices-names/_devices.png');
          break;
        case '_numberofusers':
          imgSrc = require('@nativeRes/images/event/devices/devices-names/_numberofusers.png');
          break;
        case 'amazon':
          imgSrc = require('@nativeRes/images/event/devices/devices-names/amazon.png');
          break;
        case 'apple':
          imgSrc = require('@nativeRes/images/event/devices/devices-names/apple.png');
          break;
        case 'galaxy-a3':
          imgSrc = require('@nativeRes/images/event/devices/devices-names/galaxy-a3.png');
          break;
        case 'galaxy-a5':
          imgSrc = require('@nativeRes/images/event/devices/devices-names/galaxy-a5.png');
          break;
        case 'galaxy-a7':
          imgSrc = require('@nativeRes/images/event/devices/devices-names/galaxy-a7.png');
          break;
        case 'galaxy-s1':
          imgSrc = require('@nativeRes/images/event/devices/devices-names/galaxy-s1.png');
          break;
        case 'galaxy-s2':
          imgSrc = require('@nativeRes/images/event/devices/devices-names/galaxy-s2.png');
          break;
        case 'galaxy-s3':
          imgSrc = require('@nativeRes/images/event/devices/devices-names/galaxy-s3.png');
          break;
        case 'galaxy-s4':
          imgSrc = require('@nativeRes/images/event/devices/devices-names/galaxy-s4.png');
          break;
        case 'galaxy-s5':
          imgSrc = require('@nativeRes/images/event/devices/devices-names/galaxy-s5.png');
          break;
        case 'galaxy-s6':
          imgSrc = require('@nativeRes/images/event/devices/devices-names/galaxy-s6.png');
          break;
        case 'galaxy-s7':
          imgSrc = require('@nativeRes/images/event/devices/devices-names/galaxy-s7.png');
          break;
        case 'galaxy-tab':
          imgSrc = require('@nativeRes/images/event/devices/devices-names/galaxy-tab.png');
          break;
        case 'galaxy-tab2':
          imgSrc = require('@nativeRes/images/event/devices/devices-names/galaxy-tab2.png');
          break;
        case 'galaxy-tab3':
          imgSrc = require('@nativeRes/images/event/devices/devices-names/galaxy-tab3.png');
          break;
        case 'galaxy-taba':
          imgSrc = require('@nativeRes/images/event/devices/devices-names/galaxy-taba.png');
          break;
        case 'general-mobile-device':
          imgSrc = require('@nativeRes/images/event/devices/devices-names/general-mobile-device.png');
          break;
        case 'general-mobile-phone':
          imgSrc = require('@nativeRes/images/event/devices/devices-names/general-mobile-phone.png');
          break;
        case 'google':
          imgSrc = require('@nativeRes/images/event/devices/devices-names/google.png');
          break;
        case 'google-nexus':
          imgSrc = require('@nativeRes/images/event/devices/devices-names/google-nexus.png');
          break;
        case 'google-pixel':
          imgSrc = require('@nativeRes/images/event/devices/devices-names/google-pixel.png');
          break;
        case 'htc':
          imgSrc = require('@nativeRes/images/event/devices/devices-names/htc.png');
          break;
        case 'huawei':
          imgSrc = require('@nativeRes/images/event/devices/devices-names/huawei.png');
          break;
        case 'ipad':
          imgSrc = require('@nativeRes/images/event/devices/devices-names/ipad.png');
          break;
        case 'iphone':
          imgSrc = require('@nativeRes/images/event/devices/devices-names/iphone.png');
          break;
        case 'ipod':
          imgSrc = require('@nativeRes/images/event/devices/devices-names/ipod.png');
          break;
        case 'lg':
          imgSrc = require('@nativeRes/images/event/devices/devices-names/lg.png');
          break;
        case 'linux-desktop':
          imgSrc = require('@nativeRes/images/event/devices/devices-names/linux-desktop.png');
          break;
        case 'macintosh':
          imgSrc = require('@nativeRes/images/event/devices/devices-names/macintosh.png');
          break;
        case 'one-plus':
          imgSrc = require('@nativeRes/images/event/devices/devices-names/one-plus.png');
          break;
        case 'samsung':
          imgSrc = require('@nativeRes/images/event/devices/devices-names/samsung.png');
          break;
        case 'sony-xperia':
          imgSrc = require('@nativeRes/images/event/devices/devices-names/sony-xperia.png');
          break;
        case 'windows-desktop':
          imgSrc = require('@nativeRes/images/event/devices/devices-names/windows-desktop.png');
          break;
      }
      return (
        <View key={index} style={event_devices.device_type_tile}>
          <Image style={{height:60, resizeMode: 'contain', marginBottom: 20}} source={imgSrc}/>
          <Text style={event_devices.numbers}>{item.value.toLocaleString()}</Text>
          <View style={event_devices.decoration}/>
          <Text style={event_devices.title}>{item.title}</Text>
        </View>
      )
    })
  }
  _renderTapDeviceName = () => {
    let device_name_top5 = this.state.rows_device_name.slice(0, 5)
    let device_name_rest = this.state.rows_device_name.slice(6, this.state.rows_device_name.length)
    return (
      <View style={event_devices.tab_content_device_types}>
        <View style={event_devices.top5}>{this.getTiles_device_name(device_name_top5)}</View>
      </View>
    )
  }
  render() {
    const {loading, rows_device_name, rows_platform_description, rows_device_brand_name, total, select_category} = this.state
    if (loading) {
      return <LoadingBar title={'Hold tight! We\'re getting your event\'s statistics...'} />
    }
    return (
      <View style={event_devices.event_devices}>
        <Triangle
          width={320}
          height={140}
          color={'#2f3239'}
          direction={'down'}
        />
        <View style={event_devices.total_buyers}>
          <Image style={event_devices.total_image} source={require('@nativeRes/images/event/devices/icon_top.png')}/>
          <Counter
            end={total}
            start={0}
            time={3000}
            digits={0}
            easing='linear'
            style={event_devices.total_count}
          />
          <Text style={event_devices.total_description}>Total Ticket Buyers</Text>
        </View>
        {this._renderTapContent()}
        {select_category == BROWSER && this._renderTapBrowser()}
        {select_category == DEVICE_TYPE && this._renderTapDeviceType()}
        {select_category == 2 && this._renderTapPlateForm()}
        {select_category == 3 && this._renderTapDeviceBrand()}
        {select_category == 4 && this._renderTapDeviceName()}
      </View>
    )
  }
}export default connect(
  (state) => {
    const event = state.events.get('selected').toJS()
    return {
      event,
    }
  }
)(EventDevices)

