import React from 'react'
import d3 from 'd3'
import ReactResizeDetector from 'react-resize-detector'
import moment from 'moment-timezone'

import {makeURL} from '../../_common/core/http'
import {HTTP_INIT, HTTP_LOADING, HTTP_LOADING_SUCCESSED, HTTP_LOADING_FAILED, CACHE_SIZE} from '../../_common/core/http'

const DEFAULT_INTERVAL = 500
const DEFAULT_COLORS = ['#3bc77a', '#6C88CD', '#B1CE78', '#FF76A5', '#53DCEE', '#8C8AFC', '#00E2A8', '#DDB09D']
const DEFAULT_MARGIN_LEFT = 10
const DEFAULT_MARGIN_LEFT_TITLE = 50
const DEFAULT_MARGIN_TOP = 20
const DEFAULT_MARGIN_RIGHT = 10
const DEFAULT_MARGIN_BOTTOM = 30
const DEFAULT_MARGIN_BOTTOM_TITLE = 70
const DEFAULT_BAR_MAXWIDTH = 40
const DEFAULT_BAR_MINWIDTH = 16
const DEFAULT_BAR_TRANSITION_DURATION = 500

const DATA_METHOD_REMOTE = 'remote'
const DATA_METHOD_LOCAL = 'local'

export default class BarChart extends React.Component {
  constructor(props) {
    super(props)

    this.unMounted = true

    let options = props.options
    this.state = {
      height: options.height || 350,
      titleX: options.titleX,
      titleY: options.titleY,
      margin: {
        left: options.titleY ? DEFAULT_MARGIN_LEFT_TITLE : DEFAULT_MARGIN_LEFT_TITLE,
        top: DEFAULT_MARGIN_TOP,
        right: DEFAULT_MARGIN_RIGHT,
        bottom: options.titleX ? DEFAULT_MARGIN_BOTTOM_TITLE : DEFAULT_MARGIN_BOTTOM
      },
      barMaxWidth: DEFAULT_BAR_MAXWIDTH,
      barMinWidth: DEFAULT_BAR_MINWIDTH,
      barMinWidthSupport: options.barMinWidth,
      colors: (i) => ((options.colors) ? options.colors[i%options.colors.length] : DEFAULT_COLORS[i%DEFAULT_COLORS.length]),
      barHover: options.barHover || options.barHover==null,
      tooltip: options.tooltip || options.tooltip==null,
      autoRefresh: options.autoRefresh,
      componentVisible: false,
      offline: false,
      lastOnlineTime: null,
    }
  }

  componentDidMount() {
    this.unMounted = false
    this.init()
  }

  componentWillUnmount() {
    this.unMounted = true
    clearInterval(this.drawBarsInterval)
    clearInterval(this.autoRefreshInterval)
  }

  componentWillReceiveProps(nextProps) {
    if(JSON.stringify(this.props.data.data)!=JSON.stringify(nextProps.data.data) && !this.unMounted) {
      this.setState({}, this.refresh.bind(this))
    }
  }

  resizeHandler() {
    clearInterval(this.drawBarsInterval)
    setTimeout(() => {
      this.setOptions()
      this.drawChart()
      this.drawBarsInterval = setInterval(this.drawBars.bind(this), DEFAULT_INTERVAL)
    }, 0)
  }

  init() {
    clearInterval(this.drawBarsInterval)
    clearInterval(this.autoRefreshInterval)
    this.clearChart()

    this.refresh()
    if(this.state.autoRefresh) {
      this.autoRefreshInterval = setInterval(this.refresh.bind(this), this.state.autoRefresh)
    }
  }

  refresh() {
    clearInterval(this.drawBarsInterval)

    let that = this
    this.setOptions()
    this.loadData(() => {
      that.drawChart()
      that.drawBarsInterval = setInterval(that.drawBars.bind(that), DEFAULT_INTERVAL)
    })
  }

  setOptions() {
    let svg = d3.select(this.refs.barchart)
    if(!svg.node()) return

    let {barMinWidth, margin, barMinWidthSupport} = this.state
    if(this.props.data && this.props.data.data && barMinWidthSupport) {
      svg.style('min-width', (barMinWidth*Object.keys(this.props.data.data).length + margin.left + margin.right)+'px')
    }
  }

