define((require, module, exports) ->
  defaults = {
    width: 200
    height: 10
    colors: null
  }
  frag = document.createDocumentFragment()

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

    x = d3.scale.linear()
      .domain([0, d3.sum(data)])
      .range([0, options.width])
    svg = d3.select(frag)
      .append('svg')
      .remove()
      .attr('class', 'd3bar')
      #.attr('style', "border-radius:#{options.height>>>1}px")
    bars = svg.attr(
      width: options.width
      height: options.height
    )

    attrs = {
      lastWidth: 0
    }

    bars.selectAll('g')
      .data(data)
      .enter()
      .append('g')
      .attr('transform', (d, i) ->
        currentX = "translate(#{attrs.lastWidth},#{options.height>>>1})"
        attrs.lastWidth += x(d)
        currentX
      )
      .append('line')
      .attr(
        'class': 'animate-line'
        stroke: (d, i) -> getColor()
        'stroke-width': options.height
        x1: 0
        y1: 0
        x2: (d) -> x(d)
        y2: 0
      )

    svg[0][0]
)
