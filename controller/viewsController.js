const Tour = require("./../models/tour-models");
const catchAsync = require("./../utils/catchAsync");
const User = require("./../models/user-Models");
const AppError = require("./../utils/appError");
const Booking = require("./../models/bookingModel");

exports.getOverview = catchAsync(async (req, res, next) => {
  //1) get tour data from collection
  const tours = await Tour.find();
  //2) build template
  //3) render that template using tour data from 1
  res.status(200).render("overview", {
    title: "All Tours",
    tours,
  });
});
exports.getTour = catchAsync(async (req, res, next) => {
  //1) get the data, for the requested tour (including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: "reviews",
    fields: "review rating user",
  });
  if (!tour) {
    return next(new AppError("No tour found with that name", 404));
  }
  //2) build template
  //3) render template using data from 1
  res.status(200).render("tour", {
    title: `${tour.name} Tour`,
    tour,
  });
});
exports.getLoginForm = (req, res) => {
  res.status(200).render("login", {
    title: "Log into your account",
  });
};
exports.getAccount = (req, res) => {
  res.status(200).render("account", {
    title: "Your account",
    user: res.locals.user,
  });
};
exports.getMyTours = catchAsync(async (req, res, next) => {
  //1) find all bookings
  const bookins = await Booking.find({ user: req.user.id });

  //2) find tours with the returned IDs
  const tourIDs = bookins.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });
  //3) render the overview template using those tours
  res.status(200).render("overview", {
    title: "My Tours",
    tours,
  });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).render("account", {
    title: "Your account",
    user,
  });
});
