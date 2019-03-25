import _ from 'lodash'
import React, {Component} from 'react'
import {View, TouchableWithoutFeedback, Text, Platform} from 'react-native'
import Svg, {G, Path} from 'react-native-svg'
import d3 from 'd3'
import {commonStyle} from '../../native/styles'

const DEFAULT_SIZE = 250

export default class PieChart extends Component {
  constructor(props) {
    super(props)

    let options = props.options
    this.state = {
      size: options.size || DEFAULT_SIZE,
      radius: (options.size || DEFAULT_SIZE)/2,
      data: this.getData(props)
    }
  }

  componentWillReceiveProps(newProps) {
    if(!_.isEqual(newProps, this.props)) {
      this.setState({data:this.getData(newProps)})
    }
  }

  getData(props) {
    let {json} = props
    let total = 0
    return _.map(json, (index, value) => {
      total = total + parseInt(index)
      return [value, parseInt(index)]
    })
  }
  toggleHighlight(i) {
    this.setState({
      barColour: [
        ...this.state.barColour.slice(0, i),
        this.state.barColour[i] === colours.blue ? colours.brown : colours.blue,
        ...this.state.barColour.slice(i + 1)
      ]
    })
  }

  _color = (i) => {
    let colors_array = (this.props.options && this.props.options.colors) || ['#3bc77a', '#6C88CD', '#B1CE78', '#FF76A5', '#53DCEE', '#8C8AFC', '#00E2A8', '#00EEAF', '#495893', '#c378ce', '#77b754', '#cd5356', '#b4cdea', '#908c9c', '#e6c877', '#eb7f5e', '#72b791', '#28a474', '#0395e9', '#a0a0a0']
    return colors_array[i % colors_array.length]
  }

  _createArc(index) {

    const arcs = d3.layout.pie()
      .sort(null)
      .value((d) => d[1])
      .padAngle(.04)
      (this.state.data)

    const arc = d3.svg.arc()
      .innerRadius(3)
      .outerRadius(this.state.radius - 10)
    const arcOver = d3.svg.arc()
      .innerRadius(3)
      .outerRadius(this.state.radius)


    const arcData = arcs[index]
    //var path = (this.state.highlightedIndex == index) ? hightlightedArc(arcData) : arc(arcData);
    const path = arc(arcData)
    return {
      path,
      color: this._color(index)
    }
  }

  // getViewWidth = (e) => {
  //   this.setState({viewWidth: e.nativeEvent.layout.width})
  // }
  getClientRect = (e) => {
    this.setState({
      clientRect: e.nativeEvent.layout
    })
  }
  removeArcTooltip = () => {
    this.setState({arcTooltipInfo: null})
  }

  render() {
    const {options: {title, legands}} = this.props
    const {data, arcTooltipInfo, radius, size} = this.state
    const svg = (
      <TouchableWithoutFeedback onPress={this.removeArcTooltip}>
        <View style={{alignItems: 'center'}}>
          {title && <Text style={commonStyle.chartTitleLabel}>{title}</Text>}
          <View onLayout={this.getClientRect}>
            <Svg width={size} height={size}>
              <G transform = {`translate(${radius},${radius})`} >
                {
                  data.map((item, i) => {
                    const {path, color} = this._createArc(i)
                    return (
                      <TouchableWithoutFeedback key={`arc-${i}`} onPress={(e) => this.onArcPress(e, i)}>
                        {Platform.OS === 'ios' ? <Path d={path} fill={color}/> : <Path fill={color}/>}
                      </TouchableWithoutFeedback>
                    )
                  })
                }
              </G>
            </Svg>
          </View>
          {arcTooltipInfo && this.renderArcTooltip(arcTooltipInfo)}
          {(legands==null || legands!=false) && <View style={[commonStyle.chartLegandContainer]}>
            {
              data.map((d, index) => (
                  <View key={`legand-${index}`} style={{flexDirection: 'row', padding: 10, minWidth: 125}}>
                    <View style={[{borderRadius: 2, width: 5, height: 15}, {backgroundColor: this._color(index)}]}/><Text
                    style={commonStyle.chartLegandLabel}> {d[0]}</Text>
                  </View>
                )
              )
            }
          </View>}
        </View>
      </TouchableWithoutFeedback>
    )

    return svg
  }

  renderArcTooltip = (info) => {
    const {clientRect, data} = this.state
    if (!clientRect) return ''
    const percentage = () => parseInt(info.d[1] * 100 / _.sumBy(data, d => d[1]))

    return (
      <View
        style={[commonStyle.chartTooltip, {left: clientRect.x + info.locationX, top: clientRect.y + info.locationY}]}>
        <View style={[commonStyle.chartTooltipColor, {backgroundColor: info.color}]}/>
        <Text style={commonStyle.chartTooltipKey}>{info.d[0]}</Text>
        <Text style={commonStyle.chartTooltipValue}>{info.d[1]}</Text><Text style={commonStyle.chartTooltipValue}>({percentage()})%</Text>
      </View>
    )
  }


  onArcPress = (e, i) => {
    const {locationX, locationY} = e.nativeEvent

    const {data} = this.state
    this.setState({
      arcTooltipInfo: {
        locationX,
        locationY,
        d: data[i],
        color: this._color(i)
      }
    })
  }
}
