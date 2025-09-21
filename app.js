const express = require("express");
const favicon = require("serve-favicon");
const path = require("path");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const AppError = require("./utils/appError"); //import the appError class
const globalErrorHandeler = require("./controller/errorController"); //import the errorController
const tourRouter = require("./tourRoute");
const userRouter = require("./userRoute");
const reviewRouter = require("./reviewRoute");
const bookingRouter = require("./bookingRoutes");
const viewRouter = require("./viewRoutes");
const cookieParser = require("cookie-parser");

const app = express();

app.set("view engine", "pug"); //this is to set the view engine to pug
app.set("views", path.join(__dirname, "views"));
//this is to set the views directory
//1)global middleware
//this is to serve the static files like images,css,js
app.use(express.static(path.join(__dirname, "starter/public"))); //this is to serve the static files like images,css,js
//the below statement is to set security http headers
//? app.use(helmet()); //this is to set the security http headers
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": [
          "'self'",
          "https://cdnjs.cloudflare.com",
          "https://api.mapbox.com",
          "https://js.stripe.com", // ✅ Stripe script
        ],
        "style-src": [
          "'self'",
          "https://cdnjs.cloudflare.com",
          "https://api.mapbox.com",
          "https://fonts.googleapis.com",
        ],
        "font-src": ["'self'", "https://fonts.gstatic.com"],
        "img-src": [
          "'self'",
          "data:",
          "blob:",
          "https://api.mapbox.com",
          "https://events.mapbox.com",
        ],
        "worker-src": ["'self'", "blob:"],
        "connect-src": [
          "'self'",
          "https://api.mapbox.com",
          "https://events.mapbox.com",
          "https://js.stripe.com", // ✅ Stripe connections
        ],
        "frame-src": ["https://js.stripe.com"], // ✅ Stripe checkout frames
      },
    },
  })
);

//this is to set the security http headers

//Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev")); //morgan function is give me an information about the request like(http method,code status,url,time to send request )
} //this is to log the request in development mode
//!the below code is to limit the number of requests from the same IP address
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter); //!the first argument is the route that we want to limit the requests and the second argument is the limiter middleware
//bodey parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" })); //this is to limit the size of the body to 10kb
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

//data sanitization against NoSQL query injection
//! no sql injection mean if the hacker send a query like this to the database {email: {$gt: ""}} this query will return all the users in the database because $gt mean greater than and "" mean empty string so all the emails are greater than empty string so this query will return all the users in the database
app.use(mongoSanitize()); //this is to sanitize the data against NoSQL query injection
//data sanitization against XSS
//! xss mean cross site scripting attack this is when the hacker send a malicious code to the website like <script>alert("hacked")</script> this code will be executed in the browser and the hacker can steal the cookies and other sensitive data from the user
app.use(xss()); //this is to sanitize the data against XSS attack
//prevent parameter pollution
app.use(
  //this allow the parameter that we want to allow to be duplicated in the query string
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
); //this is to prevent parameter pollution

//the below code is to test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString(); //this to know the request time
  // console.log(req.cookies);
  next();
});

//3)routes
//this is all coming functions called routes

app.use("/", viewRouter); //this called mounting routers
app.use("/api/v1/tours", tourRouter); //this called mounting routers
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/bookings", bookingRouter);

app.all("*", (req, res, next) => {
  // //? this middleware is to handle all the requests that are not handled by the previous routes like /api/v1/tours/1234 or /api/users
  // //! * this is to catch all the requests that are not handled by the previous routes
  // res.status(404).json({
  //   status: "fail",
  //   message: `Can't find ${req.originalUrl} on this server`, //this is to show the error message if the route is not found
  // });
  // const err = new Error(`Can't find ${req.originalUrl} on this server`); //this is to create a new error object
  // err.status = "fail"; //this is to set the status of the error
  // err.statusCode = 404; //this is to set the status code of the error
  next(new AppError(`Can't find ${req.originalUrl} on this server`)); //this is to pass the error to the next middleware
});

app.use(globalErrorHandeler); //this is to use the global error handler middleware

//4)start the server

module.exports = app; //this is to export the app for testing purpose
//api and the rest api are the same but rest api is more modern and it have the methods(get,post,put,patch,delet)
