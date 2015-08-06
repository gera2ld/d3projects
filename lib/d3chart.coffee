define((require, module, exports) ->
  utils = require('./d3utils')

  defaults = {
    width: 260
    height: 150
    minX: null
    maxX: null
    minY: null
    maxY: null
    stroke: '#7ed321'
    threshold: 15
    getText: null
    fontSize: 12
    rectWidth: 40
    lineHeight: 1.5
  }

  (data, options) ->
    options = _.extend({}, defaults, options)
    options.minX ?= d3.min(data, (d) -> d.x)
    options.minY ?= d3.min(data, (d) -> d.y)
    options.maxX ?= d3.max(data, (d) -> d.x)
    options.maxY ?= d3.max(data, (d) -> d.y)

    svg = utils.newSVG()
      .attr(
        'class': 'd3chart'
        width: options.width
        height: options.height
      )
    id = utils.getId()
    fillId = "d3chart-fill-#{id}"
    shadowId = "d3chart-shadow-#{id}"
    utils.addShadowFilter(svg, shadowId)
    utils.addLinearGradient(svg, fillId, options.stroke)

    x = d3.scale.linear()
      .domain([options.minX, options.maxX])
      .range([0, options.width])

    y = d3.scale.linear()
      .domain([options.minY, options.maxY])
      .range([options.height, 0])

    data = _.map(data, (d, i) ->
      {
        x: d.x
        y: d.y
        dx: x(d.x)
        dy: y(d.y)
        index: i
      }
    )

    # draw line
    line = d3.svg.line()
      .x((d) -> d.dx)
      .y((d) -> d.dy)
      .interpolate('monotone')
    svg.append('path')
      .attr(
        'class': 'line'
        stroke: options.stroke
        d: line(data)
      )

    # draw area
    area = d3.svg.area()
      .x((d) -> d.dx)
      .y0(options.height)
      .y1((d) -> d.dy)
      .interpolate('monotone')
    svg.append('path')
      .attr(
        'class': 'area'
        d: area(data)
      )
      .style('fill', "url(##{fillId})")

    current = {
      show: ->
        return unless @hidden
        @hidden = false
        @circle.wrap.style('display', 'block')
        @tips.wrap.style('display', 'block')
      hide: ->
        return if @hidden
        @hidden = true
        @circle.wrap.style('display', 'none')
        @tips.wrap.style('display', 'none')
      circle: {
        wrap: svg.append('g').attr('class', 'circle-wrap')
      }
      tips: {
        wrap: svg.append('g').attr('class', 'text-wrap')
      }
    }
    current.circle.el = current.circle.wrap
      .append('circle')
      .attr('fill', options.stroke)
      .style('filter', "url(##{shadowId})")
    current.tips.rect = current.tips.wrap
      .append('rect')
      .style('filter', "url(##{shadowId})")
      .attr(
        width: options.rectWidth
        rx: 5
        ry: 5
      )
    current.hide()

    showCircle = (d) ->
      circle = current.circle.el
      #circle = circle.transition().duration(100)
      circle.attr(
        cx: d.dx
        cy: d.dy
      )
    showText = (d) ->
      text = options.getText?(d) or [d.y]
      th = options.fontSize * (options.lineHeight * (text.length + 1) - 1)
      current.tips.rect.attr('height', th)
      tx = d.dx - 5
      ty = d.dy - th - 10
      maxX = options.width - options.rectWidth
      maxY = options.height - th
      tx = maxX if tx > maxX
      tx = 0 if tx < 0
      ty = maxY if ty > maxY
      ty = 0 if ty < 0
      tips = current.tips.wrap
      tips.style('transform', "translate(#{tx}px,#{ty}px)")
      tips.selectAll('text').remove()
      tips.selectAll('text')
        .data(text)
        .enter()
        .append('text')
        .attr(
          x: options.fontSize * .5
          y: (d, i) -> options.fontSize * options.lineHeight * (i + 1)
          'font-size': options.fontSize
        )
        .text((d) -> d)

    svg.selectAll('path').on('mousemove', ->
      dx = d3.event.offsetX
      cir = _.reduce(data, (cir, d) ->
        delta = Math.abs(d.dx - dx)
        if delta < options.threshold and (not cir.delta? or cir.delta > delta)
          cir.delta = delta
          cir.d = d
        cir
      , {})
      if cir.d
        showCircle cir.d
        showText cir.d
        current.show()
      else
        current.hide()
    ).on('mouseleave', ->
      current.hide()
    )

    svg[0][0]
)
