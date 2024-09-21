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
      orders: req.user.orders,
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

userRouter.get("/checkJWTtoken", (req, res) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    if (!user) {
      return res.json({ status: "JWT invalid!", success: false, err: info });
    } else {
      return res.json({ status: "JWT valid!", success: true, user: user });
    }
  })(req, res);
});

userRouter
  .route("/orders")
  .get(authenticate.verifyUser, (req, res, next) => {
    User.findById(req.user._id)
      .then((user) => {
        if (user) {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(user.orders);
        } else {
          err = new Error(`User ${req.user._id} not found`);
          err.status = 404;
          return next(err);
        }
      })
      .catch((err) => next(err));
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    User.findById(req.user._id)
      .then((user) => {
        if (user) {
          console.log("req.body", req.body);
          user.orders.push(req.body);
          user
            .save()
            .then((user) => {
              console.log("user", user);
              res.statusCode = 201;
              res.setHeader("Content-Type", "application/json");
              res.json(user.orders[user.orders.length - 1]);
            })
            .catch((err) => next(err));
        } else {
          err = new Error(`User ${req.user._id} not found`);
          err.status = 404;
          return next(err);
        }
      })
      .catch((err) => next(err));
  })
  .put((req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /user/orders`);
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    User.findById(req.user._id)
      .then((user) => {
        if (user) {
          user.orders = user.orders.filter(
            (order) => order.nikeId != req.body.nikeId
          );
          user
            .save()
            .then((user) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(user.orders);
            })
            .catch((err) => next(err));
        } else {
          err = new Error(`User ${req.user._id} not found`);
          err.status = 404;
          return next(err);
        }
      })
      .catch((err) => next(err));
  });

module.exports = userRouter;
