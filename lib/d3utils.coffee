define((require, module, exports) ->
  _id = 0
  frag = document.createDocumentFragment()

  getId = -> _id += 1

  newSVG = ->
    d3.select(frag)
      .append('svg')
      .remove()

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

  {
    getId: getId
    newSVG: newSVG
    addShadowFilter: addShadowFilter
    addLinearGradient: addLinearGradient
  }
)
