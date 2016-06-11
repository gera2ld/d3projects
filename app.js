(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
require('./d3bar')();

require('./d3chart')();

require('./d3lock')();

require('./d3pie')();

require('./d3columns')();


},{"./d3bar":2,"./d3chart":4,"./d3columns":6,"./d3lock":8,"./d3pie":10}],2:[function(require,module,exports){
var $, d3bar;

d3bar = require('./lib');

$ = require('../d3utils').$;

module.exports = function() {
  return $('#d3bar').appendChild(d3bar([15, 16, 5], {
    maxX: 40
  }));
};


},{"../d3utils":12,"./lib":3}],3:[function(require,module,exports){
var colorGenerator, defaults, utils;

utils = require('../d3utils');

defaults = {
  width: 200,
  height: 10,
  maxX: null,
  colors: null,
  fontSize: 16,
  lineHeight: 1.2,
  onmouseover: null,
  onmouseleave: null,
  transition: 500
};

colorGenerator = function(colors) {
  var index, isArray;
  index = -1;
  isArray = Array.isArray(colors);
  return function() {
    index = index + 1;
    if (isArray) {
      return colors[index = index % colors.length];
    } else {
      return colors(index);
    }
  };
};

module.exports = function(array, options) {
  var clipper, clipperId, clipper_rect, data, getColor, halfHeight, id, lines, shadowId, sum, sumX, svg, wrap, x;
  options = _.extend({}, defaults, options);
  if (!options.colors) {
    options.colors = d3.scale.category10();
  }
  getColor = colorGenerator(options.colors);
  halfHeight = options.height / 2;
  id = utils.getId();
  clipperId = "d3bar-clipper-" + id;
  shadowId = "d3chart-shadow-" + id;
  sum = d3.sum(array);
  if (options.maxX == null) {
    options.maxX = sum;
  }
  x = d3.scale.linear().domain([0, options.maxX]).range([0, options.width]);
  data = _.reduce(array, function(obj, d, i) {
    var r;
    r = {
      value: d,
      index: i,
      x: obj.lastWidth,
      dx: x(d)
    };
    obj.list.push(r);
    obj.lastWidth += r.dx;
    return obj;
  }, {
    list: [],
    lastWidth: 0
  }).list;
  sumX = x(sum);
  svg = utils.newSVG().attr({
    'class': 'd3bar',
    width: options.width,
    height: options.height
  });
  utils.addShadowFilter(svg, shadowId);
  clipper = utils.addClipPath(svg, clipperId);
  clipper_rect = clipper.append('rect').attr({
    x: 0,
    y: 0,
    width: 0,
    height: options.height,
    rx: halfHeight,
    ry: halfHeight
  });
  if (options.transition) {
    clipper_rect = clipper_rect.transition().duration(options.transition);
  }
  clipper_rect.attr('width', sumX);
  wrap = svg.append('g').attr('clip-path', "url(#" + clipperId + ")");
  lines = wrap.selectAll('line').data(data).enter().append('line').attr({
    'class': 'd3bar-line',
    stroke: function() {
      return getColor();
    },
    'stroke-width': options.height,
    x1: 0,
    x2: 0,
    y1: halfHeight,
    y2: halfHeight
  }).on('mouseover', function() {
    var d, line;
    line = d3.select(this);
    d = line.data[0];
    return typeof options.onmouseover === "function" ? options.onmouseover(d3.event, d) : void 0;
  });
  if (options.transition) {
    lines = lines.transition().duration(options.transition);
  }
  lines.attr({
    x1: function(d) {
      return d.x;
    },
    x2: function(d) {
      return d.x + d.dx;
    }
  });
  wrap.on('mouseleave', function() {
    return typeof options.onmouseleave === "function" ? options.onmouseleave(d3.event) : void 0;
  });
  return svg[0][0];
};


},{"../d3utils":12}],4:[function(require,module,exports){
var $, d3chart;

d3chart = require('./lib');

$ = require('../d3utils').$;

module.exports = function() {
  return $('#d3chart').appendChild(d3chart([
    {
      x: 0,
      y: 0
    }, {
      x: 1,
      y: 2
    }, {
      x: 2,
      y: 8
    }, {
      x: 3,
      y: 9
    }, {
      x: 4,
      y: 10
    }, {
      x: 5,
      y: 12
    }, {
      x: 6,
      y: 14
    }, {
      x: 7,
      y: 17
    }, {
      x: 8,
      y: 10
    }, {
      x: 9,
      y: 12
    }, {
      x: 10,
      y: 15
    }, {
      x: 11,
      y: 16
    }
  ], {
    minY: 0,
    maxY: 40,
    getText: function(d) {
      return ['X: ' + d.x, 'Y: ' + d.y];
    }
  }));
};


},{"../d3utils":12,"./lib":5}],5:[function(require,module,exports){
var defaults, utils;

utils = require('../d3utils');

defaults = {
  width: 260,
  height: 150,
  minX: null,
  maxX: null,
  minY: null,
  maxY: null,
  stroke: '#7ed321',
  threshold: 15,
  getText: null,
  fontSize: 12,
  rectWidth: 40,
  lineHeight: 1.5
};

module.exports = function(data, options) {
  var area, current, fillId, id, line, linearea, onmousemove, shadowId, showCircle, showText, svg, x, y;
  options = _.extend({}, defaults, options);
  if (options.minX == null) {
    options.minX = d3.min(data, function(d) {
      return d.x;
    });
  }
  if (options.minY == null) {
    options.minY = d3.min(data, function(d) {
      return d.y;
    });
  }
  if (options.maxX == null) {
    options.maxX = d3.max(data, function(d) {
      return d.x;
    });
  }
  if (options.maxY == null) {
    options.maxY = d3.max(data, function(d) {
      return d.y;
    });
  }
  svg = utils.newSVG().attr({
    'class': 'd3chart',
    width: options.width,
    height: options.height
  });
  id = utils.getId();
  fillId = "d3chart-fill-" + id;
  shadowId = "d3chart-shadow-" + id;
  utils.addShadowFilter(svg, shadowId);
  utils.addLinearGradient(svg, fillId, options.stroke);
  x = d3.scale.linear().domain([options.minX, options.maxX]).range([0, options.width]);
  y = d3.scale.linear().domain([options.minY, options.maxY]).range([options.height, 0]);
  data = _.map(data, function(d, i) {
    return {
      x: d.x,
      y: d.y,
      dx: x(d.x),
      dy: y(d.y),
      index: i
    };
  });
  linearea = {
    line: {},
    area: {}
  };
  line = d3.svg.line().x(function(d) {
    return d.dx;
  }).y(function(d) {
    return d.dy;
  }).interpolate('monotone');
  linearea.line.el = svg.append('path').attr({
    'class': 'd3chart-line',
    stroke: options.stroke,
    d: line(data)
  });
  area = d3.svg.area().x(function(d) {
    return d.dx;
  }).y0(options.height).y1(function(d) {
    return d.dy;
  }).interpolate('monotone');
  linearea.area.el = svg.append('path').attr({
    'class': 'd3chart-area',
    d: area(data)
  }).style('fill', "url(#" + fillId + ")");
  current = {
    show: function() {
      if (!this.hidden) {
        return;
      }
      this.hidden = false;
      this.circle.wrap.style('display', 'block');
      return this.tips.wrap.style('display', 'block');
    },
    hide: function() {
      if (this.hidden || linearea.line.hovered || linearea.area.hovered) {
        return;
      }
      this.hidden = true;
      this.circle.wrap.style('display', 'none');
      return this.tips.wrap.style('display', 'none');
    },
    circle: {
      wrap: svg.append('g').attr('class', 'd3chart-circle')
    },
    tips: {
      wrap: svg.append('g').attr('class', 'd3chart-text')
    }
  };
  current.circle.el = (function() {
    var wrap;
    wrap = current.circle.wrap;
    wrap.append('circle').attr({
      'class': 'd3chart-outer-circle',
      r: 3
    }).style('filter', "url(#" + shadowId + ")");
    wrap.append('circle').attr({
      'class': 'd3chart-inner-circle',
      r: 1,
      fill: options.stroke
    });
    return wrap.selectAll('circle');
  })();
  current.tips.rect = current.tips.wrap.append('rect').style('filter', "url(#" + shadowId + ")").attr({
    width: options.rectWidth,
    rx: 5,
    ry: 5
  });
  current.hide();
  showCircle = function(d) {
    var circle;
    circle = current.circle.el;
    return circle.attr({
      cx: d.dx,
      cy: d.dy
    });
  };
  showText = function(d) {
    var text, th, tips, tx, ty;
    text = (typeof options.getText === "function" ? options.getText(d) : void 0) || [d.y];
    th = options.fontSize * (options.lineHeight * (text.length + 1) - 1);
    current.tips.rect.attr('height', th);
    tx = utils.ensureRange(d.dx - 5, 0, options.width - options.rectWidth);
    ty = utils.ensureRange(d.dy - th - 10, 0, options.height - th);
    tips = current.tips.wrap;
    tips.attr('transform', "translate(" + tx + "," + ty + ")");
    tips.selectAll('text').remove();
    return tips.selectAll('text').data(text).enter().append('text').attr({
      x: options.fontSize * .5,
      y: function(d, i) {
        return options.fontSize * options.lineHeight * (i + 1);
      },
      'font-size': options.fontSize
    }).text(function(d) {
      return d;
    });
  };
  onmousemove = function() {
    var cir, dx;
    dx = d3.event.offsetX;
    cir = _.reduce(data, function(cir, d) {
      var delta;
      delta = Math.abs(d.dx - dx);
      if (delta < options.threshold && ((cir.delta == null) || cir.delta > delta)) {
        cir.delta = delta;
        cir.d = d;
      }
      return cir;
    }, {});
    if (cir.d) {
      showCircle(cir.d);
      showText(cir.d);
      return current.show();
    } else {
      return current.hide();
    }
  };
  linearea.line.el.on('mousemove', function() {
    linearea.line.hovered = true;
    return onmousemove();
  }).on('mouseleave', function() {
    linearea.line.hovered = false;
    return current.hide();
  });
  linearea.area.el.on('mousemove', function() {
    linearea.area.hovered = true;
    return onmousemove();
  }).on('mouseleave', function() {
    linearea.area.hovered = false;
    return current.hide();
  });
  return svg[0][0];
};


},{"../d3utils":12}],6:[function(require,module,exports){
const columns = require('./lib');
const $ = require('../d3utils').$;

module.exports = function () {
  $('#d3columns').appendChild(columns([{
    value: 20,
  }, {
    value: 2,
  }, {
    value: 5,
  }, {
    value: 50,
  }, {
    value: 85,
  }, {
    value: 82,
  }]));
};

},{"../d3utils":12,"./lib":7}],7:[function(require,module,exports){
const utils = require('../d3utils');

module.exports = function (data, options) {
  function column(d, i) {
    const v = d.value;
    const h = y(v);
    const halfWidth = options.columnWidth / 2;
    const h0 = y(0);
    const h1 = h + halfWidth;
    return `M${-halfWidth} ${h1}A${halfWidth} ${halfWidth} 0 0 1 ${halfWidth} ${h1}L${halfWidth} ${h0}L${-halfWidth} ${h0}Z`;
  }
  options = Object.assign({
    width: 300,
    height: 200,
    columnWidth: 20,
  }, options);
  const minY = 0;
  const maxY = d3.max(data, item => item.value);
  const y = d3.scale.linear().domain([minY, maxY]).range([options.height, 0]);
  const gap = options.width / data.length;
  const colors = d3.scale.category10();
  const svg = utils.newSVG().attr({
    width: options.width,
    height: options.height,
  })
  .on('click', () => {
    const svgEl = svg[0][0];
    utils.svg2img(svgEl).then(img => {
      svgEl.parentNode.replaceChild(img, svgEl);
    });
  });
  svg.append('g')
  .selectAll('path')
  .data(data)
  .enter()
  .append('path')
  .attr({
    d: column,
    transform: (d, i) => `translate(${gap * (i + .5)},0)`,
    fill: (d, i) => d.color || colors(i),
  });
  return svg[0][0];
};

},{"../d3utils":12}],8:[function(require,module,exports){
var $, d3lock;

d3lock = require('./lib');

$ = require('../d3utils').$;

module.exports = function() {
  var body, checkData, confirmData, lockData, mode, onReset, recordData, reset, setMode, title, validateData;
  title = $('.lock-title');
  body = $('.lock-body');
  reset = $('.lock-reset');
  lockData = mode = checkData = null;
  recordData = function(data) {
    lockData = data;
    setMode(2);
    return true;
  };
  confirmData = function(data) {
    var ok;
    ok = _.isEqual(lockData, data);
    if (ok) {
      setMode(0);
    } else {
      lockData = null;
      title.innerHTML = '两次解锁图案不一样，请重新设置！';
      _.delay(function() {
        return setMode(1);
      }, 1000);
    }
    return ok;
  };
  validateData = function(data) {
    var ok;
    ok = _.isEqual(lockData, data);
    if (ok) {
      title.innerHTML = '解锁成功！';
    } else {
      title.innerHTML = '解锁失败！';
    }
    _.delay(function() {
      return setMode(mode);
    }, 1000);
    return ok;
  };
  setMode = function(_mode) {
    switch (_mode) {
      case 0:
        title.innerHTML = '请解锁';
        checkData = validateData;
        reset.style.display = 'block';
        break;
      case 1:
        title.innerHTML = '绘制解锁图案';
        lockData = null;
        checkData = recordData;
        reset.style.display = 'none';
        break;
      case 2:
        title.innerHTML = '确认解锁图案';
        checkData = confirmData;
        break;
      default:
        return;
    }
    return mode = _mode;
  };
  onReset = function() {
    return setMode(1);
  };
  body.appendChild(d3lock({
    width: '100%',
    height: '100%',
    checkData: function(data) {
      return checkData(data);
    }
  }));
  reset.addEventListener('click', onReset, false);
  return onReset();
};


},{"../d3utils":12,"./lib":9}],9:[function(require,module,exports){
var defaults, utils;

utils = require('../d3utils');

defaults = {
  size: 200,
  r: null,
  ir: null,
  checkData: null,
  delay: 500
};

module.exports = function(options) {
  var checkPath, circles, circles_wrap, clearPath, data, line, path, path_wrap, select, selected, svg, touch, updatePath;
  options = _.extend({}, defaults, options);
  svg = utils.newSVG().attr({
    width: options.width || options.size,
    height: options.height || options.size,
    viewBox: "0 0 " + options.size + " " + options.size
  });
  data = _.map(_.range(9), function(d) {
    return {
      index: d,
      cx: ~~(((~~(d / 3)) * 2 + 1) * options.size / 6),
      cy: ~~((d % 3 * 2 + 1) * options.size / 6)
    };
  });
  if (options.r == null) {
    options.r = ~~(options.size / 12);
  }
  if (options.ir == null) {
    options.ir = options.r >> 1;
  }
  line = d3.svg.line().x(function(d) {
    return d.cx;
  }).y(function(d) {
    return d.cy;
  }).interpolate('linear');
  touch = {};
  selected = [];
  select = function(d) {
    if (d.selected) {
      return;
    }
    d.selected = true;
    selected.push(d);
    return path_wrap.selectAll('circle').data(selected).enter().append('circle').attr({
      cx: function(d) {
        return d.cx;
      },
      cy: function(d) {
        return d.cy;
      },
      r: options.ir
    });
  };
  updatePath = function(pos) {
    var pathData;
    pathData = selected;
    if (pos) {
      pathData = pathData.concat({
        cx: pos[0],
        cy: pos[1]
      });
    }
    path.attr('d', line(pathData));
    return circles.classed('d3lock-selected', function(d) {
      return d.selected;
    });
  };
  clearPath = function(cb) {
    return _.delay(function() {
      _.each(selected, function(d) {
        return d.selected = false;
      });
      selected = [];
      touch.id = null;
      touch.freeze = false;
      circles_wrap.classed('d3lock-pass d3lock-fail', false);
      path.attr('d', '');
      path_wrap.classed('d3lock-pass d3lock-fail', false).selectAll('circle').remove();
      circles.classed('d3lock-selected', false);
      return typeof cb === "function" ? cb() : void 0;
    }, options.delay);
  };
  checkPath = function() {
    var r;
    if ((touch.id == null) || touch.freeze) {
      return;
    }
    touch.freeze = true;
    updatePath();
    r = typeof options.checkData === "function" ? options.checkData(_.pluck(selected, 'index')) : void 0;
    if (r === true) {
      circles_wrap.classed('d3lock-pass', true);
      path_wrap.classed('d3lock-pass', true);
    } else if (r === false) {
      circles_wrap.classed('d3lock-fail', true);
      path_wrap.classed('d3lock-fail', true);
    }
    return clearPath();
  };
  circles_wrap = svg.append('g').attr('class', 'd3lock-circles');
  circles = circles_wrap.selectAll('circle').data(data).enter().append('circle').attr({
    r: options.r,
    cx: function(d) {
      return d.cx;
    },
    cy: function(d) {
      return d.cy;
    }
  }).on('touchstart', function() {
    var d, e;
    if ((touch.id != null) || touch.freeze) {
      return;
    }
    e = d3.event;
    e.preventDefault();
    touch.id = e.touches[0].identifier;
    d = d3.select(this).data()[0];
    return select(d);
  }).on('touchmove', function() {
    var d, pos, x, y;
    if (touch.freeze) {
      return;
    }
    pos = d3.touch(svg[0][0], touch.id);
    if (!pos) {
      return;
    }
    x = pos[0], y = pos[1];
    d = _.find(data, function(d) {
      return (x - d.cx) * (x - d.cx) + (y - d.cy) * (y - d.cy) <= options.r * options.r;
    });
    if (d) {
      select(d);
    }
    return updatePath(pos);
  }).on('touchend', checkPath);
  path_wrap = svg.append('g').attr('class', 'd3lock-path');
  path = path_wrap.append('path');
  return svg[0][0];
};


},{"../d3utils":12}],10:[function(require,module,exports){
const d3pie = require('./lib');
const $ = require('../d3utils').$;

module.exports = function () {
  $('#d3pie').appendChild(d3pie([{
    value: 10,
  }, {
    value: 20,
  }, {
    value: 30,
  }, {
    value: 40,
  }]));
};

},{"../d3utils":12,"./lib":11}],11:[function(require,module,exports){
const utils = require('../d3utils');

module.exports = (data, options) => {
  options = Object.assign({
    outerRadius: 100,
    innerRadius: 80,
    startAngle: 0,
  }, options);
  options.cornerRadius = (options.outerRadius - options.innerRadius) / 2;
  const size = options.outerRadius * 2;
  const svg = utils.newSVG().attr({
    width: size,
    height: size,
  })
  .on('click', () => {
    const svgEl = svg[0][0];
    utils.svg2img(svgEl).then(img => {
      svgEl.parentNode.replaceChild(img, svgEl);
    });
  });
  const total = d3.sum(data, item => item.value);
  const colors = d3.scale.category10();
  const arc = d3.svg.arc()
    .innerRadius(options.innerRadius)
    .outerRadius(options.outerRadius)
    .cornerRadius(options.cornerRadius)
    .startAngle((d, i) => d.startAngle)
    .endAngle((d, i) => d.endAngle);
  data.reduce((startAngle, item, i) => {
    item.startAngle = startAngle;
    const endAngle = item.endAngle = startAngle + item.value * 2 * Math.PI / total;
    return endAngle;
  }, options.startAngle);
  svg.append('g')
  .attr('transform', `translate(${options.outerRadius},${options.outerRadius})`)
  .selectAll('path')
  .data(data)
  .enter()
  .append('path')
  .attr({
    d: arc,
    fill: (d, i) => d.color || colors(i),
  });
  return svg[0][0];
};

},{"../d3utils":12}],12:[function(require,module,exports){
var $, _frag, _id, addClipPath, addLinearGradient, addShadowFilter, ensureRange, getId, newSVG, svg2img;

_id = 0;

_frag = document.createDocumentFragment();

$ = function(selector) {
  return document.querySelector(selector);
};

getId = function() {
  return _id += 1;
};

ensureRange = function(num, min, max) {
  if (max !== null) {
    if (num > max) {
      num = max;
    }
  }
  if (min !== null) {
    if (num < min) {
      num = min;
    }
  }
  return num;
};

newSVG = function() {
  return d3.select(_frag).append('svg').remove();
};

addClipPath = function(svg, id) {
  return svg.append('defs').append('clipPath').attr('id', id);
};

addShadowFilter = function(svg, id, rgba) {
  var feMerge, filter;
  if (rgba == null) {
    rgba = [.5, .5, .5, 1];
  }
  filter = svg.append('defs').append('filter').attr({
    id: id,
    width: 1.4,
    height: 1.4,
    x: -.2,
    y: -.1
  });
  filter.append('feColorMatrix').attr({
    type: 'matrix',
    values: ("0 0 0 " + rgba[0] + " 0 ") + ("0 0 0 " + rgba[1] + " 0 ") + ("0 0 0 " + rgba[2] + " 0 ") + ("0 0 0 " + rgba[3] + " 0 ")
  });
  filter.append('feGaussianBlur').attr({
    stdDeviation: 1,
    result: 'blur'
  });
  filter.append('feOffset').attr({
    'in': 'blur',
    dx: 0,
    dy: 1,
    result: 'offsetBlur'
  });
  feMerge = filter.append('feMerge');
  feMerge.append('feMergeNode').attr('in', 'offsetBlur');
  return feMerge.append('feMergeNode').attr('in', 'SourceGraphic');
};

addLinearGradient = function(svg, id, stop0, stop1) {
  var gradient;
  if (stop1 == null) {
    stop1 = 'white';
  }
  gradient = svg.append('defs').append('linearGradient').attr({
    id: id,
    x1: 0,
    y1: -.5,
    x2: 0,
    y2: 1
  });
  gradient.append('stop').attr('offset', 0).style('stop-color', stop0);
  return gradient.append('stop').attr('offset', 1).style('stop-color', stop1);
};

svg2img = function(svg) {
  return new Promise(function(resolve, reject) {
    var blob, img, serializer, url, xml;
    serializer = new XMLSerializer;
    xml = serializer.serializeToString(svg);
    blob = new Blob([xml], {
      type: 'image/svg+xml'
    });
    url = URL.createObjectURL(blob);
    img = new Image;
    img.src = url;
    return img.onload = function() {
      var canvas, ctx, dImg, dpi;
      dpi = window.devicePixelRatio || 1;
      canvas = document.createElement('canvas');
      canvas.width = dpi * img.width;
      canvas.height = dpi * img.height;
      ctx = canvas.getContext('2d');
      ctx.scale(dpi, dpi);
      ctx.drawImage(img, 0, 0);
      dImg = new Image;
      dImg.src = canvas.toDataURL();
      dImg.style.width = img.width + 'px';
      dImg.style.height = img.height + 'px';
      resolve(dImg);
      return URL.revokeObjectURL(url);
    };
  });
};

module.exports = {
  $: $,
  getId: getId,
  ensureRange: ensureRange,
  newSVG: newSVG,
  addClipPath: addClipPath,
  addShadowFilter: addShadowFilter,
  addLinearGradient: addLinearGradient,
  svg2img: svg2img
};


},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAuY29mZmVlIiwiZDNiYXIvaW5kZXguY29mZmVlIiwiZDNiYXIvbGliLmNvZmZlZSIsImQzY2hhcnQvaW5kZXguY29mZmVlIiwiZDNjaGFydC9saWIuY29mZmVlIiwiZDNjb2x1bW5zL2luZGV4LmpzIiwiZDNjb2x1bW5zL2xpYi5qcyIsImQzbG9jay9pbmRleC5jb2ZmZWUiLCJkM2xvY2svbGliLmNvZmZlZSIsImQzcGllL2luZGV4LmpzIiwiZDNwaWUvbGliLmpzIiwiZDN1dGlscy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBRyxPQUFBLENBQVEsU0FBUixDQUFILENBQUE7O0FBQ0csT0FBQSxDQUFRLFdBQVIsQ0FBSCxDQUFBOztBQUNHLE9BQUEsQ0FBUSxVQUFSLENBQUgsQ0FBQTs7QUFDRyxPQUFBLENBQVEsU0FBUixDQUFILENBQUE7O0FBQ0csT0FBQSxDQUFRLGFBQVIsQ0FBSCxDQUFBOzs7O0FDSkEsSUFBQTs7QUFBQSxLQUFBLEdBQVEsT0FBQSxDQUFRLE9BQVI7O0FBQ1IsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxZQUFSLENBQ0YsQ0FBQzs7QUFFSCxNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFBO1NBQ2YsQ0FBQSxDQUFFLFFBQUYsQ0FDRSxDQUFDLFdBREgsQ0FDZSxLQUFBLENBQU0sQ0FBQyxFQUFELEVBQUssRUFBTCxFQUFTLENBQVQsQ0FBTixFQUNYO0lBQUEsSUFBQSxFQUFNLEVBQU47R0FEVyxDQURmO0FBRGU7Ozs7QUNKakIsSUFBQTs7QUFBQSxLQUFBLEdBQVEsT0FBQSxDQUFRLFlBQVI7O0FBRVIsUUFBQSxHQUNFO0VBQUEsS0FBQSxFQUFPLEdBQVA7RUFDQSxNQUFBLEVBQVEsRUFEUjtFQUVBLElBQUEsRUFBTSxJQUZOO0VBR0EsTUFBQSxFQUFRLElBSFI7RUFJQSxRQUFBLEVBQVUsRUFKVjtFQUtBLFVBQUEsRUFBWSxHQUxa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QU0sR0FBRyxDQUFDO01BQ3pCLE1BQU0sQ0FBQyxNQUFQLEdBQWdCLEdBQUEsR0FBTSxHQUFHLENBQUM7TUFDMUIsR0FBQSxHQUFNLE1BQU0sQ0FBQyxVQUFQLENBQWtCLElBQWxCO01BQ04sR0FBRyxDQUFDLEtBQUosQ0FBVSxHQUFWLEVBQWUsR0FBZjtNQUNBLEdBQUcsQ0FBQyxTQUFKLENBQWMsR0FBZCxFQUFtQixDQUFuQixFQUFzQixDQUF0QjtNQUNBLElBQUEsR0FBTyxJQUFJO01BQ1gsSUFBSSxDQUFDLEdBQUwsR0FBYyxNQUFNLENBQUMsU0FBVixDQUFBO01BQ1gsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFYLEdBQW1CLEdBQUcsQ0FBQyxLQUFKLEdBQVk7TUFDL0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFYLEdBQW9CLEdBQUcsQ0FBQyxNQUFKLEdBQWE7TUFDakMsT0FBQSxDQUFRLElBQVI7YUFDQSxHQUFHLENBQUMsZUFBSixDQUFvQixHQUFwQjtJQWJXO0VBUGdCLENBQVI7QUFBYjs7QUFzQlYsTUFBTSxDQUFDLE9BQVAsR0FDRTtFQUFBLENBQUEsRUFBRyxDQUFIO0VBQ0EsS0FBQSxFQUFPLEtBRFA7RUFFQSxXQUFBLEVBQWEsV0FGYjtFQUdBLE1BQUEsRUFBUSxNQUhSO0VBSUEsV0FBQSxFQUFhLFdBSmI7RUFLQSxlQUFBLEVBQWlCLGVBTGpCO0VBTUEsaUJBQUEsRUFBbUIsaUJBTm5CO0VBT0EsT0FBQSxFQUFTLE9BUFQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiZG8gcmVxdWlyZSAnLi9kM2JhcidcbmRvIHJlcXVpcmUgJy4vZDNjaGFydCdcbmRvIHJlcXVpcmUgJy4vZDNsb2NrJ1xuZG8gcmVxdWlyZSAnLi9kM3BpZSdcbmRvIHJlcXVpcmUgJy4vZDNjb2x1bW5zJ1xuIiwiZDNiYXIgPSByZXF1aXJlICcuL2xpYidcbiQgPSByZXF1aXJlICcuLi9kM3V0aWxzJ1xuICAuJFxuXG5tb2R1bGUuZXhwb3J0cyA9IC0+XG4gICQgJyNkM2JhcidcbiAgICAuYXBwZW5kQ2hpbGQgZDNiYXIgWzE1LCAxNiwgNV0sXG4gICAgICBtYXhYOiA0MFxuIiwidXRpbHMgPSByZXF1aXJlICcuLi9kM3V0aWxzJ1xuXG5kZWZhdWx0cyA9XG4gIHdpZHRoOiAyMDBcbiAgaGVpZ2h0OiAxMFxuICBtYXhYOiBudWxsXG4gIGNvbG9yczogbnVsbFxuICBmb250U2l6ZTogMTZcbiAgbGluZUhlaWdodDogMS4yXG4gIG9ubW91c2VvdmVyOiBudWxsXG4gIG9ubW91c2VsZWF2ZTogbnVsbFxuICB0cmFuc2l0aW9uOiA1MDBcblxuY29sb3JHZW5lcmF0b3IgPSAoY29sb3JzKSAtPlxuICBpbmRleCA9IC0xXG4gIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5IGNvbG9yc1xuICAtPlxuICAgIGluZGV4ID0gaW5kZXggKyAxXG4gICAgaWYgaXNBcnJheVxuICAgICAgY29sb3JzW2luZGV4ID0gaW5kZXggJSBjb2xvcnMubGVuZ3RoXVxuICAgIGVsc2VcbiAgICAgIGNvbG9ycyBpbmRleFxuXG5tb2R1bGUuZXhwb3J0cyA9IChhcnJheSwgb3B0aW9ucykgLT5cbiAgb3B0aW9ucyA9IF8uZXh0ZW5kIHt9LCBkZWZhdWx0cywgb3B0aW9uc1xuICB1bmxlc3Mgb3B0aW9ucy5jb2xvcnNcbiAgICBvcHRpb25zLmNvbG9ycyA9IGRvIGQzLnNjYWxlLmNhdGVnb3J5MTBcbiAgZ2V0Q29sb3IgPSBjb2xvckdlbmVyYXRvciBvcHRpb25zLmNvbG9yc1xuICBoYWxmSGVpZ2h0ID0gb3B0aW9ucy5oZWlnaHQgLyAyXG4gIGlkID0gZG8gdXRpbHMuZ2V0SWRcbiAgY2xpcHBlcklkID0gXCJkM2Jhci1jbGlwcGVyLSN7aWR9XCJcbiAgc2hhZG93SWQgPSBcImQzY2hhcnQtc2hhZG93LSN7aWR9XCJcblxuICBzdW0gPSBkMy5zdW0gYXJyYXlcbiAgb3B0aW9ucy5tYXhYID89IHN1bVxuICB4ID0gZDMuc2NhbGUubGluZWFyKClcbiAgICAuZG9tYWluIFswLCBvcHRpb25zLm1heFhdXG4gICAgLnJhbmdlIFswLCBvcHRpb25zLndpZHRoXVxuICBkYXRhID0gXy5yZWR1Y2UgYXJyYXksIChvYmosIGQsIGkpIC0+XG4gICAgICByID1cbiAgICAgICAgdmFsdWU6IGRcbiAgICAgICAgaW5kZXg6IGlcbiAgICAgICAgeDogb2JqLmxhc3RXaWR0aFxuICAgICAgICBkeDogeCBkXG4gICAgICBvYmoubGlzdC5wdXNoIHJcbiAgICAgIG9iai5sYXN0V2lkdGggKz0gci5keFxuICAgICAgb2JqXG4gICAgLFxuICAgICAgbGlzdDogW11cbiAgICAgIGxhc3RXaWR0aDogMFxuICAgIC5saXN0XG4gIHN1bVggPSB4IHN1bVxuXG4gIHN2ZyA9IHV0aWxzLm5ld1NWRygpXG4gICAgLmF0dHJcbiAgICAgICdjbGFzcyc6ICdkM2JhcidcbiAgICAgIHdpZHRoOiBvcHRpb25zLndpZHRoXG4gICAgICBoZWlnaHQ6IG9wdGlvbnMuaGVpZ2h0XG4gIHV0aWxzLmFkZFNoYWRvd0ZpbHRlciBzdmcsIHNoYWRvd0lkXG4gIGNsaXBwZXIgPSB1dGlscy5hZGRDbGlwUGF0aCBzdmcsIGNsaXBwZXJJZFxuICBjbGlwcGVyX3JlY3QgPSBjbGlwcGVyLmFwcGVuZCAncmVjdCdcbiAgICAuYXR0clxuICAgICAgeDogMFxuICAgICAgeTogMFxuICAgICAgd2lkdGg6IDBcbiAgICAgIGhlaWdodDogb3B0aW9ucy5oZWlnaHRcbiAgICAgIHJ4OiBoYWxmSGVpZ2h0XG4gICAgICByeTogaGFsZkhlaWdodFxuICBpZiBvcHRpb25zLnRyYW5zaXRpb25cbiAgICBjbGlwcGVyX3JlY3QgPSBjbGlwcGVyX3JlY3QudHJhbnNpdGlvbigpXG4gICAgICAuZHVyYXRpb24gb3B0aW9ucy50cmFuc2l0aW9uXG4gIGNsaXBwZXJfcmVjdC5hdHRyICd3aWR0aCcsIHN1bVhcblxuICB3cmFwID0gc3ZnLmFwcGVuZCAnZydcbiAgICAuYXR0ciAnY2xpcC1wYXRoJywgXCJ1cmwoIyN7Y2xpcHBlcklkfSlcIlxuICBsaW5lcyA9IHdyYXAuc2VsZWN0QWxsICdsaW5lJ1xuICAgIC5kYXRhIGRhdGFcbiAgICAuZW50ZXIoKVxuICAgIC5hcHBlbmQgJ2xpbmUnXG4gICAgLmF0dHJcbiAgICAgICdjbGFzcyc6ICdkM2Jhci1saW5lJ1xuICAgICAgc3Ryb2tlOiAtPiBkbyBnZXRDb2xvclxuICAgICAgJ3N0cm9rZS13aWR0aCc6IG9wdGlvbnMuaGVpZ2h0XG4gICAgICB4MTogMFxuICAgICAgeDI6IDBcbiAgICAgIHkxOiBoYWxmSGVpZ2h0XG4gICAgICB5MjogaGFsZkhlaWdodFxuICAgIC5vbiAnbW91c2VvdmVyJywgLT5cbiAgICAgIGxpbmUgPSBkMy5zZWxlY3QgQFxuICAgICAgW2RdID0gbGluZS5kYXRhXG4gICAgICBvcHRpb25zLm9ubW91c2VvdmVyPyBkMy5ldmVudCwgZFxuICBpZiBvcHRpb25zLnRyYW5zaXRpb25cbiAgICBsaW5lcyA9IGxpbmVzLnRyYW5zaXRpb24oKVxuICAgICAgLmR1cmF0aW9uIG9wdGlvbnMudHJhbnNpdGlvblxuICBsaW5lcy5hdHRyXG4gICAgeDE6IChkKSAtPiBkLnhcbiAgICB4MjogKGQpIC0+IGQueCArIGQuZHhcbiAgd3JhcC5vbiAnbW91c2VsZWF2ZScsIC0+XG4gICAgb3B0aW9ucy5vbm1vdXNlbGVhdmU/IGQzLmV2ZW50XG5cbiAgc3ZnWzBdWzBdXG4iLCJkM2NoYXJ0ID0gcmVxdWlyZSAnLi9saWInXG4kID0gcmVxdWlyZSAnLi4vZDN1dGlscydcbiAgLiRcblxubW9kdWxlLmV4cG9ydHMgPSAtPlxuICAkICcjZDNjaGFydCdcbiAgICAuYXBwZW5kQ2hpbGQgZDNjaGFydCBbXG4gICAgICAoeDogMCwgIHk6IDAgKVxuICAgICAgKHg6IDEsICB5OiAyIClcbiAgICAgICh4OiAyLCAgeTogOCApXG4gICAgICAoeDogMywgIHk6IDkgKVxuICAgICAgKHg6IDQsICB5OiAxMClcbiAgICAgICh4OiA1LCAgeTogMTIpXG4gICAgICAoeDogNiwgIHk6IDE0KVxuICAgICAgKHg6IDcsICB5OiAxNylcbiAgICAgICh4OiA4LCAgeTogMTApXG4gICAgICAoeDogOSwgIHk6IDEyKVxuICAgICAgKHg6IDEwLCB5OiAxNSlcbiAgICAgICh4OiAxMSwgeTogMTYpXG4gICAgXSxcbiAgICAgIG1pblk6IDBcbiAgICAgIG1heFk6IDQwXG4gICAgICBnZXRUZXh0OiAoZCkgLT4gW1xuICAgICAgICAnWDogJyArIGQueFxuICAgICAgICAnWTogJyArIGQueVxuICAgICAgXVxuIiwidXRpbHMgPSByZXF1aXJlICcuLi9kM3V0aWxzJ1xuXG5kZWZhdWx0cyA9XG4gIHdpZHRoOiAyNjBcbiAgaGVpZ2h0OiAxNTBcbiAgbWluWDogbnVsbFxuICBtYXhYOiBudWxsXG4gIG1pblk6IG51bGxcbiAgbWF4WTogbnVsbFxuICBzdHJva2U6ICcjN2VkMzIxJ1xuICB0aHJlc2hvbGQ6IDE1XG4gIGdldFRleHQ6IG51bGxcbiAgZm9udFNpemU6IDEyXG4gIHJlY3RXaWR0aDogNDBcbiAgbGluZUhlaWdodDogMS41XG5cbm1vZHVsZS5leHBvcnRzID0gKGRhdGEsIG9wdGlvbnMpIC0+XG4gIG9wdGlvbnMgPSBfLmV4dGVuZCB7fSwgZGVmYXVsdHMsIG9wdGlvbnNcbiAgb3B0aW9ucy5taW5YID89IGQzLm1pbiBkYXRhLCAoZCkgLT4gZC54XG4gIG9wdGlvbnMubWluWSA/PSBkMy5taW4gZGF0YSwgKGQpIC0+IGQueVxuICBvcHRpb25zLm1heFggPz0gZDMubWF4IGRhdGEsIChkKSAtPiBkLnhcbiAgb3B0aW9ucy5tYXhZID89IGQzLm1heCBkYXRhLCAoZCkgLT4gZC55XG5cbiAgc3ZnID0gdXRpbHMubmV3U1ZHKClcbiAgICAuYXR0clxuICAgICAgJ2NsYXNzJzogJ2QzY2hhcnQnXG4gICAgICB3aWR0aDogb3B0aW9ucy53aWR0aFxuICAgICAgaGVpZ2h0OiBvcHRpb25zLmhlaWdodFxuICBpZCA9IGRvIHV0aWxzLmdldElkXG4gIGZpbGxJZCA9IFwiZDNjaGFydC1maWxsLSN7aWR9XCJcbiAgc2hhZG93SWQgPSBcImQzY2hhcnQtc2hhZG93LSN7aWR9XCJcbiAgdXRpbHMuYWRkU2hhZG93RmlsdGVyIHN2Zywgc2hhZG93SWRcbiAgdXRpbHMuYWRkTGluZWFyR3JhZGllbnQgc3ZnLCBmaWxsSWQsIG9wdGlvbnMuc3Ryb2tlXG5cbiAgeCA9IGQzLnNjYWxlLmxpbmVhcigpXG4gICAgLmRvbWFpbiBbb3B0aW9ucy5taW5YLCBvcHRpb25zLm1heFhdXG4gICAgLnJhbmdlIFswLCBvcHRpb25zLndpZHRoXVxuXG4gIHkgPSBkMy5zY2FsZS5saW5lYXIoKVxuICAgIC5kb21haW4gW29wdGlvbnMubWluWSwgb3B0aW9ucy5tYXhZXVxuICAgIC5yYW5nZSBbb3B0aW9ucy5oZWlnaHQsIDBdXG5cbiAgZGF0YSA9IF8ubWFwIGRhdGEsIChkLCBpKSAtPlxuICAgIHg6IGQueFxuICAgIHk6IGQueVxuICAgIGR4OiB4IGQueFxuICAgIGR5OiB5IGQueVxuICAgIGluZGV4OiBpXG5cbiAgbGluZWFyZWEgPVxuICAgIGxpbmU6IHt9XG4gICAgYXJlYToge31cblxuICAjIGRyYXcgbGluZVxuICBsaW5lID0gZDMuc3ZnLmxpbmUoKVxuICAgIC54IChkKSAtPiBkLmR4XG4gICAgLnkgKGQpIC0+IGQuZHlcbiAgICAuaW50ZXJwb2xhdGUgJ21vbm90b25lJ1xuICBsaW5lYXJlYS5saW5lLmVsID0gc3ZnLmFwcGVuZCAncGF0aCdcbiAgICAuYXR0clxuICAgICAgJ2NsYXNzJzogJ2QzY2hhcnQtbGluZSdcbiAgICAgIHN0cm9rZTogb3B0aW9ucy5zdHJva2VcbiAgICAgIGQ6IGxpbmUgZGF0YVxuXG4gICMgZHJhdyBhcmVhXG4gIGFyZWEgPSBkMy5zdmcuYXJlYSgpXG4gICAgLnggKGQpIC0+IGQuZHhcbiAgICAueTAgb3B0aW9ucy5oZWlnaHRcbiAgICAueTEgKGQpIC0+IGQuZHlcbiAgICAuaW50ZXJwb2xhdGUgJ21vbm90b25lJ1xuICBsaW5lYXJlYS5hcmVhLmVsID0gc3ZnLmFwcGVuZCAncGF0aCdcbiAgICAuYXR0clxuICAgICAgJ2NsYXNzJzogJ2QzY2hhcnQtYXJlYSdcbiAgICAgIGQ6IGFyZWEgZGF0YVxuICAgIC5zdHlsZSAnZmlsbCcsIFwidXJsKCMje2ZpbGxJZH0pXCJcblxuICBjdXJyZW50ID1cbiAgICBzaG93OiAtPlxuICAgICAgcmV0dXJuIHVubGVzcyBAaGlkZGVuXG4gICAgICBAaGlkZGVuID0gZmFsc2VcbiAgICAgIEBjaXJjbGUud3JhcC5zdHlsZSAnZGlzcGxheScsICdibG9jaydcbiAgICAgIEB0aXBzLndyYXAuc3R5bGUgJ2Rpc3BsYXknLCAnYmxvY2snXG4gICAgaGlkZTogLT5cbiAgICAgIHJldHVybiBpZiBAaGlkZGVuIG9yIGxpbmVhcmVhLmxpbmUuaG92ZXJlZCBvciBsaW5lYXJlYS5hcmVhLmhvdmVyZWRcbiAgICAgIEBoaWRkZW4gPSB0cnVlXG4gICAgICBAY2lyY2xlLndyYXAuc3R5bGUgJ2Rpc3BsYXknLCAnbm9uZSdcbiAgICAgIEB0aXBzLndyYXAuc3R5bGUgJ2Rpc3BsYXknLCAnbm9uZSdcbiAgICBjaXJjbGU6XG4gICAgICB3cmFwOlxuICAgICAgICBzdmcuYXBwZW5kICdnJ1xuICAgICAgICAgIC5hdHRyICdjbGFzcycsICdkM2NoYXJ0LWNpcmNsZSdcbiAgICB0aXBzOlxuICAgICAgd3JhcDpcbiAgICAgICAgc3ZnLmFwcGVuZCAnZydcbiAgICAgICAgICAuYXR0ciAnY2xhc3MnLCAnZDNjaGFydC10ZXh0J1xuICBjdXJyZW50LmNpcmNsZS5lbCA9IGRvIC0+XG4gICAgd3JhcCA9IGN1cnJlbnQuY2lyY2xlLndyYXBcbiAgICAjIFNhZmFyaSBkb2VzIG5vdCBzdXBwb3J0IGByYCBpbiBDU1NcbiAgICB3cmFwLmFwcGVuZCAnY2lyY2xlJ1xuICAgICAgLmF0dHJcbiAgICAgICAgJ2NsYXNzJzogJ2QzY2hhcnQtb3V0ZXItY2lyY2xlJ1xuICAgICAgICByOiAzXG4gICAgICAuc3R5bGUgJ2ZpbHRlcicsIFwidXJsKCMje3NoYWRvd0lkfSlcIlxuICAgIHdyYXAuYXBwZW5kICdjaXJjbGUnXG4gICAgICAuYXR0clxuICAgICAgICAnY2xhc3MnOiAnZDNjaGFydC1pbm5lci1jaXJjbGUnXG4gICAgICAgIHI6IDFcbiAgICAgICAgZmlsbDogb3B0aW9ucy5zdHJva2VcbiAgICB3cmFwLnNlbGVjdEFsbCAnY2lyY2xlJ1xuICBjdXJyZW50LnRpcHMucmVjdCA9IGN1cnJlbnQudGlwcy53cmFwXG4gICAgLmFwcGVuZCAncmVjdCdcbiAgICAuc3R5bGUgJ2ZpbHRlcicsIFwidXJsKCMje3NoYWRvd0lkfSlcIlxuICAgIC5hdHRyXG4gICAgICB3aWR0aDogb3B0aW9ucy5yZWN0V2lkdGhcbiAgICAgIHJ4OiA1XG4gICAgICByeTogNVxuICBkbyBjdXJyZW50LmhpZGVcblxuICBzaG93Q2lyY2xlID0gKGQpIC0+XG4gICAgY2lyY2xlID0gY3VycmVudC5jaXJjbGUuZWxcbiAgICAjY2lyY2xlID0gY2lyY2xlLnRyYW5zaXRpb24oKS5kdXJhdGlvbigxMDApXG4gICAgY2lyY2xlLmF0dHJcbiAgICAgIGN4OiBkLmR4XG4gICAgICBjeTogZC5keVxuICBzaG93VGV4dCA9IChkKSAtPlxuICAgIHRleHQgPSAob3B0aW9ucy5nZXRUZXh0PyBkKSBvciBbZC55XVxuICAgIHRoID0gb3B0aW9ucy5mb250U2l6ZSAqIChvcHRpb25zLmxpbmVIZWlnaHQgKiAodGV4dC5sZW5ndGggKyAxKSAtIDEpXG4gICAgY3VycmVudC50aXBzLnJlY3QuYXR0ciAnaGVpZ2h0JywgdGhcbiAgICB0eCA9IHV0aWxzLmVuc3VyZVJhbmdlIGQuZHggLSA1LCAwLCBvcHRpb25zLndpZHRoIC0gb3B0aW9ucy5yZWN0V2lkdGhcbiAgICB0eSA9IHV0aWxzLmVuc3VyZVJhbmdlIGQuZHkgLSB0aCAtIDEwLCAwLCBvcHRpb25zLmhlaWdodCAtIHRoXG4gICAgdGlwcyA9IGN1cnJlbnQudGlwcy53cmFwXG4gICAgIyBodHRwczovL2Nzcy10cmlja3MuY29tL3RyYW5zZm9ybXMtb24tc3ZnLWVsZW1lbnRzL1xuICAgICMgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4vZG9jcy9XZWIvU1ZHL0F0dHJpYnV0ZS90cmFuc2Zvcm1cbiAgICAjIFVzZSB0cmFuc2Zvcm0gYXR0cmlidXRlcyBmb3IgY3Jvc3MtYnJvd3NlciBzdXBwb3J0XG4gICAgdGlwcy5hdHRyICd0cmFuc2Zvcm0nLCBcInRyYW5zbGF0ZSgje3R4fSwje3R5fSlcIlxuICAgIHRpcHMuc2VsZWN0QWxsICd0ZXh0J1xuICAgICAgLnJlbW92ZSgpXG4gICAgdGlwcy5zZWxlY3RBbGwgJ3RleHQnXG4gICAgICAuZGF0YSB0ZXh0XG4gICAgICAuZW50ZXIoKVxuICAgICAgLmFwcGVuZCAndGV4dCdcbiAgICAgIC5hdHRyXG4gICAgICAgIHg6IG9wdGlvbnMuZm9udFNpemUgKiAuNVxuICAgICAgICB5OiAoZCwgaSkgLT4gb3B0aW9ucy5mb250U2l6ZSAqIG9wdGlvbnMubGluZUhlaWdodCAqIChpICsgMSlcbiAgICAgICAgJ2ZvbnQtc2l6ZSc6IG9wdGlvbnMuZm9udFNpemVcbiAgICAgIC50ZXh0IChkKSAtPiBkXG5cbiAgb25tb3VzZW1vdmUgPSAtPlxuICAgIGR4ID0gZDMuZXZlbnQub2Zmc2V0WFxuICAgIGNpciA9IF8ucmVkdWNlIGRhdGEsIChjaXIsIGQpIC0+XG4gICAgICBkZWx0YSA9IE1hdGguYWJzIGQuZHggLSBkeFxuICAgICAgaWYgZGVsdGEgPCBvcHRpb25zLnRocmVzaG9sZCBhbmQgKG5vdCBjaXIuZGVsdGE/IG9yIGNpci5kZWx0YSA+IGRlbHRhKVxuICAgICAgICBjaXIuZGVsdGEgPSBkZWx0YVxuICAgICAgICBjaXIuZCA9IGRcbiAgICAgIGNpclxuICAgICwge31cbiAgICBpZiBjaXIuZFxuICAgICAgc2hvd0NpcmNsZSBjaXIuZFxuICAgICAgc2hvd1RleHQgY2lyLmRcbiAgICAgIGRvIGN1cnJlbnQuc2hvd1xuICAgIGVsc2VcbiAgICAgIGRvIGN1cnJlbnQuaGlkZVxuXG4gIGxpbmVhcmVhLmxpbmUuZWxcbiAgICAub24gJ21vdXNlbW92ZScsIC0+XG4gICAgICBsaW5lYXJlYS5saW5lLmhvdmVyZWQgPSB0cnVlXG4gICAgICBkbyBvbm1vdXNlbW92ZVxuICAgIC5vbiAnbW91c2VsZWF2ZScsIC0+XG4gICAgICBsaW5lYXJlYS5saW5lLmhvdmVyZWQgPSBmYWxzZVxuICAgICAgZG8gY3VycmVudC5oaWRlXG5cbiAgbGluZWFyZWEuYXJlYS5lbFxuICAgIC5vbiAnbW91c2Vtb3ZlJywgLT5cbiAgICAgIGxpbmVhcmVhLmFyZWEuaG92ZXJlZCA9IHRydWVcbiAgICAgIGRvIG9ubW91c2Vtb3ZlXG4gICAgLm9uICdtb3VzZWxlYXZlJywgLT5cbiAgICAgIGxpbmVhcmVhLmFyZWEuaG92ZXJlZCA9IGZhbHNlXG4gICAgICBkbyBjdXJyZW50LmhpZGVcblxuICBzdmdbMF1bMF1cbiIsImNvbnN0IGNvbHVtbnMgPSByZXF1aXJlKCcuL2xpYicpO1xuY29uc3QgJCA9IHJlcXVpcmUoJy4uL2QzdXRpbHMnKS4kO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgJCgnI2QzY29sdW1ucycpLmFwcGVuZENoaWxkKGNvbHVtbnMoW3tcbiAgICB2YWx1ZTogMjAsXG4gIH0sIHtcbiAgICB2YWx1ZTogMixcbiAgfSwge1xuICAgIHZhbHVlOiA1LFxuICB9LCB7XG4gICAgdmFsdWU6IDUwLFxuICB9LCB7XG4gICAgdmFsdWU6IDg1LFxuICB9LCB7XG4gICAgdmFsdWU6IDgyLFxuICB9XSkpO1xufTtcbiIsImNvbnN0IHV0aWxzID0gcmVxdWlyZSgnLi4vZDN1dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChkYXRhLCBvcHRpb25zKSB7XG4gIGZ1bmN0aW9uIGNvbHVtbihkLCBpKSB7XG4gICAgY29uc3QgdiA9IGQudmFsdWU7XG4gICAgY29uc3QgaCA9IHkodik7XG4gICAgY29uc3QgaGFsZldpZHRoID0gb3B0aW9ucy5jb2x1bW5XaWR0aCAvIDI7XG4gICAgY29uc3QgaDAgPSB5KDApO1xuICAgIGNvbnN0IGgxID0gaCArIGhhbGZXaWR0aDtcbiAgICByZXR1cm4gYE0key1oYWxmV2lkdGh9ICR7aDF9QSR7aGFsZldpZHRofSAke2hhbGZXaWR0aH0gMCAwIDEgJHtoYWxmV2lkdGh9ICR7aDF9TCR7aGFsZldpZHRofSAke2gwfUwkey1oYWxmV2lkdGh9ICR7aDB9WmA7XG4gIH1cbiAgb3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe1xuICAgIHdpZHRoOiAzMDAsXG4gICAgaGVpZ2h0OiAyMDAsXG4gICAgY29sdW1uV2lkdGg6IDIwLFxuICB9LCBvcHRpb25zKTtcbiAgY29uc3QgbWluWSA9IDA7XG4gIGNvbnN0IG1heFkgPSBkMy5tYXgoZGF0YSwgaXRlbSA9PiBpdGVtLnZhbHVlKTtcbiAgY29uc3QgeSA9IGQzLnNjYWxlLmxpbmVhcigpLmRvbWFpbihbbWluWSwgbWF4WV0pLnJhbmdlKFtvcHRpb25zLmhlaWdodCwgMF0pO1xuICBjb25zdCBnYXAgPSBvcHRpb25zLndpZHRoIC8gZGF0YS5sZW5ndGg7XG4gIGNvbnN0IGNvbG9ycyA9IGQzLnNjYWxlLmNhdGVnb3J5MTAoKTtcbiAgY29uc3Qgc3ZnID0gdXRpbHMubmV3U1ZHKCkuYXR0cih7XG4gICAgd2lkdGg6IG9wdGlvbnMud2lkdGgsXG4gICAgaGVpZ2h0OiBvcHRpb25zLmhlaWdodCxcbiAgfSlcbiAgLm9uKCdjbGljaycsICgpID0+IHtcbiAgICBjb25zdCBzdmdFbCA9IHN2Z1swXVswXTtcbiAgICB1dGlscy5zdmcyaW1nKHN2Z0VsKS50aGVuKGltZyA9PiB7XG4gICAgICBzdmdFbC5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChpbWcsIHN2Z0VsKTtcbiAgICB9KTtcbiAgfSk7XG4gIHN2Zy5hcHBlbmQoJ2cnKVxuICAuc2VsZWN0QWxsKCdwYXRoJylcbiAgLmRhdGEoZGF0YSlcbiAgLmVudGVyKClcbiAgLmFwcGVuZCgncGF0aCcpXG4gIC5hdHRyKHtcbiAgICBkOiBjb2x1bW4sXG4gICAgdHJhbnNmb3JtOiAoZCwgaSkgPT4gYHRyYW5zbGF0ZSgke2dhcCAqIChpICsgLjUpfSwwKWAsXG4gICAgZmlsbDogKGQsIGkpID0+IGQuY29sb3IgfHwgY29sb3JzKGkpLFxuICB9KTtcbiAgcmV0dXJuIHN2Z1swXVswXTtcbn07XG4iLCJkM2xvY2sgPSByZXF1aXJlICcuL2xpYidcbiQgPSByZXF1aXJlICcuLi9kM3V0aWxzJ1xuICAuJFxuXG5tb2R1bGUuZXhwb3J0cyA9IC0+XG4gIHRpdGxlID0gJCAnLmxvY2stdGl0bGUnXG4gIGJvZHkgPSAkICcubG9jay1ib2R5J1xuICByZXNldCA9ICQgJy5sb2NrLXJlc2V0J1xuXG4gIGxvY2tEYXRhID0gbW9kZSA9IGNoZWNrRGF0YSA9IG51bGxcblxuICByZWNvcmREYXRhID0gKGRhdGEpIC0+XG4gICAgbG9ja0RhdGEgPSBkYXRhXG4gICAgc2V0TW9kZSAyXG4gICAgdHJ1ZVxuXG4gIGNvbmZpcm1EYXRhID0gKGRhdGEpIC0+XG4gICAgb2sgPSBfLmlzRXF1YWwgbG9ja0RhdGEsIGRhdGFcbiAgICBpZiBva1xuICAgICAgc2V0TW9kZSAwXG4gICAgZWxzZVxuICAgICAgbG9ja0RhdGEgPSBudWxsXG4gICAgICB0aXRsZS5pbm5lckhUTUwgPSAn5Lik5qyh6Kej6ZSB5Zu+5qGI5LiN5LiA5qC377yM6K+36YeN5paw6K6+572u77yBJ1xuICAgICAgXy5kZWxheSAtPlxuICAgICAgICBzZXRNb2RlIDFcbiAgICAgICwgMTAwMFxuICAgIG9rXG5cbiAgdmFsaWRhdGVEYXRhID0gKGRhdGEpIC0+XG4gICAgb2sgPSBfLmlzRXF1YWwgbG9ja0RhdGEsIGRhdGFcbiAgICBpZiBva1xuICAgICAgdGl0bGUuaW5uZXJIVE1MID0gJ+ino+mUgeaIkOWKn++8gSdcbiAgICBlbHNlXG4gICAgICB0aXRsZS5pbm5lckhUTUwgPSAn6Kej6ZSB5aSx6LSl77yBJ1xuICAgIF8uZGVsYXkgLT5cbiAgICAgIHNldE1vZGUgbW9kZVxuICAgICwgMTAwMFxuICAgIG9rXG5cbiAgc2V0TW9kZSA9IChfbW9kZSkgLT5cbiAgICBzd2l0Y2ggX21vZGVcbiAgICAgIHdoZW4gMFxuICAgICAgICB0aXRsZS5pbm5lckhUTUwgPSAn6K+36Kej6ZSBJ1xuICAgICAgICBjaGVja0RhdGEgPSB2YWxpZGF0ZURhdGFcbiAgICAgICAgcmVzZXQuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcbiAgICAgIHdoZW4gMVxuICAgICAgICB0aXRsZS5pbm5lckhUTUwgPSAn57uY5Yi26Kej6ZSB5Zu+5qGIJ1xuICAgICAgICBsb2NrRGF0YSA9IG51bGxcbiAgICAgICAgY2hlY2tEYXRhID0gcmVjb3JkRGF0YVxuICAgICAgICByZXNldC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXG4gICAgICB3aGVuIDJcbiAgICAgICAgdGl0bGUuaW5uZXJIVE1MID0gJ+ehruiupOino+mUgeWbvuahiCdcbiAgICAgICAgY2hlY2tEYXRhID0gY29uZmlybURhdGFcbiAgICAgIGVsc2VcbiAgICAgICAgcmV0dXJuXG4gICAgbW9kZSA9IF9tb2RlXG5cbiAgb25SZXNldCA9IC0+IHNldE1vZGUgMVxuXG4gIGJvZHkuYXBwZW5kQ2hpbGQgZDNsb2NrXG4gICAgd2lkdGg6ICcxMDAlJ1xuICAgIGhlaWdodDogJzEwMCUnXG4gICAgY2hlY2tEYXRhOiAoZGF0YSkgLT4gY2hlY2tEYXRhIGRhdGFcblxuICByZXNldC5hZGRFdmVudExpc3RlbmVyICdjbGljaycsIG9uUmVzZXQgLCBmYWxzZVxuICBkbyBvblJlc2V0XG4iLCJ1dGlscyA9IHJlcXVpcmUgJy4uL2QzdXRpbHMnXG5cbmRlZmF1bHRzID1cbiAgc2l6ZTogMjAwXG4gIHI6IG51bGxcbiAgaXI6IG51bGxcbiAgY2hlY2tEYXRhOiBudWxsXG4gIGRlbGF5OiA1MDBcblxubW9kdWxlLmV4cG9ydHMgPSAob3B0aW9ucykgLT5cbiAgb3B0aW9ucyA9IF8uZXh0ZW5kIHt9LCBkZWZhdWx0cywgb3B0aW9uc1xuXG4gIHN2ZyA9IHV0aWxzLm5ld1NWRygpXG4gICAgLmF0dHJcbiAgICAgIHdpZHRoOiBvcHRpb25zLndpZHRoIHx8IG9wdGlvbnMuc2l6ZVxuICAgICAgaGVpZ2h0OiBvcHRpb25zLmhlaWdodCB8fCBvcHRpb25zLnNpemVcbiAgICAgIHZpZXdCb3g6IFwiMCAwICN7b3B0aW9ucy5zaXplfSAje29wdGlvbnMuc2l6ZX1cIlxuXG4gIGRhdGEgPSBfLm1hcCAoXy5yYW5nZSA5KSwgKGQpIC0+XG4gICAgaW5kZXg6IGRcbiAgICBjeCA6IH5+ICgoKH5+IChkIC8gMykpICogMiArIDEpICogb3B0aW9ucy5zaXplIC8gNilcbiAgICBjeSA6IH5+ICgoZCAlIDMgKiAyICsgMSkgKiBvcHRpb25zLnNpemUgLyA2KVxuICBvcHRpb25zLnIgPz0gfn4gKG9wdGlvbnMuc2l6ZSAvIDEyKVxuICBvcHRpb25zLmlyID89IG9wdGlvbnMuciA+PiAxXG5cbiAgbGluZSA9IGQzLnN2Zy5saW5lKClcbiAgICAueCAoZCkgLT4gZC5jeFxuICAgIC55IChkKSAtPiBkLmN5XG4gICAgLmludGVycG9sYXRlICdsaW5lYXInXG5cbiAgdG91Y2ggPSB7fVxuICBzZWxlY3RlZCA9IFtdXG4gIHNlbGVjdCA9IChkKSAtPlxuICAgIHJldHVybiBpZiBkLnNlbGVjdGVkXG4gICAgZC5zZWxlY3RlZCA9IHRydWVcbiAgICBzZWxlY3RlZC5wdXNoIGRcbiAgICBwYXRoX3dyYXAuc2VsZWN0QWxsICdjaXJjbGUnXG4gICAgICAuZGF0YSBzZWxlY3RlZFxuICAgICAgLmVudGVyKClcbiAgICAgIC5hcHBlbmQgJ2NpcmNsZSdcbiAgICAgIC5hdHRyXG4gICAgICAgIGN4OiAoZCkgLT4gZC5jeFxuICAgICAgICBjeTogKGQpIC0+IGQuY3lcbiAgICAgICAgcjogb3B0aW9ucy5pclxuXG4gIHVwZGF0ZVBhdGggPSAocG9zKSAtPlxuICAgIHBhdGhEYXRhID0gc2VsZWN0ZWRcbiAgICBpZiBwb3NcbiAgICAgIHBhdGhEYXRhID0gcGF0aERhdGEuY29uY2F0XG4gICAgICAgIGN4OiBwb3NbMF1cbiAgICAgICAgY3k6IHBvc1sxXVxuICAgIHBhdGguYXR0ciAnZCcsIGxpbmUgcGF0aERhdGFcbiAgICBjaXJjbGVzLmNsYXNzZWQgJ2QzbG9jay1zZWxlY3RlZCcsIChkKSAtPiBkLnNlbGVjdGVkXG5cbiAgY2xlYXJQYXRoID0gKGNiKSAtPlxuICAgIF8uZGVsYXkgLT5cbiAgICAgIF8uZWFjaCBzZWxlY3RlZCwgKGQpIC0+XG4gICAgICAgIGQuc2VsZWN0ZWQgPSBmYWxzZVxuICAgICAgc2VsZWN0ZWQgPSBbXVxuICAgICAgdG91Y2guaWQgPSBudWxsXG4gICAgICB0b3VjaC5mcmVlemUgPSBmYWxzZVxuICAgICAgY2lyY2xlc193cmFwLmNsYXNzZWQgJ2QzbG9jay1wYXNzIGQzbG9jay1mYWlsJywgZmFsc2VcbiAgICAgIHBhdGguYXR0ciAnZCcsICcnXG4gICAgICBwYXRoX3dyYXBcbiAgICAgICAgLmNsYXNzZWQgJ2QzbG9jay1wYXNzIGQzbG9jay1mYWlsJywgZmFsc2VcbiAgICAgICAgLnNlbGVjdEFsbCAnY2lyY2xlJ1xuICAgICAgICAucmVtb3ZlKClcbiAgICAgIGNpcmNsZXMuY2xhc3NlZCAnZDNsb2NrLXNlbGVjdGVkJywgZmFsc2VcbiAgICAgIGNiPygpXG4gICAgLCBvcHRpb25zLmRlbGF5XG5cbiAgY2hlY2tQYXRoID0gLT5cbiAgICByZXR1cm4gaWYgbm90IHRvdWNoLmlkPyBvciB0b3VjaC5mcmVlemVcbiAgICB0b3VjaC5mcmVlemUgPSB0cnVlXG4gICAgZG8gdXBkYXRlUGF0aFxuICAgIHIgPSBvcHRpb25zLmNoZWNrRGF0YT8oXy5wbHVjayBzZWxlY3RlZCwgJ2luZGV4JylcbiAgICBpZiByIGlzIHRydWVcbiAgICAgIGNpcmNsZXNfd3JhcC5jbGFzc2VkICdkM2xvY2stcGFzcycsIHRydWVcbiAgICAgIHBhdGhfd3JhcC5jbGFzc2VkICdkM2xvY2stcGFzcycsIHRydWVcbiAgICBlbHNlIGlmIHIgaXMgZmFsc2VcbiAgICAgIGNpcmNsZXNfd3JhcC5jbGFzc2VkICdkM2xvY2stZmFpbCcsIHRydWVcbiAgICAgIHBhdGhfd3JhcC5jbGFzc2VkICdkM2xvY2stZmFpbCcsIHRydWVcbiAgICBkbyBjbGVhclBhdGhcblxuICBjaXJjbGVzX3dyYXAgPSBzdmcuYXBwZW5kICdnJ1xuICAgIC5hdHRyICdjbGFzcycsICdkM2xvY2stY2lyY2xlcydcbiAgY2lyY2xlcyA9IGNpcmNsZXNfd3JhcFxuICAgIC5zZWxlY3RBbGwgJ2NpcmNsZSdcbiAgICAuZGF0YSBkYXRhXG4gICAgLmVudGVyKClcbiAgICAuYXBwZW5kICdjaXJjbGUnXG4gICAgLmF0dHJcbiAgICAgIHI6IG9wdGlvbnMuclxuICAgICAgY3g6IChkKSAtPiBkLmN4XG4gICAgICBjeTogKGQpIC0+IGQuY3lcbiAgICAub24gJ3RvdWNoc3RhcnQnLCAtPlxuICAgICAgcmV0dXJuIGlmIHRvdWNoLmlkPyBvciB0b3VjaC5mcmVlemVcbiAgICAgIGUgPSBkMy5ldmVudFxuICAgICAgZG8gZS5wcmV2ZW50RGVmYXVsdFxuICAgICAgdG91Y2guaWQgPSBlLnRvdWNoZXNbMF0uaWRlbnRpZmllclxuICAgICAgW2RdID0gZDMuc2VsZWN0IHRoaXNcbiAgICAgICAgLmRhdGEoKVxuICAgICAgc2VsZWN0IGRcbiAgICAub24gJ3RvdWNobW92ZScsIC0+XG4gICAgICByZXR1cm4gaWYgdG91Y2guZnJlZXplXG4gICAgICBwb3MgPSBkMy50b3VjaCBzdmdbMF1bMF0sIHRvdWNoLmlkXG4gICAgICByZXR1cm4gdW5sZXNzIHBvc1xuICAgICAgW3gsIHldID0gcG9zXG4gICAgICBkID0gXy5maW5kIGRhdGEsIChkKSAtPlxuICAgICAgICAoeCAtIGQuY3gpICogKHggLSBkLmN4KSArICh5IC0gZC5jeSkgKiAoeSAtIGQuY3kpIDw9IG9wdGlvbnMuciAqIG9wdGlvbnMuclxuICAgICAgaWYgZFxuICAgICAgICBzZWxlY3QgZFxuICAgICAgdXBkYXRlUGF0aCBwb3NcbiAgICAub24gJ3RvdWNoZW5kJywgY2hlY2tQYXRoXG5cbiAgcGF0aF93cmFwID0gc3ZnLmFwcGVuZCAnZydcbiAgICAuYXR0ciAnY2xhc3MnLCAnZDNsb2NrLXBhdGgnXG4gIHBhdGggPSBwYXRoX3dyYXAuYXBwZW5kICdwYXRoJ1xuXG4gIHN2Z1swXVswXVxuIiwiY29uc3QgZDNwaWUgPSByZXF1aXJlKCcuL2xpYicpO1xuY29uc3QgJCA9IHJlcXVpcmUoJy4uL2QzdXRpbHMnKS4kO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgJCgnI2QzcGllJykuYXBwZW5kQ2hpbGQoZDNwaWUoW3tcbiAgICB2YWx1ZTogMTAsXG4gIH0sIHtcbiAgICB2YWx1ZTogMjAsXG4gIH0sIHtcbiAgICB2YWx1ZTogMzAsXG4gIH0sIHtcbiAgICB2YWx1ZTogNDAsXG4gIH1dKSk7XG59O1xuIiwiY29uc3QgdXRpbHMgPSByZXF1aXJlKCcuLi9kM3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKGRhdGEsIG9wdGlvbnMpID0+IHtcbiAgb3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe1xuICAgIG91dGVyUmFkaXVzOiAxMDAsXG4gICAgaW5uZXJSYWRpdXM6IDgwLFxuICAgIHN0YXJ0QW5nbGU6IDAsXG4gIH0sIG9wdGlvbnMpO1xuICBvcHRpb25zLmNvcm5lclJhZGl1cyA9IChvcHRpb25zLm91dGVyUmFkaXVzIC0gb3B0aW9ucy5pbm5lclJhZGl1cykgLyAyO1xuICBjb25zdCBzaXplID0gb3B0aW9ucy5vdXRlclJhZGl1cyAqIDI7XG4gIGNvbnN0IHN2ZyA9IHV0aWxzLm5ld1NWRygpLmF0dHIoe1xuICAgIHdpZHRoOiBzaXplLFxuICAgIGhlaWdodDogc2l6ZSxcbiAgfSlcbiAgLm9uKCdjbGljaycsICgpID0+IHtcbiAgICBjb25zdCBzdmdFbCA9IHN2Z1swXVswXTtcbiAgICB1dGlscy5zdmcyaW1nKHN2Z0VsKS50aGVuKGltZyA9PiB7XG4gICAgICBzdmdFbC5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChpbWcsIHN2Z0VsKTtcbiAgICB9KTtcbiAgfSk7XG4gIGNvbnN0IHRvdGFsID0gZDMuc3VtKGRhdGEsIGl0ZW0gPT4gaXRlbS52YWx1ZSk7XG4gIGNvbnN0IGNvbG9ycyA9IGQzLnNjYWxlLmNhdGVnb3J5MTAoKTtcbiAgY29uc3QgYXJjID0gZDMuc3ZnLmFyYygpXG4gICAgLmlubmVyUmFkaXVzKG9wdGlvbnMuaW5uZXJSYWRpdXMpXG4gICAgLm91dGVyUmFkaXVzKG9wdGlvbnMub3V0ZXJSYWRpdXMpXG4gICAgLmNvcm5lclJhZGl1cyhvcHRpb25zLmNvcm5lclJhZGl1cylcbiAgICAuc3RhcnRBbmdsZSgoZCwgaSkgPT4gZC5zdGFydEFuZ2xlKVxuICAgIC5lbmRBbmdsZSgoZCwgaSkgPT4gZC5lbmRBbmdsZSk7XG4gIGRhdGEucmVkdWNlKChzdGFydEFuZ2xlLCBpdGVtLCBpKSA9PiB7XG4gICAgaXRlbS5zdGFydEFuZ2xlID0gc3RhcnRBbmdsZTtcbiAgICBjb25zdCBlbmRBbmdsZSA9IGl0ZW0uZW5kQW5nbGUgPSBzdGFydEFuZ2xlICsgaXRlbS52YWx1ZSAqIDIgKiBNYXRoLlBJIC8gdG90YWw7XG4gICAgcmV0dXJuIGVuZEFuZ2xlO1xuICB9LCBvcHRpb25zLnN0YXJ0QW5nbGUpO1xuICBzdmcuYXBwZW5kKCdnJylcbiAgLmF0dHIoJ3RyYW5zZm9ybScsIGB0cmFuc2xhdGUoJHtvcHRpb25zLm91dGVyUmFkaXVzfSwke29wdGlvbnMub3V0ZXJSYWRpdXN9KWApXG4gIC5zZWxlY3RBbGwoJ3BhdGgnKVxuICAuZGF0YShkYXRhKVxuICAuZW50ZXIoKVxuICAuYXBwZW5kKCdwYXRoJylcbiAgLmF0dHIoe1xuICAgIGQ6IGFyYyxcbiAgICBmaWxsOiAoZCwgaSkgPT4gZC5jb2xvciB8fCBjb2xvcnMoaSksXG4gIH0pO1xuICByZXR1cm4gc3ZnWzBdWzBdO1xufTtcbiIsIl9pZCA9IDBcbl9mcmFnID0gZG8gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudFxuJCA9IChzZWxlY3RvcikgLT4gZG9jdW1lbnQucXVlcnlTZWxlY3RvciBzZWxlY3RvclxuXG5nZXRJZCA9IC0+IF9pZCArPSAxXG5cbmVuc3VyZVJhbmdlID0gKG51bSwgbWluLCBtYXgpIC0+XG4gIHVubGVzcyBtYXggPT0gbnVsbFxuICAgIG51bSA9IG1heCBpZiBudW0gPiBtYXhcbiAgdW5sZXNzIG1pbiA9PSBudWxsXG4gICAgbnVtID0gbWluIGlmIG51bSA8IG1pblxuICBudW1cblxubmV3U1ZHID0gLT5cbiAgZDMuc2VsZWN0IF9mcmFnXG4gICAgLmFwcGVuZCAnc3ZnJ1xuICAgIC5yZW1vdmUoKVxuXG5hZGRDbGlwUGF0aCA9IChzdmcsIGlkKSAtPlxuICBzdmcuYXBwZW5kICdkZWZzJ1xuICAgIC5hcHBlbmQgJ2NsaXBQYXRoJ1xuICAgIC5hdHRyICdpZCcsIGlkXG5cbiMgaHR0cHM6Ly9naXRodWIuY29tL3dienlsL2QzLW5vdGVzL2Jsb2IvbWFzdGVyL2hlbGxvLWRyb3Atc2hhZG93Lmh0bWxcbiMgaHR0cDovL2NvbW1vbnMub3JlaWxseS5jb20vd2lraS9pbmRleC5waHAvU1ZHX0Vzc2VudGlhbHMvRmlsdGVyc1xuYWRkU2hhZG93RmlsdGVyID0gKHN2ZywgaWQsIHJnYmEgPSBbLjUsIC41LCAuNSwgMV0pIC0+XG4gIGZpbHRlciA9IHN2Zy5hcHBlbmQgJ2RlZnMnXG4gICAgLmFwcGVuZCAnZmlsdGVyJ1xuICAgIC5hdHRyXG4gICAgICBpZDogaWRcbiAgICAgIHdpZHRoOiAxLjRcbiAgICAgIGhlaWdodDogMS40XG4gICAgICB4OiAtLjJcbiAgICAgIHk6IC0uMVxuICBmaWx0ZXIuYXBwZW5kICdmZUNvbG9yTWF0cml4J1xuICAgIC5hdHRyXG4gICAgICB0eXBlOiAnbWF0cml4J1xuICAgICAgdmFsdWVzOlxuICAgICAgICBcIjAgMCAwICN7cmdiYVswXX0gMCBcIiArXG4gICAgICAgIFwiMCAwIDAgI3tyZ2JhWzFdfSAwIFwiICtcbiAgICAgICAgXCIwIDAgMCAje3JnYmFbMl19IDAgXCIgK1xuICAgICAgICBcIjAgMCAwICN7cmdiYVszXX0gMCBcIlxuICBmaWx0ZXIuYXBwZW5kICdmZUdhdXNzaWFuQmx1cidcbiAgICAuYXR0clxuICAgICAgIydpbic6ICdTb3VyY2VBbHBoYSdcbiAgICAgIHN0ZERldmlhdGlvbjogMVxuICAgICAgcmVzdWx0OiAnYmx1cidcbiAgZmlsdGVyLmFwcGVuZCAnZmVPZmZzZXQnXG4gICAgLmF0dHJcbiAgICAgICdpbic6ICdibHVyJ1xuICAgICAgZHg6IDBcbiAgICAgIGR5OiAxXG4gICAgICByZXN1bHQ6ICdvZmZzZXRCbHVyJ1xuICBmZU1lcmdlID0gZmlsdGVyLmFwcGVuZCAnZmVNZXJnZSdcbiAgZmVNZXJnZS5hcHBlbmQgJ2ZlTWVyZ2VOb2RlJ1xuICAgIC5hdHRyICdpbicsICdvZmZzZXRCbHVyJ1xuICBmZU1lcmdlLmFwcGVuZCAnZmVNZXJnZU5vZGUnXG4gICAgLmF0dHIgJ2luJywgJ1NvdXJjZUdyYXBoaWMnXG5cbmFkZExpbmVhckdyYWRpZW50ID0gKHN2ZywgaWQsIHN0b3AwLCBzdG9wMSA9ICd3aGl0ZScpIC0+XG4gIGdyYWRpZW50ID0gc3ZnLmFwcGVuZCAnZGVmcydcbiAgICAuYXBwZW5kICdsaW5lYXJHcmFkaWVudCdcbiAgICAuYXR0clxuICAgICAgaWQ6IGlkXG4gICAgICB4MTogMFxuICAgICAgeTE6IC0uNVxuICAgICAgeDI6IDBcbiAgICAgIHkyOiAxXG4gIGdyYWRpZW50LmFwcGVuZCAnc3RvcCdcbiAgICAuYXR0ciAnb2Zmc2V0JywgMFxuICAgIC5zdHlsZSAnc3RvcC1jb2xvcicsIHN0b3AwXG4gIGdyYWRpZW50LmFwcGVuZCAnc3RvcCdcbiAgICAuYXR0ciAnb2Zmc2V0JywgMVxuICAgIC5zdHlsZSAnc3RvcC1jb2xvcicsIHN0b3AxXG5cbnN2ZzJpbWcgPSAoc3ZnKSAtPiBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSAtPlxuICBzZXJpYWxpemVyID0gbmV3IFhNTFNlcmlhbGl6ZXJcbiAgeG1sID0gc2VyaWFsaXplci5zZXJpYWxpemVUb1N0cmluZyBzdmdcbiAgYmxvYiA9IG5ldyBCbG9iIFt4bWxdLCAodHlwZTogJ2ltYWdlL3N2Zyt4bWwnKVxuICB1cmwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMIGJsb2JcbiAgaW1nID0gbmV3IEltYWdlXG4gIGltZy5zcmMgPSB1cmxcbiAgaW1nLm9ubG9hZCA9IC0+XG4gICAgZHBpID0gd2luZG93LmRldmljZVBpeGVsUmF0aW8gb3IgMVxuICAgIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgJ2NhbnZhcydcbiAgICBjYW52YXMud2lkdGggPSBkcGkgKiBpbWcud2lkdGhcbiAgICBjYW52YXMuaGVpZ2h0ID0gZHBpICogaW1nLmhlaWdodFxuICAgIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0ICcyZCdcbiAgICBjdHguc2NhbGUgZHBpLCBkcGlcbiAgICBjdHguZHJhd0ltYWdlIGltZywgMCwgMFxuICAgIGRJbWcgPSBuZXcgSW1hZ2VcbiAgICBkSW1nLnNyYyA9IGRvIGNhbnZhcy50b0RhdGFVUkxcbiAgICBkSW1nLnN0eWxlLndpZHRoID0gaW1nLndpZHRoICsgJ3B4J1xuICAgIGRJbWcuc3R5bGUuaGVpZ2h0ID0gaW1nLmhlaWdodCArICdweCdcbiAgICByZXNvbHZlIGRJbWdcbiAgICBVUkwucmV2b2tlT2JqZWN0VVJMIHVybFxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gICQ6ICRcbiAgZ2V0SWQ6IGdldElkXG4gIGVuc3VyZVJhbmdlOiBlbnN1cmVSYW5nZVxuICBuZXdTVkc6IG5ld1NWR1xuICBhZGRDbGlwUGF0aDogYWRkQ2xpcFBhdGhcbiAgYWRkU2hhZG93RmlsdGVyOiBhZGRTaGFkb3dGaWx0ZXJcbiAgYWRkTGluZWFyR3JhZGllbnQ6IGFkZExpbmVhckdyYWRpZW50XG4gIHN2ZzJpbWc6IHN2ZzJpbWdcbiJdfQ==
