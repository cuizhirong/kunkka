module.exports = function(ctx, str, maxWidth) {
  let width = ctx.measureText(str).width,
    ellipsis = '...',
    ellipsisWidth = ctx.measureText(ellipsis).width;

  if (width <= maxWidth || width <= ellipsisWidth) {
    return str;
  } else {
    let len = str.length;
    while (width >= maxWidth - ellipsisWidth && len-- > 0) {
      str = str.substring(0, len);
      width = ctx.measureText(str).width;
    }
    return str + ellipsis;
  }
};
