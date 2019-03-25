import _ from 'lodash'
let scrollY = 0
export function isInt(n){
  return !_.isNaN(Number(n)) && n % 1 === 0
}

export function isFloat(n){
  return !_.isNaN(Number(n)) && n % 1 !== 0
}

export function isWeb() {
  return typeof document != 'undefined'
}

export function isNative() {
  return typeof navigator != 'undefined' && navigator.product == 'ReactNative'
}

export function setScroll(Y) {
  scrollY = Y
}

export function getScroll() {
  return scrollY
}
