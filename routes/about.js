var express = require("express");
var router = express.Router();

// Site homepage
router.get("/", function(req, res, next) {
  res.render("about", {});
});

module.exports = router;
