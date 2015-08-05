define((require, module, exports) ->
  defaults = {
    width: 200
    height: 160
    minX: null
    maxX: null
    minY: null
    maxY: null
    stroke: 'blue'
    strokeWidth: 2
    fillStart: 'green'
    radius: 3
    threshold: 15
  }
  frag = document.createDocumentFragment()

  (data, options) ->
    options = _.extend({}, defaults, options)
    options.minX ?= d3.min(data, (d) -> d.x)
    options.minY ?= d3.min(data, (d) -> d.y)
    options.maxX ?= d3.max(data, (d) -> d.x)
    options.maxY ?= d3.max(data, (d) -> d.y)

    svg = d3.select(frag)
      .append('svg')
      .remove()
      .attr(
        'class': 'd3chart'
        width: options.width
        height: options.height
      )

    x = d3.scale.linear()
      .domain([options.minX, options.maxX])
      .range([0, options.width])

    y = d3.scale.linear()
      .domain([options.minY, options.maxY])
      .range([options.height, 0])

    # draw line
    line = d3.svg.line()
      .x((d) -> x(d.x))
      .y((d) -> y(d.y))
      .interpolate('monotone')
    svg.append('path')
      .attr(
        stroke: options.stroke
        'stroke-width': options.strokeWidth
        fill: 'none'
        d: line(data)
      )

    # draw area
    fillId = 'chartFill'
    area = d3.svg.area()
      .x((d) -> x(d.x))
      .y0(options.height)
      .y1((d) -> y(d.y))
      .interpolate('monotone')
    gradient = svg.append('defs')
      .append('linearGradient')
      .attr(
        id: fillId
        x1: 0
        y1: 0
        x2: 0
        y2: 1
      )
    gradient.append('stop')
      .attr('offset', 0)
      .style('stop-color', options.fillStart)
    gradient.append('stop')
      .attr('offset', 1)
      .style('stop-color', 'white')
    svg.append('path')
      .datum(data)
      .attr('d', area)
      .style('fill', 'url(#' + fillId + ')')

    circle = {
      wrap: svg.append('g').attr('class', 'circle-wrap')
    }
    svg.on('mousemove', ->
      dx = d3.event.offsetX
      cir = _.reduce(data, (cir, d) ->
        delta = Math.abs(x(d.x) - dx)
        if delta < options.threshold and (not cir.delta? or cir.delta > delta)
          cir.delta = delta
          cir.d = d
        cir
      , {})
      if cir.d
        #transition = !!circle.dom
        circle.dom or= circle.wrap.append('circle')
        dom = circle.dom
        #if transition
        #dom = circle.dom.transition().duration(100)
        dom.attr(
          cx: x(cir.d.x)
          cy: y(cir.d.y)
          r: options.radius
        )
      else
        circle.dom.remove()
        circle.dom = null
    )
    svg.on('mouseleave', ->
      if circle.dom
        circle.dom.remove()
        circle.dom = null
    )

    svg[0][0]
)
