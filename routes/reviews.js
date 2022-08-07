const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const reviews = require('../controllers/reviews');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');

// Crea una review
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.newReview));

// Eliminar reviews ($pull toma la id y extrae cualquier cosa con esa id de las reviews)
router.delete('/:reviewId', isReviewAuthor, isLoggedIn, catchAsync(reviews.deleteReview));

module.exports = router;