const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
// Joi = validaciones por el lado del server en /Schema.js
const { reviewSchema } = require('../schemas.js');
const Review = require('../models/review');
const Attractions = require('../models/attractions');

//validaciones de las reviews (middleware)
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error){
        const msg = error.details.map(el => el.message).join(',')
       throw new ExpressError(msg, 400); 
    } else {
        next();
    }
};

// Crea una review
router.post('/', validateReview, catchAsync(async(req, res) => {
    const attraction = await Attractions.findById(req.params.id);
    const review = new Review(req.body.review);
    attraction.reviews.push(review);
    await review.save();
    await attraction.save();
    req.flash('success', 'Created a new review!');
    res.redirect(`/attractions/${attraction.id}`);
}));

// Eliminar reviews ($pull toma la id y extrae cualquier cosa con esa id de las reviews)
router.delete('/:reviewId', catchAsync(async(req, res) => {
    const {id, reviewId} = req.params;
    await Attractions.findByIdAndUpdate(id, {$pull: {reviews: reviewId} });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review!');
    res.redirect(`/attractions/${id}`);
}))

module.exports = router;