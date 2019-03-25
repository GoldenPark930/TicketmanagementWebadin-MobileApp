var S3Client = require('knox')
var bluebird = require('bluebird')

bluebird.promisifyAll(S3Client.prototype)

module.exports.s3Client = new S3Client({
  key: process.env.ADMIN_UPLOADS_AWS_KEY,
  secret: process.env.ADMIN_UPLOADS_AWS_SECRET,
  bucket: process.env.ADMIN_UPLOADS_BUCKET,
})
