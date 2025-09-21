const User = require("../models/user-Models"); //import the Tour model
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const factory = require("./handlerFactory"); //import the handlerFactory module
const multer = require("multer");
const sharp = require("sharp");
//! this is to upload the user photo
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "starter/public/img/users");
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split("/")[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.uploadUserPhoto = upload.single("photo");
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({
      quality: 90,
    })
    .toFile(`starter/public/img/users/${req.file.filename}`);
  next();
});

//!this function is related to updateMe function only to allow the user to update only the name and email not the password
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// exports.getAllUsers = catchAsync(async (req, res, next) => {
//   const users = await User.find(); //this is to filter the tours based on the query parameters sent by the user send the response
//   //query.sort.select.skip.limit
//   res.status(200).json({
//     status: "success", //status of the request.
//     result: users.length, //the number of tours
//     data: {
//       users,
//     },
//   });
// });
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id; //this to get the user id from login user
  next();
};
//!the below function to give user permission to update his data not the other user
exports.updateMe = catchAsync(async (req, res, next) => {
  console.log(req.file);
  // 1) create error if user posts password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /updateMyPassword.",
        400
      )
    );
  }
  //2) filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, "name", "email");
  if (req.file) filteredBody.photo = req.file.filename;
  // 3) update user document
  console.log("filteredBody =>", filteredBody);

  const updateduser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    message: "user updated successfully",
    data: {
      updateduser,
    },
  });
});
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false }); //!the first argument is the id of the user and the second argument is the data that we want to update
  res.status(204).json({
    status: "success",
    data: null,
  });
});

//we does not change this function because the user will use signup function to create his account
exports.createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "please use /signup instead",
  });
};
exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
//don't update password with this
exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);
