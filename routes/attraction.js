const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Attractions = require('../models/attractions');
//verifica si la persona esta conectada para realizar acciones
const { isLoggedIn } = require('../middleware');
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
router.get('/new', isLoggedIn, (req, res) => {
    res.render('attractions/new');
});

// Crea nuevas atracciones
router.post('/', isLoggedIn, validateAttraction, catchAsync(async (req, res, next) => {
    const attraction = new Attractions(req.body.attraction);
    attraction.author = req.user._id;
    await attraction.save();
    req.flash('success', 'Successfully made a new attraction!');
    res.redirect(`/attractions/${attraction._id}`);
}));

//Mostrar informacion de atraccion seleccionada
router.get('/:id', catchAsync(async (req, res) => {
    const attraction = await Attractions.findById(req.params.id).populate('reviews').populate('author');
    console.log(attraction);
    if(!attraction){
        req.flash('error', 'Cannot find that attraction!');
        return res.redirect('/attractions')
    }
    res.render('attractions/show', { attraction });
}));

//obtiene la atraccion para actualizar/editar
router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
    const attraction = await Attractions.findById(req.params.id);
    res.render('attractions/edit', { attraction });
}));

//Actualiza/edita una atraccion
router.put('/:id', isLoggedIn, validateAttraction, catchAsync(async (req, res) => {
    const { id } = req.params;
    const attraction = await Attractions.findByIdAndUpdate(id, { ...req.body.attraction });
    req.flash('success', 'Successfully updated attraction!');
    res.redirect(`/attractions/${attraction._id}`);
}));

// Eliminar attraction
router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Attractions.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted attraction!');
    res.redirect('/attractions');
}));

module.exports = router;