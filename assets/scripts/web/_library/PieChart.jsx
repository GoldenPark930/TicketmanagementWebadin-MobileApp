import React from 'react'
import d3 from 'd3'
import moment from 'moment-timezone'

import {makeURL} from '../../_common/core/http'
import {HTTP_INIT, HTTP_LOADING, HTTP_LOADING_SUCCESSED, HTTP_LOADING_FAILED, CACHE_SIZE} from '../../_common/core/http'

const DEFAULT_INTERVAL = 500
const DEFAULT_COLORS = ['#3bc77a', '#6C88CD', '#B1CE78', '#FF76A5', '#53DCEE', '#8C8AFC', '#00E2A8', '#00EEAF', '#495893','#c378ce','#77b754','#cd5356','#b4cdea','#908c9c','#e6c877','#eb7f5e','#72b791','#28a474','#0395e9','#a0a0a0']
const DEFAULT_SIZE = 250
const DEFAULT_PIE_PAD_ANGLE = 0.04
const DEFAULT_INNER_RADIUS = 3
const DEFAULT_PIE_TRANSITION_DURATION = 2000
const DEFAULT_PIE_HOVER_DURATION = 200
const DEFAULT_PIE_LABEL_PERCENT = 5
const DEFAULT_PIE_LABEL_POSITION = 0.4

const DATA_METHOD_REMOTE = 'remote'
const DATA_METHOD_LOCAL = 'local'

export default class PieChart extends React.Component {
  constructor(props) {
    super(props)

    this.unMounted = true

    let options = props.options
    this.state = {
      title: options.title,
      size: options.size || DEFAULT_SIZE,
      radius: (options.size || DEFAULT_SIZE)/2,
      colors: (i) => ((options.colors) ? options.colors[i%options.colors.length] : DEFAULT_COLORS[i%DEFAULT_COLORS.length]),
      pieHover: options.pieHover || options.pieHover==null,
      pieLabel: options.pieLabel==true,
      legends: options.legends || options.legends==null,
      tooltip: options.tooltip || options.tooltip==null,
      total: 0,
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
    clearInterval(this.drawChartInterval)
    clearInterval(this.autoRefreshInterval)
  }

  componentWillReceiveProps(nextProps) {
    if(JSON.stringify(this.props.data.data)!=JSON.stringify(nextProps.data.data) && !this.unMounted) {
      this.setState({}, this.refresh.bind(this))
    }
  }

  init() {
    clearInterval(this.drawChartInterval)
    clearInterval(this.autoRefreshInterval)
    this.clearChart()

    this.refresh()
    if(this.state.autoRefresh) {
      this.autoRefreshInterval = setInterval(this.refresh.bind(this), this.state.autoRefresh)
    }
  }

  refresh() {
    clearInterval(this.drawChartInterval)

    let that = this
    this.loadData(() => {
      that.drawChartInterval = setInterval(that.drawChart.bind(this), DEFAULT_INTERVAL)
    })
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
              total: Object.keys(result).reduce((p, k) => (p+result[k]), 0),
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
      if(!that.unMounted) {
        if(parent_http_status == HTTP_LOADING_FAILED) {
          this.setState({
            offline: true,
            lastOnlineTime: Date.now()
          }, callback)  
        } else {
          this.setState({
            data: Object.entries(data.data),
            total: Object.keys(data.data).reduce((p, k) => (p+data.data[k]), 0),
            offline: false
          }, callback)
        }
      }
    }
  }

  clearChart() {
    d3.select(this.refs.piechart).html('')
    d3.select(this.refs.piechartLegends).html('')
  }

