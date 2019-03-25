import _ from 'lodash'
import React, { PropTypes } from 'react'
import Tooltip from 'react-bootstrap/lib/Tooltip'
import { findDOMNode } from 'react-dom'
import Dropdown from 'react-bootstrap/lib/Dropdown'
import MenuItem from 'react-bootstrap/lib/MenuItem'
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger'

import { DragSource, DropTarget } from 'react-dnd'

import {shortid} from '../../../_common/core/rand'
import Checkbox from '../../_library/Checkbox'
import Currency from '../../_library/Currency'
import Button from '../../_library/Button'

const activeTooltip = <Tooltip id={`tt-${shortid()}`}>This add-on is available for sale</Tooltip>
const inActiveTooltip = <Tooltip id={`tt-${shortid()}`}>This add-on is <strong>not</strong> available for sale</Tooltip>

export default class AddOnRow extends React.Component {
  handleEdit() {
    if(this.props.handleEdit) {
      this.props.handleEdit()
    }
  }
  handleActivate() {
    if(this.props.handleActivate) {
      this.props.handleActivate()
    }
  }
  handleDeactivate() {
    if(this.props.handleDeactivate) {
      this.props.handleDeactivate()
    }
  }

  render() {
    const {event, addon, last} = this.props

    let activeLabel
    if (addon.active) {
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

    return (
      <tr>
        <td className="addons-table-td-desktop">{activeLabel}</td>
        <td className="addons-table-td-desktop">{addon.name}</td>
        <td className="addons-table-td-desktop">{addon.groupName}</td>
        <td className="addons-table-td-desktop"><Currency code={addon.currency} value={addon.cost} /></td>
        <td className="addons-table-td-desktop"><Currency code={addon.currency} value={addon.price} /></td>
        <td className="addons-table-td-desktop">{addon.stock===null ? 'Unlimited' : addon.stock}</td>
        <td className="addons-table-td-desktop">
          <div className="btn-toolbar2">
            <Button className="btn btn-primary" type="button" onClick={e => this.handleEdit()}>
              <i className="fa fa-pencil fa-fw" />Edit
            </Button>
            {addon.active&&
            <Button className="btn btn-seablue" type="button" onClick={e => this.handleDeactivate()}>
              <i className="fa fa-ban" />Deactivate
            </Button>
            }
            {!addon.active&&
            <Button className="btn btn-ok" type="button" onClick={e => this.handleActivate()}>
              <i className="fa fa-cog" />Activate
            </Button>
            }
          </div>
        </td>
        <td colSpan={6} className="addons-table-td-mobile">
          <div className="addons-table-td-mobile-labels">{activeLabel}</div>
          <div className="addons-table-td-mobile-values">
            <div className="addons-table-td-mobile-name">
              <div className="addons-table-td-mobile-label">Name</div>
              <div className="addons-table-td-mobile-value">{addon.name}</div>
            </div>
            <div className="addons-table-td-mobile-name">
              <div className="addons-table-td-mobile-label">Group</div>
              <div className="addons-table-td-mobile-value">{addon.groupName}</div>
            </div>
            <div className="addons-table-td-mobile-cost">
              <div className="addons-table-td-mobile-label">Cost</div>
              <div className="addons-table-td-mobile-value"><Currency code={addon.currency} value={addon.cost} /></div>
            </div>
            <div className="addons-table-td-mobile-price">
              <div className="addons-table-td-mobile-label">Price</div>
              <div className="addons-table-td-mobile-value"><Currency code={addon.currency} value={addon.price} /></div>
            </div>
            <div className="addons-table-td-mobile-stock">
              <div className="addons-table-td-mobile-label">Stock</div>
              <div className="addons-table-td-mobile-value">{addon.stock===null ? 'Unlimited' : addon.stock}</div>
            </div>
          </div>
          <div className="addons-table-td-mobile-action">
            <div className="btn-toolbar2">
              <Button className="btn btn-primary" type="button" onClick={e => this.handleEdit()}>
                <i className="fa fa-pencil fa-fw" />Edit
              </Button>
              {addon.active&&
              <Button className="btn btn-seablue" type="button" onClick={e => this.handleDeactivate()}>
                <i className="fa fa-ban" />Deactivate
              </Button>
              }
              {!addon.active&&
              <Button className="btn btn-ok" type="button" onClick={e => this.handleActivate()}>
                <i className="fa fa-cog" />Activate
              </Button>
              }
            </div>
          </div>
        </td>
      </tr>
    )
  }
}
