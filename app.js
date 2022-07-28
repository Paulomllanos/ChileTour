const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const {attractionSchema} = require('./schemas.js');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const Attractions = require('./models/attractions');

// Joi = validaciones por el lado del server

mongoose.connect('mongodb://127.0.0.1:27017/tourApp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

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
app.use(methodOverride('_method'));

const validateAttraction = (req, res, next) => {
    const { error } = attractionSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
       throw new ExpressError(msg, 400); 
    } else {
        next();
    }
}

app.get('/', (req, res) => {
    res.render('home')
});

app.get('/attractions', catchAsync(async (req, res) => {
    const attractions = await Attractions.find({});
     res.render('attractions/index', { attractions })
}));

//Crear nuevas atracciones
app.get('/attractions/new', (req, res) => {
    res.render('attractions/new');
});

app.post('/attractions', validateAttraction, catchAsync(async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Attraction Data!', 400);
    const attraction = new Attractions(req.body.attraction);
    await attraction.save();
    res.redirect(`/attractions/${attraction._id}`);
}));

//Mostrar informacion de atraccion seleccionada
app.get('/attractions/:id', catchAsync(async (req, res) => {
    const attraction = await Attractions.findById(req.params.id);
    res.render('attractions/show', { attraction });
}));

app.get('/attractions/:id/edit', catchAsync(async (req, res) => {
    const attraction = await Attractions.findById(req.params.id);
    res.render('attractions/edit', { attraction });
}));

app.put('/attractions/:id', validateAttraction, catchAsync(async (req, res) => {
    const { id } = req.params;
    const attraction = await Attractions.findByIdAndUpdate(id, { ...req.body.attraction });
    res.redirect(`/attractions/${attraction._id}`);
}));

app.delete('/attractions/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Attractions.findByIdAndRemove(id);
    res.redirect('/attractions');
}));

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if(!err.message) err.message = 'Oh no, Something Went Wrong!'
    res.status(statusCode).render('error', { err });
})

app.listen(3000, () => {
    console.log('Server on port 3000');
});