  drawChart() {
    if(!this.state.componentVisible) {
      if (document.hidden) return
      if (!d3.select(this.refs.piechart).node()) return
      let ele = $(this.refs.piechartContainer)
      if(
        !ele || 
        ele.offset().top-$(window).scrollTop()<=0 || 
        ele.offset().top+ele.height()-$(window).scrollTop()>=$(window).height() ||
        (ele.closest('.Collapsible__contentOuter') && ele.closest('.Collapsible__contentOuter').height()==0)
      )
        return  
    }

    if(this.unMounted) return
    
    this.setState({componentVisible: true})
    clearInterval(this.drawChartInterval)

    let svg = d3.select(this.refs.piechart)
    const {size, radius, colors, total, data, pieHover, pieLabel, legends, tooltip} = this.state

    let data_d = []
    data.forEach((val, index) => {
      if(val[1]>0) {
        data_d.push([val[0], val[1], index])
      }
    })
    
    let pie = d3.layout.pie()
      .sort(null)
      .value(d => d[1])
      .padAngle(DEFAULT_PIE_PAD_ANGLE)
    let arc = d3.svg.arc()
      .innerRadius(DEFAULT_INNER_RADIUS)
      .outerRadius(radius-5)
    let arcOver = d3.svg.arc()
      .innerRadius(DEFAULT_INNER_RADIUS)
      .outerRadius(radius)

    let g = svg.select('g')
    let isFirst = false
    if(!g[0][0]) {
      g = svg.append('g')
      isFirst = true
    }
    g.attr('transform', 'translate(' + radius + ',' + radius + ')')

    let paths = g.selectAll('path')
        .data(pie(data_d))
    paths.enter().append('path')
      .attr('fill', (d, i) => colors(d.data[2]))
      .attr('d', arc({startAngle: isFirst ? 0 : Math.PI*2, endAngle: isFirst? 0 : Math.PI*2}))
      .each(function(d) {
        this._current = {
          data: d.data,
          value: d.value,
          startAngle: isFirst? 0 : Math.PI*2,
          endAngle: isFirst ? 0 : Math.PI*2
        }
      })

    g.selectAll('path').on('mouseenter',null)
    g.selectAll('path').on('mouseleave',null)
    g.selectAll('path').on('mousemove',null)
    g.selectAll('path').on('mouseout',null)
    paths.exit().transition()
      .duration(DEFAULT_PIE_TRANSITION_DURATION)
      .attrTween('d', function(d) {
        let i = d3.interpolate(this._current, {startAngle: Math.PI*2, endAngle: Math.PI*2, value: 0})
        this._current = i(0)
        return function(t) {
          return arc(i(t))
        }
      })
      .remove()

    paths.transition()
      .duration(DEFAULT_PIE_TRANSITION_DURATION)
      .attrTween('d', function(d) {
        let i = d3.interpolate(this._current, d)
        this._current = i(0)
        return function(t) {
          return arc(i(t))
        }
      })
    
    if(pieHover) {
      setTimeout(() => {
        g.selectAll('path')
          .on('mouseenter', function(d) {
            d3.select(this)
              .transition()
              .duration(DEFAULT_PIE_HOVER_DURATION)
              .attr('d', arcOver)
          })
          .on('mouseleave', function(d) {
            d3.select(this).transition()
              .attr('d', arc)
              .attr('stroke','none')
          })
      }, DEFAULT_PIE_TRANSITION_DURATION)
    }

    g.selectAll('text').remove()
    if(pieLabel) {
      setTimeout(() => {
        let label = d3.svg.arc()
          .outerRadius(radius*DEFAULT_PIE_LABEL_POSITION)
          .innerRadius(radius*DEFAULT_PIE_LABEL_POSITION)
        g.selectAll('text')
          .data(pie(data_d)).enter()
          .append('text')
            .attr('transform', (d) => 'translate(' + label.centroid(d) + ')')
            .attr('text-anchor', 'middle')
            .attr('dy', '0.35em')
            .text((d) => {
              let percent = parseInt(Math.round((d.data[1] / total)*100))
              if(percent>DEFAULT_PIE_LABEL_PERCENT)
                return percent + '%'
              else
                return ''
            })
      }, DEFAULT_PIE_TRANSITION_DURATION)
    }

    if(tooltip) {
      setTimeout(() => {
        g.selectAll('path')
          .on('mousemove', (d, i) => {
            let tooltip = d3.select(this.refs.piechartTooltip)
            tooltip.select('.piechart-tooltip-color')
              .style('background-color', colors(d.data[2]))
            tooltip.select('.piechart-tooltip-key')
              .text(d.data[0])
            tooltip.select('.piechart-tooltip-value')
              .text(d.data[1] + ' (' + parseInt(Math.round((d.data[1] / total)*100)) + '%)')
            tooltip.style('left', (d3.event.layerX+2)+'px')
              .style('top', (d3.event.layerY-tooltip.node().getBoundingClientRect().height-2)+'px')
              .style('visibility', 'visible')
          })
          .on('mouseout', (d) => {
            d3.select(this.refs.piechartTooltip)
              .style('visibility', 'hidden')
              .style('left', '0px')
              .style('top', '0px')
          })
      }, DEFAULT_PIE_TRANSITION_DURATION)
    }

    d3.select(this.refs.piechartLegends).html('')
    if(legends) {
      let legend = d3.select(this.refs.piechartLegends)
        .selectAll('.legend')
        .data(data)
        .enter()
        .append('div')
        .attr('class', 'legend')
      legend.append('div')
        .attr('class', 'legend-rect')
        .style('background-color', (d, i) => colors(i))
      legend.append('div')
        .attr('class', 'legend-text')
        .text((d, i) => d[0])
    }
  }

