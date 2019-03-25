import DeviceInfo from 'react-native-device-info'
import _ from 'lodash'
import React, {Component} from 'react'
import {View, ScrollView, TouchableWithoutFeedback, Platform, Text as Text1} from 'react-native'
import Svg, {G, Line, Path, Rect, Text, Circle} from 'react-native-svg'
import d3 from 'd3'
import {line} from 'd3-shape'
import {max, ticks} from 'd3-array'
import {commonStyle, styleConstant} from '../../native/styles'

const DEFAULT_HEIGHT = 350
const BAR_MAX_WIDTH = 40
const BAR_MIN_WIDTH = 7

export default class BarChart extends Component {
    constructor(props) {
        super(props)

        this.state = {}
        this.contentOffsetX = 0
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

    getChartMargin() {
        const {options} = this.props
        const margin = DeviceInfo.isTablet() ? {top: 40, right: 50, bottom: 40, left: 50} : {top: 20, right: 10, bottom: 30, left: 30}
        if (options.titleY && options.titleY.length > 0) {
            margin.left += 30
        }
        if (options.titleX && options.titleX.length > 0) {
            margin.bottom += 40
        }
        return margin
    }
    getChart(props, {width, height}) {
        const chart = {
            barsDrawn: false
        }

        chart.data = _.map(props.json, (value, key) => {
            return [key, value]
        })

        chart.margin = this.getChartMargin()
        chart.width = width - chart.margin.left - chart.margin.right
        chart.height = height - chart.margin.top - chart.margin.bottom

        chart.colors = (i) => {
            let colors_array = ['#3bc77a', '#6C88CD', '#B1CE78', '#FF76A5', '#53DCEE', '#8C8AFC', '#00E2A8', '#00EEAF', '#495893', '#c378ce', '#77b754', '#cd5356', '#b4cdea', '#908c9c', '#e6c877', '#eb7f5e', '#72b791', '#28a474', '#0395e9', '#a0a0a0']
            return colors_array[i % colors_array.length]
        }

        // Set x-axis
        chart.x = d3.scale.ordinal()
            .rangeRoundBands([0, chart.width], .1)
            .domain(chart.data.map(d => d[0]))
        // Set y-axis
        chart.y = d3.scale.linear()
            .range([chart.height, 0])
            .domain([0, max(chart.data, d => d[1])])

        this.chart = chart
        return chart
    }

    calculateViewWidth = (e) => {  // To fit width as screen width
        const {width} = e.nativeEvent.layout
        this.setState({width})
    }

    calculateCharacterWidth = (e) => {  // To calculate text width
        const {width} = e.nativeEvent.layout
        this.characterWidth = width
    }

    calculateTitleViewHeight = (e) => {
        const {height} = e.nativeEvent.layout
        this.titleViewHeight = height
    }
    removeBarTooltip = () => {
        this.setState({barTooltipInfo: null})
    }

    getCalculatedWidth() {
        const {width} = this.state

        const margin = this.getChartMargin()
        const minWidth = Object.keys(this.props.json).length * BAR_MIN_WIDTH + margin.left + margin.right

        return width > minWidth ? width : minWidth
    }

    handleScroll = (evt) => {
        this.contentOffsetX = evt.nativeEvent.contentOffset.x
    }

    onBarPress = (e, i) => {
        const {locationX, locationY} = e.nativeEvent
        //console.log(`locationX=${locationX}, locationY=${locationY}, pageX=${pageX}, pageY=${pageY}`)

        const chart = this.chart
        this.setState({
            barTooltipInfo: {
                //px: locationX - chart.margin.left,
                //py: locationY - chart.margin.top - chart.height,
                locationX: locationX - this.contentOffsetX,
                locationY,
                d: chart.data[i],
                color: chart.colors(i)
            }
        })
    }

    render() {
        const {options} = this.props
        const title = options && options.title
        const titleX = options && options.titleX
        const titleY = options && options.titleY

        const width = this.getCalculatedWidth()
        const height = options && options.height || DEFAULT_HEIGHT

        const chart = this.getChart(this.props, {width: width, height: height})

        return (
            <View onLayout={this.calculateViewWidth}>
              <View style={{flexDirection: 'row'}}>
                <Text1 style={{color:'transparent', fontSize:11}} onLayout={this.calculateCharacterWidth}>a</Text1>
              </View>
              <View style={{alignItems: 'center'}} onLayout={this.calculateTitleViewHeight}>
                  {title && <Text style={commonStyle.chartTitleLabel}>{title}</Text>}
              </View>
              <ScrollView horizontal onScroll={this.handleScroll}>
                <TouchableWithoutFeedback onPress={this.removeBarTooltip}>
                  <Svg width={width} height={height}>
                    <G transform = {`translate(${chart.margin.left}, ${chart.margin.top})`}>
                        {/*Render X axis title*/}
                      <G>
                          {titleX && titleX.length &&
                          <Text fill={styleConstant.colors.chartTitleLabel} fontWeight='600' fontSize={18}
                                fontFamily='Open Sans' textAnchor='middle'
                                x={chart.width / 2 + 80}
                                y={chart.height + 40}>{titleX.toUpperCase()}</Text>}
                      </G>
                        {/*Render Y axis title*/}
                      <G>
                          {titleY && titleY.length &&
                          <Text fill={styleConstant.colors.chartTitleLabel} fontWeight='600' fontSize={18}
                                fontFamily='Open Sans' textAnchor='middle'
                                x={-60} y={chart.height / 2 + 10}
                                rotate={-90}>{titleY.toUpperCase()}</Text>}
                      </G>
                        {this.renderChart(chart)}
                    </G>
                  </Svg>
                </TouchableWithoutFeedback>
              </ScrollView>
                {this.state.barTooltipInfo && this.renderBarTooltip(this.state.barTooltipInfo)}
            </View>
        )
    }

    renderChart(chart) {
        //if (_.isEmpty(chart.data)) return

        const yAxis = ticks(0, max(chart.data, d => d[1]), 10)

        const labelDistance = 9
        const bandWidth = chart.x.rangeBand()

        const x = (d) => bandWidth > BAR_MAX_WIDTH ? chart.x(d[0]) + (bandWidth - BAR_MAX_WIDTH) / 2 : chart.x(d[0])
        return (
            <G transform = {`translate(${0}, ${chart.height})`}>
              <G key={-1}>
                <Line stroke={styleConstant.colors.chartScaleLine} x1={-30} x2={chart.width}/>
                  {
                      // Render X-Axis labels
                      this.characterWidth &&
                      chart.data.map((d, i) => {
                          const labelWidth = this.characterWidth * d[0].length

                          return (
                              <G key={i + 1}>
                                  {labelWidth < bandWidth &&
                                  <Text fontSize='11' fontWeight='400' fill={styleConstant.colors.chartLegandLabel} x={chart.x(d[0]) + (bandWidth - labelWidth) / 2}
                                        y={labelDistance}>{d[0]}</Text>}
                              </G>
                          )
                      })
                  }
              </G>
              <G key={-2}>
                <Line stroke={styleConstant.colors.chartScaleLine} y1={0} y2={-chart.height}/>
                  {
                      // Render Y-Axis labels
                      yAxis.map((d, i) => (
                          <G key={i + 1} transform = {`translate(0, ${(chart.y(d) - chart.height)})`}>
                            <Line stroke={styleConstant.colors.chartScaleLine} strokeWidth='2' x1={-30}
                                  x2={chart.width}/>
                            <Text fontSize='11' fontWeight='400' textAnchor='end' fill={styleConstant.colors.chartLegandLabel}
                                  x={-10} y={-5}
                                  dy={-10}>{d.toLocaleString()}</Text>
                          </G>
                      ))
                  }
              </G>
                {/* Draw bars*/
                    chart.data.map((d, i) => {
                            return (
                                <TouchableWithoutFeedback key={i} onPress={(e) => this.onBarPress(e, i)}>
                                  <Rect
                                      x={bandWidth > BAR_MAX_WIDTH ? chart.x(d[0]) + (bandWidth - BAR_MAX_WIDTH) / 2 : chart.x(d[0])}
                                      y={chart.y(d[1]) - chart.height}
                                      width={bandWidth > BAR_MAX_WIDTH ? BAR_MAX_WIDTH : bandWidth}
                                      height={chart.height - chart.y(d[1])}
                                      fill={chart.colors(i)}
                                      stroke={chart.colors(i)}
                                  >
                                  </Rect>
                                </TouchableWithoutFeedback>
                            )
                        }
                    )
                }
            </G>
        )
    }

    renderBarTooltip = (info) => {
        return (
            <View style={[commonStyle.chartTooltip, {left: info.locationX, top: info.locationY}]}>
              <View style={[commonStyle.chartTooltipColor, {backgroundColor: info.color}]}/>
              <Text1 style={commonStyle.chartTooltipKey}>{info.d[0]}</Text1>
              <Text1 style={commonStyle.chartTooltipValue}>{info.d[1]}</Text1>
            </View>
        )
    }

}
