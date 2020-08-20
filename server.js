if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config('.env');
}

const express = require('express');
const expressLayouts = require('express-ejs-layouts');
// const expressLayouts = require('ejs');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const indexRouter = require('./routes/index');
const authorRouter = require('./routes/authors');

const app = express();

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('layout', 'layouts/layout');

app.use(expressLayouts);
app.use(express.static('public'));
app.use(bodyParser.urlencoded({limit: '10mb', extended: false}));

mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', error => console.error(error));
db.once('open', () => console.log('connected to Mongoose'));

app.use('/', indexRouter);
app.use('/authors', authorRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`listening at ${port}`);
});