const APIFeatures = require("../utils/apifeatures.js"); //import the APIFeatures class
const Tour = require("../models/tour-models"); //import the Tour model
const catchAsync = require("../utils/catchAsync.js"); //import the catchAsync function
const AppError = require("../utils/appError.js"); //import the appError class
const factory = require("./handlerFactory.js"); //import the handlerFactory module
const multer = require("multer");
const sharp = require("sharp");

//!الاكواد دي بتخليني احمل وارفع صور علي الويب سايت
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

exports.uploadTourImages = upload.fields([
  {
    name: "imageCover",
    maxCount: 1,
  },
  {
    name: "images",
    maxCount: 3,
  },
]);
// upload.single("image");
// upload.array("images", 5);
exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  //1) cover image
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat("jpeg")
    .jpeg({
      quality: 90,
    })
    .toFile(`starter/public/img/tours/${req.body.imageCover}`);

  //2) images
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat("jpeg")
        .jpeg({
          quality: 90,
        })
        .toFile(`starter/public/img/tours/${filename}`);
      req.body.images.push(filename);
    })
  );
  
  next();
});
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = "5"; //this is to limit the number of tours to 5
  req.query.sort = "price,-ratingsAverage"; //this is to sort the tours by price in ascending order and ratingsAverage in descending order
  req.query.fields = "name,price,ratingsAverage,summary,difficulty"; //this is to limit the fields that are returned in the response
  next(); //this is to call the next middleware function in the stack
};

// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: "fail",
//       message: "missing name or price",
//     });
//   }
//   next();
// };
// exports.checkID = (req, res, next, val) => {
//   //this is a middleware param function that check the id before the request
//   console.log(`tour id is: ${val}`);
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       //404 mean wrong
//       status: "fail",
//       message: "invalid id",
//     });
//   }
//   next();
// };
exports.getAllTours = factory.getAll(Tour);
// catchAsync(async (req, res) => {
//   //this is the function that get all tours

//   // excute the query
//   // const query = query.find(JSON.parse(queryStr)); //this is to filter the tours based on the query parameters sent by the user

//   const features =
//   new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate(); //this is to create a new instance of the APIFeatures class
//   const tours = await features.query; //this is to filter the tours based on the query parameters sent by the user send the response
//   //query.sort.select.skip.limit
//   res.status(200).json({
//     status: "success", //status of the request.
//     result: tours.length, //the number of tours
//     data: {
//       tours,
//     },
//   });
// });

//2)route handelrs
exports.getOne = factory.getOne(Tour, { path: "reviews" });
// exports.getTour = catchAsync(async (req, res, next) => {
//   //this is the function that get a tour by id

//   const tour = await Tour.findById(req.params.id).populate("reviews");
//   //findById() is a method that return the document with the id that is passed to it
//   //Tour.findOne({ _id: req.params.id }) //this is another way to find a tour by id
//   if (!tour) {
//     return next(new AppError("No tour found with that ID", 404)); //if the tour is not found, pass an error to the next middleware
//   }
//   res.status(200).json({
//     status: "success",
//     data: {
//       tour, //the tour that is found
//     },
//   });
// });
exports.createTour = factory.createOne(Tour);
// exports.createTour = catchAsync(async (req, res, next) => {
//   const newTour = await Tour.create(req.body); //create a new tour using the Tour model

//   res.status(201).json({
//     //201 mean creat
//     status: "success",
//     data: {
//       tour: newTour,
//     },
//   });
//! references for the regular try-catch block
// catch (err) {
//   res.status(400).json({
//     status: "fail",
//     message: err.message, //send the error message
//   });
// }
// });
exports.updateTour = factory.updateOne(Tour);
// exports.updateTour = catchAsync(async (req, res, next) => {
//   //this is the function that update a tour

//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true, //this will return the updated document
//     runValidators: true, //this will run the validators that are defined in the schema
//     context: "query", //this is to set the context of the query to "query"
//   });
//   if (!tour) {
//     return next(new AppError("No tour found with that ID", 404)); //if the tour is not found, pass an error to the next middleware
//   }
//   res.status(201).json({
//     status: "success",
//     data: {
//       tour,
//     },
//   });
// });
exports.deleteTour = factory.deleteOne(Tour);
// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id); //findByIdAndDelete() is a method that delete the document with the id that is passed to it
//   if (!tour) {
//     return next(new AppError("No tour found with that ID", 404)); //if the tour is not found, pass an error to the next middleware
//   }
//   //this is the function that delete a tour

//   res.status(204).json({
//     //204 mean no content
//     status: "success",
//     data: null,
//   });
// });
exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    // { $match: { ratingsAverage: { $gte: 0 } } },
    {
      $group: {
        _id: { $toUpper: "$difficulty" }, //this is to group the tours by difficulty
        numTours: { $sum: 1 },
        numRating: { $sum: "$ratingsQuantity" }, //!the first object is the aggregation function name and the second object is the field that we want to sum
        avgRatings: { $avg: "$ratingsAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    {
      $sort: { avgPrice: 1 }, //this is to sort the tours by average price in ascending order
    },
    // {
    //   $match: { _id: { $ne: "EASY" } }, //this is to exclude the easy tours from the result
    // },
  ]);

  res.status(200).json({
    status: "success",
    data: { stats },
  });
});
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; //convert the year to a number
  const plan = await Tour.aggregate([
    {
      $unwind: "$startDates", //this is to unwind the startDates array
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`), //this is to match the startDates that are greater than or equal to the first day of the year
          $lte: new Date(`${year}-12-31`), //this is to match the startDates that are less than or equal to the last day of the year
        },
      },
    },
    {
      $group: {
        _id: { $month: "$startDates" }, //this is to group the tours by month
        numTourStarts: { $sum: 1 }, //this is to count the number of tours that start in that month
        tours: { $push: "$name" }, //this is to push the name of the tour into an array
      },
    },
    {
      $addFields: { month: "$_id" }, //this is to add a new field called month that contains the month number
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 }, //this is to sort the tours by number of starts in descending order
    },
    {
      $limit: 12, //this is to limit the number of tours to 12
    },
  ]);
  res.status(200).json({
    status: "success",
    data: { plan },
  });
});

// /tours-within/:distance/center/:latlng/unit/:unit
// /tours-within/233/center/-40,45/unit/mi
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");

  if (!lat || !lng) {
    return next(
      new AppError(
        "Please provide latitude and longitude in the format lat,lng.",
        400
      )
    );
  }

  // تحويل المسافة إلى radians
  const earthRadius = unit === "mi" ? 3963.2 : 6378.1;
  const radius = distance / earthRadius;
  console.log(lat, lng, radius);

  const tours = await Tour.find({
    startLocation: {
      $geoWithin: { $centerSphere: [[lng, lat], radius] },
    },
  });

  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");
  const multiplier = unit === "mi" ? 0.000621371 : 0.001;
  if (!lat || !lng) {
    return next(
      new AppError(
        "Please provide latitude and longitude in the format lat,lng.",
        400
      )
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: "distance",
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      distances,
    },
  });
});
