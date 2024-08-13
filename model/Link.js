const mongoose = require("mongoose");

const LinkSchema = new mongoose.Schema(
  {
    destination: { type: String, required: true },
    shortUrl: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    tag: { type: String, required: false },
    title: { type: String, required: false },
    click: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Link", LinkSchema);
