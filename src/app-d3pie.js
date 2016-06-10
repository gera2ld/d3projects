const d3pie = require('./d3pie');
const $ = require('./d3utils').$;

module.exports = function () {
  $('#d3pie').appendChild(d3pie([{
    value: 10,
  }, {
    value: 20,
  }, {
    value: 30,
  }, {
    value: 40,
  }]));
};
