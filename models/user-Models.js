const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A tour must have a name"], //the first one if it true the second one is the message that will be shown if the condition is not met
    //!required is a validator that is used to ensure that the name field is not empty
    unique: true,
    trim: true,
    maxlength: [40, "A tour name must have less or equal than 40 characters"], //the first one if it true the second one is the message that will be shown if the condition is not met
    minlength: [8, "A tour name must have more or equal than 10 characters"], //the first one if it true the second one is the message that will be shown if the condition is not met
    //maxlengt(),minlength() for numbers and dates
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please enter a valid Email"],
  },
  photo: {
    type: String,
    default: "default.jpg",
  }, //this is an array of strings
  role: {
    type: String,
    enum: ["user", "guide", "lead-guide", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "A user must have a password"],

    minlength: [
      8,
      "A user password must have more or equal than 10 characters",
    ], //the first one if it true the second one is the message that will be shown if the condition is not met
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "A user must have a password"],
    validate: {
      //!this only work with create and save!!
      validator: function (el) {
        return el === this.password; //thats check if the passwordConfirm is the same with password
      },
      message: "password are not the same",
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre("save", async function (next) {
  //only run this function if password is actually modified
  if (!this.isModified("password")) return next(); // if the user doesnt change the password
  // hash the password with cost 12
  this.password = await bcrypt.hash(this.password, 12);
  // delete passwordConfirm field
  this.passwordConfirm = undefined;
  this.passwordChangedAt = Date.now() - 1000;
  next();
});
//الفانكشن اللي تحت دي اللي هي رقم 3 في resetPassword
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000; //-1000 دي عشان ممكن يكون في تأخير بسيط في الحفظ في الداتا بيز
  next();
});
userSchema.pre(/^find/, function (next) {
  //this point to the current query
  this.find({ active: { $ne: false } }); //هنا بنعمل فلتر ان احنا نجيب اللي الاكتف بتاعته مش false يعني اللي الاكتف بتاعته true او مش موجودة خالص
  //?$ne that mean not equal
  next();
});
//this function is used to check if the password the user entered is correct
//we can not use this because the password is doesnt showe in the out but cause this (select: false)
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
//4) check if user changed password after the token was issued
userSchema.methods.changePasswordAfter = function (jwtTimestamp) {
  if (this.passwordChangedAt) {
    //! parseInt()is used to convert the data type date into integer to can compared
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return jwtTimestamp < changedTimestamp;
  }
  //false means not changed
  return false;
};
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  console.log({ resetToken, passwordResetToken: this.passwordResetToken });
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; //10 minutes
  return resetToken; //this is the token that will be sent to the user email
};

const User = mongoose.model("User", userSchema);
module.exports = User;
