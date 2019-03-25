import {handleActions} from 'redux-actions'
import Immutable from 'immutable'
import {UPDATE_LOCATION} from 'react-router-redux'

const initialState = Immutable.Map({
  path: '',
  sidebarType: 'main', // values = [main, event, brand]
})

export default handleActions({
  [UPDATE_LOCATION]: (state, action) => {    
    var path = action.payload.pathname
    var isEvent = path.indexOf('/event') >= 0 ? true : false
    var isBrand = path.indexOf('/brand') >= 0 ? true : false

    return state.withMutations(map => {
      map
        .set('path', path)
        .set('sidebarType', isEvent ? 'event' : (isBrand ? 'brand' : 'main'))
    })
    return initialState
  }
}, initialState)
