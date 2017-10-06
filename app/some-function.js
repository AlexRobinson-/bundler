const something = require('./another-file')

module.exports = function () {
  return 'something' + something
}