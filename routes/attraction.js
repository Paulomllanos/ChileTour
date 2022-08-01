const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Attractions = require('../models/attractions');
// Joi = validaciones por el lado del server en /Schema.js
const { attractionSchema } = require('../schemas.js');
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

router.get('/', catchAsync(async (req, res) => {
    const attractions = await Attractions.find({});
     res.render('attractions/index', { attractions })
}));

//Crear nuevas atracciones
router.get('/new', (req, res) => {
    res.render('attractions/new');
});

// Crea nuevas atracciones
router.post('/', validateAttraction, catchAsync(async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Attraction Data!', 400);
    const attraction = new Attractions(req.body.attraction);
    await attraction.save();
    res.redirect(`/attractions/${attraction._id}`);
}));

//Mostrar informacion de atraccion seleccionada
router.get('/:id', catchAsync(async (req, res) => {
    const attraction = await Attractions.findById(req.params.id).populate('reviews');
    res.render('attractions/show', { attraction });
}));

//obtiene la atraccion para actualizar/editar
router.get('/:id/edit', catchAsync(async (req, res) => {
    const attraction = await Attractions.findById(req.params.id);
    res.render('attractions/edit', { attraction });
}));

//Actualiza/edita una atraccion
router.put('/:id', validateAttraction, catchAsync(async (req, res) => {
    const { id } = req.params;
    const attraction = await Attractions.findByIdAndUpdate(id, { ...req.body.attraction });
    res.redirect(`/attractions/${attraction._id}`);
}));

// Eliminar attraction
router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Attractions.findByIdAndDelete(id);
    res.redirect('/attractions');
}));

module.exports = router;