const { attractionSchema, reviewSchema } = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');
const Attractions = require('./models/attractions');
const Review = require('./models/review');

//validaciones por el lado del servidor (utiliza JOI)
module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        //esto sirve para redirigir a la misma url el login
        req.session.returnTo = req.originalUrl;
        //-------------------------------------------------
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}

//validaciones de atracciones (middleware)
module.exports.validateAttraction = (req, res, next) => {
    const { error } = attractionSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
       throw new ExpressError(msg, 400); 
    } else {
        next();
    }
};

//validaciones de las reviews (middleware)
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error){
        const msg = error.details.map(el => el.message).join(',')
       throw new ExpressError(msg, 400); 
    } else {
        next();
    }
};

//Mensaje si usuario trata de hacer algo que no tiene permitido en atracciones
module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const attraction = await Attractions.findById(id);
    if (!attraction.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/attractions/${id}`);
    }
    next();
};

//Mensaje si usuario trata de hacer algo que no tiene permitido en review
module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/attractions/${id}`);
    }
    next();
};