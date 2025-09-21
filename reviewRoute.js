const express = require("express");
const authController = require("./controller/authController");
const reviewController = require("./controller/reviewController");
const router = express.Router({ mergeParams: true }); //this is to get the tour id from the tourRoute.js file
// POST /tour/2323/reviews
// GET /tour/2323/reviews
// GET /tour/2323/reviews/2323
router.use(authController.protect);
router
  .route("/")
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo("user"),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

router
  .route("/:id")
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo("user", "admin"),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo("user", "admin"),
    reviewController.deleteReview
  );
module.exports = router;
