const express = require('express');
const router = express.Router();

// Override the home layout to display the admin layout
router.all('/*', (req, res, next)=>{

	req.app.locals.layout = 'home';
	next();

});

// Routes for home page
router.get('/', (req, res)=>{

    res.render('home/index');

});

router.get('/about', (req, res)=>{

    res.render('home/about');

});

router.get('/login', (req, res)=>{

    res.render('home/login');

});

router.get('/register', (req, res)=>{

    res.render('home/register');

});

module.exports = router;