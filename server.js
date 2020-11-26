const path = require("path");
const express = require("express");

const app = express()
const port = 3000;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded());

app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views"));
// app.set("view engine", "jade");

const indexRouter = require("./routes/index");
app.use('/', indexRouter);

const shopRouter = require("./routes/shop")
app.use('/shop', shopRouter);

const affiliatesRouter = require("./routes/affiliates")
app.use('/affiliate-products', affiliatesRouter);

app.listen(port, () => {
	console.log(`Server listening on port ${port}`);
})