  loadData(callback) {
    let {data, parent_http_status} = this.props
    let that = this

    if(data.method == DATA_METHOD_REMOTE) {
      let {url, param, cb} = data
      oboe({
          url: makeURL(url, param),
          method: 'GET',
          headers: isDemoAccount() ? null : {
            'Accept': 'application/vnd.api+json',
            'Content-Type': 'application/vnd.api+json'
          },
          withCredentials: true
        }).done((response) => {
          if(!that.unMounted){
            let result = cb(response)
            that.setState({
              data: Object.entries(result),
              dataX: Object.keys(result),
              dataY: Object.values(result),
              offline: false
            }, callback)
          }
        }).fail((errorReport) => {
          if(!that.unMounted) {
            this.setState({
              offline: true,
              lastOnlineTime: Date.now()
            })
          }
        })
    } else if(data.method == DATA_METHOD_LOCAL) {
      if(!that.unMounted){
        if(parent_http_status == HTTP_LOADING_FAILED) {
          this.setState({
            offline: true,
            lastOnlineTime: Date.now()
          }, callback)  
        } else {
          this.setState({
            data: Object.entries(data.data),
            dataX: Object.keys(data.data),
            dataY: Object.values(data.data),
            offline: false
          }, callback)  
        }
      }
    }
  }

  clearChart() {
    d3.select(this.refs.barchart).html('')
  }

  drawChart() {
    let svg = d3.select(this.refs.barchart)
    if(!svg.node()) return

    let {data, dataX, dataY, margin, titleX, titleY} = this.state

    let chartWidth = svg.node().getBoundingClientRect().width - this.state.margin.left - this.state.margin.right
    let chartHeight = svg.node().getBoundingClientRect().height - this.state.margin.top - this.state.margin.bottom

    if(chartWidth<=0) return

    let chartX = d3.scale.ordinal()
      .rangeBands([0, chartWidth], .1)
      .domain(data.map(d => d[0]))
    let chartY = d3.scale.linear()
      .range([chartHeight, 0])
      .domain([0, d3.max(data, d => d[1])])
    let xAxis = d3.svg.axis()
      .scale(chartX)
      .orient('bottom')
      .tickSize(0, 0)
      .tickPadding(15)
    let yAxis = d3.svg.axis()
      .scale(chartY)
      .orient('left')
      .tickSize(-chartWidth, 0)
      .tickPadding(10)
      .ticks(d3.min([10, d3.max(dataY)]))

    let g = svg.select('g')
    if(!g[0][0]) g = svg.append('g')
    g.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

    g.selectAll('.axis').remove()
    g.insert('g', ':first-child')
      .attr('class', 'axis x-axis')
      .attr('transform', 'translate(0,' + chartHeight + ')')
      .call(xAxis)
      .call(g => {
        let texts = g.selectAll('.tick text')[0]
        let textsWidth = 0
        for(let i=0; i<texts.length; i++) {
          textsWidth += d3.select(texts[i]).node().getBoundingClientRect().width
        }
        if(textsWidth>chartWidth-150){ 
          g.selectAll('.tick text').style('display', 'none')
        }
      })
    g.insert('g', ':first-child')
      .attr('class', 'axis y-axis')
      .call(yAxis)
      .call(g => {
        g.selectAll('.tick line').attr('x1', -30)
        g.selectAll('.tick text').attr('dy', -7)
      })

    g.selectAll('.axis-label').remove()
    if(titleY) {
      g.insert('text', ':first-child')
        .attr('x', -chartHeight/2)
        .attr('y', -60)
        .attr('transform', 'rotate(-90)')
        .attr('class', 'axis-label axis-label-y')
        .text(titleY)
    }
    if(titleX) {
      g.insert('text', ':first-child')
        .attr('x', chartWidth/2)
        .attr('y', chartHeight+60)
        .attr('class', 'axis-label axis-label-x')
        .text(titleX)
    }
  }

