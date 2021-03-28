const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');

const Post = require('../models/post');

exports.getPosts = (req, res, next) => {
	Post.find().then((posts) => {
		res
			.status(200)
			.json({ message: 'Fetched posts successfully.', posts: posts });
	});
};

exports.createPost = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new Error('Validation failed, entered data is incorrect.');
		error.statusCode = 422;
		throw error;
	}
	if (!req.file) {
		const error = new Error('No image provided.');
		error.statusCode = 422;
		throw error;
	}

	const title = req.body.title;
	const imageUrl = req.file.path;
	const content = req.body.content;

	const post = new Post({
		title: title,
		imageUrl: imageUrl,
		content: content,
		creator: { name: 'Gagan' },
	});
	post
		.save()
		.then((result) => {
			res.status(201).json({
				message: 'Post has been successfully saved.',
				post: result,
			});
		})
		.catch((errors) => {
			if (!errors.statusCode) {
				errors.statusCode = 500;
			}
			next(err);
		});
};

exports.getPost = (req, res, next) => {
	const postId = req.params.postId;
	Post.findById(postid)
		.then((post) => {
			if (!post) {
				const error = new Error('Could Not find any post.');
				error.statusCode = 404;
				throw error;
			}
			res.status(200).json({ message: 'Post fetched.' });
		})
		.catch((errors) => {
			if (!errors.statusCode) {
				errors.statusCode = 500;
			}
			next(err);
		});
};

exports.updatePost = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new Error('Validation failed, entered data is incorrect.');
		error.statusCode = 422;
		throw error;
	}
	const postId = req.params.postId;
	const title = req.body.title;
	const content = req.body.content;
	let imageUrl = req.body.imageUrl;
	if (req.file) {
		imageUrl = req.file.path;
	}
	if (!imageUrl) {
		const error = new Error('No file picked.');
		error.statusCode = 422;
		throw error;
	}
	Post.findById(postId)
		.then((post) => {
			if (!post) {
				const error = new Error('Could Not find any post.');
				error.statusCode = 404;
				throw error;
			}
			if (imageUrl !== post.imageUrl) {
				clearImage(post.imageUrl);
			}
			post.title = title;
			post.imageUrl = imageUrl;
			post.content = content;
			return post.save();
		})
		.then((result) => {
			res.status(200).json({ message: 'Post updated.', post: result });
		})
		.catch((errors) => {
			if (!errors.statusCode) {
				errors.statusCode = 500;
			}
			next(err);
		});
};

exports.deletePost = (req, res, next) => {
	const postId = req.params.postId;
	Post.findById(postId)
		.then((post) => {
			if (!post) {
				const error = new Error('Could Not find any post.');
				error.statusCode = 404;
				throw error;
			}
			//Check if the loggedIn user created this post
			clearImage(post.imageUrl);
			return Post.findByIdAndRemove(postId);
		})
		.then((result) => {
			console.log(result);
			res.status(200).json({ message: 'Deleted post.' });
		})
		.catch((errors) => {
			if (!errors.statusCode) {
				errors.statusCode = 500;
			}
			next(err);
		});
};

const clearImage = (filepath) => {
	filepath = path.join(__dirname, '..', filePath);
	fs.unlink(filePath, (err) => console.log(err));
};
