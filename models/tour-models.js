const mongoose = require("mongoose");
const slugify = require("slugify"); //import the slugify library
const User = require("./user-Models");

// const validate = require("validator"); //import the validator library
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name"], //the first one if it true the second one is the message that will be shown if the condition is not met
      //!required is a validator that is used to ensure that the name field is not empty
      unique: true, //!unique technically is not a validator but it is used to ensure that the name of the tour is unique
      trim: true,
      maxlength: [40, "A tour name must have less or equal than 40 characters"], //the first one if it true the second one is the message that will be shown if the condition is not met
      minlength: [10, "A tour name must have more or equal than 10 characters"], //the first one if it true the second one is the message that will be shown if the condition is not met
      //maxlengt(),minlength() for numbers and dates
      // validate: [validate.isAlpha, "Tour name must only contain characters"], //this is a custom validator that is used to ensure that the name of the tour contains only characters
    },

    slug: String,

    secretTour: {
      type: Boolean,
      default: false, //this is to set the default value of the secretTour field to false
      select: false, //this is to exclude the secretTour field from the response
    },
    duration: {
      type: Number,
      required: [true, "A tour must have a duration"], //the first one if it true the second one is the message that will be shown if the condition is not met
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have a group size"], //the first one if it true the second one is the message that will be shown if the condition is not met
    },
    difficulty: {
      type: String,
      required: [true, "A tour must have a difficulty"], //the first one if it true the second one is the message that will be shown if the condition is not met
      enum: {
        values: ["easy", "medium", "difficult"], //the values that are allowed for the difficulty field
        message: "Difficulty is either: easy, medium, or difficult",
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"], //the first one if it true the second one is the message that will be shown if the condition is not met
      max: [5, "Rating must be below 5.0"],
      set: (val) => Math.round(val * 10) / 10, //this is to round the rating to one decimal place
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "A tour must have a price"], //the first one if it true the second one is the message that will be shown if the condition is not met
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          //this only point to current doc on NEW document creation
          return val < this.price; //this is a custom validator that is used to ensure that the priceDiscount is less than the price
        },
        message: "Discount price ({VALUE}) should be below regular price", //this is the message that will be shown if the condition is not met
      },
    },
    summary: {
      type: String,
      trim: true, //this is to remove the spaces from the beginning and the end of}
      required: [true, "A tour must have a summary"], //the first one if it true the second one is the message that will be shown if the condition is not met
    },
    description: {
      type: String,
      trim: true, //this is to remove the spaces from the beginning and the end of the string
    },
    imageCover: {
      type: String,
      // required: [true, "A tour must have a cover image"], //the first one if it true the second one is the message that will be shown if the condition is not met
    },
    images: [String], //this is an array of strings
    createdAt: {
      type: Date,
      default: Date.now(), //this is to set the default value of the createdAt field to the current date
      select: false, //this is to exclude the createdAt field from the response
    },
    startDates: [Date], //this is an array of dates
    startLocation: {
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },

    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],

    //the statment is the embedding the user data in the tour data
    // guides: Array,
    //the code is the referencing the user data in the tour data
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    toJSON: { virtuals: true }, //this is to include the virtuals in the response
    toObject: { virtuals: true }, //this is to include the virtuals in the response
  }
);
//!احنا بنعمل انديكس علي ال الحقول اللي بنستخدمها كتير في السيرش عشان يحسن الاداء
tourSchema.index({ price: 1, ratingsAverage: -1 }); //! 1is for ascending order and -1 is for descending order
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: "2dsphere" }); //this is to create a geospatial index on the startLocation field
// tourSchema.index({ geoNear: "2dsphere" });
tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7; //this is to create a virtual field called durationWeeks that will return the duration in weeks
});
//!virtual populate دي لازمتها انها بتعرض الريفيوز اللي بتاعت التور من غير ما تخزنها جوا الداتا بيز
tourSchema.virtual("reviews", {
  ref: "Review", //this is the name of the model that we want to reference
  foreignField: "tour", //this the field the review will stored in it
  localField: "_id", //this is the field that we want to reference
});
//document middleware: runs before .save() and .create()
tourSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true }); //this is to create a slug from the name of the tour
  next(); //this is to call the next middleware
});

//the below code is to embed the user data in the tour data
// tourSchema.pre("save", async function (next) {
//   console.log("Before save, guides =", this.guides);
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = Promise.all(guidesPromises);
//   next();
////////////////////////////////
// });
// tourSchema.pre("save", function (next) {
//   console.log("Will save document..."); //this is to log a message before saving the document
//   next(); //this is to call the next middleware
// });
// tourSchema.post("save", function (doc, next) {
//   console.log(doc); //this is to log the document that was saved
//   next(); //this is to call the next middleware
// });

//query middleware: runs before .find(), .findOne(), .findById(), etc.
tourSchema.pre(/^find/, function (next) {
  //! /^/ this is a regular expression that matches any string that starts with "find" like find, findOne, findById, etc.
  // tourSchema.pre("find", function (next) {
  this.find({ secretTour: { $ne: true } }); //this is to exclude the secret tours from the query
  this.start = Date.now(); //this is to store the start time of the query
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: "guides",
    select: "-__v -passwordChangedAt",
  });
  next();
});
// tourSchema.pre("aggregate", function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } }); // unshift() is used to add a new elemnt to the beginning of the array
//   console.log(this.pipeline()); //this is to log the aggregation pipeline
//   next();
// });
tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`); //this is to log the time taken by the query
  console.log(docs); //this is to log the documents that were found
  next(); //this is to call the next middleware
});
//the below code is to populate the guides field with the user data

//aggregation middleware: runs before .aggregate()
const Tour = mongoose.model("Tour", tourSchema);
module.exports = Tour;
//this is to create a model called Tour with the schema tourSchema
//the model is used to interact with the database and perform CRUD operations
