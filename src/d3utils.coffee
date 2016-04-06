_id = 0
_frag = do document.createDocumentFragment
$ = (selector) -> document.querySelector selector

getId = -> _id += 1

ensureRange = (num, min, max) ->
  unless max == null
    num = max if num > max
  unless min == null
    num = min if num < min
  num

newSVG = ->
  d3.select _frag
    .append 'svg'
    .remove()

addClipPath = (svg, id) ->
  svg.append 'defs'
    .append 'clipPath'
    .attr 'id', id

# https://github.com/wbzyl/d3-notes/blob/master/hello-drop-shadow.html
# http://commons.oreilly.com/wiki/index.php/SVG_Essentials/Filters
addShadowFilter = (svg, id, rgba = [.5, .5, .5, 1]) ->
  filter = svg.append 'defs'
    .append 'filter'
    .attr
      id: id
      width: 1.4
      height: 1.4
      x: -.2
      y: -.1
  filter.append 'feColorMatrix'
    .attr
      type: 'matrix'
      values:
        "0 0 0 #{rgba[0]} 0 " +
        "0 0 0 #{rgba[1]} 0 " +
        "0 0 0 #{rgba[2]} 0 " +
        "0 0 0 #{rgba[3]} 0 "
  filter.append 'feGaussianBlur'
    .attr
      #'in': 'SourceAlpha'
      stdDeviation: 1
      result: 'blur'
  filter.append 'feOffset'
    .attr
      'in': 'blur'
      dx: 0
      dy: 1
      result: 'offsetBlur'
  feMerge = filter.append 'feMerge'
  feMerge.append 'feMergeNode'
    .attr 'in', 'offsetBlur'
  feMerge.append 'feMergeNode'
    .attr 'in', 'SourceGraphic'

addLinearGradient = (svg, id, stop0, stop1 = 'white') ->
  gradient = svg.append 'defs'
    .append 'linearGradient'
    .attr
      id: id
      x1: 0
      y1: -.5
      x2: 0
      y2: 1
  gradient.append 'stop'
    .attr 'offset', 0
    .style 'stop-color', stop0
  gradient.append 'stop'
    .attr 'offset', 1
    .style 'stop-color', stop1

module.exports =
  $: $
  getId: getId
  ensureRange: ensureRange
  newSVG: newSVG
  addClipPath: addClipPath
  addShadowFilter: addShadowFilter
  addLinearGradient: addLinearGradient
