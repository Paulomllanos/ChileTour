const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');
const users = require('../controllers/users');

//router.route sirve para ordenar y asimilar rutas identicas 

router.route('/register')
    // reproduce el registro de usuario
    .get(users.renderRegister)
    //Crear nuevo usuario
    .post(catchAsync(users.createUser));

router.route('/login')
    //Reproduce/Seguimiento al usuario
    .get(users.renderLogin)
    //Conecta al Usuario
    .post(passport.authenticate('local', { 
    keepSessionInfo: true,
    successReturnToOrRedirect: '/',
    failureFlash: true, 
    failureRedirect: '/login'
    }), users.login);
    // ojo con la nueva version de ---> passportJS <---

//Desconecta al usuario
router.get('/logout', users.logout);

module.exports = router;