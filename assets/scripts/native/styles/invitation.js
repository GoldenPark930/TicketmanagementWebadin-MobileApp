import { StyleSheet } from 'react-native'
import Dimensions from 'Dimensions'

const window = Dimensions.get('window')

export default StyleSheet.create({
  heading_style : {
    marginTop:30,
    marginBottom:20,
    paddingLeft:10,
    borderLeftWidth:3,
    borderLeftColor: '#ffa46b'
  },
  heading_text:{
    fontWeight:'600',
    fontSize:18,
    color:'#ffffff',
    fontFamily: 'Open Sans'
  },
  emailButton: {
    paddingHorizontal:5,
    paddingVertical:10,
    backgroundColor:'#25b998',
    borderRadius:3,

    shadowRadius: 2,
    shadowOpacity: 0.2,
    shadowColor: '#000000',
    shadowOffset: {
      height: 3,
      width: 6
    }
  },
  emailButton_text:{
    fontSize:12,
    color:'#ffffff',
    fontFamily: 'Open Sans'
  },
  addnew_msg:{
    paddingVertical:20,
    fontStyle: 'italic',
    color:'#B6C5CF',
    textAlign:'center',
  },
  modal_dialog:{
    margin: 30
  },
  modal_header:{

  },
  text_compact:{

  }
})

