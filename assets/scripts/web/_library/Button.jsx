import classNames from 'classnames'
import React from 'react'

export default class Button extends React.Component {
  render() {
    const {disabled, loading, className, success, children, ...props} = this.props
    let content
    if (loading) {
      content = this.props.loadingContent || <i className="fa fa-circle-o-notch fa-fw fa-spin" />
    } else if (success) {
      content = this.props.succesContent || <i className="fa fa-fw fa-check" />
    } else {
      content = children
    }

    const cs = classNames(className, success ? 'btn-success' : '')

    return (
      <button {...props} className={cs} disabled={disabled || loading}>{content}</button>
    )
  }
}
