require.extensions['.less'] = function(m, filename) {
  m._compile('', filename);
};
