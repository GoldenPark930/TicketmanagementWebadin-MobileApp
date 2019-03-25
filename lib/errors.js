function APIError(message, status, title) {
  this.name = 'APIError'
  this.title = title
  this.message = message || 'Unexpected error occurred while processing your request. Please try again soon'
  this.details = this.message
  this.status = status || 500
}
APIError.prototype = Object.create(Error.prototype)
APIError.prototype.toJSON = function() {
  return {
    title: this.title,
    details: this.details,
    status: this.status,
  }
}

module.exports.APIError = APIError
