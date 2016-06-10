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
