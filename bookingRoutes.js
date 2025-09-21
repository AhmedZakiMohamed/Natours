const express = require("express");
const authController = require("./controller/authController");
const bookingController = require("./controller/bookingController");
const router = express.Router(); //this is to get the tour id from the tourRoute.js file
router.use(authController.protect);
router.get(
  "/chechout-session/:tourId",

  bookingController.getCheckoutSession
);
router.use(authController.restrictTo("admin", "lead-guide"));
router
  .route("/")
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);
router
  .route("/:id")
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);
module.exports = router;
