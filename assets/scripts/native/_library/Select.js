import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import {View, Text, ScrollView} from 'react-native'
import {Menu, MenuOptions, MenuOption, MenuTrigger} from 'react-native-popup-menu'
import Icon from 'react-native-vector-icons/FontAwesome'
import {commonStyle, menu} from '../../native/styles'

export default class Select extends React.Component {
  static propTypes = {
    label: PropTypes.string,
    options: PropTypes.arrayOf(PropTypes.shape({
      value: PropTypes.any,
      label: PropTypes.any
    }))
  }

  render() {
    const {id, label, error, options, value,onBlur, onChange, defaultValue, style, ...field} = this.props

        const item = _.find(options, {value})
        const valueLabel = item ? item.label : defaultValue
        return (
            <View style={{flex: 1, padding: 5}}>
                <View style={commonStyle.fieldContainer }>
                    <Menu onBackdropPress={onBlur}>
                        <MenuTrigger>
                            <View style={style}>
                                <Text ellipsizeMode='tail' numberOfLines={1} style={commonStyle.fieldLabel}>{label}</Text>
                                <View style={[commonStyle.selectFieldContainer,error && field.touched &&{borderColor:'#d9534f'}]}>
                                    <Text style={[commonStyle.fieldValue, {flex:1}]}>{valueLabel}</Text>
                                    <Icon style={commonStyle.fieldIcon} name='caret-down' size={20}/>
                                    {error && field.touched &&
                                        <View style={commonStyle.fieldErrorWrapper}>
                                            <Icon name='caret-left' size={15} color='white' />
                                            <Text style={commonStyle.fieldValueError}>{error}</Text>
                                        </View>
                                    }
                                </View>
                            </View>
                        </MenuTrigger>
                      {options.length > 0 &&
                      <MenuOptions
                        customStyles={menu.menuOptionsCustomStylesForSelect}>
                          <ScrollView>
                            {
                              options.map((o, index) =>
                                <MenuOption key={index}
                                            customStyles={{optionText: {color: 'white'}}}
                                            onSelect={() => onChange(o.value)}>
                                  <Text style={menu.menuOptionLabel}>
                                    {value == o.value && <Icon name='check'/>} {o.label.toString()}
                                  </Text>
                                </MenuOption>
                              )
                            }
                          </ScrollView>
                      </MenuOptions>
                      }
                    </Menu>
                </View>
              </View>
        )
    }
}
