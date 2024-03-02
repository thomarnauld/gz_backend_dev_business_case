const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema({
  delivery_id: { type: String },
  package_id: { type: String, required: true },
  pickup_time: { type: Date },
  start_time: { type: Date },
  end_time: { type: Date },
  location: {
    type: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ["open", "picked-up", "in-transit", "delivered", "failed"],
  },
});

module.exports = mongoose.model("Delivery", deliverySchema);
