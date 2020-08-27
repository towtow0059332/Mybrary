const express = require('express');
const router = express.Router();
const Book = require('../models/book');
const Author = require('../models/author');

const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];

//all books route
router.get('/', async (req, res) => {
    let query = Book.find();

    if (req.query.title) {
        query = query.regex('title', new RegExp(req.query.title, 'i'));
    }
    if (req.query.publishedBefore) {
        query = query.lte('publishDate', req.query.publishedBefore);
        console.log('publishedBefore: ' + req.query.publishedBefore);
    }
    if (req.query.publishedAfter) {
        query = query.gte('publishDate', req.query.publishedAfter);
        console.log('publishedAfter: ' + req.query.publishedAfter);
    }

    try {
        const books = await query.exec();
        res.render('books/index', {
            books: books,
            searchOptions: req.query
        });
    } catch (err) {
        res.redirect('/');
    }
});

//new book route
router.get('/new', async (req, res) => {
    renderNewPage(res, new Book());
});

// create book route
router.post('/', async (req, res) => {
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        description: req.body.description
    });
    saveCover(book, req.body.coverImage);

    try {
        const newBook = await book.save();
        res.redirect(`books/${newBook.id}`);
    } catch (err) {
        await renderNewPage(res, book, true);
    }
});

//show book route
router.get('/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id).populate('author').exec();
        console.log(book);
        res.render('books/show', {book: book})
    } catch (err) {
        res.redirect('/');
    }
});

// edit book route
router.get('/:id/edit', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        await renderEditPage(res, book);
    } catch (err) {
        res.redirect('/');
    }
});

//update book route
router.put('/:id', async (req, res) => {
    let book;
    try {
        book = await Book.findById(req.params.id);
        book.title = req.body.title;
        book.author = req.body.author;
        book.publishDate = new Date(req.body.publishDate);
        book.pageCount = req.body.pageCount;
        book.description = req.body.description;

        if (req.body.coverImage) {
            saveCover(book, req.body.coverImage);
        }
        await book.save();

        res.redirect(`${book.id}`);
    } catch (err) {
        if (book) {
            await renderEditPage(res, book, true);
        } else {
            res.redirect('/');
        }
    }
});

// delete book page
router.delete('/:id', async (req, res) => {
    let book;
    try {
        book = await Book.findById(req.params.id);
        await book.remove();
        res.redirect('/books');
    } catch {
        if (book) {
            res.render('/books/show', {
                book: book,
                errorMessage: 'could not remove book'
            });
        } else {
            res.redirect('/');
        }
    }
});

async function renderEditPage(res, book, hasError = false) {
    await renderFormPage(res, book, 'edit', hasError);
};

async function renderNewPage(res, book, hasError = false) {
    await renderFormPage(res, book, 'new', hasError);
};

function saveCover(book, coverEncoded) {
    if (!coverEncoded) return;
    const cover = JSON.parse(coverEncoded);
    if (cover && imageMimeTypes.includes(cover.type)) {
        book.coverImage = new Buffer.from(cover.data, 'base64');
        book.coverImageType = cover.type;
    }
};

async function renderFormPage(res, book, form, hasError = false) {
    try {
        const authors = await Author.find({});
        const params = {
            authors: authors,
            book: book
        }
        if (hasError) {
            let error;
            if (form === 'edit') error = 'updating';
            else error = 'creating';
            params.errorMessage = `error ${error} book`;
        }
        res.render(`books/${form}`, params);
    } catch {
        res.redirect('/books');
    }
};

module.exports = router;