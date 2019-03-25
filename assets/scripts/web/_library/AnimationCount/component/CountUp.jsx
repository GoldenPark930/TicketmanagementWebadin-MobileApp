import React, { Component, PropTypes } from 'react'	
import formatNumber from '../mod/Util'	

export default class AnimationCount extends Component {
  static displayName = 'AnimationCount'	

  static propTypes = {
    start: PropTypes.number,
    count: PropTypes.number,
    duration: PropTypes.number,
    decimals: PropTypes.number,
    useGroup: PropTypes.bool,
    localeString: PropTypes.bool,
  }

  constructor(props) {
    super(props)	
    this.start = this.props.start
    this.state = {
      value: formatNumber(this.start, this.props.decimals, this.props.useGroup, this.props.localeString),
      startTime: new Date().getTime(),
    }	
    this.timer = null
  }

  componentDidMount() {
    this.setTimer(this.props, this.state.startTime)	
  }

  componentWillReceiveProps(nextProps) {
    if(this.timer != null)
      return
    if(nextProps.count == this.props.count && nextProps.count === 0)
      return

    this.start = this.props.count

    this.setState({
      value: formatNumber(this.start),
      startTime: new Date().getTime(),
    })
    this.clearTimer()
    this.setTimer(nextProps, new Date().getTime())
  }

  componentWillUnmount() {
    this.clearTimer()	
  }

  setTimer(props, startTime) {
    if (this.timer || props.count === this.start) {
      return	
    }
    this.timer = setInterval(() => {
      const t = new Date().getTime() - startTime	
      const b = this.start	
      const c = props.count - this.start	
      const d = props.duration	
      let result	
      if (t < props.duration) {
        result = this.countUp(t, b, c, d, props.linear)	
      } else {
        result = formatNumber(props.count, props.decimals, props.useGroup, props.localeString)	
        clearInterval(this.timer)	
        this.timer = null
      }
      this.setState({ value: result })	
    }, 10)	
  }

  clearTimer() {
    clearInterval(this.timer)	
    this.timer = null	
  }

  countUp(t, b, c, d, linear) {
    let result = 0
    if (!linear) { // default
      result = parseFloat(((c * (-(2 ** ((-10 * t) / d)) + 1) * 1024) / 1023) + b)
    } else {
      result = b + parseFloat(c * t / d)
    }
    result = formatNumber(result, this.props.decimals, this.props.useGroup, this.props.localeString)	
    return result	
  }

  render() {
    // console.log(this.props, this.state)
    return (
      <div>
        {this.props.prefix}
        {this.state.value}
        {this.props.subfix}
      </div>
    )	
  }
}
