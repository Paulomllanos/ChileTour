const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
// Joi = validaciones por el lado del server en /Schema.js
const { attractionSchema, reviewSchema } = require('./schemas.js');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const Attractions = require('./models/attractions');
const Review = require('./models/review');

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

//validaciones de atracciones (middleware)
const validateAttraction = (req, res, next) => {
    const { error } = attractionSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
       throw new ExpressError(msg, 400); 
    } else {
        next();
    }
};

//validaciones de las reviews (middleware)
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
       throw new ExpressError(msg, 400); 
    } else {
        next();
    }
};

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

// Crea nuevas atracciones
app.post('/attractions', validateAttraction, catchAsync(async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Attraction Data!', 400);
    const attraction = new Attractions(req.body.attraction);
    await attraction.save();
    res.redirect(`/attractions/${attraction._id}`);
}));

//Mostrar informacion de atraccion seleccionada
app.get('/attractions/:id', catchAsync(async (req, res) => {
    const attraction = await Attractions.findById(req.params.id).populate('reviews');
    res.render('attractions/show', { attraction });
}));

//obtiene la atraccion para actualizar/editar
app.get('/attractions/:id/edit', catchAsync(async (req, res) => {
    const attraction = await Attractions.findById(req.params.id);
    res.render('attractions/edit', { attraction });
}));

//Actualiza/edita una atraccion
app.put('/attractions/:id', validateAttraction, catchAsync(async (req, res) => {
    const { id } = req.params;
    const attraction = await Attractions.findByIdAndUpdate(id, { ...req.body.attraction });
    res.redirect(`/attractions/${attraction._id}`);
}));

// Eliminar attraction
app.delete('/attractions/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Attractions.findByIdAndDelete(id);
    res.redirect('/attractions');
}));

// Crea una review
app.post('/attractions/:id/reviews', validateReview, catchAsync(async(req, res) => {
    const attraction = await Attractions.findById(req.params.id);
    const review = new Review(req.body.review);
    attraction.reviews.push(review);
    await review.save();
    await attraction.save();
    res.redirect(`/attractions/${attraction.id}`);
}));

// Eliminar reviews ($pull toma la id y extrae cualquier cosa con esa id de las reviews)
app.delete('/attractions/:id/reviews/:reviewId', catchAsync(async(req, res) => {
    const {id, reviewId} = req.params;
    await Attractions.findByIdAndUpdate(id, {$pull: {reviews: reviewId} });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/attractions/${id}`);
}))

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