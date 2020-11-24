const https = require("https"), path = require("path");
const { query } = require("express");
const e = require("express");


// const api_converter_map = {
// 	"product": ShopifyProduct,
// 	"image": ShopifyImage,
// 	"variant": ShopifyVariant,
// }


class ShopifyServer {
	constructor(version, shop) {
		this.api_version = version;
		this.shop_name = shop;

		this.products = [];
	}

	auth(key, password) {
		this.api_url = `https://${this.shop_name}.myshopify.com/admin/api/${this.api_version}/`;
		this.auth = Buffer.from(`${key}:${password}`, "utf-8").toString("base64");
	}

	api_get(resource, params, callback) {
		let url_arr = [this.api_url, `${resource}.json`]

		if (params.length > 0) {
			url_arr.push("?fields=");
			url_arr.push(params.join());
		}

		let url = url_arr.join("");
		console.log(url);

		let req = https.request(url, {method: "GET"}, res => {
			let data = "";
	
			res.on("data", d => data += d)
			res.on("end", () => {
				callback(JSON.parse(data))
			})
	
			res.on("error", (error) => {
				console.log("" + error);
			})
		});
	
		req.setHeader("Authorization", `Basic ${this.auth}`);
		req.setHeader("Content-Type", "application/json");
		req.end();
	}

	api_post(resource, object, callback) {

	}

	api_put(resource, object, callback) {
		let url = this.api_url + `${resource}.json`;
		console.log(url);

		let req = https.request(url, {method: "PUT"}, res => {
			let data = "";
	
			res.on("data", d => data += d)
			res.on("end", () => {
				callback(data)
			})
	
			res.on("error", (error) => {
				console.log("" + error);
			})
		});

		req.setHeader("Authorization", `Basic ${this.auth}`);
		req.setHeader("Content-Type", "application/json");
		req.end(JSON.stringify(object))
	}

	populate_from_api() {
		this.products.length = 0; // Clear list
		this.api_get("products", ["id", "title", "body_html", "variants", "images"], data => {
			if ("products" in data) {
				data.products.forEach(product => {
					let shopify_product = new ShopifyProduct(product);
					this.products.push(shopify_product);
					// console.log(shopify_product);
				});
			}
		});
	}

	get_product(id) {
		return this.products.find(product => product.api_id == id);
	}

	update_product(id) {
		let product = this.get_product(id);
		if (product == null || product == undefined) {
			res.render("error", {code: 500, status: "invalid product id"});
			return;
		}

		let json = product.get_update_json();
		this.api_put(`products/${id}`, {product: json}, data => console.log(data));
	}
}

class ShopifyObject {
	constructor(api_id, type) {
		this.api_id = api_id;
		this.type = type;
	}
}

class ShopifyProduct extends ShopifyObject {
	constructor(fields) {
		super(fields["id"], "Product");

		this.title = fields["title"];
		this.description = fields["body_html"];

		this.variants = [];
		fields["variants"].forEach(variant => this.variants.push(new ShopifyProductVariant(variant)));

		this.images = [];
		fields["images"].forEach(img => this.images.push(new ShopifyImage(img)));
	}

	get_update_json() {
		let variants = [];
		this.variants.forEach(variant => variants.push(variant.get_update_json()));

		let images = [];
		this.images.forEach(img => images.push(img.get_update_json()));

		return {
			id: this.api_id,
			title: this.title,
			body_html: this.description,
			variants: variants,
			images: images
		}
	}
}

class ShopifyImage extends ShopifyObject {
	constructor(fields) {
		super(fields["id"], "Image");

		this.src = fields["attachment"];
	}

	get_update_json() {
		return {
			id: this.api_id,
			attachment: this.src
		}
	}
}

class ShopifyProductVariant extends ShopifyObject {
	constructor(fields) {
		super(fields["id"], "ProductVariant");

		this.price = fields["price"];
	}

	get_update_json() {
		return {
			id: this.api_id,
			price: this.price
		}
	}
}

exports.ShopifyServer = ShopifyServer;
exports.ShopifyProduct = ShopifyProduct;
exports.ShopifyImage = ShopifyImage;
exports.ShopifyProductVariant = ShopifyProductVariant;