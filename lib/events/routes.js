var fs = require('fs')
var path = require('path')

var _ = require('lodash')
var Router = require('express').Router

function readDB() { return JSON.parse(fs.readFileSync(path.join(__dirname, 'samples', 'events.json'))) }
var db = readDB()
function readDB_performance() { return JSON.parse(fs.readFileSync(path.join(__dirname, 'samples', 'performance1.json'))) }
var db_performance = readDB_performance()
function readDB_referrals() { return JSON.parse(fs.readFileSync(path.join(__dirname, 'samples', 'referrals.json'))) }
var db_referrals = readDB_referrals()
function readDB_audience() { return JSON.parse(fs.readFileSync(path.join(__dirname, 'samples', 'audience.json'))) }
var db_audience = readDB_audience()
function readDB_orders() { return JSON.parse(fs.readFileSync(path.join(__dirname, 'samples', 'orders.json'))) }
var db_orders = readDB_orders()

var router = module.exports = Router()

router.route('/api/events')
  .get(function(req, res) {
    if (Math.random() * 100 < 10) {
      return res.status(500).json({details: 'Randomly generated error for testing'})
    }
    const events = _.chain(db.data)
      // .map(function(e) { return _.omit(e, 'relationships') })
      .value()
    setTimeout(function() {
      res.status(200).json({data: events})
    }, Math.random() * 800)
  })
  .post(function(req, res) {
    var schema = req.app.get('schema')
    var result = schema.validateMultiple(req.body, 'https://api.theticketfairy.com/schema#event')
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

    var doc = Object.assign({}, req.body.data, {
      id: ('000' + parseInt(Math.random() * 1000, 10)).substr(-3),
    })
    db.data.push(doc)

    return res.status(200).json({data: doc})
  })

router.route('/api/events/:id')
  .get(function(req, res) {
    if (Math.random() * 100 < 10) {
      return res.status(500).json({details: 'Randomly generated error for testing'})
    }
    var includes = _.get(req.query, 'include', '').split(',')

    var event = _.find(db.data, {id: req.params.id})
    if (!event) { return res.status(404).json({details: 'Event not found'}) }

    var included = {}

    _.forEach(event.relationships, function(v, k) {
      var data = v.data
      var rels = data
      if (!_.isArray(data)) { rels = [data] }
      _.forEach(rels, function(rel) {
        var key = [rel.type, rel.id].join(':')
        if (included[key]) { return }
        var result = _.find(db.included, {id: rel.id, type: rel.type})
        if (!result) { return }
        included[key] = result
      })
    })

    setTimeout(function() {
      res.status(200).json({data: event, included: _.values(included)})
    }, Math.random() * 800)
  })
  .patch(function(req, res) {
    var current = _.find(db.data, {id: req.params.id})
    if (!current) {
      return res.status(404).json({
        errors: [
          {
            status: 404,
            code: 'not_found',
            details: 'The event you are trying to edit does not exist'
          }
        ]
      })
    }
    var schema = req.app.get('schema')
    var updated = _.merge({}, current, req.body.data, _.pick(current, 'id', 'type'))
    var result = schema.validateMultiple({data: updated}, 'https://api.theticketfairy.com/schema#event')
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

    db.data = _.map(db.data, function(e) {
      if (e.id === current.id) {
        return updated
      }
      return e
    })

    return res.status(200).json({data: updated})
  })

router.route('/api/events/:id/relationships/tickets').get(function(req, res) {
  if (Math.random() * 100 < 10) {
    return res.status(500).json({details: 'Randomly generated error for testing'})
  }
  var event = _.find(db.data, 'id', req.params.id)
  if (!event) {
    return res.status(404).json({
      errors: [{
        status: 404,
        code: 'not_found',
        details: 'Event not found'
      }]
    })
  }

  var tickets = _.chain(event)
    .get('relationships.tickets.data', [])
    .map(function(v, k) {
      return _.find(db.included, {id: v.id, type: 'ticket'})
    }).value()

  setTimeout(function() {
    res.status(200).json({data: tickets})
  }, Math.random() * 800)
})

