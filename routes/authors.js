const express = require('express');
const router = express.Router();
const Author = require('../models/author');
const Book = require('../models/book');

//all authors route
router.get('/', async (req, res) => {
    let searchOptions = {};

    if (req.query.name) {
        searchOptions.name = new RegExp(req.query.name, 'i');
    }

    try {
        const authors = await Author.find(searchOptions);
        res.render('authors/index', {
            authors: authors,
            searchOptions: req.query
        });
    } catch {
        res.redirect('/');
    }
});

//new author route
router.get('/new', (req, res) => {
    res.render('authors/new', {author: new Author()});
});

// create author route
router.post('/', async (req, res) => {
    const author = new Author({
        name: req.body.authorName
    });

    try {
        const newAuthor = await author.save();
        res.redirect(`authors/${newAuthor.id}`);
    } catch {
        res.render('authors/new', {
            author: author,
            errorMessage: `error creating author`
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const author = await Author.findById(req.params.id);
        const books = await Book.find({author: author.id}).exec();
        res.render('authors/show', {
            author: author,
            booksByAuthor: books
        });
    } catch (err) {
        res.redirect('/');
    }
});

router.get('/:id/edit', async (req, res) => {
    try {
        const author = await Author.findById(req.params.id);
        res.render('authors/edit', {author: author});
    } catch (err) {
        console.error(err);
    }
});

router.put('/:id', async (req, res) => {
    let author;
    try {
        author = await Author.findById(req.params.id).exec();
        author.name = req.body.authorName;
        await author.save();
        res.redirect(`${author.id}`);
    } catch (err) {
        if (!author) {
            res.redirect('/');
        } else {
            res.render('authors/edit', {
                author: author,
                errorMessage: 'error updating author'
            });
        }
    }
});

router.delete('/:id', async (req, res) => {
    let author;
    try {
        author = await Author.findById(req.params.id).exec();
        author.name = req.body.authorName;
        await author.remove();
        res.redirect(`/authors`);
    } catch (err) {
        if (!author) {
            res.redirect('/');
        } else {
            res.redirect(`/authors/${author.id}`);
        }
    }
});

module.exports = router;