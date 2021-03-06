import url from 'url'
import _ from 'lodash'
import {isWeb, isNative} from './utils'

export const HTTP_INIT = 0
export const HTTP_LOADING = 1
export const HTTP_LOADING_SUCCESSED = 2
export const HTTP_LOADING_FAILED = 3
export const CACHE_SIZE = 1000

export const DEMOACCOUNT_EVENT_ID = 999999

const messageByCode = {
  'request_failed': [
    'Request failed to complete.',
    'This may be caused by bad network conditions.',
    'Check your connection and try again.'
  ].join(' '),
  'unexpected': [
    'Impressive... You just uncovered a bug in the system.',
    'You might want to try again or report this issue.'
  ].join(' '),
  'demoAccount_pathname_notfound': [
    'You can\'t access to that resource in demoAccount'
  ].join(' '),
}

function ServerError(...errs) {
  if (!(this instanceof ServerError)) {
    return new ServerError(...errs)
  }
  const len = errs.length
  this.name = 'ServerError'
  this.message = `${len} error${len > 1 ? 's' : ''} occurred`
  this.errors = this.children = errs
}

ServerError.fromResponse = function(res) {
  if (_.has(res, 'errors')) {
    return ServerError(...res.errors)
  }
  return ServerError({code: 'unexpected', details: messageByCode['unexpected'], meta: res})
}

ServerError.prototype = Object.create(Error.prototype)
ServerError.prototype.constructor = ServerError

