const columns = require('./lib');
const $ = require('../d3utils').$;

module.exports = function () {
  $('#d3columns').appendChild(columns([{
    value: 20,
  }, {
    value: 2,
  }, {
    value: 5,
  }, {
    value: 50,
  }, {
    value: 85,
  }, {
    value: 82,
  }]));
};
