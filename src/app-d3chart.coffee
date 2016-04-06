d3chart = require './d3chart'
$ = require './d3utils'
  .$

module.exports = ->
  $ '#d3chart'
    .appendChild d3chart [
      (x: 0,  y: 0 )
      (x: 1,  y: 2 )
      (x: 2,  y: 8 )
      (x: 3,  y: 9 )
      (x: 4,  y: 10)
      (x: 5,  y: 12)
      (x: 6,  y: 14)
      (x: 7,  y: 17)
      (x: 8,  y: 10)
      (x: 9,  y: 12)
      (x: 10, y: 15)
      (x: 11, y: 16)
    ],
      minY: 0
      maxY: 40
      getText: (d) -> [
        'X: ' + d.x
        'Y: ' + d.y
      ]