  render() {
    const {title, size, legends, tooltip, offline, lastOnlineTime} = this.state

    return (
      <div ref="piechartContainer" className="piechart-container">
        { title && 
          <div className="piechart-title">{title}</div>
        }
        <svg ref="piechart" width={size} height={size}></svg>
        { legends &&
          <div ref="piechartLegends" className="piechart-legends"></div>
        }
        { tooltip &&
          <div ref="piechartTooltip" className="piechart-tooltip">
            <div className="piechart-tooltip-color"></div>
            <div className="piechart-tooltip-key"></div>
            <div className="piechart-tooltip-value"></div>
          </div>
        }
        { offline &&
          <div className="offline_message">
            <img src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHYAAABACAYAAADPhIOhAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAe1SURBVHic7Zx9bFPXGcaf9/ijsVtYSUhswhoSgkYLY90mSlkSO7OqTKVN124Smjo6tUKQD6ZqVVs2raoGArFoLRpVNZoQ1A1t/UAqlYBB1wq6gg1jVKkqysIoBDtkI7GXpAklJCbxve/+yJKFfNj32je+STi//87Xex75yb05X/cQEtDQ0ODs7e19G8AqALZE9SXDDAA4bLVaf1xUVNSX7s5Fogp9fX1PAfg+pKl6sQF4LBaLPWlG5wmNZeb56RAyU2Hmr5rRb0JjJdMTaewMxWq2gBlMD4BDRHTQjM6lscZzEcAOIcQbJSUl18wSkZKxRPScx+P5rVFipivHjx9/noieZeZfqqr6ps/ni42uwwCFqnOWsUpLAeQTkE8kZjGrg+YT2olxVmWc60Lk/PJ6DKSiST6xBiCEOBKNRneXlZVdHZn/0WZY88LzHiVWHwsRlYHhIvp/OYOBERlMg8lMuL8MVvJBAvbhhuODgj3NUb2apLEG4PF4zoxMX3w6c7ZlwL4eYTwN8IKR5mlkNoieYOAJZETbg9Xul509/Jr7T5HrWgPIUbHBBKvdqy0D9vMAtgNYYEDIbDBe6r2dgqHKeVUMaPorkU+sQTRVuXIE6HUwyiepixwmrg1VusubiNcuqov8J15laawBhCpy72aohwEs1FKfLDbMKn0KGYtWgoRAtOk0vjz2e3CsX0NjPCxAn4UqXI8W1EdOT1RNGpsiwep5HmZ1P4BMrW1y1tfDee+Dw2nnvQ/CcbcX4Z1rAGYtIVws6Eiwcl75wl1t/vEqyP+xKdBU5fo6mA9Bh6k296KbTB3CsdQH+/wlerqfBeK/hKrc3x2vUBqbJKEN2W4BOgRgtp521qy8Ccts2brHWk4G3g1VufNHF0hjk4A3Q7Aq9iGJUS/FnfronhYBQCYDbzeuXmofmSmNTYJgm7sKoGKzdYxgZUZW5wsjM6SxOgltyHYTeJvZOkZDwM8vVeQOv+elsTphxfIiiO40W8c4OMiibh1KSGN1cLk6bw4Iphx10QRjTdOG3LsAaawuVPRXALjDbB1xsAhWfgJIY3XBTI+brSERxLSWAZLGaiS4LscF8DfM1pEIBgpbKt33SGO1YrV8D0lONNONIrhIGqsV4vvMlqAVYvqONFY7+WYL0AoDS6SxWuHpYyyAudJY7WSbLUAHWdJY7Yw5eTiFmSWN1Qqldhw0zVyXxmqFofmEYNwwysQPfrwynVyVxmqECBeMiNPfeh5QlbEFrKL/yjkjugCAoDRWIyrwDyPiKFcj6PrzSzefbWJG93s7EOv8lxFdAMwX5GE2jZCKs0atO3W//yp6z32EjMIVAAncuPQxblw+k7ihRkjQ36SxGiFHxlGORvsB2BNW1kB/y1n0t5w1ItQYWNAx+SrWSMErzd0MfGhUPPv8Jbjz4Wcxp/x52POWGRUWBHyycGfbZfnE6oL3AbQq1Sh33PdDzH3yFZBl8FqPr6z6GTrf2Ihrp/amrFAFvQnI/VhdiKjjLQCtqcQg223Ierxm2FQAIGFF1o+2QWSkvId/zUq2PYA0VhcFe5qjDNqeSgybaxGEY+xRZLrNCXvuPamEBhh1C2pbugBprG7sDksdgLZk2yvd4QnLYt0pvQzaLcJeM5SQxurkrh3/7mNwBQBNH9mMRunpRM/f3xmTf73hAGJfXElaFxN+MfS0AtLYpCisixxiwq5k23e8tRHd77+KgfZmxDpacPVILdr/+Ewqkt4trA3/YWRGqqNiRyAQmJNijGlDSUlJNxExADgU8VxUqPcD+JbeODxwA10HatB1oCZx5cT8kzIy1o3OTLiW4vf7twF4IVG9W4RNXq93y1Di84rcuVahHidA12dyBtJKQHFBXbh5dIF8FetjUyAQGP5ifXF9a4fNGisD6GLalRBCrFh845kKSGP1Iph5r9/vLx3KyPtdR6uFbPcT8F7aVBBOCyVWXLj7yoQ7TtJY/dwO4OCJEydWDmUsqG3pyneHHyHGJmBSN+QVELZ/oYQ9+fUdcadc0tjkmK2q6oeBQGD1UAZthlqwK7wFJJaBcXgS+jwlVLFiYW14o5bLvbQMntYB2G2ItJkHA6hxOp2bly9fftOPfanS9QAIPyVQOZK/65mZcUwQ/aagru0DPQ0TGtvY2Gjv7Oysh7xhPB5nFEVZ7/P5mkYXBNfluNhiWUPEPgBFSHxfRR8Bp1TwEQHaO9HgKBHT4pOFmcLgfYq5XyPmfBWYK6BmMchGRNegqhGyiAvX2zMvLX2nUcO9QBKJZOZAgUBgq6qqOWYLuVUhoojX6/2V0XGtzLyaiBYbHViimXMADDdWADDlanPJMPsnI6jVYrHsVBTlGUztqcynzKx7RYeIbEhi9yWN9Fut1tcmI7C1uLj4st/vfxlTeweHiWhFEu0+MVyJgRDRr4uKipLfXY+DAICenp4tmOI/wgzk48zMTEM2ZMdjeIHi6NGjWXa7/a8ApuIFGseIqCCJdkFm9hmuJnU+JaIHPB5PV+KqyXHTytP/zN0DTNot2RJgPxGtnUxTgQmWFAOBwA+Y+UUA357Mzm8lmLkBwNbS0tK0zELirhWfPHnym4qiPARgBREtZmYXBm8mm8ojaLMZANBDRBFm/hzAaQCHvV7vZ+kU8V+Wrmn3RofwVAAAAABJRU5ErkJggg=='/>
            <div className="bold">You are working offline. </div>
            <div>Information last updated on {moment(lastOnlineTime).format('D MMM YYYY')} at {moment(lastOnlineTime).format('hh:mm:ss')}</div>
          </div>
        }
      </div>
    )
  }
}
