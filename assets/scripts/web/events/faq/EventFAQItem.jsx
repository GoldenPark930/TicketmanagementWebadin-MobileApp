import React, {PropTypes} from 'react'
import _ from 'lodash'
import { findDOMNode } from 'react-dom'
import { DragSource, DropTarget } from 'react-dnd'

import RichTextArea from '../../_library/RichTextArea'

const cardSource = {
  beginDrag(props) {
    return {
      id: props.id,
      index: props.index,
      indexSection: props.indexSection
    }
  }
}

const cardTarget = {
  hover(props, monitor, component) {
    const dragIndex = monitor.getItem().index
    const dragIndexSection = monitor.getItem().indexSection
    const hoverIndex = props.index
    const hoverIndexSection = props.indexSection

    if (dragIndexSection !== hoverIndexSection) {
      return
    }

    if (dragIndex === hoverIndex) {
      return
    }

    const hoverBoundingRect = findDOMNode(component).getBoundingClientRect()
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
    const clientOffset = monitor.getClientOffset()
    const hoverClientY = clientOffset.y - hoverBoundingRect.top

    if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
      return
    }
    if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
      return
    }
    props.onMove(dragIndex, hoverIndex)
    monitor.getItem().index = hoverIndex
  }
}

@DropTarget('EventFAQItem', cardTarget, connect => ({
  connectDropTarget: connect.dropTarget()
}))
@DragSource('EventFAQItem', cardSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  connectDragPreview: connect.dragPreview(),
  isDragging: monitor.isDragging()
}))

export default class EventFAQItem extends React.Component {
  static propTypes = {
    connectDragSource: PropTypes.func.isRequired,
    connectDropTarget: PropTypes.func.isRequired,
    connectDragPreview: PropTypes.func.isRequired,
    index: PropTypes.number.isRequired,
    isDragging: PropTypes.bool.isRequired,
    id: PropTypes.any.isRequired,
    onMove: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)

    this.state = {
      item: props.item
    }
  }

  componentWillReceiveProps(newProps) {
    this.setState({
      item: newProps.item
    })
  }

  delete() {
    if(this.props.onDelete) {
      this.props.onDelete()
    }
  }

  expand() {
    if(this.props.onExpand) {
      this.props.onExpand()
    }
  }

  collapse() {
    if(this.props.onCollapse) {
      this.props.onCollapse()
    }
  }

  changeQuestion(val) {
    if(this.props.onChangeQuestion) {
      this.props.onChangeQuestion(val)
    }
  }

  changeAnswer(val) {
    if(this.props.onChangeAnswer) {
      this.props.onChangeAnswer(val)
    }
  }

  render() {
    const { isDragging, connectDragSource, connectDropTarget, connectDragPreview } = this.props
    const opacity = isDragging ? 0 : 1
    const {item} = this.state

    if(item.expanded) {
      return connectDragPreview(connectDropTarget(
        <div className="eventfaq-item expanded" style={{ opacity }}>
          <div className="eventfaq-item-top">
            <div className="eventfaq-item-caret" onClick={e => this.collapse()}><i className="fa fa-caret-down" aria-hidden="true"></i></div>
            <input type="text" value={item.question} className="eventfaq-item-question form-control" placeholder="Question" onChange={e => this.changeQuestion(e.target.value)} />
            { connectDragSource(<div className="eventfaq-item-button eventfaq-item-button-drag"><i className="fa fa-arrows" aria-hidden="true"></i></div>) }
            <div className="eventfaq-item-button eventfaq-item-button-delete" onClick={e => this.delete()}><i className="fa fa-trash" aria-hidden="true"></i></div>
            <div className="eventfaq-item-button eventfaq-item-button-save"><i className="fa fa-floppy-o" aria-hidden="true"></i></div>
          </div>
          <div className="eventfaq-item-answer">
            <RichTextArea label="" value={item.answer} onChange={val => this.changeAnswer(val)} baseurl={process.env.ADMIN_CDN_URL} />
          </div>
        </div>
      ))
    } else {
      return connectDragPreview(connectDropTarget(
        <div className="eventfaq-item collapsed" style={{ opacity }}>
          <div className="eventfaq-item-caret" onClick={e => this.expand()}><i className="fa fa-caret-right" aria-hidden="true"></i></div>
          <input type="text" value={item.question} className="eventfaq-item-question form-control" placeholder="Question" onChange={e => this.changeQuestion(e.target.value)} />
          { connectDragSource(<div className="eventfaq-item-button eventfaq-item-button-drag"><i className="fa fa-arrows" aria-hidden="true"></i></div>) }
          <div className="eventfaq-item-button eventfaq-item-button-delete" onClick={e => this.delete()}><i className="fa fa-trash" aria-hidden="true"></i></div>
          <div className="eventfaq-item-button eventfaq-item-button-save"><i className="fa fa-floppy-o" aria-hidden="true"></i></div>
        </div>
      ))
    }
  }
}