ServerError.prototype.toFieldErrors = function() {
  return _.chain(this.errors)
    .map((fe) => {
      if (fe.code !== 'validation_failed') { return {} }
      let p = _.get(fe, 'source.pointer', '').replace(/^\//, '').split('/')
      if (p[0] === 'data') {
        p = p.slice(1)
      }
      const keyPath = p.length ? p : '_error'
      return _.set({}, keyPath, fe.details)
    })
    .reduce(_.merge, {})
    .value()
}

function unpackAPIArray(arr, included) {
  return _.map(arr, e => unpackAPIObject(e, included))
}
function unpackAPIObject(obj, included) {
  const rels = {}
  const iter = e => {
    var rel = _.get(included, `${e.type}:${e.id}`)
    return rel ? unpackAPIObject(_.get(included, `${e.type}:${e.id}`), included): e
  }
  _.forEach(_.get(obj, 'relationships'), (es, k) => {
    const data = _.get(es, 'data')
    if (_.isArray(data)) {
      rels[k] = _.map(data, iter)
    } else {
      rels[k] = iter(data)
    }
  })
  return {
    ...obj.attributes,
    id: obj.id,
    type: obj.type,
    $relationships: rels,
    $original: obj
  }
}

export function unpackAPI(obj) {
  if (!obj) { return obj }
  const {data, included, ...rest} = obj || {}
  const includeMap = _.keyBy(included || [], e => `${e.type}:${e.id}`)

  if (!data) { return obj }

  let out

  if (_.isArray(data)) { out = unpackAPIArray(data, includeMap) }
  else { out = unpackAPIObject(data, includeMap) }

  return {...rest, data: out}
}

const config    = require('../../../../config.json'),
      API_BASE  = process.env.ADMIN_API_BASE || config.ADMIN_API_BASE

export let makeURL = _.identity

if (API_BASE) {
  let u = url.parse(API_BASE)
  makeURL = (pathname, params) => {
    let isDemo = isWeb() && isDemoAccount()
    if(isDemo){
      let f_pathname = pathname.replace(/\/$/, '') // remove tailing /
      let json = null
      switch(f_pathname){
        case '/api/authenticate':
          break
        case '/api/events':
          json = asset('/assets/json/demoAccount/events.json')
          break
        case '/api/events/' + DEMOACCOUNT_EVENT_ID:
          json = asset('/assets/json/demoAccount/event.json')
          break
        case '/api/events/' + DEMOACCOUNT_EVENT_ID + '/relationships/add_ons':
          json = asset('/assets/json/demoAccount/add_ons.json')
          break
        case '/api/events/' + DEMOACCOUNT_EVENT_ID + '/relationships/check_in':
          json = asset('/assets/json/demoAccount/check_in.json')
          break
        case '/api/events/' + DEMOACCOUNT_EVENT_ID + '/relationships/demographics':
          json = asset('/assets/json/demoAccount/demographics.json')
          break
        case '/api/events/' + DEMOACCOUNT_EVENT_ID + '/relationships/devices':
          json = asset('/assets/json/demoAccount/devices.json')
          break
        case '/api/events/' + DEMOACCOUNT_EVENT_ID + '/relationships/email_templates':
          json = asset('/assets/json/demoAccount/email_templates.json')
          break
        case '/api/events/' + DEMOACCOUNT_EVENT_ID + '/relationships/gaming':
          json = asset('/assets/json/demoAccount/gaming.json')
          break
        case '/api/events/' + DEMOACCOUNT_EVENT_ID + '/relationships/mailchimp_lists':
          json = asset('/assets/json/demoAccount/mailchimp_lists.json')
          break
        case '/api/events/' + DEMOACCOUNT_EVENT_ID + '/relationships/mailouts':
          json = asset('/assets/json/demoAccount/mailouts.json')
          break
        case '/api/events/' + DEMOACCOUNT_EVENT_ID + '/relationships/order_locations':
          json = asset('/assets/json/demoAccount/order_locations.json')
          break
        case '/api/events/' + DEMOACCOUNT_EVENT_ID + '/relationships/orders':
          json = asset('/assets/json/demoAccount/orders.json')
          break
        case '/api/events/' + DEMOACCOUNT_EVENT_ID + '/relationships/referrals':
          json = asset('/assets/json/demoAccount/referrals.json')
          break
        case '/api/events/' + DEMOACCOUNT_EVENT_ID + '/relationships/tickets':
          json = asset('/assets/json/demoAccount/tickets.json')
          break
        case '/api/events/' + DEMOACCOUNT_EVENT_ID + '/relationships/performance':
          if(params && params.section != ''){
            switch(params.section){
              case 'add_on_breakdown':
                json = asset('/assets/json/demoAccount/performance_add_on_breakdown.json')
                break
              case 'box_office_sales':
                json = asset('/assets/json/demoAccount/performance_box_office_sales.json')
                break
              case 'charges':
                json = asset('/assets/json/demoAccount/performance_charges.json')
                break
              case 'discount_code_breakdown':
                json = asset('/assets/json/demoAccount/performance_discount_code_breakdown.json')
                break
              case 'password_breakdown':
                json = asset('/assets/json/demoAccount/performance_password_breakdown.json')
                break
              case 'pre_registration':
                json = asset('/assets/json/demoAccount/performance_pre_registration.json')
                break
              case 'promoter_sales':
                json = asset('/assets/json/demoAccount/performance_promoter_sales.json')
                break
              case 'release_breakdown':
                json = asset('/assets/json/demoAccount/performance_release_breakdown.json')
                break
              case 'resale':
                json = asset('/assets/json/demoAccount/performance_resale.json')
                break
              case 'sales':
                json = asset('/assets/json/demoAccount/performance_sales.json')
                break
              case 'waiting_list':
                json = asset('/assets/json/demoAccount/performance_waiting_list.json')
                break
              default:
                break
            }
          }
          break
        case '/api/audience/' + DEMOACCOUNT_EVENT_ID:
          if(params && params.type == 'event'){
            switch(params.section){
              case 'likes':
                json = asset('/assets/json/demoAccount/audience_event_likes.json')
                break
              case 'music':
                json = asset('/assets/json/demoAccount/audience_event_music.json')
                break
              case 'gender':
                json = asset('/assets/json/demoAccount/audience_event_gender.json')
                break
              case 'psychographics':
                json = asset('/assets/json/demoAccount/audience_event_psychographics.json')
                break
              default:
                break
            }
          }
          break
        default:
          break
      }
      if(json)
        return json
    }
    const p = url.parse(url.format(_.extend(u,{pathname: pathname})))
    p.pathname += p.pathname.charAt(p.pathname.length - 1) === '/' ? '' : '/'
    p.query = params
    return url.format(p)
  }
}

export function fetchAPI(pathname, options) {
  const opts = {
    credentials: 'include',
    headers: {
      'Accept': 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json'
    },
    ...options,
  }

  if(isWeb()) {
    const whatwgfetch = require('isomorphic-fetch')
    let url = makeURL(pathname, opts.params)
    let fetch_opts = opts
    if(isDemoAccount()){
      let extension = url.split('.').pop()
      if(extension == 'json'){// found matched json
        fetch_opts = null
      }
    }
    return whatwgfetch(url, fetch_opts)
      .catch(err => {
        const code = 'request_failed'
        return Promise.reject(ServerError({code: code, details: messageByCode[code]}))
      })
      .then(res => {
        if (res.status < 200 || res.status >= 300) {
          return Promise.reject(res)
        }
        return res
      })
      .catch(res => {
        if (res instanceof ServerError) { return Promise.reject(res) }
        return res.json()
          .catch(() => {
            const code = 'unexpected'
            return Promise.reject(ServerError({status: res.status, code: code, details: messageByCode[code]}))
          })
          .then(e => {
            return Promise.reject(ServerError.fromResponse(e))
          })
      })
      .then(res => {
        if (res.status === 204) {
          return
        }
        return res.json()
      })
      .then(body => unpackAPI(body))
  } else if(isNative()) {
    return fetch(makeURL(pathname, opts.params), opts)
      .catch(err => {
        const code = 'request_failed'
        return Promise.reject(ServerError({code: code, details: messageByCode[code]}))
      })
      .then(res => {
        if (res.status < 200 || res.status >= 300) {
          return Promise.reject(res)
        }
        return res
      })
      .catch(res => {
        if (res instanceof ServerError) { return Promise.reject(res) }
        return res.json()
          .catch(() => {
            const code = 'unexpected'
            return Promise.reject(ServerError({status: res.status, code: code, details: messageByCode[code]}))
          })
          .then(e => {
            return Promise.reject(ServerError.fromResponse(e))
          })
      })
      .then(res => {
        if (res.status === 204) {
          return
        }
        return res.json()
      })
      .then(body => unpackAPI(body))
  }
}
