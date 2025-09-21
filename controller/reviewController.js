const Review = require("../models/reviewModels");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory.js"); //import the handlerFactory module

// exports.getAllReviews = catchAsync(async (req, res, next) => {
  
//   let filter = {};
//   if (req.params.tourId) filter = { tour: req.params.tourId };
//   const reviews = await Review.find(filter); //this is to get all reviews from the database
//   res.status(200).json({
//     status: "success",
//     results: reviews.length,
//     data: {
//       reviews,
//     },
//   });
// });
exports.setTourUserIds = (req, res, next) => {
  //ALLOW NESTED ROUTES
  if (!req.body.tour) req.body.tour = req.params.tourId; //this is to set the tour id in the review if it is not set in the request body
  if (!req.body.user) req.body.user = req.user.id; //this is to set the user id in the review if it is not set in the request body
}
// exports.createReview = catchAsync(async (req, res, next) => {
//   //ALLOW NESTED ROUTES
//   
//   const newReview = await Review.create(req.body); //this is to create a new review in the database
//   res.status(201).json({
//     status: "success",
//     data: {
//       review: newReview,
//     },
//   });
// });
exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);