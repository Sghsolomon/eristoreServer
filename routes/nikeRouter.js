const express = require("express");
const Nike = require("../models/nike");
const authenticate = require("../authenticate");

const nikeRouter = express.Router();

nikeRouter
  .route("/")
  .get((req, res, next) => {
    Nike.find()
      .populate("comments.author")
      .then((nikes) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(nikes);
      })
      .catch((err) => next(err));
  })
  .post((req, res, next) => {
    Nike.create(req.body)
      .then((nike) => {
        console.log("nike Created ", nike);
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(nike);
      })
      .catch((err) => next(err));
  })
  .put((req, res) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /nikes");
  })
  .delete((req, res, next) => {
    Nike.deleteMany()
      .then((response) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(response);
      })
      .catch((err) => next(err));
  });

nikeRouter
  .route("/:nikeId")
  .get((req, res, next) => {
    Nike.findById(req.params.nikeId)
      .then((nike) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(nike);
      })
      .catch((err) => next(err));
  })
  .post((req, res) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /nikes/${req.params.nikeId}`);
  })
  .put((req, res, next) => {
    Nike.findByIdAndUpdate(
      req.params.nikeId,
      {
        $set: req.body,
      },
      { new: true }
    )
      .then((nike) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(nike);
      })
      .catch((err) => next(err));
  })
  .delete((req, res, next) => {
    Nike.findByIdAndDelete(req.params.nikeId)
      .then((response) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(response);
      })
      .catch((err) => next(err));
  });

//"/:nikeId/comments"
nikeRouter
  .route("/:nikeId/comments")
  .get(authenticate.verifyUser, (req, res, next) => {
    Nike.findById(req.params.nikeId)
      .populate("comments.author")
      .then((nike) => {
        if (nike) {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(nike.comments);
        } else {
          err = new Error(`nike Id ${req.params.nikeId} not found`);
          err.status = 404;
          return next(err);
        }
      })
      .catch((err) => next(err));
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    Nike.findById(req.params.nikeId)
      .then((nike) => {
        if (nike) {
          req.body.author = req.user._id;
          nike.comments.push(req.body);
          nike
            .save()
            .then((nike) => {
              const postedComment = nike.comments[nike.comments.length - 1];
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json({
                comment: postedComment,
                author: {
                  _id: req.user_id,
                  username: req.user.username,
                },
              });
            })
            .catch((err) => next(err));
        } else {
          err = new Error(`nike ${req.params.nikeId} not found`);
          err.status = 404;
          return next(err);
        }
      })
      .catch((err) => next(err));
  })
  .put((req, res) => {
    res.statusCode = 403;
    res.end(
      `PUT operation not supported on /nikes/${req.params.nikeId}/comments`
    );
  })
  .delete((req, res, next) => {
    Nike.findById(req.params.nikeId)
      .then((nike) => {
        if (nike) {
          for (let i = nike.comments.length - 1; i >= 0; i--) {
            nike.comments.id(nike.comments[i]._id).deleteOne();
          }
          nike
            .save()
            .then((nike) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(nike);
            })
            .catch((err) => next(err));
        } else {
          err = new Error(`Nike ${req.params.campsiteId} not found`);
          err.status = 404;
          return next(err);
        }
      })
      .catch((err) => next(err));
  });

nikeRouter
  .route("/:nikeId/comments/:commentId")
  .get((req, res, next) => {
    Nike.findById(req.params.nikeId)
      .then((nike) => {
        if (nike && nike.comments.id(req.params.commentId)) {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(nike.comments.id(req.params.commentId));
        } else if (!nike) {
          err = new Error(`nike ${req.params.nikeId} not found`);
          err.status = 404;
          return next(err);
        } else {
          err = new Error(`Comment ${req.params.commentId} not found`);
          err.status = 404;
          return next(err);
        }
      })
      .catch((err) => next(err));
  })
  .post((req, res) => {
    res.statusCode = 403;
    res.end(
      `POST operation not supported on /nikes/${req.params.campsiteId}/comments/${req.params.commentId}`
    );
  })
  .put((req, res, next) => {
    Nike.findById(req.params.nikeId)
      .then((nike) => {
        if (nike && nike.comments.id(req.params.commentId)) {
          if (req.body.rating) {
            nike.comments.id(req.params.commentId).rating = req.body.rating;
          }
          if (req.body.text) {
            nike.comments.id(req.params.commentId).text = req.body.text;
          }
          nike
            .save()
            .then((nike) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(nike);
            })
            .catch((err) => next(err));
        } else if (!nike) {
          err = new Error(`Nike ${req.params.nikeId} not found`);
          err.status = 404;
          return next(err);
        } else {
          err = new Error(`Comment ${req.params.commentId} not found`);
          err.status = 404;
          return next(err);
        }
      })
      .catch((err) => next(err));
  })
  .delete((req, res, next) => {
    Nike.findById(req.params.nikeId)
      .then((nike) => {
        if (nike && nike.comments.id(req.params.commentId)) {
          nike.comments.id(req.params.commentId).deleteOne();
          nike
            .save()
            .then((nike) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(nike);
            })
            .catch((err) => next(err));
        } else if (!nike) {
          err = new Error(`nike ${req.params.nikeId} not found`);
          err.status = 404;
          return next(err);
        } else {
          err = new Error(`Comment ${req.params.commentId} not found`);
          err.status = 404;
          return next(err);
        }
      })
      .catch((err) => next(err));
  });

//'/:nikeId/comments/:commentId'

nikeRouter
  .route("/:nikeId/comments/:commentId")
  .get((req, res, next) => {
    Nike.findById(req.params.nikeId)
      .then((nike) => {
        if (nike && nike.comments.id(req.params.commentId)) {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(nike.comments.id(req.params.commentId));
        } else if (!nike) {
          err = new Error(`nike ${req.params.nikeId} not found`);
          err.status = 404;
          return next(err);
        } else {
          err = new Error(`Comment ${req.params.commentId} not found`);
          err.status = 404;
          return next(err);
        }
      })
      .catch((err) => next(err));
  })
  .post((req, res) => {
    res.statusCode = 403;
    res.end(
      `POST operation not supported on /nikes/${req.params.nikeId}/comments/${req.params.commentId}`
    );
  })
  .put((req, res, next) => {
    Nike.findById(req.params.nikeId)
      .then((nike) => {
        if (nike && nike.comments.id(req.params.commentId)) {
          Nike.findByIdAndUpdate(
            nike.comments.id(req.params.commentId),
            { $set: req.body },
            { new: true }
          );
          // if (req.body.rating) {
          //   nike.comments.id(req.params.commentId).rating = req.body.rating;
          // }
          // if (req.body.text) {
          //   nike.comments.id(req.params.commentId).text = req.body.text;
          // }
          nike
            .save()
            .then((nike) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(nike);
            })
            .catch((err) => next(err));
        } else if (!nike) {
          err = new Error(`nike ${req.params.nikeId} not found`);
          err.status = 404;
          return next(err);
        } else {
          err = new Error(`Comment ${req.params.commentId} not found`);
          err.status = 404;
          return next(err);
        }
      })
      .catch((err) => next(err));
  })
  .delete((req, res, next) => {
    Nike.findById(req.params.nikeId)
      .then((nike) => {
        if (nike && nike.comments.id(req.params.commentId)) {
          nike.comments.id(req.params.commentId).deleteOne();
          nike
            .save()
            .then((nike) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(nike);
            })
            .catch((err) => next(err));
        } else if (!nike) {
          err = new Error(`nike ${req.params.nikeId} not found`);
          err.status = 404;
          return next(err);
        } else {
          err = new Error(`Comment ${req.params.commentId} not found`);
          err.status = 404;
          return next(err);
        }
      })
      .catch((err) => next(err));
  });

module.exports = nikeRouter;
