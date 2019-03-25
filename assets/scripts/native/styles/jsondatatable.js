import { StyleSheet } from 'react-native'
import Dimensions from 'Dimensions'

const window = Dimensions.get('window')

export default StyleSheet.create({
  datatable_searchbar:{
    marginBottom:10,
    flex:1,
    flexDirection:'row'
  },
  searchbar_left:{flex:1},
  searchbar_right:{},
  datatable_tablecontent:{},
  pagination_select_panelsize:{},
  pagination_select_pgsize:{},
  datatable_paginationbar:{}
})
