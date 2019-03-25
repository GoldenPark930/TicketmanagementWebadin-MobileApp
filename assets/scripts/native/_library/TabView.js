import React from 'react'
import PropTypes from 'prop-types'
import {View, Text, TouchableOpacity, ScrollView} from 'react-native'
import styles from '../styles/common'
import Icon from 'react-native-vector-icons/FontAwesome'

export class Tab extends React.Component {
  render() {
    return <View style={this.props.style}>{this.props.children}</View>
  }
}

export class TabView extends React.Component {
  static propTypes = {
    tabBarUnderlineColor : PropTypes.string,
    tabBarTextStyle : PropTypes.any,
    tabBarActiveTextStyle : PropTypes.any,
    tabBarActiveViewColor: PropTypes.string,
    tabBarStyle : PropTypes.any,
    style: PropTypes.any,
    icon: PropTypes.string,
    tabBarActiveBackgroundColor: PropTypes.any
  }
  constructor(props) {
    super(props)

    // initialize state
    this.state = { selectedIndex: props.all ? 0 : 1 }
  }

  render() {
    const {all,hasBackground, style,tabBarUnderlineColor,tabBarActiveTextStyle,tabBarStyle,tabBarActiveViewColor,tabBarTextStyle, shape} = this.props
    const {selectedIndex} = this.state
    let headers = []
    let bodies = []

    if(all) {
      headers.push(
        <View key={0} className={'tab-title'+(selectedIndex==0 ? ' selected' : '')} onClick={() => this.selectIndex(0)}>
          <Text>All</Text>
        </View>
      )
    }
    for(let i=0; i<this.props.children.length; i++) {
      let activeViewColor
      if (selectedIndex==i+1) {
        if(tabBarActiveViewColor) {
          activeViewColor = tabBarActiveViewColor
        }else{
          activeViewColor = '#1a1d25'
        }
      }else{
        activeViewColor = '#1a1d2500'
      }
      headers.push(
        <TouchableOpacity key={i+1}
                          onPress={() => this.selectIndex(i+1)}>
          <View
            style={[styles.tabBar,{
              borderBottomWidth:3,
              borderBottomColor: tabBarUnderlineColor && selectedIndex==i+1 ? tabBarUnderlineColor : '#00000000',
              backgroundColor:activeViewColor}, tabBarStyle]}
          >
            {selectedIndex==i+1 && <View style={{
              position: 'absolute',
              left:0, right:0, bottom:0, top:-10,
            }}>
              {!shape && <View style={{
                borderBottomColor: '#393e46',
                borderBottomWidth: 65,
                borderLeftColor: 'transparent',
                borderLeftWidth: selectedIndex == 1 ? 0: 18 ,
                borderRightColor: 'transparent',
                borderRightWidth: selectedIndex == this.props.children.length ? 0: 18 ,
                borderTopColor: '#393e46',
                borderTopWidth: 0
              }} />}
            </View>}
            <View style={[{alignItems: 'center'}]}>
              {this.props.children[i].props.icon && <Icon name={this.props.children[i].props.icon} size={20} color={selectedIndex==i+1 ? '#ffa46b': '#ffffff'} size={14}/>}
              <Text style={[ styles.tabBarTextStyle, selectedIndex==i+1 && tabBarActiveTextStyle ? tabBarActiveTextStyle : tabBarTextStyle]}>{this.props.children[i].props.title}</Text>
            </View>
          </View>
        </TouchableOpacity>
      )
      if (selectedIndex==0 || selectedIndex==i+1) {
        bodies.push(
          <View key={i + 1}>
            {this.props.children[i].props.children}
          </View>
        )
      }
    }

    return (
      <View>
        <ScrollView horizontal={true} style={[styles.tabHeader]}>
          {headers}
        </ScrollView>
        <View style={[{
          backgroundColor:'#1a1d25',
          paddingHorizontal:10,
          paddingVertical:15}, style]}>
          {bodies}
        </View>
      </View>
    )
  }

  selectIndex(i) {
    this.setState({
      selectedIndex: i
    })
    if(this.props.onSelectTab) {
      this.props.onSelectTab(i)
    }
  }
}
