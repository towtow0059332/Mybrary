const express = require('express');
const router = express.Router();
const Author = require('../models/author');
const Book = require('../models/book');

//all authors route
router.get('/', async (req, res) => {
    let searchOptions = {};

    if (req.query.name) {
        searchOptions.name = new RegExp(req.query.name, 'i');
        // console.log(searchOptions.name);
    }

    try {
        const authors = await Author.find(searchOptions);
        // console.log(authors);
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
        // res.redirect(`authors`);
    } catch {
        res.render('authors/new', {
            author: author,
            errorMessage: `error creating author`
        });
    }

    // author.save((err, newAuthor) => {
    //     if (err) {
    //         let locals = {errorMessage: `error creating author`};
    //         res.render('authors/new', {
    //             author: author,
    //             locals
    //         });
    //     } else {
    //         // res.redirect(`author/${newAuthor.id}`);
    //         res.redirect('authors');
    //     }
    // });
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
        // console.log(err);
        res.redirect('/');
    }
});

router.get('/:id/edit', async (req, res) => {
    try {
        const author = await Author.findById(req.params.id);
        // console.log(req.params.id);
        // console.log(author);
        res.render('authors/edit', {author: author});
    } catch (err) {
        console.error(err);
    }
});

router.put('/:id', async (req, res) => {
    let author;
    try {
        author = await Author.findById(req.params.id).exec();
        // const authors = await Author.find({});
        // console.log(author);
        // console.log(authors);
        // console.log(req.params.id);

        // let author2 = Author.findById(req.params.id);

        // let author3 = await Author.findOne({_id: req.params.id});

        // console.log(req.params.id);
        // console.log('await author: ' + await Author.findById(req.params.id));
        // console.log('author2: ' + author2);
        // console.log('author3: ' + author3);
        // console.log('author: ' + Author.findById(req.params.id));
        // console.log(author);
        // console.log(req.body.authorName);
        author.name = req.body.authorName;
        console.log(author);

        await author.save();
        res.redirect(`${author.id}`);
    } catch (err) {
        // console.error(err);
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
        // console.error(err);
        if (!author) {
            res.redirect('/');
        } else {
            res.redirect(`/authors/${author.id}`);
        }
    }
});

module.exports = router;