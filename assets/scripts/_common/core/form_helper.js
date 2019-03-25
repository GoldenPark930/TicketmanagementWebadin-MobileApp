const KEY = 'redux_form_changed_fields' 

global.form_helper_reset = function helper_reset(){
  localStorage.setItem(KEY, null)
}

global.form_helper_get = function helper_get(){
  let fields = JSON.parse(localStorage.getItem(KEY))
  if(fields == null)
    fields = {}
  return fields
}

global.form_helper_set = function helper_set(obj){
  localStorage.setItem(KEY, JSON.stringify(obj))
}

global.form_helper_isEditted = function helper_isEditted(){
  if(JSON.parse(localStorage.getItem(KEY)) == null)
    return false
  return true
}