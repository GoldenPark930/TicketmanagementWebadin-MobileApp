const KEY = 'redux_form_changed_fields'
import {AsyncStorage} from 'react-native'

global.native_form_helper_reset = function helper_reset(){
  AsyncStorage.setItem(KEY, null);
//  localStorage.setItem(KEY, null)
}

global.native_form_helper_get = function helper_get(){
  let fields = JSON.parse(AsyncStorage.getItem(KEY))
  if(fields == null)
    fields = {}
  return fields
}

global.native_form_helper_set = function helper_set(obj){
  AsyncStorage.setItem(KEY, JSON.stringify(obj))
}

global.naive_form_helper_isEditted = function helper_isEditted(){
  if(JSON.parse(AsyncStorage.getItem(KEY)) == null)
    return false
  return true
}
