define((require, module, exports) ->
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
  }
  frag = document.createDocumentFragment()
  _id = 0

  getId = -> _id += 1

  # https://github.com/wbzyl/d3-notes/blob/master/hello-drop-shadow.html
  # http://commons.oreilly.com/wiki/index.php/SVG_Essentials/Filters
  addShadowFilter = (svg, id) ->
    filter = svg.append('defs')
      .append('filter')
      .attr(
        id: id
        width: 2
        height: 2
        x: -.5
        y: -.5
      )
    shadowRGBA = [.5, .5, .5, 1]
    filter.append('feColorMatrix')
      .attr(
        type: 'matrix'
        values: (
          "0 0 0 #{shadowRGBA[0]} 0 " +
          "0 0 0 #{shadowRGBA[1]} 0 " +
          "0 0 0 #{shadowRGBA[2]} 0 " +
          "0 0 0 #{shadowRGBA[3]} 0 "
        )
      )
    filter.append('feGaussianBlur')
      .attr(
        #'in': 'SourceAlpha'
        stdDeviation: 2.5
        result: 'blur'
      )
    filter.append('feOffset')
      .attr(
        'in': 'blur'
        dx: 0
        dy: 2
        result: 'offsetBlur'
      )
    feMerge = filter.append('feMerge')
    feMerge.append('feMergeNode')
      .attr('in', 'offsetBlur')
    feMerge.append('feMergeNode')
      .attr('in', 'SourceGraphic')

  addLinearGradient = (svg, id, stop0, stop1 = 'white') ->
    gradient = svg.append('defs')
      .append('linearGradient')
      .attr(
        id: id
        x1: 0
        y1: -.5
        x2: 0
        y2: 1
      )
    gradient.append('stop')
      .attr('offset', 0)
      .style('stop-color', stop0)
    gradient.append('stop')
      .attr('offset', 1)
      .style('stop-color', stop1)

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
    id = getId()
    fillId = "d3chart-fill-#{id}"
    shadowId = "d3chart-shadow-#{id}"
    addShadowFilter(svg, shadowId)
    addLinearGradient(svg, fillId, options.stroke)

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
      th = options.fontSize * (1.5 * text.length + .5)
      current.tips.rect
        .attr(
          width: options.rectWidth
          height: th
          rx: 5
          ry: 5
        )
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
      _.each(text, (t, i) ->
        tips.append('text')
          .attr(
            x: options.fontSize * .5
            y: options.fontSize * 1.5 * (i + 1)
            'font-size': options.fontSize
          )
          .text(t)
      )

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
