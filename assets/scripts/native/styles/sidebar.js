import { StyleSheet } from 'react-native'
import Dimensions from 'Dimensions'

const window = Dimensions.get('window')

export default StyleSheet.create({
    container: {
        flex:1,
        paddingTop:15,
    },
    nav_container:{
        flex:1,
    },
    navItem:{
        paddingLeft: 20,
        paddingRight: 20,
        height: 55,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        minWidth: 90
    },
    active_navItem:{
        height: 55,
        alignItems:'center',
        flexDirection:'row',
    },
    itemIcon:{
        width: 23,
        resizeMode: 'contain',
    },
    itemText:{
        color: '#ffffff',
        fontSize:14,
        fontWeight: '400',
        fontFamily: 'Open Sans'
    },
    sideItemIcon: {
        width: 18,
        resizeMode: 'contain',
        marginRight: 15
    },
    navLinear:{position:'absolute', left:0, top:0},
    navlinearGradient:{
        width:3,
        height:55,
    },

    /* shadow */
    shadow: {
      shadowColor: '#000000',
      shadowRadius: 1,
      shadowOpacity: 1,
      shadowOffset: {
        height: 10,
        width: 0
      }
    },

    logout: {
      flexDirection: 'row',
      padding: 10,
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: 'grey'
    },

    logoutText: {
      flex: 1,
      marginLeft: 10,
      fontSize: 15,
      fontWeight: '500',
      color: '#B6C5CF',
      fontFamily: 'Open Sans',
    },
    accountSettings: {
      flexDirection: 'row',
      padding: 10,
      alignItems: 'center',
    },
    accountSettingsText: {
      marginLeft: 10,
      fontSize: 15,
      fontWeight: '500',
      color: '#B6C5CF',
      fontFamily: 'Open Sans',
    },
    abbName: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: '#4d5257',
      alignItems: 'center',
      justifyContent: 'center',
    },
    abbNameText: {
      fontSize: 10,
      color: '#B6C5CF',
      fontFamily: 'Open Sans',
    }
})
