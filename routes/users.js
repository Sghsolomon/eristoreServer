var express = require("express");
const userRouter = express.Router();
const User = require("../models/user");
const passport = require("passport");
const authenticate = require("../authenticate");
//const cors = require("./cors");

/* GET users listing. */
userRouter.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

userRouter.post("/signup", (req, res) => {
  User.register(
    new User({ username: req.body.username }),
    req.body.password,
    (err, user) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.json({ err: err });
      } else {
        if (req.body.firstname) {
          user.firstname = req.body.firstname;
        }
        if (req.body.lastname) {
          user.lastname = req.body.lastname;
        }
        user
          .save()
          .then(() => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json({ success: true, status: "Registration Successful!" });
          })
          .catch((err) => {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.json({ err: err });
          });
      }
    }
  );
});

userRouter.post(
  "/login",
  passport.authenticate("local", { session: false }),
  (req, res) => {
    const token = authenticate.getToken({ _id: req.user._id });
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.json({
      success: true,
      token: token,
      id: req.user._id,
      firstName: req.user.firstname,
      //user: req.user,
      status: "You are successfully logged in!",
    });
  }
);

userRouter.get(
  "/logout",

  authenticate.verifyUser,
  (req, res, next) => {
    authenticate.getToken({ _id: req.user._id }, 0);
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.json({
      success: true,
      status: "You have successfully logged out!",
    });
  }
);

module.exports = userRouter;
