const textEllipsis = require('./text_ellipsis');

module.exports = {
  /**
   * Draws a rounded rectangle using the current state of the canvas.
   * If you omit the last three params, it will draw a rectangle
   * outline with a 5 pixel border radius
   * @param {CanvasRenderingContext2D} ctx
   * @param {Number} x The top left x coordinate
   * @param {Number} y The top left y coordinate
   * @param {Number} width The width of the rectangle
   * @param {Number} height The height of the rectangle
   * @param {Number} [radius = 5] The corner radius; It can also be an object
   *                 to specify different radii for corners
   * @param {Number} [radius.tl = 0] Top left
   * @param {Number} [radius.tr = 0] Top right
   * @param {Number} [radius.br = 0] Bottom right
   * @param {Number} [radius.bl = 0] Bottom left
   * @param {Boolean} [isStroke = false] Whether to stroke the rectangle.
   */
  roundRect: function(ctx, x, y, width, height, radius, color, isStroke) {
    if (typeof radius === 'number') {
      radius = {
        tl: radius,
        tr: radius,
        br: radius,
        bl: radius
      };
    }
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();

    if (isStroke) {
      ctx.strokeStyle = color;
      ctx.stroke();
    } else {
      ctx.fillStyle = color;
      ctx.fill();
    }
  },
  text: function(ctx, text, x, y, color, textAlign, maxWidth) {
    ctx.fillStyle = color;
    ctx.textBaseline = 'middle';
    ctx.textAlign = textAlign ? textAlign : 'start';
    if (maxWidth) {
      ctx.fillText(textEllipsis(ctx, text, maxWidth), x, y, maxWidth);
    } else {
      ctx.fillText(text, x, y);
    }
  }
};
