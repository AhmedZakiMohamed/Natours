const express = require("express");
const userController = require("./controller/userController");
const authController = require("./controller/authController");

const router = express.Router();
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/logout", authController.logout);
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

//!الحركه اللي تحت دي علشان بدل ما ادخل الفانكشن protect دي عند كل واحد لوحده كده هي اتطبقت على كل الفانكشن اللي بعديها
router.use(authController.protect);

router.patch("/updateMyPassword", authController.updatePassword);
router.get("/me", userController.getMe, userController.getUser);
router.patch(
  "/updateMe",
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);
router.delete("/deleteMe", userController.deleteMe);

//! الحركه اللي تحت دي علشان بدل ما ادخل الفانكشن restrictTo دي عند كل واحد لوحده كده هي اتطبقت على كل الفانكشن اللي بعديها
router.use(authController.restrictTo("admin"));

router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);
// authController.restrictTo('admin') thats to check if the user is admin and allow to admin only delete the user

module.exports = router;
