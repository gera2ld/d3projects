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
    getText: null
    fontSize: 12
    rectWidth: 40
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
        stroke: options.stroke
        'stroke-width': options.strokeWidth
        fill: 'none'
        d: line(data)
      )

    # draw area
    fillId = 'chartFill'
    area = d3.svg.area()
      .x((d) -> d.dx)
      .y0(options.height)
      .y1((d) -> d.dy)
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

    display = (hide) ->
      hide = !!hide
      return if @hidden == hide
      @hidden = hide
      @wrap.style('display', if hide then 'none' else 'block')
    current = {
      circle: {
        hidden: true
        wrap: svg.append('g').attr('class', 'circle-wrap').style('display', 'none')
        display: display
      }
      tips: {
        hidden: true
        wrap: svg.append('g').attr('class', 'text-wrap').style('display', 'none')
        display: display
      }
    }
    current.circle.dom = current.circle.wrap.append('circle')
    current.tips.rect = current.tips.wrap.append('rect')

    showCircle = (d) ->
      if d
        circle = current.circle.dom
        #circle = circle.transition().duration(100)
        circle.attr(
          cx: d.dx
          cy: d.dy
          r: options.radius
        )
        current.circle.display()
      else
        current.circle.display(true)
    showText = (d) ->
      if d
        text = options.getText?(d) or [d.y]
        current.tips.rect
          .attr(
            width: options.rectWidth
            height: options.fontSize * (1.5 * text.length + .5)
            rx: 5
            ry: 5
          )
        tx = d.dx - 5
        ty = d.dy - 30
        tx = 0 if tx < 0
        maxX = options.width - options.rectWidth
        tx = maxX if tx > maxX
        ty = 0 if ty < 0
        tips = current.tips.wrap
          .style('transform', 'translate(' + tx + 'px,' + ty + 'px)')
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
        current.tips.display()
      else
        current.tips.display(true)

    svg.on('mousemove', ->
      dx = d3.event.offsetX
      cir = _.reduce(data, (cir, d) ->
        delta = Math.abs(d.dx - dx)
        if delta < options.threshold and (not cir.delta? or cir.delta > delta)
          cir.delta = delta
          cir.d = d
        cir
      , {})
      showCircle cir.d
      showText cir.d
    )
    svg.on('mouseleave', ->
      current.circle.display(true)
      current.tips.display(true)
    )

    svg[0][0]
)
