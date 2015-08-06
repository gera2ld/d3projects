define((require, module, exports) ->
  defaults = {
    width: 200
    height: 10
    colors: null
  }
  frag = document.createDocumentFragment()
  _id = 0
  getId = -> _id += 1

  colorGenerator = (colors) ->
    _config = {index: -1}
    isArray = Array.isArray(colors)
    ->
      _config.index = _config.index + 1
      if isArray
        colors[_config.index = _config.index % colors.length]
      else
        colors(_config.index)


  (data, options) ->
    options = _.extend({}, defaults, options)
    unless options.colors
      options.colors = d3.scale.category10()
    getColor = colorGenerator(options.colors)
    halfHeight = options.height >>> 1
    clipperId = "d3bar-clipper-#{getId()}"

    x = d3.scale.linear()
      .domain([0, d3.sum(data)])
      .range([0, options.width])
    svg = d3.select(frag)
      .append('svg')
      .remove()
      .attr('class', 'd3bar')
    bars = svg.attr(
      width: options.width
      height: options.height
    )
    clipper = svg.append('defs')
      .append('clipPath')
      .attr('id', clipperId)
    clipper.append('rect')
      .attr(
        x: 0
        y: 0
        width: options.width
        height: options.height
        rx: halfHeight
        ry: halfHeight
      )

    lastWidth = 0

    bars.append('g')
      .attr('clip-path', "url(##{clipperId})")
      .selectAll('line')
      .data(data)
      .enter()
      .append('line')
      .attr(
        'class': 'animate-line'
        stroke: (d, i) -> getColor()
        'stroke-width': options.height
        x1: 0
        y1: 0
        x2: (d) -> x(d)
        y2: 0
        transform: (d, i) ->
          currentX = "translate(#{lastWidth},#{halfHeight})"
          lastWidth += x(d)
          currentX
      )

    svg[0][0]
)
