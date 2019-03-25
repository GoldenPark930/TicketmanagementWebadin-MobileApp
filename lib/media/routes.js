var crypto = require('crypto')
var fs = require('fs')
var path = require('path')

var Router = require('express').Router
var S3Client = require('knox')
var S3UploadStream = require('s3-upload-stream')
var aws = require('aws-sdk')
var gm = require('gm')
var pipe = require('multipipe')
var _ = require('lodash')

var APIError = require('../errors').APIError
var s3Client = require('../s3').s3Client

var S3_UNEXPECTED_ERROR = new APIError('Unexpected error occurred while fetching file. Please try again soon.')
var S3_FORBIDDEN_ERROR = new APIError('You do have the necessary rights to access this resource.', 403, 'Access Denied')
var S3_NOT_FOUND_ERROR = new APIError('Not found', 404)

var router = module.exports = Router()

var allowedImageExtensions = {
  '.jpeg': true,
  '.jpg': true,
  '.bmp': true,
  '.gif': true,
  '.png': true,
  '.webp': true
}

router.post('/api/uploads', function(req, res) {
  if (!allowedImageExtensions[path.extname(req.body.filename)]) {
    return res
      .status(400)
      .json({
        message: 'Invalid file type received. Please select a JPEG/JPG, BMP, GIF, PNG or WEBP image.'
      })
  }
  var bucket = process.env.ADMIN_UPLOADS_BUCKET
  var key = 'uploads/events/images/img-' + crypto.randomBytes(20).toString('hex') + '.jpg'
  var policy = new Buffer(JSON.stringify({
    expiration: new Date(Date.now() + 10 * 60 * 1000),
    conditions: [
      {success_action_status: '200'},
      {'bucket': bucket},
      {'acl': 'public-read'},
      ['eq', '$key', key],
      ['content-length-range', 0, 10485760]
    ]
  })).toString('base64')

  var form = {
    url: 'https://' + bucket + '.s3.amazonaws.com',
    key: key,
    aws: process.env.ADMIN_UPLOADS_AWS_KEY,
    dest: '/' + key,
    policy: policy,
    signature: crypto.createHmac('sha1', process.env.ADMIN_UPLOADS_AWS_SECRET).update(policy).digest('base64')
  }

  res.json(form)
})

router.get('/processed/uploads/*', function(req, res) {
  if (path.extname(req.path) != '.jpg') {
    res.status(400).json({details: 'Image format not supported. Please use JPEGs (.jpg).'})
  }

  var p = s3Client.getFileAsync(req.path).then(function(img) {
    if (img.statusCode === 200) {
      p.cancel()
      res.set('Content-Type', 'image/jpeg')
      img.pipe(res)
    }
    else if (img.statusCode === 403) { return Promise.reject(S3_FORBIDDEN_ERROR) }
    else if (img.statusCode === 404) { return fetchRawImage(req.path) }
    else { return Promise.reject(S3_UNEXPECTED_ERROR) }
  })

  p.catch(function(err) {
    //TODO log it
    var response = _.result(err, 'toJSON', S3_UNEXPECTED_ERROR.toJSON())
    res.status(response.status).json(response)
  })
  .then(function(srcImg) {
    if (srcImg.statusCode === 200) { return srcImg }
    else if (img.statusCode === 403) { return Promise.reject(S3_FORBIDDEN_ERROR) }
    else if (img.statusCode === 404) { return Promise.reject(S3_NOT_FOUND_ERROR) }
    else { return Promise.reject(S3_UNEXPECTED_ERROR) }
  })
  .catch(function(err) {
    //TODO log it
    var response = _.result(err, 'toJSON')
    if (response) {
      res.status(response.status).json(response)
    }
  })
  .then(function(srcImg) {
    var processStream = processImage(srcImg, path.basename(req.path))
    streamToPromise(storeImage(req.path.replace(/^\//, ''), processStream))
      .catch(function(err) {
        // TODO log it
      })
    res.set('Content-Type', 'image/jpeg')
    processStream.pipe(res)
  })
})

function streamToPromise(stream) {
  return new Promise(function(resolve, reject) {
    stream.on('end', resolve)
    stream.on('error', reject)
  })
}

function fetchRawImage(targetPath) {
  var ext = path.extname(targetPath)
  var name = path.basename(targetPath, ext)
  var canonical = path.basename(name, path.extname(name)) + ext
  var filename = path.join(path.dirname(targetPath).replace(/^\/processed/i, ''), canonical)
  return s3Client.getFileAsync(filename)
}

var transforms = {
  'gray': function(pipeline) { return pipeline.type('grayscale') },
  'blur0x75_w2048': function(pipeline) {
    return pipeline
      .resize('800', '600', '^')
      .blur(0, 100)
      .resize('2048', '1152', '^')
      .blur(0, 100)
      .background('black')
      .flatten()
  },
}

function processImage(srcStream, filename) {
  var ext = path.extname(filename)
  var profile = path.extname(path.basename(filename, ext)).slice(1)
  var transform = transforms[profile]

  var pipeline = gm(srcStream)

  if (transform) {
    pipeline = transform(pipeline)
  } else {
    pipeline = pipeline
      .resize(1024, 1024, '>')
      .background('white')
      .flatten()
  }

  return pipeline
    .quality(65)
    .noProfile()
    .stream('jpg')
}

function storeImage(path, srcStream) {
  var s3Stream = S3UploadStream(new aws.S3())
  var upload = s3Stream.upload({
    Bucket: process.env.TTF_PUBLIC_BUCKET,
    Key: path,
    ACL: 'public-read',
    ContentType: 'image/jpeg'
  })
  upload.maxPartSize(20971520)
  upload.concurrentParts(5)

  return pipe(srcStream, upload)
}