  drawBars() {
    let svg = d3.select(this.refs.barchart)

    if(!this.state.componentVisible) {
      if (document.hidden) return
      if (!svg.node()) return
      let ele = $(this.refs.barchart)
      if(
        !ele || 
        ele.offset().top-$(window).scrollTop()<=0 || 
        ele.offset().top+ele.height()-$(window).scrollTop()>=$(window).height() ||
        (ele.closest('.Collapsible__contentOuter') && ele.closest('.Collapsible__contentOuter').height()==0)
      )
        return
    }

    if(this.unMounted) return

    let that = this
    let {data, dataX, dataY, margin, titleX, titleY, barMaxWidth, colors, barHover, tooltip} = this.state

    let chartWidth = svg.node().getBoundingClientRect().width - this.state.margin.left - this.state.margin.right
    let chartHeight = svg.node().getBoundingClientRect().height - this.state.margin.top - this.state.margin.bottom
    
    if(chartWidth<=0) return
    
    this.setState({componentVisible: true})
    clearInterval(this.drawBarsInterval)

    let chartX = d3.scale.ordinal()
      .rangeBands([0, chartWidth], .1)
      .domain(data.map(d => d[0]))
    let chartY = d3.scale.linear()
      .range([0, chartHeight])
      .domain([0, d3.max(data, d => d[1])])

    let g = d3.select(this.refs.barchart).select('g')

    let bars = g.select('.bars')
    if(!bars[0][0]) bars = g.append('g').attr('class', 'bars')

    let bars_d = bars.selectAll('.bar').data(data)
    
    bars_d.enter().append('rect')
      .attr('class', barHover ? 'bar hover' : 'bar')
      .attr('x', d => chartX.rangeBand()>barMaxWidth ? chartX(d[0])+(chartX.rangeBand()-barMaxWidth)/2 : chartX(d[0]))
      .attr('width', chartX.rangeBand()>barMaxWidth ? barMaxWidth : chartX.rangeBand())
      .attr('fill', (d, i) => colors(i))
      .attr('stroke', (d, i) => colors(i))
      .attr('y', d => chartHeight)
      .attr('height', d => 0)

    bars_d.exit().remove()

    bars.selectAll('.bar')
      .attr('x', d => chartX.rangeBand()>barMaxWidth ? chartX(d[0])+(chartX.rangeBand()-barMaxWidth)/2 : chartX(d[0]))
      .attr('width', chartX.rangeBand()>barMaxWidth ? barMaxWidth : chartX.rangeBand())
      .transition()
        .duration(DEFAULT_BAR_TRANSITION_DURATION)
        .delay((d, i) => i*50)
        .ease('linear')
        .attr('y', d => chartHeight - chartY(d[1]))
        .attr('height', d => chartY(d[1]))

    if(tooltip) {
      setTimeout(() => {
        bars.selectAll('.bar')
          .on('mousemove', function(d, i) {
            let tooltip = d3.select(that.refs.barchartTooltip)
            tooltip.select('.barchart-tooltip-color')
              .style('background-color', colors(i))
            tooltip.select('.barchart-tooltip-key')
              .text(d[0])
            tooltip.select('.barchart-tooltip-value')
              .text(d[1])
            tooltip.style('left', ($(that.refs.barchart).parent().scrollLeft()+d3.event.layerX-tooltip.node().getBoundingClientRect().width/2)+'px')
              .style('top', (d3.event.layerY-tooltip.node().getBoundingClientRect().height-5)+'px')
              .style('visibility', 'visible')
          })
          .on('mouseout', function(d) {
            d3.select(that.refs.barchartTooltip)
              .style('visibility', 'hidden')
              .style('left', '0px')
              .style('top', '0px')
          })
      }, DEFAULT_BAR_TRANSITION_DURATION)
    }
  }

  render() {
    let {height, tooltip, offline, lastOnlineTime} = this.state
    return (
      <div className="barchart">
        <svg ref="barchart" width="100%" height={height}></svg>
        { tooltip &&
          <div ref="barchartTooltip" className="barchart-tooltip">
            <div className="barchart-tooltip-color"></div>
            <div className="barchart-tooltip-key"></div>
            <div className="barchart-tooltip-value"></div>
          </div>
        }
        { offline &&
          <div className="offline_message">
            <img src='data:image/png;base64,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'/>
            <div className="bold">You are working offline. </div>
            <div>Information last updated on {moment(lastOnlineTime).format('D MMM YYYY')} at {moment(lastOnlineTime).format('hh:mm:ss')}</div>
          </div>
        }
        <ReactResizeDetector handleWidth handleHeight onResize={this.resizeHandler.bind(this)} />
      </div>
    )
  }
}
