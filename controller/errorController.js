const AppError = require("../utils/appError"); //this is to import the AppError class

const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`; //this is to create a message for the error
  return new AppError(message, 400); //this is to create a new AppError
};

const handleDublicateError = (err) => {
  console.log("🔍 Duplicate Error Object:", err); // للـ debugging

  let message = "Duplicate field value. Please use another value!";

  // جرب استخراج القيمة من keyValue object (الطريقة الحديثة)
  if (err.keyValue && typeof err.keyValue === "object") {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    message = `Duplicate field value for ${field}: "${value}". Please use another value!`;
  }
  // جرب من الـ message إذا موجود
  else if (err.message && typeof err.message === "string") {
    const match = err.message.match(/(["'])(\\?.)*?\1/);
    if (match && match[0]) {
      message = `Duplicate field value: ${match[0]}. Please use another value!`;
    }
  }

  return new AppError(message, 400);
};

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message); //this is to get the value of the error
  const message = `invalid input data ${errors.join(". ")}`; //this is to create a message for the error
  return new AppError(message, 400); //this is to create a new AppError
};

const handleJsonWebTokenError = () => {
  return new AppError("Invalid token. Please log in again!", 401);
};

const handleJsonWebTokenExpiredError = () => {
  return new AppError("Your token has expired! Please log in again.", 401);
};

// في global error handler

const sendErrorDev = (error, req, res) => {
  //api
  if (req.originalUrl.startsWith("/api")) {
    return res.status(error.statusCode).json({
      status: error.status,
      message: error.message, //this is to send the error message;
      stack: error.stack, //this is to send the error stack
      error: error, //this is to send the error object
    });
  }
  //rendered website
  console.error("ERROR 💥", error);
  return res.status(error.statusCode).render("error", {
    title: "Something went wrong!",
    msg: error.message,
  });
};

const sendErrorProd = (err, req, res) => {
  //api
  if (req.originalUrl.startsWith("/api")) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message, //this is to send the error message;
        error: err, //this is to send the error object
      });
    }
    //programming or other unknown error: don't leak error details
    //1)log error
    console.error("ERROR 💥", err); //this is to log the error in the
    //2)send generic message
    return res.status(500).json({
      status: "error",
      message: "Something went very wrong!", //this is to send a generic error message in production mode
    });

    //opreational, trusted error: send message to client
  }
  if (err.isOperational) {
    return res.status(err.statusCode).render("error", {
      title: "Something went wrong!",
      message: err.message, //this is to send the error message;
      error: err, //this is to send the error object
    });
  }
  //programming or other unknown error: don't leak error details
  //rendered website
  //1)log error
  console.error("ERROR 💥", err); //this is to log the error in the
  //2)send generic message
  return res.status(err.statusCode || 500).render("error", {
    title: "Something went wrong!",
    message: "please try again later", //this is to send the error message;
    error: err, //this is to send the error object
  });
};

//!this is called global error handling middleware
module.exports = (err, req, res, next) => {
  console.log(err.stack); //this is to log the error stack in the console
  err.statusCode = err.statusCode || 500; //this is to set the status code of the error if it is not set
  err.status = err.status || "error"; //this is to set the status of the

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res); //this is to send the error in development mode
  } else if (process.env.NODE_ENV === "production") {
   let error = Object.create(err); // preserve prototype and all original properties
   
 //this is to create a copy of the error object preserving prototype
    error.message = err.message;

    if (error.name === "CastError") error = handleCastError(error);
    if (error.code === 11000) error = handleDublicateError(error);
    if (error.name === "ValidationError") error = handleValidationError(error);
    if (error.name === "JsonWebTokenError") error = handleJsonWebTokenError();
    if (error.name === "TokenExpiredError")
      error = handleJsonWebTokenExpiredError();

    // ضيف default values عشان sendErrorProd يشتغل صح
    error.statusCode = error.statusCode || 500;
    error.status = error.status || "error";

    sendErrorProd(error, req, res); //this is to send the error in production mode
  }
};

//! عندي مشكله في ال validation error
