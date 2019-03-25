import _ from 'lodash'
import {StyleSheet} from 'react-native'

import constants from './constants'
import DeviceInfo from 'react-native-device-info'

export const COLORS = ['#7774FF', '#38C9FF', '#45C578', '#CB5CF4', '#F68243', '#FF5B95']
export const GRADIENT_COLORS1 = [
  ['rgba(124,68,234,1)', 'rgba(150,149,237,0.7)'],
  ['rgba(0,156,226,1)', 'rgba(13,223,238,0.7)'],
  ['rgba(50,185,124,1)', 'rgba(0,235,146,0.7)'],
  ['rgba(124,68,234,1)', 'rgba(204,113,228,0.7)'],
  ['rgba(205,125,45,1)', 'rgba(239,200,103,0.7)'],
  ['rgba(180,72,234,1)', 'rgba(233,85,138,0.7)']
]
export const GRADIENT_COLORS2 = [
  ['rgba(124,68,234,0.4)', 'rgba(124,68,234,0.1)', 'rgba(0,0,0,0)'],
  ['rgba(0,156,226,0.4)', 'rgba(0,156,226,0.1)', 'rgba(0,0,0,0)'],
  ['rgba(50,185,124,0.4)', 'rgba(50,185,124,0.1)', 'rgba(0,0,0,0)'],
  ['rgba(124,68,234,0.4)', 'rgba(124,68,234,0.1)', 'rgba(0,0,0,0)'],
  ['rgba(205,125,45,0.4)', 'rgba(205,125,45,0.1)', 'rgba(0,0,0,0)'],
  ['rgba(233,85,138,0.4)', 'rgba(233,85,138,0.1)', 'rgba(0,0,0,0)']
]
export const rangeColors = (i) => {

}
let style = {
  genderBreakdownContentWrapper: {flexDirection: 'row', marginLeft: 30, marginRight: 30},
  genderBreakdownItemWrapper: {flex:1, alignItems:'center', marginTop:30},
  textDescription: {fontSize:10,color:'#b6c5cf', fontFamily: 'Open Sans'},
  textTitle: {fontSize:16,fontWeight:'400',color:'#FFF',marginTop:10, fontFamily: 'Open Sans'},
  textInfo: {fontSize:28,fontWeight:'400',color:'#b6c5cf', fontFamily: 'Open Sans'},
  ageRangeContentWrapper: {flexDirection:'row'},
  ageRangeItemWrapper: {flex:1, backgroundColor:'transparent'},
  ageRangeSummaryWrapper: {flexDirection:'row',alignItems:'center',justifyContent:'center',marginTop:20},
  ageRangeSummaryItemWrapper: {alignItems:'center',paddingLeft:15,paddingRight:15, marginBottom:25},
  ageRangeSummaryInfoWrapper: {flexDirection:'row',height:46,justifyContent:'center',alignItems:'center'},
  ageRangeSummaryInfoIcon: {width:20},
  ageRangeSummaryInfoLabel: {fontSize:26,color:'#FFF',fontWeight:'400', fontFamily: 'Open Sans'},
  profession_stat: {flexDirection: 'row', alignItems: 'center'},
  profession_stat_image: {width: 32, height: 22.66, marginRight: 10},
  profession_stat_title: {fontSize: 40, fontWeight: '600', color: '#fff', fontFamily: 'Open Sans'},
  profession_stat_subTitle: {fontSize: 11, fontWeight: '700', color: '#ffbf66', fontFamily: 'Open Sans'},
  across: {paddingVertical: 20},
  across_text: {fontSize: 14, fontWeight: '700', color: '#fff', fontFamily: 'Open Sans'},
}

if (!DeviceInfo.isTablet()) style = _.merge(style, {
  genderBreakdownContentWrapper: {flexDirection:'column'},
  ageRangeContentWrapper: {flexDirection:'column'},
  ageRangeSummaryWrapper: {flexDirection:'column'}
})
export default StyleSheet.create(style)

