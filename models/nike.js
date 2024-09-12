const mongoose = require("mongoose");
const Schema = mongoose.Schema;
require("mongoose-currency").loadType(mongoose);
const Currency = mongoose.Types.Currency;

const commentSchema = new Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    text: {
      type: String,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const nikeSchema = new Schema(
  {
    node: {
      name: {
        type: String,
        required: true,
        unique: true,
      },
      model: {
        type: String,
        required: true,
      },
      market: {
        state: {
          highestBid: {
            amount: {
              type: Currency,
              required: true,
              min: 0,
            },
          },
        },
      },
      media: {
        smallImageUrl: {
          type: String,
          required: true,
        },
      },
    },

    comments: [commentSchema],
  },
  {
    timestamps: true,
  }
);

const Nike = mongoose.model("Nike", nikeSchema);

module.exports = Nike;
