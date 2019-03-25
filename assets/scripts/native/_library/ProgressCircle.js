import _ from 'lodash'
import React from 'react'
import {View, Text, Image} from 'react-native'
import {AnimatedCircularProgress} from 'react-native-circular-progress'
import commonStyle from '../../native/styles/common'
import PropTypes from 'prop-types';

const DEFAULT_SIZE = 192
const DEFAULT_WIDTH = 10
const DEFAULT_TINT_COLOR = '#fb52ae'
const DEFAULT_BACKGROUND_COLOR = '#40475c'

export default class ProgressCircle extends React.Component {

  static propTypes = {
    size: PropTypes.number,
    width: PropTypes.number,
    tintColor: PropTypes.string,
    backgroundColor: PropTypes.string,
    value: PropTypes.number,
    img: PropTypes.number
  }

  constructor(props) {
    super(props)

    this.state = this.getStateFromProps(props)
  }

  getStateFromProps(props) {
    return {
      size: props.size || DEFAULT_SIZE,
      width: props.width || DEFAULT_WIDTH,
      tintColor: props.tintColor || DEFAULT_TINT_COLOR,
      backgroundColor: props.backgroundColor || DEFAULT_BACKGROUND_COLOR,
      value: props.value || 0,
      img: props.img
    }
  }

  componentWillReceiveProps(newProps) {
    if(!_.isEmpty(newProps, this.props)) {
      this.setState(this.getStateFromProps(newProps))
    }
  }

  render() {
    const {size, width, tintColor, backgroundColor, value, img} = this.state

    return (
      <AnimatedCircularProgress
        size={size}
        width={width}
        fill={value}
        tintColor={tintColor}
        backgroundColor={backgroundColor}
        rotation={0}>
        {
          (fill) => {
            const r = size/2/Math.sqrt(2)
            const offset = size/2-r
            return (<View style={{position:'absolute', top:offset, left:offset, width:2*r, height:2*r, alignItems:'center', justifyContent:'center'}}>
              {img && <Image style={commonStyle.imageStretch} source={img} resizeMode='contain'/>}
              {!img && <Text style={{color:'#FFF',fontSize:35}}>{value}%</Text>}
            </View>)
          }
        }
      </AnimatedCircularProgress>
    )
  }
}
