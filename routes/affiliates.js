const https = require("https"), path = require("path");
const express = require("express");
const { request } = require("express");
const router = express.Router();
const { RSA_NO_PADDING } = require("constants");
const { fstat } = require("fs");
const fs = require("fs");
const { stringify } = require("querystring");


router.get("/", (req, res) => {
	let f = fs.readFile("./public/data/affiliates.json", (err, data) => {
		let json = JSON.parse(data);
		res.render("affiliates", {affiliates: json});
	});
});

module.exports = router;