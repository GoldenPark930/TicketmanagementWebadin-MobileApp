import React from 'react'
import {View, Text, TextInput, ScrollView} from 'react-native'
import _ from 'lodash'
import {commonStyle, menu} from '../../styles'
import styles from '../../styles/event-promotion'
import PromotionItem from './PromotionItem'

import {Button, Tab, DateTimePickera, Select, TagsField} from '../../_library'

const cardSource = {
  beginDrag(props) {
    return {
      id: props.id,
      index: props.index
    }
  }
}

const EMPTY_TICKET_TYPE = {
  id: '',
  displayName: 'Select Ticket Type',
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

class promotion extends React.Component {
  constructor(props) {
    super(props)

    this.focus = this.focus.bind(this)

    const {tickets} = props
    let ticketOptions = [EMPTY_TICKET_TYPE]
    _.map(tickets, (t, id)=>{
      ticketOptions.push(t)
    })

    this.state = {
      promotion: props.promotion,
      newItemDialog: ticketOptions.length > 0,
      ticketOptions: ticketOptions,
      ticketType: '',
      discountOption: '',
      discountValueSymbol: props.currency,
      nameRequired: false,
      discountValue:0
    }
  }

  componentDidMount() {
    this.focus()
  }

  componentWillReceiveProps(newProps) {
    const {tickets} = this.props
    let ticketOptions = [EMPTY_TICKET_TYPE]
    _.map(tickets, (t, id)=>{
      let tSearched = _.find(newProps.promotion.items, {ticketTypeID: t.id})
      if(!tSearched)
        ticketOptions.push(t)
    })
    this.setState({
      promotion: newProps.promotion,
      newItemDialog : ticketOptions.length > 0,
      ticketOptions: ticketOptions,
      ticketType: '',
      discountOption: '',
      discountValueSymbol: newProps.currency,
    })
  }

  deletePromotion() {
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
    if(val!='') {
      this.setState({nameRequired: false})
    } else {
      this.setState({nameRequired: true})
    }
    if(this.props.onChangeName) {
      this.props.onChangeName(val)
    }
  }

  changePromoCodes(val){
    if(this.props.onChangePromoCodes) {
      this.props.onChangePromoCodes(val)
    }
  }

  changeStartDate(val){
    if(this.props.onChangePromoStartDate) {
      this.props.onChangePromoStartDate(val)
    }
  }

  changeEndDate(val){
    if(this.props.onChangePromoEndDate) {
      this.props.onChangePromoEndDate(val)
    }
  }

  changeTicketType(e){
    this.setState({ticketType: e})
  }

  changeDiscount(e){
    const {event, currency} = this.props
    let symbol = e == 'percentage' ? '%' : currency
    this.setState({discountOption: e, discountValueSymbol: symbol})
  }

  showAddItemDialog() {
    let {tickets, promotion, currency} = this.props
    let ticketOptions = [EMPTY_TICKET_TYPE]
    _.map(tickets, (t, id)=>{
      let tSearched = _.find(promotion.items, {ticketTypeID: t.id})
      if(!tSearched)
        ticketOptions.push(t)
    })
    promotion.expanded = true
    this.setState({
      promotion: promotion,
      newItemDialog : ticketOptions.length > 0,
      ticketOptions: ticketOptions,
      ticketType: '',
      discountOption: '',
      discountValueSymbol: currency
    })
  }

  addItem(){
    const {tickets} = this.props
    const {discountOption, ticketType, quantityLimit} = this.state
    let tid = ticketType
    let tSelected = _.find(tickets, {id: tid})
    let tText = tSelected ? tSelected.displayName : ''
    let discountValue = discountOption != 'none' && discountOption != '' ? this.state.discountValue : 0
    if(!discountValue)
      discountValue = 0

    let newItem = {
      id: new Date().valueOf(),
      ticketTypeID: tid,
      ticketName: tText,
      discountType: discountOption,
      discountValue: discountValue,
      quantityLimit: quantityLimit,
      expanded: false
    }

    if(discountOption != 'none' && discountOption != ''){
      this.refs.discountValue.value = 0
      this.refs.discountValue.focus()
    }
    this.setState({quantityLimit: '', discountValue:''})

    if(this.props.onNewPromotionItem){
      this.props.onNewPromotionItem(newItem)
    }
  }

  cancelItem(){
    this.setState({newItemDialog: false})
  }

  savePromotion(){
    const {promotion} = this.state
    if(promotion.name == ''){
      this.setState({ nameRequired: true})
      this.focus()
    }else{
      if(this.props.onSavePromotion) {
        this.props.onSavePromotion()
      }
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

  focus(){
    this.textInput.focus()
  }

  render(){
    const {promotion, newItemDialog, discountOption, discountValueSymbol, ticketOptions, ticketType, nameRequired, discountValue, quantityLimit} = this.state
    const {isDoingSth, isWorking, isDragging, connectDragSource, connectDropTarget, connectDragPreview, key } = this.props
    const opacity = isDragging ? 0 : 1

    const DISCOUNT_OPTIONS = [
      {
        value: '',
        title: 'Select Discount Type'
      },
      {
        value: 'fixed_discount',
        title: 'Fixed Discount'
      },
      {
        value: 'fixed_price',
        title: 'Fixed Price'
      },
      {
        value: 'percentage',
        title: 'Percentage Discount'
      },
      {
        value: 'none',
        title: 'No Discount'
      }
    ]

    let items = _.map(promotion.items, (item, j) =>
      <PromotionItem
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

    return(
      <View key={key} style={{marginVertical:10,backgroundColor:'#393e46',padding:10, borderRadius:2}}>
        <View style={{ flexDirection:'row', }}>
          {!promotion.expanded && <Button icon={'caret-right'} style={{backgroundColor:'#ffffff00'}} onPress={e => this.expand()}/>}
          {promotion.expanded && <Button icon={'caret-down'} style={{backgroundColor:'#ffffff00'}} onPress={e => this.collapse()}/>}
          <TextInput
            ref={(input) => { this.textInput = input }}
            id={promotion.id}
            value={promotion.name}
            placeholder="Enter Promotion Name"
            onChange={e => this.changeName(e.value)}
            style={{flex:1, color:'#c6ccd0'}}
          />
        </View>

        {promotion.expanded && newItemDialog &&
          <View>
            <Text style={{marginBottom: 20, fontFamily: 'Open Sans', color:'#c6ccd0'}}>Promotion Description (for your reference)</Text>
            <TextInput
              ref={(input) => { this.textInput = input }}
              id={promotion.id}
              value={promotion.name}
              placeholder="Enter Promotion Name"
              onChange={e => this.changeName(e.value)}
              style={{
                height: 40,
                marginTop: 2,
                backgroundColor: '#494d54',
                borderWidth:1,
                borderRadius:2,
                borderColor: '#63666d',
                paddingHorizontal: 8,
              }}
            />
            <View style={{backgroundColor: '#232732', padding: 20, }}>
              <Select
                label="Ticket Type"
                options={_.map(ticketOptions,(o)=>({value:o.id, label:o.displayName}))}
                onChange={(value)=>this.changeTicketType(value)}
                value={ticketType}
                defaultValue='Select Ticeket Type'
              />
              <Select
                label="Pricing Adjustment"
                ref='discount'
                options={_.map(DISCOUNT_OPTIONS,(o)=>({value:o.value, label:o.title}))}
                onChange={(value)=>this.changeDiscount(value)}
                value={discountOption}
                defaultValue='Select Discount Type'
              />
              {discountOption != '' && discountOption != 'none' &&
                <View style={[commonStyle.directionRow, {paddingHorizontal:5, marginTop:5}]}>
                  <Text style={[commonStyle.fieldLabel, {flex:1}]}>
                    {discountOption == 'fixed_price' ? 'New Price' : 'Discount Amount'}
                  </Text>
                  {discountOption == 'percentage' ?
                    <View style={commonStyle.directionRow}>
                      <View style={{width:50}}>
                        <TextInput
                          ref='discountValue'
                          type='number'
                          placeholder='0'
                          defaultValue='0'
                          style={[commonStyle.selectFieldContainer, {paddingHorizontal:5}]}
                          autoFocus={true}
                          onChangeText={(value)=>this.setState({discountValue:value})}
                          value={discountValue}
                        />
                      </View>
                      <Text style={{color: '#b6c5cf', marginLeft:5}}>{discountValueSymbol}</Text>
                    </View>:
                    <View style={commonStyle.directionRow}>
                      <Text style={{color: '#b6c5cf', marginRight:5}}>{discountValueSymbol}</Text>
                      <View style={{width:50}}>
                        <TextInput
                          ref='discountValue'
                          type='number'
                          defaultValue='0'
                          placeholder='0'
                          style={[commonStyle.selectFieldContainer, {paddingHorizontal:5}]}
                          autoFocus={true}
                          onChangeText={(value)=>this.setState({discountValue:value})}
                          value={discountValue}
                        />
                      </View>
                    </View>
                  }
                </View>}
              <View style={{paddingHorizontal:5,  marginTop:5, flexDirection:'row', alignItems:'center'}}>
                <Text style={commonStyle.fieldLabel}>
                  Maximum Number of Tickets (optional)
                </Text>
                <View style={{width:50}}>
                  <TextInput
                    ref='quantityLimit'
                    type='number'
                    id='quantityLimit'
                    style={[commonStyle.selectFieldContainer,{paddingHorizontal:5}]}
                    placeholder='0'
                    defaultValue='0'
                    onChangeText={(value)=>this.setState({quantityLimit:value})}
                    value={quantityLimit}
                  />
                </View>
              </View>

              <View style={[commonStyle.directionRow,{margin:15, justifyContent:'center'}]}>
                <Button style={{backgroundColor:'#638a94'}} disabled={discountOption == '' || ticketType == ''} onPress={()=>this.addItem()} title='Add' />
                <Button style={{backgroundColor:'#798284'}} onPress={()=>this.cancelItem()} title='Cancel' />
              </View>
            </View>
          </View>
        }
        { promotion.expanded &&
            <ScrollView horizontal={true}>
              <View>
                {items}
              </View>
            </ScrollView>
        }
        {promotion.expanded &&
          <View>
            <View style={styles.eventpromotion_promotion}>
              <Text style={{color:'#b6c5cf'}}>
                Enter valid codes for unlocking this promotion (press space or enter after each one):
              </Text>
              <TagsField isPromotion={true} value={promotion.codes} onChange={()=>this.changePromoCodes()} controlOutside/>
            </View>
            <View style={styles.eventpromotion_promotion}>
              <DateTimePickera defaultValue={promotion.startDate} label="Start Date (optional)" id="startDate" placeholder="D MMM YYYY H:M AM" onChange={(val)=>this.changeStartDate(val)}/>
              <DateTimePickera defaultValue={promotion.endDate} label="End Date (optional)" id="endDate" placeholder="D MMM YYYY H:M AM" onChange={(val)=>this.changeEndDate(val)}/>
            </View>
            <View style={{flexDirection:'row', justifyContent:'center', padding:10}}>
              <Button icon={promotion.isNew ? 'floppy-o' : 'pencil'} title={promotion.isNew ? 'Create':'Update'} onPress={e => this.savePromotion()}/>
              <Button icon='trash' title='Delete' onPress={e => this.deletePromotion()} style={{backgroundColor:'#d45450'}}/>
            </View>
          </View>
        }
      </View>
    )
  }
}export default promotion
