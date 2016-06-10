const utils = require('./d3utils');

module.exports = (data, options) => {
  function addArc(startAngle, endAngle, attrs) {
    const arc = d3.svg.arc()
    .innerRadius(options.innerRadius)
    .outerRadius(options.outerRadius)
    .cornerRadius(options.cornerRadius)
    .startAngle(startAngle)
    .endAngle(endAngle);
    svg.append('path')
    .attr(attrs)
    .attr({
      d: arc,
      transform: `translate(${options.outerRadius},${options.outerRadius})`,
    });
  }
  options = Object.assign({
    outerRadius: 100,
    innerRadius: 80,
  }, options);
  options.cornerRadius = (options.outerRadius - options.innerRadius) / 2;
  const size = options.outerRadius * 2;
  const svg = utils.newSVG().attr({
    width: size,
    height: size,
  });
  const total = d3.sum(data, item => item.value);
  const colors = d3.scale.category10();
  data.reduce((startAngle, item, i) => {
    const endAngle = startAngle + item.value * 2 * Math.PI / total;
    addArc(startAngle, endAngle, {fill: item.color || colors(i)});
    return endAngle;
  }, 0);
  return svg[0][0];
};
