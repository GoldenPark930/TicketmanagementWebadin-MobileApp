import React, {PropTypes} from 'react'
import { findDOMNode } from 'react-dom'
import { DragSource, DropTarget } from 'react-dnd'
import update from 'react/lib/update'
import _ from 'lodash'

import EventFAQItem from './EventFAQItem'

const cardSource = {
  beginDrag(props) {
    return {
      id: props.id,
      index: props.index
    }
  }
}

const cardTarget = {
  hover(props, monitor, component) {
    if(monitor.getItem().indexSection === undefined) {
      const dragIndex = monitor.getItem().index
      const hoverIndex = props.index

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
  },
  drop(props, monitor, component) {
    if(monitor.getItem().indexSection !== undefined) {
      const dragIndexItem = monitor.getItem().index
      const dragIndex = monitor.getItem().indexSection
      const hoverIndex = props.index

      if (dragIndex === hoverIndex) {
        return
      }
      
      props.onMoveItemAcrossSection(dragIndex, dragIndexItem, hoverIndex)
    }
  }
}

@DropTarget(['EventFAQSection', 'EventFAQItem'], cardTarget, connect => ({
  connectDropTarget: connect.dropTarget()
}))
@DragSource('EventFAQSection', cardSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  connectDragPreview: connect.dragPreview(),
  isDragging: monitor.isDragging()
}))

export default class EventFAQSection extends React.Component {
  static propTypes = {
    connectDragSource: PropTypes.func.isRequired,
    connectDropTarget: PropTypes.func.isRequired,
    connectDragPreview: PropTypes.func.isRequired,
    index: PropTypes.number.isRequired,
    isDragging: PropTypes.bool.isRequired,
    id: PropTypes.any.isRequired,
    onMove: PropTypes.func.isRequired,
    onMoveItemAcrossSection: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)

    this.state = {
      section: props.section
    }
  }

  componentWillReceiveProps(newProps) {
    this.setState({
      section: newProps.section
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

  changeName(val) {
    if(this.props.onChangeName) {
      this.props.onChangeName(val)
    }
  }

  newItem() {
    if(this.props.onNewItem) {
      this.props.onNewItem()
    }
  }

  deleteItem(index) {
    if(this.props.onDeleteItem) {
      this.props.onDeleteItem(index)
    }
  }

  moveItem(dragIndex, hoverIndex) {
    if(this.props.onMoveItemInsideSection) {
      this.props.onMoveItemInsideSection(dragIndex, hoverIndex)
    }
  }

  expandItem(index) {
    if(this.props.onExpandItem) {
      this.props.onExpandItem(index)
    }
  }

  collapseItem(index) {
    if(this.props.onCollapseItem) {
      this.props.onCollapseItem(index)
    }
  }

  changeQuestion(index, val) {
    if(this.props.onChangeQuestion) {
      this.props.onChangeQuestion(index, val)
    }
  }

  changeAnswer(index, val) {
    if(this.props.onChangeQuestion) {
      this.props.onChangeAnswer(index, val)
    }
  }

  render() {
    const {section} = this.state
    const { isDragging, connectDragSource, connectDropTarget, connectDragPreview } = this.props
    const opacity = isDragging ? 0 : 1

    let items = _.map(section.items, (item, j) =>
      <EventFAQItem
        id={item.id}
        key={item.id}
        index={j}
        indexSection={this.props.index}
        item={item}
        onDelete={() => this.deleteItem(j)}
        onMove={(dragIndex, hoverIndex) => this.moveItem(dragIndex, hoverIndex)}
        onExpand={() => this.expandItem(j)}
        onCollapse={() => this.collapseItem(j)}
        onChangeQuestion={(val) => this.changeQuestion(j, val)}
        onChangeAnswer={(val) => this.changeAnswer(j, val)}
      />
    )

    return connectDragPreview(connectDropTarget(
      <div className="eventfaq-section" style={{ opacity }}>
        <div className="eventfaq-section-top">
          { section.expanded && <div className="eventfaq-section-caret" onClick={e => this.collapse()}><i className="fa fa-caret-down" aria-hidden="true"></i></div> }
          { !section.expanded && <div className="eventfaq-section-caret" onClick={e => this.expand()}><i className="fa fa-caret-right" aria-hidden="true"></i></div> }
          <input type="text" value={section.name} className="eventfaq-section-name form-control" placeholder="Question" onChange={e => this.changeName(e.target.value)} />
          { connectDragSource(<div className="eventfaq-section-button eventfaq-section-button-drag"><i className="fa fa-arrows" aria-hidden="true"></i></div>) }
          <div className="eventfaq-section-button eventfaq-section-button-delete" onClick={e => this.delete()}><i className="fa fa-trash" aria-hidden="true"></i></div>
          <div className="eventfaq-section-button eventfaq-section-button-save"><i className="fa fa-floppy-o" aria-hidden="true"></i></div>
          <div className="eventfaq-section-button eventfaq-section-button-newitem" onClick={e => this.newItem()}><i className="fa fa-plus" aria-hidden="true"></i></div>
        </div>
        { section.expanded && 
          <div className="eventfaq-section-items">
            {items}
          </div>
        }
      </div>
    ))
  }
}