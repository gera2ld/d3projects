define((require, module, exports) ->
  utils = require('./d3utils')

  defaults = {
    size: 200
    r: null
    ir: null
    checkData: null
    delay: 500
  }

  (options) ->
    options = _.extend({}, defaults, options)

    svg = utils.newSVG()
      .attr(
        width: options.size
        height: options.size
      )

    data = _.map(_.range(9), (d) ->
      {
        index: d
        cx : ~~ (((~~ (d / 3)) * 2 + 1) * options.size / 6)
        cy : ~~ ((d % 3 * 2 + 1) * options.size / 6)
      }
    )
    options.r ?= ~~ (options.size / 12)
    options.ir ?= options.r >> 1

    line = d3.svg.line()
      .x((d) -> d.cx)
      .y((d) -> d.cy)
      .interpolate('linear')

    touch = {}
    selected = []
    select = (d) ->
      return if d.selected
      d.selected = true
      selected.push d
      path_wrap.selectAll('circle')
        .data(selected)
        .enter()
        .append('circle')
        .attr(
          cx: (d) -> d.cx
          cy: (d) -> d.cy
          r: options.ir
        )

    updatePath = (pos) ->
      pathData = selected
      if pos
        pathData = pathData.concat({cx: pos[0], cy: pos[1]})
      path.attr('d', line(pathData))
      circles.classed('d3lock-selected', (d) -> d.selected)

    clearPath = (cb) ->
      _.delay(->
        _.each(selected, (d) ->
          d.selected = false
        )
        selected = []
        touch.id = null
        touch.freeze = false
        circles_wrap.classed('d3lock-pass d3lock-fail', false)
        path.attr('d', '')
        path_wrap
          .classed('d3lock-pass d3lock-fail', false)
          .selectAll('circle').remove()
        circles.classed('d3lock-selected', false)
        cb?()
      , options.delay)

    checkPath = ->
      return if not touch.id? or touch.freeze
      touch.freeze = true
      updatePath()
      r = options.checkData?(_.pluck(selected, 'index'))
      if r is true
        circles_wrap.classed('d3lock-pass', true)
        path_wrap.classed('d3lock-pass', true)
      else if r is false
        circles_wrap.classed('d3lock-fail', true)
        path_wrap.classed('d3lock-fail', true)
      clearPath()

    circles_wrap = svg.append('g')
      .attr('class', 'd3lock-circles')
    circles = circles_wrap
      .selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr(
        r: options.r
        cx: (d) -> d.cx
        cy: (d) -> d.cy
      )
      .on('touchstart', ->
        return if touch.id? or touch.freeze
        e = d3.event
        e.preventDefault()
        touch.id = e.touches[0].identifier
        [d] = d3.select(this).data()
        select d
      )
      .on('touchmove', ->
        return if touch.freeze
        pos = d3.touch(svg[0][0], touch.id)
        return unless pos
        [x, y] = pos
        d = _.find(data, (d) ->
          (x - d.cx) * (x - d.cx) + (y - d.cy) * (y - d.cy) <= options.r * options.r
        )
        if d
          select d
        updatePath pos
      )
      .on('touchend', checkPath)

    path_wrap = svg.append('g')
      .attr('class', 'd3lock-path')
    path = path_wrap.append('path')

    svg[0][0]
)
