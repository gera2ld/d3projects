define((require, module, exports) ->
  utils = require('d3utils')

  defaults = {
    width: 200
    height: 40
    strokeWidth: 10
    colors: null
    getText: null
    rectWidth: 40
    fontSize: 16
    lineHeight: 1.2
  }

  colorGenerator = (colors) ->
    _config = {index: -1}
    isArray = Array.isArray(colors)
    ->
      _config.index = _config.index + 1
      if isArray
        colors[_config.index = _config.index % colors.length]
      else
        colors(_config.index)

  (array, options) ->
    options = _.extend({}, defaults, options)
    unless options.colors
      options.colors = d3.scale.category10()
    getColor = colorGenerator(options.colors)
    halfHeight = options.strokeWidth >>> 1
    id = utils.getId()
    clipperId = "d3bar-clipper-#{id}"
    shadowId = "d3chart-shadow-#{id}"

    x = d3.scale.linear()
      .domain([0, d3.sum(array)])
      .range([0, options.width])
    lastWidth = 0
    data = _.map(array, (d, i) ->
      r = {value: d, index: i, x: lastWidth, dx: x(d)}
      lastWidth += r.dx
      r
    )

    svg = utils.newSVG()
      .attr(
        'class': 'd3bar'
        width: options.width
        height: options.height
      )
    utils.addShadowFilter(svg, shadowId)
    clipper = svg.append('defs')
      .append('clipPath')
      .attr('id', clipperId)
    clipper.append('rect')
      .attr(
        x: 0
        y: 0
        width: options.width
        height: options.strokeWidth
        rx: halfHeight
        ry: halfHeight
      )

    tips = {
      wrap: svg.append('g').attr('class', 'text-wrap')
      show: ->
        return unless @hidden
        @hidden = false
        @wrap.style('display', 'block')
      hide: ->
        return if @hidden
        @hidden = true
        @wrap.style('display', 'none')
    }
    tips.rect = tips.wrap.append('rect')
      .style('filter', "url(##{shadowId})")
      .attr(
        width: options.rectWidth
        rx: 5
        ry: 5
      )
    tips.hide()

    showText = (d) ->
      text = options.getText?(d) or [d.value]
      th = options.fontSize * (options.lineHeight * (text.length + 1) - 1)
      tips.rect.attr('height', th)
      tx = d.x
      ty = options.height - options.strokeWidth - th - 5
      maxX = options.width - options.rectWidth
      tx = maxX if tx > maxX
      tx = 0 if tx < 0
      wrap = tips.wrap
      wrap.style('transform', "translate(#{tx}px,#{ty}px)")
      wrap.selectAll('text').remove()
      wrap.selectAll('text')
        .data(text)
        .enter()
        .append('text')
        .attr(
          'text-anchor': 'middle'
          x: options.rectWidth / 2
          y: (d, i) -> options.fontSize * options.lineHeight * (i + 1)
          'font-size': options.fontSize
        )
        .text((d) -> d)

    svg.append('g')
      .attr('clip-path', "url(##{clipperId})")
      .style('transform', "translate(0,#{options.height - options.strokeWidth}px)")
      .selectAll('line')
      .data(data)
      .enter()
      .append('line')
      .attr(
        'class': 'animate-line'
        stroke: -> getColor()
        'stroke-width': options.strokeWidth
        x1: 0
        y1: 0
        x2: (d) -> d.dx
        y2: 0
        transform: (d, i) ->
          currentX = "translate(#{d.x},#{halfHeight})"
          currentX
      )
      .on('mouseover', ->
        line = d3.select(this)
        [d] = line.data()
        showText d
        tips.show()
      )
      .on('mouseleave', ->
        tips.hide()
      )

    svg[0][0]
)
