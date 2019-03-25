var fs = require('fs')
var path = require('path')

var _ = require('lodash')
var Router = require('express').Router

function readDB() { return JSON.parse(fs.readFileSync(path.join(__dirname, 'samples', 'users.json'))) }
var db = readDB()

var router = module.exports = Router()

router.route('/api/users')
  .post(function(req, res) {
    var schema = req.app.get('schema')
    var result = schema.validateMultiple(req.body, 'https://api.theticketfairy.com/schema#user')
    if (!result.valid) {
      return res.status(422).json({
        errors: _.map(result.errors, function(err) {
          return {
            status: 422,
            source: {pointer: [err.dataPath, err.params.key].filter(Boolean).join('/')},
            code: 'validation_failed',
            details: err.message
          }
        }),
      })
    }

    var form = req.body.data
    var existing = _.find(db.data, {email: form.attributes.email})
    if (existing) {
      return res.status(422).json({
        errors: [
          {
            status: 422,
            source: {pointer: '/data/attributes/email'},
            code: 'validation_failed',
            details: 'A user with this email is already registered'
          }
        ]
      })
    }

    var user = Object.assign({}, form, {
      id: ('000' + parseInt(Math.random() * 1000, 10)).substr(-3),
      type: 'user'
    })

    db.data.push(user)

    return res.status(200).json({
      data: user
    })
  })

router.route('/api/authenticate')
  .get(function(req, res) {
    var uid = req.cookies.uid

    var user = _.find(db.data, {id: uid, type: 'user'})
    if (!user) { return res.status(200).json({data: null}) }

    return res.status(200).json({
      data: user,
      included: _.compact(_.map(user.relationships.organizations.data, function(o) {
        return _.find(db.included, {id: o.id, type: o.type})
      }))
    })
  })
  .post(function(req, res) {
    var username = _.get(req.body, 'data.attributes.username')
    var password = _.get(req.body, 'data.attributes.password')
    var matcher = _.matches({email: username, password: password})
    var user = _.find(db.data, function(u) { return matcher(u.attributes) })
    if (!user) {
      return res.status(403).json({
        errors: [
          {
            code: 'access_denied',
            status: 403,
            title: 'Access Denied',
            details: 'Invalid username or password'
          }
        ]
      })
    }
    res.cookie('uid', user.id, {httpOnly: true, expires: new Date(Date.now() + 60*24*60*60*1000)})
    return res.status(200).json({
      data: user,
      included: _.compact(_.map(user.relationships.organizations.data, function(o) {
        return _.find(db.included, {id: o.id, type: o.type})
      }))
    })
  })
  .delete(function(req, res) {
    res.clearCookie('uid')
    return res.status(204).send()
  })

router.route('/api/fbauthenticate')
  .post(function(req, res) {
    var user = db.data[0]
    res.cookie('uid', user.id, {httpOnly: true, expires: new Date(Date.now() + 60*24*60*60*1000)})
    return res.status(200).json({
      data: user,
      included: _.compact(_.map(user.relationships.organizations.data, function(o) {
        return _.find(db.included, {id: o.id, type: o.type})
      }))
    })
  })

router.route('/api/organizations/:id')
  .get(function(req, res) {
    const org = _.find(db.included, {id: req.params.id, type: 'organization'})
    if (!org) {
      return res.status(404).json({
        status: 404,
        details: 'Organization not found'
      })
    }
    res.json({data: org})
  })
  .patch(function(req, res) {
    console.log('-req', req.params, req.body.data)
    const org = _.find(db.included, {id: req.params.id, type: 'organization'})
    if (!org) {
      return res.status(404).json({
        status: 404,
        details: 'Organization not found'
      })
    }
    var schema = req.app.get('schema')
    var updated = _.merge({}, org, req.body.data, _.pick(org, 'id', 'type'))
    var result = schema.validateMultiple(req.body, 'https://api.theticketfairy.com/schema#organization')
    if (!result.valid) {
      return res.status(422).json({
        errors: _.map(result.errors, function(err) {
          return {
            status: 422,
            source: {pointer: [err.dataPath, err.params.key].filter(Boolean).join('/')},
            code: 'validation_failed',
            details: err.message
          }
        }),
      })
    }

    db.included = _.map(db.included, function(e) {
      if (e.id === org.id) {
        return updated
      }
      return e
    })

    return res.status(200).json({data: updated})
  })

router.route('/api/organizations')
  .post(function(req, res) {
    var schema = req.app.get('schema')
    var result = schema.validateMultiple(req.body, 'https://api.theticketfairy.com/schema#organization')
    if (!result.valid) {
      return res.status(422).json({
        errors: _.map(result.errors, function(err) {
          return {
            status: 422,
            source: {pointer: [err.dataPath, err.params.key].filter(Boolean).join('/')},
            code: 'validation_failed',
            details: err.message
          }
        }),
      })
    }

    var uid = req.cookies.uid
    var doc = Object.assign({}, req.body.data, {
      id: ('000' + parseInt(Math.random() * 1000, 10)).substr(-3),
    })
    db.included.push(doc)

    var user = _.find(db.data, {id: uid, type: 'user'})
    if (!user) { return res.status(200).json({data: null}) }

    _.get(user, 'relationships.organizations.data', []).push(doc)

    return res.status(200).json(doc)
  })
