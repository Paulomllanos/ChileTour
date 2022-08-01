const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
// routes 
const attraction = require('./routes/attraction');
const reviews = require('./routes/reviews');

//conexion de mongoose con mongodb
mongoose.connect('mongodb://127.0.0.1:27017/tourApp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
//conexion de mongoose con mongodb
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database Connected");
});

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended: true}));
//Para utilizar DELETE Y PUT en express como method
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/attractions', attraction);
app.use('/attractions/:id/reviews', reviews);

app.get('/', (req, res) => {
    res.render('home')
});

// Le da a todos el script de Express Error
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if(!err.message) err.message = 'Oh no, Something Went Wrong!'
    res.status(statusCode).render('error', { err });
});

app.listen(3000, () => {
    console.log('Server on port 3000');
});