'use strict';

module.exports = function (key, vals, link, page, limit) {
  page = page ? parseInt(page, 10) : 1;
  limit = limit ? parseInt(limit, 10) : 0;
  let totalPage = 1;
  let theLimit = limit ? `&limit=${limit}` : '';
  let keyLink = `${key}_links`;
  let obj = {
    [key]: vals,
    [keyLink]: []
  };
  if (limit > 0) {
    totalPage = Math.ceil(vals.length / limit);
    obj[key] = vals.slice((page - 1) * limit, page * limit);
    if (page > 1) {
      obj[keyLink].push({
        href: `${link}?page=${page - 1}${theLimit}`,
        rel: 'prev'
      });
    }
    if (totalPage > page) {
      obj[keyLink].push({
        href: `${link}?page=${page + 1}${theLimit}`,
        rel: 'next'
      });
    }
  }
  vals = null;
  return obj;
};
