const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" }); //this is to load the environment variables from the config.env file

//this called uncaughtException its like the unhandledRejection but its for the sync function

process.on("uncaughtException", (err) => {
  console.log("Uncaught Exception!, Shutting down");
  console.log(err.name, err.message);

  //thats close the server before shutdown
  process.exit(1); //?to shutdown the program,1 is refer to success and 0 is failed
});

const app = require("./app");

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD,
);
dotenv.config({ path: "./config.env" }); //this is to load the environment variables from the config.env file
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log("DB connection successful"));

console.log(app.get("env")); //this is to get the environment of the app (development or production)
console.log(process.env); //this is to get the environment variable NODE_ENV from the config.env file
const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`app runnning on port ${port}....`);
});
// handle the unhandled rejection that if the conection of the database is has a problem like wrong password
process.on("unhandledRejection", (err) => {
  console.log("Unhandled Rejection!, Shutting down");
  console.log(err.name, err.message);
  server.close(() => {
    //thats close the server before shutdown
    process.exit(1); //?to shutdown the program,1 is refer to success and 0 is failed
  });
});


