const express = require('express');
const router = express.Router();

// Override the home layout to display the admin layout
router.all('/*', (req, res, next)=>{

	req.app.locals.layout = 'admin';
	next();

});

// Routes for Admin index page
router.get('/', (req, res)=>{

    res.render('admin/index');

});


module.exports = router;