import _ from 'lodash'
import {StyleSheet, Dimensions} from 'react-native'

import constants from './constants'
import DeviceInfo from 'react-native-device-info'
var window = Dimensions.get('window');

let style = {
  event: {
    flexDirection: 'row',
  },
  event_img: {
    borderRadius: 3,
    width: 97,
    height: 78,
    shadowRadius: 5,
    shadowOpacity: 0.7,
    shadowColor: constants.colors.shadow,
    shadowOffset: {
      height: 7,
      width: 5
    }
  },
  select2: {
    marginLeft: 13,
    marginRight:13,
    flex: 1,
    backgroundColor: '#5c6167',
    padding:7,
    borderRadius: 3,
    shadowOpacity: 0.5,
    shadowColor: constants.colors.shadow,
    shadowOffset: {
      height: 5,
      width: 5
    }
  },
  select_title: {
    flex:1,
    flexDirection: 'row',
  },
  select_titile_text: {
    width: window.width-180,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.1,
    fontFamily: 'Open Sans',
    color: 'white',
    marginLeft: 3
  },
  event_address_img: {
    width: 10,
    height: 14,
    marginLeft: 1,
    marginRight: 6,
    marginTop: 10
  },
  event_address_text: {
    fontSize: 12,
    fontFamily: 'Open Sans',
    fontWeight: '600',
    letterSpacing: -0.1,
    width: 172,
    color: '#c6cbd0',
    flexWrap: 'wrap'
  },
  event_time_img: {
    width: 11,
    height: 11,
    marginLeft: 1,
    marginRight: 6,
    marginTop: 3
  },
  event_potion_img:{
    margin: 5,
    borderRadius: 3,
    width: 97/2.5,
    height: 78/2.5,
  },
  event_time_option_img: {
    width: 10,
    height: 10,
    marginLeft: 1,
    marginRight: 6,
    marginTop: 3
  },
  event_address_option_img: {
    width: 9,
    height: 13,
    marginLeft: 1,
    marginRight: 6,
    marginTop: 10
  },
  event_content_tick: {
    width: 15,
    height: 15,
    marginLeft: 10
  },
  optionView: {
    height: 240,
    minWidth:290,
    backgroundColor: '#393e46',
    borderRadius: 5,
    position: 'absolute',
    shadowOpacity: 0.3,
    shadowColor: 'black',
    shadowOffset: {
      height: 5,
        width: 2
    }
  },
  optionText: {
    backgroundColor: '#393e46',
    paddingLeft: 5,
    borderWidth: 1,
    borderColor: '#4a4f56',
    borderRadius: 3
  },
}
export default StyleSheet.create(style)

