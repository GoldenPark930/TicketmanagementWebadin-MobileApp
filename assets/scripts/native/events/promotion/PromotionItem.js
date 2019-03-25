import React from 'react'
import PropTypes from 'prop-types';

import {View, Text, ScrollView, TouchableWithoutFeedback} from 'react-native'
import styles from '../../styles/event-promotion'
import _ from 'lodash'
import {Button} from '../../_library'
import {connect} from 'react-redux'
import Icon from 'react-native-vector-icons/dist/FontAwesome';

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

class PromotionItem extends React.Component {
  static propTypes = {
    // connectDragSource: PropTypes.func.isRequired,
    // connectDropTarget: PropTypes.func.isRequired,
    // connectDragPreview: PropTypes.func.isRequired,
    index: PropTypes.number.isRequired,
    // isDragging: PropTypes.bool.isRequired,
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
    if (this.props.onDelete) {
      this.props.onDelete()
    }
  }

  expand() {
    if (this.props.onExpand) {
      this.props.onExpand()
    }
  }

  collapse() {
    if (this.props.onCollapse) {
      this.props.onCollapse()
    }
  }

  changeQuestion(val) {
    if (this.props.onChangeQuestion) {
      this.props.onChangeQuestion(val)
    }
  }

  changeAnswer(val) {
    if (this.props.onChangeAnswer) {
      this.props.onChangeAnswer(val)
    }
  }

  render(){
    const {event} = this.props
    const {item} = this.state
    let currency = (event && event.currency && event.currency.symbol) ? event.currency.symbol : '$'

    return(
        <View key={this.props.index} style={styles.eventpromotion_item}>
          <View style={styles.eventpromotion_item_flex}>
            <Text style={styles.eventpromotion_item_text}>Ticket: </Text>
            <Text style={styles.eventpromotion_item_text}>{item.ticketName}</Text>ng
          </View>
          <View style={styles.eventpromotion_item_flex}>
            <Text style={styles.eventpromotion_item_text}>Discount:</Text>
            <Text style={styles.eventpromotion_item_text}>{item.discountType}</Text>
          </View>
          {item.discountType != 'none' && item.discountType == 'percentage' &&
            <View style={styles.eventpromotion_item_flex}>
              <Text style={styles.eventpromotion_item_text}>Value: </Text>
              <Text style={styles.eventpromotion_item_text}>{item.discountValue}% </Text>
            </View>
          }
          {item.discountType != 'none' && item.discountType != 'percentage' &&
            <View style={styles.eventpromotion_item_flex}>
              <Text style={styles.eventpromotion_item_text}>Value: </Text>
              <Text style={styles.eventpromotion_item_text}>{currency}{item.discountValue}</Text>
            </View>
          }
          <View  style={styles.eventpromotion_item_flex}>
          {!!item.quantityLimit &&
            <View>
              <Text style={styles.eventpromotion_item_text}>QuantityLimit: </Text>
              <Text style={styles.eventpromotion_item_text}>{item.quantityLimit}</Text>
            </View>
          }
          </View>
          <View style={{flex:0.25}}>
            <TouchableWithoutFeedback onPress={e => this.delete()}>
              <View>
                <Icon name="trash" size={14} color="#b6c5cf" />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </View>
    )
  }

}export default connect(
  (state) => {
    const u = state.auth.get('user')
    return {
      user: u ? u.toJS() : null,
      event: state.events.get('selected').toJS()
    }
  },
  {}
)(PromotionItem)
