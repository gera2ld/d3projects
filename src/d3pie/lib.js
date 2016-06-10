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
