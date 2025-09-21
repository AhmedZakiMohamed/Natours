const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");
//this is to create a handler factory that will be used to create the route handlers for the different models
//1)delete one
// model is a parameter that will be passed to the function when it is called
exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  });
exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    //this is the function that update a tour

    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true, //this will return the updated document
      runValidators: true, //this will run the validators that are defined in the schema
      context: "query", //this is to set the context of the query to "query"
    });
    if (!doc) {
      return next(new AppError("No document found with that ID", 404)); //if the tour is not found, pass an error to the next middleware
    }
    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });
exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body); //create a new tour using the Tour model

    res.status(201).json({
      //201 mean creat
      status: "success",
      data: {
        data: doc,
      },
    });
  });
exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);

    // لو في حاجة عايز تعمل لها populate
    if (popOptions) query = query.populate(popOptions);

    const doc = await query;

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: { doc },
    });
  });
exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Model.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const doc = await features.query; // استعلام بعد التعديلات

    res.status(200).json({
      status: "success",
      results: doc.length,
      data: {
        doc,
      },
    });
  });