router.route('/api/tickets').post(function(req, res) {
  if (Math.random() * 100 < 10) {
    return res.status(500).json({details: 'Randomly generated error for testing'})
  }
  var schema = req.app.get('schema')
  var result = schema.validateMultiple(req.body, 'https://api.theticketfairy.com/schema#ticket')
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
  var er = _.get(req.body, 'data.relationships.event.data', {})
  var eid = er.id
  var etype = er.type
  if (etype !== 'event') {
    return res.status(422).json({
      errors: [
        {
          status: 422,
          source: {pointer: '/data/relationships/event'},
          code: 'validation_failed',
          details: 'Event relationship must point to an event type'
        }
      ]
    })
  }

  var event = _.find(db.data, {id: eid})
  if (!event) {
    return res.status(422).json({
      errors: [
        {
          status: 422,
          source: {pointer: '/data/relationships/event'},
          code: 'validation_failed',
          details: 'Event relationships points to non-existing event'
        }
      ]
    })
  }

  var doc = Object.assign({}, req.body.data, {
    id: ('000' + parseInt(Math.random() * 1000, 10)).substr(-3),
  })
  db.included.push(doc)
  _.get(event, 'relationships.tickets.data', []).push(doc)

  setTimeout(function() {
    res.status(200).json({data: doc})
  }, Math.random() * 800)
})

router.route('/api/tickets/:id').patch(function(req, res) {
  var current = _.find(db.included, {id: req.params.id})
  if (!current) {
    return res.status(404).json({
      errors: [
        {
          status: 404,
          code: 'not_found',
          details: 'The ticket you are trying to edit does not exist'
        }
      ]
    })
  }
  var schema = req.app.get('schema')
  var updated = _.merge({}, current, req.body.data, _.pick(current, 'id', 'type'))
  var result = schema.validateMultiple({data: updated}, 'https://api.theticketfairy.com/schema#ticket')
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
    if (e.id === current.id) {
      return updated
    }
    return e
  })

  setTimeout(function() {
    res.status(200).json({data: updated})
  }, Math.random() * 800)
})

router.route('/api/publishing/:id')
  .get(function(req, res) {
    if (Math.random() * 100 < 10) {
      return res.status(500).json({details: 'Randomly generated error for testing'})
    }
    const notices = [
      {
        key: '/data/attributes/startDate',
        level: 'error',
        message: 'Event start date is required'
      },
      {
        key: '/data/relationships/tickets',
        level: 'error',
        message: 'There are no tickets associated with this event'
      },
      {
        key: '/data/attributes/venue',
        level: 'warning',
        message: 'A venue is not yet set'
      }
    ]

    res.json({
      data: {
        id: req.params.id,
        type: 'publishstatus',
        attributes: {
          notices: _.sample([[], notices])
        }
      }
    })
  })

router.route('/api/db').get(function(req, res) {
  res.json(db)
})

router.route('/api/events/:id/relationships/performance')
  .get(function(req, res) {
    if (Math.random() * 100 < 10) {
      return res.status(500).json({details: 'Randomly generated error for testing'})
    }

    var event = _.find(db.data, 'id', req.params.id)
    if (!event) {
      return res.status(404).json({
        errors: [{
          status: 404,
          code: 'not_found',
          details: 'Event not found'
        }]
      })
    }

    const performance = _.chain(db_performance.data).value()
    setTimeout(function() {
      res.status(200).json({data: performance})
    }, Math.random() * 800)
  })


router.route('/api/events/:id/relationships/referrals')
  .get(function(req, res) {
    if (Math.random() * 100 < 10) {
      return res.status(500).json({details: 'Randomly generated error for testing'})
    }

    var event = _.find(db.data, 'id', req.params.id)
    if (!event) {
      return res.status(404).json({
        errors: [{
          status: 404,
          code: 'not_found',
          details: 'Event not found'
        }]
      })
    }

    const referrals = _.chain(db_referrals.data).value()
    setTimeout(function() {
      res.status(200).json({data: referrals})
    }, Math.random() * 800)
  })
  
router.route('/api/audience/:id/')
  .get(function(req, res) {
    //console.log(req.params.type);
    // var type = req.params.type;
    // if(type == 'brand'){
      
    // }else{
      
    // }
    //console.log(req)
    if (Math.random() * 100 < 10) {
      return res.status(500).json({details: 'Randomly generated error for testing'})
    }

    const audience = _.chain(db_audience.data).value()
    setTimeout(function() {
      res.status(200).json({data: audience})
    }, Math.random() * 800)
  })

router.route('/api/events/:id/relationships/orders')
  .get(function(req, res) {
    if (Math.random() * 100 < 10) {
      return res.status(500).json({details: 'Randomly generated error for testing'})
    }

    var event = _.find(db.data, 'id', req.params.id)
    if (!event) {
      return res.status(404).json({
        errors: [{
          status: 404,
          code: 'not_found',
          details: 'Event not found'
        }]
      })
    }

    const order = _.chain(db_orders.data).value()
    setTimeout(function() {
      res.status(200).json({data: order})
    }, Math.random() * 800)
  })