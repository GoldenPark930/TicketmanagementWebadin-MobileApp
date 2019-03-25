import React from 'react'
import {TouchableOpacity, View, ActivityIndicator, Text} from 'react-native'
import {Link} from 'react-router-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import {commonStyle} from '../../native/styles'
import PropTypes from 'prop-types';

export default class Button extends React.Component {
  static propTypes = {
    style: PropTypes.any,
    title: PropTypes.string,
    disabled: PropTypes.bool,
    loading: PropTypes.bool,
    icon: PropTypes.string,
    rightIcon: PropTypes.string,
    success: PropTypes.bool,
    onPress: PropTypes.func,
    size: PropTypes.oneOf(['normal', 'small', 'large']),
    href: PropTypes.string
  }

  onPress = (e) => {
    const {onPress} = this.props
    if (onPress && typeof onPress === 'function') onPress(e)
  }

  render() {
    const {style, title, disabled, loading, success, icon, size, rightIcon, href} = this.props

    let isSmall = size == 'small'

    if (href) {
      return (
        <Link to={href} underlayColor='transparent'>
          <View
            style={[commonStyle.buttonContainer, commonStyle.shadow, style, isSmall && commonStyle.buttonSmallPadding]}>
            {loading && <ActivityIndicator color='white' style={{marginRight: 10}}/>}
            {success && <Icon name='check' style={{color: 'white', marginRight: 10}}/>}
            {!loading && !success && icon && <Icon name={icon} style={{color: 'white', marginRight: 10}}/>}
            {title &&
            <View><Text
              style={isSmall ? commonStyle.buttonTitleLabelSmall : commonStyle.buttonTitleLabel}>{title}</Text></View>}
            {!loading && !success && rightIcon && <Icon name={rightIcon} style={{color: 'white'}}/>}
          </View>
        </Link>
      )
    }

    return (
      <TouchableOpacity disabled={disabled} onPress={this.onPress}>
        <View style={[commonStyle.buttonContainer, commonStyle.shadow, style, isSmall && commonStyle.buttonSmallPadding]}>
          {loading && <ActivityIndicator color='white' style={{marginRight: 10}}/>}
          {success && <Icon name='check' style={{color: 'white', marginRight: 10}}/>}
          {!loading && !success && icon && <Icon name={icon} style={{color: 'white', marginRight: 10}}/>}
          {title &&
          <View><Text
            style={isSmall ? commonStyle.buttonTitleLabelSmall : commonStyle.buttonTitleLabel}>{title}</Text></View>}
          {!loading && !success && rightIcon && <Icon name={rightIcon} style={{color: 'white'}}/>}
        </View>
      </TouchableOpacity>
    )
  }
}
