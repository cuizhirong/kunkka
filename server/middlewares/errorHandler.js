module.exports = function (err, req, res, next) {
  if (req.xhr) {
    res.status(500).json({error: err.message});
  } else {
    res.status(500).json({error: err});
  }
};
