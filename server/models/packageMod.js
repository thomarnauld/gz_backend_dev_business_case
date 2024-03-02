const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema({
  package_id: { type: String },
  active_delivery_id: { type: String },
  description: { type: String },
  weight: { type: Number, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  depth: { type: Number, required: true },
  from_name: { type: String, required: true },
  from_address: { type: String, required: true },
  from_location: {
    type: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    required: true,
  },
  to_name: { type: String, required: true },
  to_address: { type: String, required: true },
  to_location: {
    type: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    required: true,
  },
});

module.exports = mongoose.model("Package", packageSchema);
