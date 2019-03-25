import _ from 'lodash'
import {StyleSheet} from 'react-native'

import constants from './constants'
import DeviceInfo from 'react-native-device-info'


let style = {
  appContainer: {
    backgroundColor: '#000',
  },

  /* Default */
  container: {
    position: 'relative',
    flex: 1,
    flexDirection: 'column',
  },

  pageContainer: {
    flex: 1,
    padding: 20,
    flexDirection: 'column',
  },
  containerCentered: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Aligning items */
  rightAligned: {
    alignItems: 'flex-end',
  },

  /* Text Styles */
  baseFont: {
    fontFamily: 'Arial',
  },
  extraBoldFont: {
    fontFamily: 'OpenSans-ExtraBold'
  },
  boldFont: {
    fontFamily: 'OpenSans-Bold',
  },
  semiBoldFont: {
    fontFamily: 'Open Sans',
  },
  mediumFont: {
    fontFamily: 'Open Sans',
  },
  mediumItalicFont: {
    fontFamily: 'Open Sans',
  },
  defaultTextStyle: {
    fontFamily: 'Open Sans'
  },

  /* Helper Text Styles */
  centered: {
    textAlign: 'center',
  },
  textRightAligned: {
    textAlign: 'right',
  },

  /* Give me padding */
  paddingHorizontal: {
    paddingHorizontal: 20,
  },
  paddingLeft: {
    paddingLeft: 20,
  },
  paddingRight: {
    paddingRight: 20,
  },
  paddingVertical: {
    paddingVertical: 20,
  },
  paddingTop: {
    paddingTop: 20,
  },
  paddingBottom: {
    paddingBottom: 20,
  },
  paddingHorizontalSml: {
    paddingHorizontal: 10,
  },
  paddingLeftSml: {
    paddingLeft: 10,
  },
  paddingRightSml: {
    paddingRight: 10,
  },
  paddingVerticalSml: {
    paddingVertical: 10,
  },
  paddingTopSml: {
    paddingTop: 10,
  },
  paddingBottomSml: {
    paddingBottom: 10,
  },

  /* General Spacing */
  hr: {
    left: 0,
    right: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E7E7E7',
    height: 1,
    backgroundColor: 'transparent',
    marginTop: 20,
    marginBottom: 20,
  },
  spacer_5: {
    left: 0, right: 0, height: 1,
    marginTop: 5,
  },
  spacer_10: {
    left: 0, right: 0, height: 1,
    marginTop: 10,
  },
  spacer_15: {
    left: 0, right: 0, height: 1,
    marginTop: 15,
  },
  spacer_20: {
    left: 0, right: 0, height: 1,
    marginTop: 20,
  },
  spacer_25: {
    left: 0, right: 0, height: 1,
    marginTop: 25,
  },
  spacer_30: {
    left: 0, right: 0, height: 1,
    marginTop: 30,
  },
  spacer_40: {
    left: 0, right: 0, height: 1,
    marginTop: 40,
  },

  directionRow: {
    flex:1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:'flex-end'
  },

  /* Grid */
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  column: {
    flexDirection: 'column'
  },
  flex1: {
    flex: 1,
  },
  flex2: {
    flex: 2,
  },
  flex3: {
    flex: 3,
  },
  flex4: {
    flex: 4,
  },
  flex5: {
    flex: 5,
  },
  flex6: {
    flex: 6,
  },

  rowContainer: {
    paddingTop: 5,
    paddingBottom: 10,
    flexDirection: 'row',
  },
  rowContainer_ticket:{
    paddingTop: 5,
    paddingBottom: 10,
    flexDirection: 'row'
  },
  /* Text */

  /* Forms */
  formContainer: {
    color: constants.colors.text1
  },
  formGroup: {
    paddingTop: 15,
    paddingLeft: 25,
    paddingRight: 25,
    paddingBottom: 25
  },
  formLabel: {
    textAlign: 'left',
    marginBottom: 10,
  },
  formInputText: {
    height: 36,
    borderColor: '#cccccc',
    borderWidth: 0.75,
    borderRadius: 3,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },

  /* Panel */
  panelContainer: {
    borderRadius: 3,
    backgroundColor: constants.colors.background7
  },
  panelTitleContainer: {
    flexDirection: 'row',
    backgroundColor: '#2f3138',
    height: 40,
    paddingLeft: 15,
    alignItems: 'center',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3
  },
  panelTitleLabel: {
    color: constants.colors.text2,
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 10,
    fontFamily: 'Open Sans'
  },
  panelContentContainer: {
    padding: 20,
  },

  /* shadow */
  shadow: {
    shadowRadius: 5,
    shadowOpacity: 0.5,
    shadowColor: constants.colors.shadow,
    shadowOffset: {
      height: 10,
      width: 10
    }
  },
  /* warnings */
  errorLabel: {
    backgroundColor: constants.colors.error,
    color: 'white',
    fontSize: 12,
    paddingLeft: 12,
    paddingRight: 12,
    paddingTop: 6,
    paddingBottom: 6,
    width: 166,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    fontFamily: 'Open Sans'
  },

  /* Field */
  fieldContainer: {
    borderBottomColor: constants.colors.border2,
    // borderBottomWidth: 1
  },
  fieldContainerWithError: {
    borderBottomColor: constants.colors.error,
    // borderBottomWidth: 1
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: constants.colors.text1,
    fontFamily: 'Open Sans',
    marginBottom: 5,
    // flex:1,
  },
  fieldValue: {
    color: constants.colors.text2,
    height: 30,
    fontSize: 14,
    padding: 5,
    borderRadius:3,
    // flex: 1,
    fontFamily: 'Open Sans',
    borderWidth: 1,
    borderColor: '#63666d',
    backgroundColor: '#494d54'
  },
  fieldValueError:{
    color:'white',
    fontSize:13,
    marginLeft:10,
    fontFamily: 'Open Sans'
  },
  fieldIcon: {
    color: constants.colors.border5,
    fontSize: 15,
    padding: 5,
    fontFamily: 'Open Sans'
  },
  fieldHeaderLabel: {
    flex:1,
    color: constants.colors.text1,
    fontSize: 14,
    fontFamily: 'Open Sans'
  },
  fieldErrorWrapper:{
    position:'absolute',
    bottom:4,
    right:4,
    backgroundColor:'#d9534f',
    padding:5,
    borderRadius:2,
    justifyContent:'flex-end',
    alignItems:'center',
    flexDirection:'row'
  },

  /* TextArea */

  /* Select */
  selectPicker: {
    color: constants.colors.text2
  },
  selectFieldContainer:{
    borderWidth:1,
    borderRadius:2,
    borderColor:'#47516d',
    paddingTop:3,
    paddingBottom:3,
    backgroundColor:'#2a2f3c',
    flexDirection:'row',
    alignItems:'center',
    paddingLeft: 3,
    flex:1.5
  },
  selectValueWrapper:{
    borderWidth: 1,
    borderRadius: 2,
    borderColor: '#47516d',
    paddingTop: 3,
    paddingBottom: 3,
    backgroundColor: '#2a2f3c',
    flexDirection: 'row',
    alignItems: 'center'
  },

  /* Button */
  buttonContainer: {
    marginLeft: 5,
    marginRight: 5,
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 8,
    paddingBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 3,
    flexDirection: 'row',
    backgroundColor: constants.colors.success,
    marginVertical:5
  },
  buttonTitleLabel: {
    color: 'white',
    fontSize: 15,
    fontFamily: 'Open Sans',
  },
  buttonTitleLabelSmall: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Open Sans',
  },
  buttonDefault: {
    backgroundColor: constants.colors.success
  },
  buttonSecondary: {
    backgroundColor: constants.colors.backgroundButtonSecondary
  },
  buttonPrimary: {
    backgroundColor: constants.colors.backgroundButtonPrimary
  },
  buttonDanger: {
    backgroundColor: constants.colors.danger
  },
  buttonSmallPadding: {
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 6,
    paddingBottom: 6
  },

  /* Switch */
  switchTitleLabel: {
    color: constants.colors.text2,
    fontWeight: '600',
    flexWrap: 'wrap'
  },

  switchDescriptionLabel: {
    color: constants.colors.text1,
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 50,
    fontFamily: 'Open Sans',
    width: '35%',
    flexWrap: 'wrap',
  },

  /* Dialog */
  modalContainer: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    flex: 1
  },

  modalContent: {
    flex: 4,
    marginTop: 50,
    backgroundColor: constants.colors.background3,
    borderRadius: 5,
  },

  modalHeaderContainer: {
    padding: 15,
    alignItems: 'center'
  },

  modalBodyContainer: {
    padding: 15
  },

  modalTitleLabel: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Open Sans'
  },

  modalFooterContainer: {
    borderTopWidth: 1,
    borderTopColor: constants.colors.border3,
    padding: 15,
    alignItems: 'flex-end'
  },

  /* Grid */
  gridHeaderContainer: {
    flexDirection: 'row',
    //flex: 1,
    backgroundColor: constants.colors.background5
  },
  gridHeaderCell: {
    paddingTop: 8,
    paddingRight: 20,
    paddingBottom: 8,
    paddingLeft: 20,
    flexDirection: 'row',
    alignItems: 'center'
  },
  gridHeaderCellLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    fontFamily: 'Open Sans'
  },
  gridBodyContainer: {
    flexDirection: 'row',
    //flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: constants.colors.border4
  },
  gridBodyCell: {
    paddingTop: 10,
    paddingRight: 20,
    paddingBottom: 10,
    paddingLeft: 20,
    flexDirection: 'row',
    alignItems: 'center'
  },
  gridBodyCellLabel: {
    fontSize: 12,
    color: 'white',
    fontFamily: 'Open Sans'
  },
  gridBoryCellValue: {
    fontSize: 18,
    color: 'white',
    fontFamily: 'Open Sans',
    fontWeight: '600',
    marginTop: 5,
    marginBottom: 8
  },
  gridSummaryContainer: {
    flexDirection: 'row'
  },
  gridSummaryCell: {
    paddingTop: 15,
    paddingRight: 20,
    paddingBottom: 15,
    paddingLeft: 20
  },
  gridSummaryCellLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: 'white',
    fontFamily: 'Open Sans'
  },

  /* menu */
  sales_circle: {
    width: 40,
    height: 40,
    borderRadius: 40,
    backgroundColor: '#393e4d',
    alignItems: 'center',
    justifyContent: 'center'
  },

  /* chart */
  chartTitleLabel: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 15,
    fontFamily: 'OpenSans-Bold'
  },
  chartLegandContainer: {
    marginTop:15,
    backgroundColor: '#2f3239',
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row'
  },
  chartLegandLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#eee',
    marginLeft: 10,
    fontFamily: 'Open Sans'

  },
  chartTooltip: {
    position: 'absolute',
    flexDirection: 'row',
    padding: 7,
    backgroundColor: '#b6c5cf',
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartTooltipColor: {
    width: 15,
    height: 15,
    borderRadius: 2,
    borderColor: '#212530',
    borderWidth: 1,
  },
  chartTooltipKey: {
    marginLeft: 10,
    fontSize: 11,
    fontFamily: 'Open Sans'
  },
  chartTooltipValue: {
    marginLeft: 10,
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Open Sans'
  },
  /**/
  heading_style: {
    marginTop: 30,
    marginBottom: 20,
    paddingLeft: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#ffa46b',
    flexDirection: 'row',
    alignItems: 'center'
  },
  heading_text: {
    fontWeight: '600',
    fontSize: 18,
    color: '#ffffff',
    fontFamily: 'Open Sans',
    marginLeft: 5
  },
  emailButton: {
    paddingHorizontal: 5,
    paddingVertical: 10,
    backgroundColor: '#25b998',
    borderRadius: 3,

    shadowRadius: 2,
    shadowOpacity: 0.2,
    shadowColor: '#000000',
    shadowOffset: {
      height: 3,
      width: 6
    }
  },
  card_block: {
    borderRadius: 3,
    paddingVertical: 35,
    paddingHorizontal: 20
  },

  noDataIcon: {
    width: 90,
    height: 81,
    opacity: 0.6
  },

  textInputNormal: {
    padding: 5,
    borderWidth: 1,
    borderColor: constants.colors.border2,
    borderRadius: 3,
    height: 37,
    width: 230,
  },

  textContent: {
    fontWeight: '700',
    fontSize: 12,
    color: '#ffffff',
    fontFamily: 'Open Sans'
  },

  searchMatchText: {
    color:'white',
    marginLeft:5
  },

  /* Paging Bar */
  pageButtonContainer: {
    borderColor: '#ddd',
    borderWidth: 0,
    borderRadius: 4,
    width: 30,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center'
  },
  pageButtonLabel: {
    color:'#B6C5CF',
    fontSize: 11,
    fontFamily: 'Open Sans'
  },
  pageButtonLabelDisabled: {
    color:'#777',
    fontSize: 11,
    fontFamily: 'Open Sans'
  },

  /* tabBar */
  tabBar:{
    paddingHorizontal:20,
    paddingVertical:15 ,
  },
  tabBarTextStyle:{
    color:'#ffffff',
    fontSize:12,
    fontWeight:'700',
    fontFamily: 'Open Sans'
  },
  tabBarBody:{
    backgroundColor:'#1a1d25',
    paddingHorizontal:10,
    paddingVertical:15},
  tabHeader:{
    borderTopLeftRadius:2,
    borderTopRightRadius:2,
    flexDirection:'row'
  },

  title:{
    flex:1,
    justifyContent:'center',
    marginLeft:20,
    paddingLeft:10,
    marginBottom:20,
    borderLeftWidth:3,
    borderLeftColor:'#ffa46b',
    height:25
  },

  /* user info */
  userInfoAvatar: {width:45,height:45,borderRadius:22.5,backgroundColor:'#313542', flexDirection: 'row', alignItems: 'center'},
  userInfoFullname:{marginLeft:10,color:'white',fontSize:22,fontWeight:'600', fontFamily: 'Open Sans'},
  userInfoDesc:{color:'#b6c5cf'},

  /* image */
  imageStretch: {
    flex: 1,
    alignSelf: 'stretch',
    width: undefined,
    height: undefined
  }
}

if(!DeviceInfo.isTablet()) style = _.merge(style, {
  panelContentContainer: {
    paddingTop: 20,
    paddingRight: 10,
    paddingBottom: 20,
    paddingLeft: 10
  },
  formGroup: {
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0
  },
  fieldHeaderLabel: {
    flex: 0
  },
  switchTitleLabel: {
    color: constants.colors.text2,
    fontWeight: '600',
    width:300,
    backgroundColor:'#00000000',
  },
  rowContainer_ticket:{
    paddingTop: 5,
    paddingBottom: 10,
    flexDirection: 'column'
  },
  modalContent: {
    flex: 20,
    marginTop: 50,
    backgroundColor: constants.colors.background3,
    borderRadius: 5
  },
})
export default StyleSheet.create(style)

