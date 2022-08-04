const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Attractions = require('../models/attractions');
const attractions = require('../controllers/attractions');
//verifica si la persona esta conectada para realizar acciones
const { isLoggedIn, isAuthor, validateAttraction } = require('../middleware');

//router.route sirve para ordenar y asimilar rutas identicas

router.route('/')
    // Home
    .get(catchAsync(attractions.index))
    // Crea nuevas atracciones
    .post(isLoggedIn, validateAttraction, catchAsync(attractions.newAttraction));

//Crear nuevas atracciones
router.get('/new', isLoggedIn, attractions.renderNewForm);
    
router.route('/:id')
    //Mostrar informacion de atraccion seleccionada
    .get(catchAsync(attractions.showAttraction))
    //Actualiza/edita una atraccion
    .put(isLoggedIn, isAuthor, validateAttraction, catchAsync(attractions.editAttraction))
    // Eliminar atraccion
    .delete(isLoggedIn, isAuthor, catchAsync(attractions.deleteAttraction));

//obtiene la atraccion para actualizar/editar
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(attractions.renderEditForm));

module.exports = router;