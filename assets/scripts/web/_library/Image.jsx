import React from 'react'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

const BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

export default class Image extends React.Component {
  constructor(props) {
    super(props)
    this.state = {source: ''}
    this.listeners = []
  }
  componentDidMount() {
    this.changeImage(this.props.src)
  }
  componentWillReceiveProps(props) {
    if (props.src === this.props.src) { return }
    this.changeImage(props.src)
  }
  componentWillUnmount() {
    this.clearListeners()
  }
  render() {
    const {className, src, fallback, transition, onLoading, onCompleted, ...attr} = this.props
    const {source} = this.state
    const style = {
      backgroundImage: `url(${source})`
    }
    const node = source ? <img key={source} className={className} src={source} {...attr} /> : null
    return (
      <ReactCSSTransitionGroup
        transitionName="fade"
        transitionEnterTimeout={250} transitionLeaveTimeout={250}
        transitionAppear={transition} transitionAppearTimeout={250}
        transitionEnter={transition} transitionLeave={transition}>
        {node}
      </ReactCSSTransitionGroup>
    )
  }
  changeImage(src) {
    if (!src) { return this.setState({source: ''}) }

    const {onLoading, onCompleted} = this.props
    this.clearListeners()

    const img = document.createElement('img')
    const onLoad = () => {
      img.removeEventListener('load', onload)
      img.removeEventListener('error', onerror)
      this.setState({source: src})
      if (onCompleted) { onCompleted() }
    }
    const onError = () => {
      img.removeEventListener('load', onload)
      img.removeEventListener('error', onerror)
      this.setState({source: this.props.fallback || src})
      if (onCompleted) { onCompleted() }
    }
    img.addEventListener('load', onLoad)
    img.addEventListener('error', onError)
    this.listeners.push(img.removeEventListener.bind(img, 'load', onLoad))
    this.listeners.push(img.removeEventListener.bind(img, 'error', onError))

    if (onLoading) { onLoading() }
    img.src = src
  }
  clearListeners() {
    for (let i = 0; i < this.listeners.length; i++) {
      this.listeners[i]()
    }
    this.listeners.length = 0
  }
}
