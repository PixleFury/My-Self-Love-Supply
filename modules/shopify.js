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

	from_json(obj, type) {
		let fields = {};
		let api_id;

		for (const k in obj) {
			if (k == "id") {
				api_id = obj.id;
				continue;
			}

			console.log(`${k}: ${typeof(obj[k])}`);
			if (typeof(obj[k]) == "object") {
				console.log(obj[k]);
				if (Array.isArray(obj[k])) {
					fields[k] = [];
					obj[k].forEach(item => fields[k].push(
						this.from_json(item, {"images": "Image", "products": "Product", "variants": "ProductVariant"}[k])
					));
				} else { // Plain object
					fields[k] = this.from_json(
						obj[k],
						{"images": "Image", "products": "Product", "variants": "ProductVariant"}[k]
					);
				}
			} else {
				fields[k] = obj[k];
			}
		}

		let x = new ShopifyObject(api_id, type, fields); 
		console.log(x);
		return x;
	}

	populate_from_api() {
		this.products.length = 0; // Clear list
		this.api_get("products", ["id", "title", "body_html", "variants", "images"], data => {
			if ("products" in data) {
				this.products = data.products;
				console.log(this.products);
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

		let json = product.dirty_fields();
		json.id = product.api_id;

		this.api_put(`products/${id}`, {product: json}, data => console.log(data));
		//product.clean();
	}
}


class ShopifyObject {
	constructor(api_id, type, fields) {
		this.api_id = api_id;
		this.type = type;

		this.fields = fields;
	}

	get(key) {
		return this.fields[key].value;
	}

	set(key, value) {
		this.fields[key] = value;
		this.fields[key].dirty = true;
	}

	is_dirty(key) {
		return this.fields[key].dirty;
	}

	clean() {
		for (const k in this.fields) {
			this.fields[k].dirty = false;
		}
	}

	flat_fields() {
		let flat = {api_id: this.api_id};
		for (const k in this.fields) {
			if (typeof(this.fields[k].value) == "object") {
				if (Array.isArray(this.fields[k].value)) {
					flat[k] = [];
					this.fields[k].value.forEach(val => flat[k].push(typeof(val) == "object" ? val.flat_fields() : val));
				} else {
					flat[k] = this.fields[k].value.flat_fields;
				}
			} else {
				flat[k] = this.fields[k].value;
			}
		}
		return flat;
	}
}


exports.ShopifyServer = ShopifyServer