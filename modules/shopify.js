const https = require("https"), path = require("path");
const { query } = require("express");

class ShopifyServer {
	constructor(key, password, version, shop) {
		this.api_settings = {
			key: key, password, password, version: version, shop: shop
		}
		this.api_url = `https://${this.api_settings.shop}.myshopify.com/admin/api/${this.api_settings.version}/graphql.json`;
		this.auth = Buffer.from(`${this.api_settings.key}:${this.api_settings.password}`, "utf-8").toString("base64");

		this.products = [];

		this.populate_products();
	}

	query(query, callback) {
		let req = https.request(this.api_url, {method: "POST"}, (res) => {
			let data = "";
	
			res.on("data", d => data += d)
			res.on("end", () => {
				console.log(data);
				callback(JSON.parse(data))
			})
	
			res.on("error", (error) => {
				console.log("" + error);
			})
		});
	
		req.setHeader("Authorization", `Basic ${this.auth}`);
		req.setHeader("Content-Type", "application/json");
		req.end(JSON.stringify({query: query}))
	}

	populate_products() {
		this.products.length = 0; // Clear array

		this.query(
			`query { shop { products(first: 5) {
				edges { node {
					id
					title
					descriptionHtml
					featuredImage {originalSrc}
					variants(first: 1) {
						edges { node { price } }
					}
				} }
			} } }`
		, data => {
			let x;
			if ("data" in data && data.data != null) {x = data.data;}
			if ("shop" in x && x.shop != null) {x = x.shop;}
			if ("products" in x && x.products != null) {x = x.products;}
			if ("edges" in x && x.edges != null) {x = x.edges;}

			x.forEach(productData => {
				if ("node" in productData && productData.node != null) {productData = productData.node;}

				let product = new Product();

				if ("id" in productData && productData.id != null) {
					let arr = productData.id.split("/");
					product.api_id = arr[4];
				}
				if ("title" in productData && productData.title != null) {
					product.title = productData.title;
				}
				if ("descriptionHtml" in productData && productData.descriptionHtml != null) {
					product.desc = productData.descriptionHtml;
				}
				if ("featuredImage" in productData && productData.featuredImage != null) {
					if ("originalSrc" in productData.featuredImage && productData.featuredImage.originalSrc != null) {
						product.icon = productData.featuredImage.originalSrc;
					}
				}
				if ("variants" in productData && productData.variants != null) {
					if ("edges" in productData.variants && productData.variants.edges != null) {
						if ("node" in productData.variants.edges && productData.variants.edges.node != null) {
							if ("price" in productData.variants.edges.node && productData.variants.edges.node.price != null) {
								product.price = productData.variants.edges.node.price;
							}
						}
					}
				}

				this.products.push(product);
			});
		});
	}

	get_product(id) {
		// id = `gid://shopify/Product/${id}`
		return this.products.find(product => product.api_id == id);
	}

	update_product(id) {
		let product = this.get_product(id);

		let query = [
			"mutation {",
				"productUpdate(input: {",
				`id: "gid://shopify/Product/${product.api_id}"`,
				(product.title_changed) ? `title: "${product.title}"` : "",
				(product.desc_changed) ? `descriptionHtml: "${product.desc}"` : "",
			"}) {",
				"userErrors {",
					"field",
					"message",
				"}",
			"}"
		].join("\n");

		this.query(query, data => {
			res.json({});
		});
	}
}

class Product {
	constructor() {
		this.api_id = "NO_API_ID";
		
		this.title = "NO_TITLE";
		this.title_changed = false;
		
		this.desc = "NO_DESCRIPTION";
		this.desc_changed = false;

		this.price = 0;
		this.price_changed = false;

		this.icon = "NO_ICON";
		this.icon_changed = false;
	};
}

exports.ShopifyServer = ShopifyServer;
exports.Product = Product;