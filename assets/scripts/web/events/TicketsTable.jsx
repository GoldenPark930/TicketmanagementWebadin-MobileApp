import _ from 'lodash'
import React, { PropTypes } from 'react'
import Tooltip from 'react-bootstrap/lib/Tooltip'
import { findDOMNode } from 'react-dom'
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger'

import { DragSource, DropTarget } from 'react-dnd'

import {shortid} from '../../_common/core/rand'
import Checkbox from '../_library/Checkbox'
import Currency from '../_library/Currency'

const activeTooltip = <Tooltip id={`tt-${shortid()}`}>This ticket is available for sale</Tooltip>
const inActiveTooltip = <Tooltip id={`tt-${shortid()}`}>This ticket is <strong>not</strong> available for sale</Tooltip>
const alwaysAvailableTooltip = <Tooltip id={`tt-${shortid()}`}>This ticket is always visible on the event page</Tooltip>
const hiddenTooltip = <Tooltip id={`tt-${shortid()}`}>This ticket is hidden unless revealed with a special link</Tooltip>

const style = {
  padding: '0.5rem 1rem',
  marginBottom: '.5rem',
  cursor: 'move'
}
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
    const dragIndex = monitor.getItem().index
    const hoverIndex = props.index

    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return
    }

    // Determine rectangle on screen
    const hoverBoundingRect = findDOMNode(component).getBoundingClientRect()

    // Get vertical middle
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

    // Determine mouse position
    const clientOffset = monitor.getClientOffset()

    // Get pixels to the top
    const hoverClientY = clientOffset.y - hoverBoundingRect.top

    // Only perform the move when the mouse has crossed half of the items height
    // When dragging downwards, only move when the cursor is below 50%
    // When dragging upwards, only move when the cursor is above 50%

    // Dragging downwards
    if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
      return
    }

    // Dragging upwards
    if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
      return
    }

    // Time to actually perform the action
    props.moveCard(dragIndex, hoverIndex)

    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    monitor.getItem().index = hoverIndex
  }
}

@DropTarget('TicketRow', cardTarget, connect => ({
  connectDropTarget: connect.dropTarget()
}))
@DragSource('TicketRow', cardSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))
class TicketRow extends React.Component {
  static propTypes = {
    connectDragSource: PropTypes.func.isRequired,
    connectDropTarget: PropTypes.func.isRequired,
    index: PropTypes.number.isRequired,
    isDragging: PropTypes.bool.isRequired,
    id: PropTypes.any.isRequired,
    moveCard: PropTypes.func.isRequired
  }
  render() {
    const {event, displayName, currency, faceValue, price, stock, maxInventory, flagAlwaysAvailable, flagHidden, active, sortOrder} = this.props
    let isInventoryMode = event.$original.inventoryMode == 'maximum'
    let cs = [
      !stock ? 'row-stale' : ''
    ].filter(Boolean).join(' ')
    let moveLabel = <i className="fa fa-arrows" />
    let activeLabel
    if (active) {
      activeLabel = (
        <OverlayTrigger placement="top" overlay={activeTooltip} trigger={['hover', 'click']}>
          <i className="fa fa-circle text-success fa-fw" />
        </OverlayTrigger>
      )
    } else {
      activeLabel = (
        <OverlayTrigger placement="top" overlay={inActiveTooltip} trigger={['hover', 'click']}>
          <i className="fa fa-circle text-danger fa-fw" />
        </OverlayTrigger>
      )
    }
    let visibleLabel
    if (flagAlwaysAvailable) {
      visibleLabel = (
        <OverlayTrigger placement="top" overlay={alwaysAvailableTooltip} trigger={['hover', 'click']}>
          <i className="fa fa-eye fa-fw brand-info" />
        </OverlayTrigger>
      )
    }

    let hiddenLabel
    if (flagHidden) {
      hiddenLabel = (
        <OverlayTrigger placement="top" overlay={hiddenTooltip} trigger={['hover', 'click']}>
          <i className="fa fa-eye-slash fa-fw brand-info" />
        </OverlayTrigger>
      )
    }

    let faceValueDisplay
    if (faceValue) {
      faceValueDisplay = (
        <Currency code={currency} value={faceValue} />
      )
    } else {
      faceValueDisplay = (
        'Not Defined'
      )
    }
    const {isDragging, connectDragSource, connectDropTarget} = this.props
    const opacity = isDragging ? 0 : 1

    //connectDragSource(connectDropTarget(
    return connectDragSource(connectDropTarget(
      <tr className={cs} style={{ ...style, opacity }}>
        <td className="tickets-table-td-desktop">{moveLabel}{visibleLabel}{hiddenLabel}{activeLabel}</td>
        <td className="tickets-table-td-desktop h4">{displayName}</td>
        <td className="tickets-table-td-desktop"><Currency code={currency} value={faceValue} /></td>
        <td className="tickets-table-td-desktop"><Currency code={currency} value={price} /></td>
        {isInventoryMode && <td className="tickets-table-td-desktop text-center"> {maxInventory}</td>}
        <td className="tickets-table-td-desktop text-center">{stock}</td>
        <td className="tickets-table-td-desktop">{this.props.children}</td>
        <td colSpan={isInventoryMode ? 7 : 6} className="tickets-table-td-mobile">
          <div className="ticket-table-td-mobile-labels">{moveLabel}{visibleLabel}{hiddenLabel}{activeLabel}</div>
          <div className="ticket-table-td-mobile-values">
            <div className="ticket-table-td-mobile-name">
              <div className="ticket-table-td-mobile-label">Ticket Name</div>
              <div className="ticket-table-td-mobile-value">{displayName}</div>
            </div>
            <div className="ticket-table-td-mobile-face">
              <div className="ticket-table-td-mobile-label">Face Value</div>
              <div className="ticket-table-td-mobile-value"><Currency code={currency} value={faceValue} /></div>
            </div>
            <div className="ticket-table-td-mobile-price">
              <div className="ticket-table-td-mobile-label">Price (Incl.Fees)</div>
              <div className="ticket-table-td-mobile-value"><Currency code={currency} value={price} /></div>
            </div>
            <div className="ticket-table-td-mobile-stock">
              <div className="ticket-table-td-mobile-label">Stock</div>
              <div className="ticket-table-td-mobile-value">{stock}</div>
            </div>
          </div>
          <div className="ticket-table-td-mobile-action">
            {this.props.children}
          </div>
        </td>
      </tr>
    ))
    //)
  }
}

export default class TicketsTable extends React.Component {
  render() {
    const {event} = this.props
    let isInventoryMode = event.$original.inventoryMode == 'maximum'
    let rows = []
    let rest = []
    React.Children.forEach(this.props.children, (c) => {
      if (!React.isValidElement(c)) {
        rest.push(c)
      } else if (c.type === TicketRow) {
        rows.push(c)
      } else {
        rest.push(c)
      }
    })

    let style = {marginTop: 0, marginBottom: 25}
    if(rows.length === 1)
      style.marginTop = 60
    return (
      <div>
        <div className="row">
          <div className="col-xs-12">
            <div className="table-responsive">
              <table className="table tickets-table" style={style}>
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Name</th>
                    <th>Face Value</th>
                    <th>Price (incl. Fees)</th>
                    {isInventoryMode && <th className="text-center">Max Number of Sales</th>}
                    <th className="text-center">Stock</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {rows}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-xs-12">{rest}</div>
        </div>
      </div>
    )
  }
}

TicketsTable.Row = TicketRow
