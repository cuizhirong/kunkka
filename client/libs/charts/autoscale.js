// https://github.com/component/autoscale-canvas/blob/master/index.js

/**
 * Retina-enable the given `canvas`.
 *
 * @param {Canvas} canvas
 * @return {Canvas}
 * @api public
 */

module.exports = function(canvas, opt) {
  var ctx = canvas.getContext('2d');
  var ratio = window.devicePixelRatio || 1;

  canvas.style.width = opt.width + 'px';
  canvas.style.height = opt.height + 'px';
  canvas.width = opt.width * ratio;
  canvas.height = opt.height * ratio;
  ctx.scale(ratio, ratio);

  return canvas;
};
