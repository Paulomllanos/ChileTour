const Review = require('../models/review');
const Attractions = require('../models/attractions');

module.exports.newReview = async(req, res) => {
    const attraction = await Attractions.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    attraction.reviews.push(review);
    await review.save();
    await attraction.save();
    req.flash('success', 'Created a new review!');
    res.redirect(`/attractions/${attraction.id}`);
};

module.exports.deleteReview = async(req, res) => {
    const {id, reviewId} = req.params;
    await Attractions.findByIdAndUpdate(id, {$pull: {reviews: reviewId} });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review!');
    res.redirect(`/attractions/${id}`);
};