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
        'class': 'd3chart-line'
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
        'class': 'd3chart-area'
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
        wrap: svg.append('g').attr('class', 'd3chart-circle')
      }
      tips: {
        wrap: svg.append('g').attr('class', 'd3chart-text')
      }
    }
    current.circle.el = do ->
      wrap = current.circle.wrap
      # Safari does not support `r` in CSS
      wrap.append('circle')
        .attr(
          'class': 'd3chart-outer-circle'
          r: 3
        )
        .style('filter', "url(##{shadowId})")
      wrap.append('circle')
        .attr(
          'class': 'd3chart-inner-circle'
          r: 1
          fill: options.stroke
        )
      wrap.selectAll('circle')
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
      tx = utils.ensureRange(d.dx - 5, 0, options.width - options.rectWidth)
      ty = utils.ensureRange(d.dy - th - 10, 0, options.height - th)
      tips = current.tips.wrap
      # https://css-tricks.com/transforms-on-svg-elements/
      # https://developer.mozilla.org/en/docs/Web/SVG/Attribute/transform
      # Use transform attributes for cross-browser support
      tips.attr('transform', "translate(#{tx},#{ty})")
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

    svg.select('path.d3chart-area').on('mousemove', ->
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
