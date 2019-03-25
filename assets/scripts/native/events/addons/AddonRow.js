import _ from 'lodash'
import React, {
  Component
} from 'react'
import {
  Text,
  View,
} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import {Button} from '../../_library'
import {commonStyle, styleConstant} from "../../styles";
import DeviceInfo from 'react-native-device-info'
class AddOnRow extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }
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
    console.warn(addon.active)
    return (
      <View style={{width:'100%'}}>
        <View style={{flexDirection: 'row', width:'100%'}}>
          <View style={{flexDirection: 'row', alignSelf: 'flex-start', width:'20%'}}>
            <Text
              style={{color: addon.active ? styleConstant.colors.success : styleConstant.colors.danger}}><Icon
              name='circle'/></Text>
              {addon.active &&
              <Text style={{marginLeft: 5, color: 'white'}}><Icon name='eye'/></Text>}
          </View>
          <View style={{flexDirection: 'row', flexWrap: 'wrap', width:'80%'}}>
            <View style={{width:'100%'}}>
              <Text style={commonStyle.gridBodyCellLabel}>Name</Text>
              <Text style={commonStyle.gridBoryCellValue}>
                {addon.name}
              </Text>
            </View>
            <View style={{width:'50%'}}>
              <Text style={commonStyle.gridBodyCellLabel}>Group</Text>
              <Text style={commonStyle.gridBoryCellValue}>
                {addon.groupName}
              </Text>
            </View>
            <View style={{width: '50%'}}>
              <Text style={[commonStyle.gridBodyCellLabel, {fontSize: 12}]}>Price</Text>
              <Text style={commonStyle.gridBoryCellValue}>
                {addon.currency ? `${addon.currency} ` : ''}{(addon.price / 100).toFixed(2)}
              </Text>
            </View>
            <View style={{width: '50%'}}>
              <Text style={[commonStyle.gridBodyCellLabel, {fontSize: 12}]}>Cost</Text>
              <Text style={commonStyle.gridBoryCellValue}>
                {addon.currency ? `${addon.currency} ` : ''}{(addon.cost / 100).toFixed(2)}
              </Text>
            </View>
            <View style={{width: '50%'}}>
              <Text style={[commonStyle.gridBodyCellLabel, {fontSize: 12}]}>Stock</Text>
              <Text style={commonStyle.gridBoryCellValue}>
                {addon.stock===null ? 'Unlimited' : addon.stock}
              </Text>
            </View>
          </View>
        </View>
        <Button size={DeviceInfo.isTablet() ?'small':'large'}
                onPress={e => this.handleEdit()} title='Edit'
                style={{marginBottom:DeviceInfo.isTablet() ? 0:5, backgroundColor:'#337ab7'}}
                icon='pencil'/>
        {addon.active &&
        <Button size={DeviceInfo.isTablet() ?'small':'large'}
                onPress={e => this.handleDeactivate()} title='Deactivate'
                style={[commonStyle.buttonSecondary, {marginBottom:DeviceInfo.isTablet() ? 0:5}]}
                icon='ban'/>
        }
        {!addon.active &&
        <Button size={DeviceInfo.isTablet() ?'small':'large'}
                onPress={e => this.handleActivate()} title='Activate'
                style={[commonStyle.buttonSecondary, {marginBottom:DeviceInfo.isTablet() ? 0:5}]}
                icon='cog'/>
        }
      </View>
    )
  }
}export default AddOnRow
