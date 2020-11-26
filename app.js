// Importing modules
const express = require('express');
const app = express();
const path = require('path');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Handlebars = require('handlebars');

// Configure Mongoose to connect to MongoDB
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/mslsdb', {useNewUrlParser: true}).then((db=>{

console.log('MONGO connected');

})).catch(error=> console.log(error));

// Configure express
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
const {select} = require('./helpers/handlebars-helpers');
app.engine('handlebars', exphbs({defaultLayout: 'home', helpers: {select: select}}));
app.set('view engine', 'handlebars');

// Body Parser 

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
// Load routes 
const home = require('./routes/home/index');
const admin = require('./routes/admin/index');
const posts = require('./routes/admin/posts');
const { handlebars } = require('hbs');

// Use routes
app.use('/', home);
app.use('/admin', admin);
app.use('/admin/posts', posts);

// Creating a webserver :: 3000
app.listen(3000, ()=>{

    console.log('listening on port 3000');
});











