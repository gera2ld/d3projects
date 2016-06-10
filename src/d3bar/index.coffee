d3bar = require './lib'
$ = require '../d3utils'
  .$

module.exports = ->
  $ '#d3bar'
    .appendChild d3bar [15, 16, 5],
      maxX: 40
