const express = require("express");
const tourController = require("./controller/tourController");
const authController = require("./controller/authController");
const reviewRouter = require("./reviewRoute");
// const reviewController = require("./controller/reviewController");
const router = express.Router();
//!nested routes
//POST /tour/234fad4/reviews
//GET /tour/234fad4/reviews
//GET /tour/234fad4/reviews/9087fhg
// router
//   .route("/:tourId/reviews")
//   .post(
//     authController.protect,
//     authController.restrictTo("user"),
//     reviewController.createReview,
//   );
router.use("/:tourId/reviews", reviewRouter);

//the coming functions called handlers

// router.param("id", tourController.checkID); //this is to check the id before the request
router
  .route("/top-5-cheap")
  .get(tourController.aliasTopTours, tourController.getAllTours); //this is to get the top 5 cheap tours
router.route("/tour-stats").get(tourController.getTourStats); //this is to get the tour stats
router
  .route("/monthly-plan/:year")
  .get(
    authController.protect,
    authController.restrictTo("admin", "lead-guide", "guide"),
    tourController.getMonthlyPlan
  );
router
  .route("/tours-within/:distance/center/:latlng/unit/:unit")
  .get(tourController.getToursWithin);
// /tours-within?distance=233&center=-40,45&unit=mi
// /tours-within/233/center/-40,45/unit/mi
router.route("/distances/:latlng/unit/:unit").get(tourController.getDistances);
router
  .route("/")
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.createTour
  );
router
  .route("/:id")
  .get(tourController.getOne)
  .patch(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
     tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.deleteTour
  );

module.exports = router;
