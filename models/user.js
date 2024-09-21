const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const orderSchema = new Schema({
  nikeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Nike",
    required: true,
  },
  shoeSize: {
    type: String,
    default: "",
  },

  country: {
    type: String,
    default: "",
  },
  fullName: {
    type: String,
    default: "",
  },
  phoneNum: {
    type: String,
    default: "",
  },
  address: {
    type: String,
    default: "",
  },
  city: {
    type: String,
    default: "",
  },
  state: {
    type: String,
    default: "",
  },
  zipCode: {
    type: String,
    default: "",
  },
});

const userSchema = new Schema({
  username: {
    type: String,
    default: "",
    required: true,
    unique: true,
  },
  firstname: {
    type: String,
    default: "",
  },
  lastname: {
    type: String,
    default: "",
  },
  admin: {
    type: Boolean,
    default: false,
  },
  orders: [orderSchema],
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

//module.exports = mongoose.model("User", userSchema);

module.exports = User;
