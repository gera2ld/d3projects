define((require, module, exports) ->
  utils = require('./d3utils')

  defaults = {
    width: 200
    height: 10
    maxX: null
    colors: null
    getText: null
    rectWidth: 40
    fontSize: 16
    lineHeight: 1.2
    onmouseover: null
    onmouseleave: null
  }

  colorGenerator = (colors) ->
    index = -1
    isArray = Array.isArray(colors)
    ->
      index = index + 1
      if isArray
        colors[index = index % colors.length]
      else
        colors(index)

  (array, options) ->
    options = _.extend({}, defaults, options)
    unless options.colors
      options.colors = d3.scale.category10()
    getColor = colorGenerator(options.colors)
    halfHeight = options.height / 2
    id = utils.getId()
    clipperId = "d3bar-clipper-#{id}"
    shadowId = "d3chart-shadow-#{id}"

    sum = d3.sum(array)
    options.maxX ?= sum
    x = d3.scale.linear()
      .domain([0, options.maxX])
      .range([0, options.width])
    data = _.reduce(array, (obj, d, i) ->
      r = {
        value: d
        index: i
        x: obj.lastWidth
        dx: x(d)
      }
      obj.list.push(r)
      obj.lastWidth += r.dx
      obj
    , {list: [], lastWidth: 0}).list
    sumX = x(sum)

    svg = utils.newSVG()
      .attr(
        'class': 'd3bar'
        width: options.width
        height: options.height
      )
    utils.addShadowFilter(svg, shadowId)
    clipper = utils.addClipPath(svg, clipperId)
    clipper.append('rect')
      .attr(
        x: 0
        y: 0
        width: sumX
        height: options.height
        rx: halfHeight
        ry: halfHeight
      )

    wrap = svg.append('g')
      .attr('clip-path', "url(##{clipperId})")
    wrap.selectAll('line')
      .data(data)
      .enter()
      .append('line')
      .attr(
        'class': 'd3bar-line'
        stroke: -> getColor()
        'stroke-width': options.height
        x1: (d) -> d.x
        y1: halfHeight
        x2: (d) -> d.x + d.dx
        y2: halfHeight
      )
      .on('mouseover', ->
        line = d3.select(this)
        [d] = line.data()
        options.onmouseover? d3.event, d
      )
    wrap.on('mouseleave', ->
        options.onmouseleave? d3.event
      )

    svg[0][0]
)
