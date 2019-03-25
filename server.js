var crypto = require('crypto')
var fs = require('fs')
var path = require('path')

var S3UploadStream = require('s3-upload-stream')
var aws = require('aws-sdk')
var bluebird = require('bluebird')
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
var compression = require('compression')
var express = require('express')
var gm = require('gm')
var pipe = require('multipipe')

aws.config.update({
  accessKeyId: process.env.ADMIN_UPLOADS_AWS_KEY,
  secretAccessKey: process.env.ADMIN_UPLOADS_AWS_SECRET,
})

var Promise = bluebird.Promise
Promise.config({cancellation: true})

var app = express()

var tv4 = require('tv4').freshApi()
tv4.addFormat(require('tv4-formats'))
tv4.addSchema('https://api.theticketfairy.com/schema', require('./schema.json'))
tv4.setErrorReporter(function(error, data, schema) {
  if (error.code === tv4.errorCodes.OBJECT_REQUIRED) {
    return 'Required'
  }
  return ''
})
app.set('schema', tv4)

app.use(compression())
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json({
  strict: true,
  type: ['application/json', 'application/vnd.api+json']
}))
app.use(express.static('dist'))

app.use(require('./lib/users/routes'))
app.use(require('./lib/orgs/routes'))
app.use(require('./lib/events/routes'))
app.use(require('./lib/media/routes'))

app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

var server = app.listen(3000, function () {
  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)
})
