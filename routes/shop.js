const https = require("https"), path = require("path");
const express = require("express");
const { request } = require("express");
const router = express.Router();
const graphql = require("shopify");

const api_settings = {
	key: "021b74c9a0db6e2a2ae1521ee80ebd82",
	password: "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",
	version: "2020-10",
	shop: "peexee-corp-dev-store"
}

const api = new graphql.ShopifyServer(
	api_settings.key, api_settings.password,
	api_settings.version, api_settings.shop
)

// Shop homepage
router.get("/", (req, res) => {
	res.sendFile("shop.html", {root: path.join(__dirname, "../public")});
})

// Get all products
router.get("/api/products", (req, res) => {
	res.json(api.products);
})

// Get indiviual product
router.get("/api/product/:id", (req, res) => {
	product = api.get_product(req.params.id);
	if (product != null) {
		res.json(product);
	} else {
		res.status(404).send("Product not found!");
	}
})

// Update product info
router.post("/api/product/:id", (req, res) => {
	let product = api.get_product(req.params.id);

	if ("title" in req.body && req.body.title != null) {
		product.set_title(req.body.title)
	}
	if ("desc" in req.body && req.body.desc != null) {
		product.set_desc(req.body.desc)
	}

	api.update_product(req.params.id);
})

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
})

module.exports = router;