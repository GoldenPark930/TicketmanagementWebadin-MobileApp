import React, { Component, PropTypes } from 'react'	
import formatNumber from '../mod/Util'	

export default class CountRoll extends Component {
  static displayName = 'CountRoll'	

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
    this.state = {
      valueStart: formatNumber(this.props.start, this.props.decimals, this.props.useGroup),
      height: 'auto',
      animationStyle: this.setAnimationStyle(0, false),
      arrayLi: [],
      updateState: false,
    }	
  }

  componentWillMount() {
    this.getAllCount()	
  }
  componentDidMount() {
    const maxHeight = this.elementLi.offsetHeight	
    this.setInit(maxHeight)	
    this.startAnimation()	
  }
  componentWillReceiveProps() {
    this.setState({ updateState: true })	
    this.getAllCount()	
  }
  componentDidUpdate() {
    if (this.state.updateState) {
      this.setInit(this.state.height)	
      this.startAnimation()	
    }
  }

  /* 计算数值 */
  getAllCount() {
    let t = 0	
    let result	
    const arr = []	
    const c = this.props.count - this.props.start	
    const b = this.props.start	
    const d = this.props.duration	
    const temp = d / 19	
    for (let i = 0; i < 19; i += 1) {
      t += temp	
      if (t < this.props.duration) {
        result = this.countUp(t, b, c, d)	
      } else {
        result = formatNumber(this.props.count, this.props.decimals, this.props.useGroup)	
      }
      arr.unshift(result)	
    }
    this.setState({ arrayLi: arr })	
  }

  /* 初始化 */
  setInit(maxHeight) {
    this.setState({
      height: maxHeight,
      animationStyle: this.setAnimationStyle(maxHeight * 19, true),
    })	
  }

  /* 设置Style */
  setAnimationStyle(height, reset) {
    return {
      transitionDuration: reset ? '0s' : `${this.props.duration / 1000}s`,
      WebkitTransitionDuration: reset ? '0s' : `${this.props.duration / 1000}s`,
      MozAnimationDirection: reset ? '0s' : `${this.props.duration / 1000}s`,
      OTransitionDuration: reset ? '0s' : `${this.props.duration / 1000}s`,
      transform: `translate3d(0, -${height}px, 0)`,
      WebkitTransform: `translate3d(0, -${height}px, 0)`,
      MozTransform: `translate3d(0, -${height}px, 0)`,
      OTransform: `translate3d(0, -${height}px, 0)`,
    }	
  }

  /* 开始动画 */
  startAnimation() {
    setTimeout(() => {
      this.setState({ animationStyle: this.setAnimationStyle(0, false) })	
    }, 200)	
  }
  /* 重新开始 */
  restartAnimation() {
    this.setState({ animationStyle: this.setAnimationStyle(this.state.height * 19, true) })	
    this.startAnimation()	
  }

  /**
   * tween Qunit easeOut
   */
  countUp(t, b, c, d) {
    const temp = ((t / d) - 1)	
    const result = (c * ((temp ** 5) + 1)) + b	
    return this.formatNumber(result)	
  }

  formatNumber(number) {
    let str = parseFloat(number).toFixed(this.props.decimals)	
    if (this.props.useGroup && this.props.decimals >= 1) {
      let array1 = str.split('.')[0].split('').reverse().join('')	
      const array2 = str.split('.')[1]	
      array1 = array1.replace(/(\d{3})(?=[^$])/g, '$1,')	
      array1 = array1.split('').reverse().join('')	
      str = `${array1}.${array2}`	
    }
    return str	
  }
  render() {
    return (
      <div
        className="count-roll-main"
        style={{ height: this.state.height }}
      >
        {this.props.prefix}
        <ul
          className="count-roll-ul"
          style={{ ...this.state.animationStyle }}
        >
          {this.state.arrayLi.map(value =>
            (<li>{value}</li>),
          )}
          <li
            className="count-roll-li"
            ref={(li) => { this.elementLi = li	 }}
          >
            {this.state.valueStart}
          </li>
        </ul>
        {this.props.subfix}
      </div>
    )	
  }
}
