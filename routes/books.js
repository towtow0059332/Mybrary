const express = require('express');
const router = express.Router();
const Book = require('../models/book');
const Author = require('../models/author');
const Path = require('path');
// const fs = require('fs');

const uploadPath = Path.join('public', Book.coverImageBasePath);
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];

// const upload = Multer({
//     dest: uploadPath,
//     fileFilter: (req, file, callback) => {
//         callback(null, imageMimeTypes.includes(file.mimetype));
//     }
// });

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
router.post('/', async (req, res) => {
    // const fileName = req.file != null ? req.file.filename : null;

    // TODO log twice
    // console.log('author: ' + req.body.author);

    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        // coverImageName: fileName,
        description: req.body.description
    });
    // console.log(book);
    saveCover(book, req.body.coverImage);

    try {
        const newBook = await book.save();
        res.redirect(`books/${newBook.id}`);
        // console.log(book);
        // res.redirect(`books`);
    } catch (err) {
        // console.log('err: ' + err);
        // if (book.coverImageName != null) {
        //     removeBookCover(book.coverImageName);
        // }
        renderNewPage(res, book, true);
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
        renderEditPage(res, book);
    } catch (err) {
        res.redirect('/');
    }
});

//update book route
router.put('/:id', async (req, res) => {
    // const fileName = req.file != null ? req.file.filename : null;


    // const book = new Book({
    //     title: req.body.title,
    //     author: req.body.author,
    //     publishDate: new Date(req.body.publishDate),
    //     pageCount: req.body.pageCount,
    //     // coverImageName: fileName,
    //     description: req.body.description
    // });
    // console.log(book);
    // saveCover(book, req.body.coverImage);
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
        // console.log(book);
        // res.redirect(`books`);
    } catch (err) {
        // console.log('err: ' + err);
        // if (book.coverImageName != null) {
        //     removeBookCover(book.coverImageName);
        // }
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

// function removeBookCover(fileName) {
//     fs.unlink(Path.join(uploadPath, fileName), err => {
//         if (err) {
//             console.error('err: ' + err);
//         }
//     });
// }

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