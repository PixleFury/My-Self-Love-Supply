const https = require("https"), path = require("path");
const express = require("express");
const { request } = require("express");
const router = express.Router();
const shopify = require("../modules/shopify.js");
const { RSA_NO_PADDING } = require("constants");

const api_settings = {
	key: "021b74c9a0db6e2a2ae1521ee80ebd82",
	password: "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",
	version: "2020-10",
	shop: "peexee-corp-dev-store"
}

const api = shopify.server;
api.auth(
	api_settings.key, api_settings.password,
	api_settings.version, api_settings.shop
);

// Shop homepage
router.get("/", (req, res) => {
	if ("editor" in req.body) {
		res.sendFile("shop.html", {root: path.join(__dirname, "../public")});
		console.log("Shop Editor");
	} else {
		res.sendFile("shop.html", {root: path.join(__dirname, "../public")});
	}
});

router.get("/:id", (req, res) => {
	let product = api.get_product(req.params.id);
	if (product == null) {
		res.render("error", {code: 404, status: "Not found"});
	} else if ("editor" in req.query) {
		res.render("shop-product-editor", product);
	} else {
		res.render("shop-product", product);
	}
});

// Get all products
router.get("/api/products", (req, res) => {
	res.json(api.products);
});

// Get indiviual product
router.get("/api/product/:id", (req, res) => {
	product = api.get_product(req.params.id);
	if (product != null) {
		res.json(product);
	} else {
		res.status(404).send("Product not found!");
	}
});

// Update product info
router.post("/api/product/:id", (req, res) => {
	console.log(req.body);
	let product = api.get_product(req.params.id);

	if ("title" in req.body && req.body.title != null) {
		product.title = req.body.title;
		product.title_changed = true;
	}
	if ("desc" in req.body && req.body.desc != null) {
		product.desc = req.body.desc;
		product.desc_changed = true;
	}
	if ("icon" in req.body && req.body.desc != null) {
		product.icon = req.body.icon;
		product.icon_changed = true;
	}
	if ("price" in req.body && req.body.price != null) {
		product.price = req.body.price;
		product.price_changed = true;
	}

	// api.update_product(req.params.id);
	res.redirect(307, `/shop/${product.api_id}`);
});

// Create product
router.post("/api/create-product", (req, res) => {
	let product = api.create_product(req.body.title, req.body.desc);

	query_api(`
		mutation {
			productCreate(input: {
				title: "${req.body.title}"
				descriptionHtml: "${req.body.desc}"
			}) {
				product {
					id
				}
				userErrors {
					field
					message
				}
			}
		}
	`, data => {
		console.log(data);
		res.json({id: data.data.productCreate.product.id});
	});
});

module.exports = router;