const express = require('express');
const router = express.Router();
const Book = require('../models/book');
const Author = require('../models/author');
const Multer = require('multer');
const Path = require('path');
const fs = require('fs');

const uploadPath = Path.join('public', Book.coverImageBasePath);
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];

const upload = Multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype));
    }
});

//all books route
router.get('/', async (req, res) => {
    let query = Book.find();

    if (req.query.title) {
        query = query.regex('title', new RegExp(req.query.title, 'i'));
        // console.log(query);
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
        // console.log(req.query)
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
router.post('/', upload.single('coverImage'), async (req, res) => {
    const fileName = req.file != null ? req.file.filename : null;

    // TODO log twice
    // console.log('author: ' + req.body.author);

    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        coverImageName: fileName,
        description: req.body.description
    });

    try {
        const newBook = await book.save();
        // res.redirect(`books/${newBook.id}`);
        // console.log(book);
        res.redirect(`books`);
    } catch (err) {
        // console.log('err: ' + err);
        if (book.coverImageName != null) {
            removeBookCover(book.coverImageName);
        }
        renderNewPage(res, book, true);
    }
});

async function renderNewPage(res, book, hasError = false) {
    try {
        const authors = await Author.find({});
        const params = {
            authors: authors,
            book: book
        }
        if (hasError) params.errorMessage = 'error creating book';
        res.render(`books/new`, params);
    } catch {
        res.redirect('/books');
    }
}

function removeBookCover(fileName) {
    fs.unlink(Path.join(uploadPath, fileName), err => {
        if (err) {
            console.error('err: ' + err);
        }
    });
}

module.exports = router;