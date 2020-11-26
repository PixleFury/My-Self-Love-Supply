const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');

// Override the home layout to display the admin layout
router.all('/*', (req, res, next)=>{

	req.app.locals.layout = 'admin';
	next();

});

router.get('/', (req, res)=>{

	Post.find({})
	.lean()
	.then(posts => {
		res.render('admin/posts', { posts: posts });
	});
});

router.get('/create', (req, res)=>{

	res.render('admin/posts/create');
});

// Converting checkbox to boolean for database storage
router.post('/create', (req, res)=>{

let allowComments = true;

if(req.body.allowComments){

	allowComments = true;

} else{

	allowComments = false;
}

	const newPost = new Post({

		title: req.body.title,
		status: req.body.status,
		allowComments: allowComments,
		body: req.body.body

	});

	newPost.save().then(savedPost =>{

		console.log(savedPost);

		res.redirect('/admin/posts');
	}).catch(error => {

		console.log('could not save post');
	});
});

//Query to get post ID from database to display full fields in edit post page
router.get('/edit/:id', (req, res) => {

	Post.findById(req.params.id)
	.lean()
	.then(post => {
		res.render('admin/posts/edit', { post: post });
	}).catch(error => console.log("Cannot get all the posts"));

});

module.exports = router;