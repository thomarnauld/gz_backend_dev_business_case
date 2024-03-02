// controllers/deliveryController.js

const Delivery = require("../models/deliveryMod");
const { getMatchedOne } = require("./matchedOneCtrl");

let subscriptions = {};

const updateDelivery = async (delivery_id, data) => {
  const matchedDelivery = await getMatchedOne("delivery", { delivery_id });
  const updatedDelivery = await Delivery.findByIdAndUpdate(matchedDelivery._id, data, { new: true });
  return updatedDelivery;
};

const broadcastDeliveryUpdate = (event, delivery_object) => {
  // Notify subscribers of this delivery
  if (subscriptions[delivery_object.delivery_id]) {
    subscriptions[delivery_object.delivery_id].forEach((subscriber) => {
      subscriber.emit(event, delivery_object);
    });
  }
};

async function handleLocationChanged(socket, payload) {
  const { delivery_id, location } = payload;
  let delivery_object = await updateDelivery(delivery_id, { location });
  delivery_object && broadcastDeliveryUpdate("delivery_updated", delivery_object);
}

async function handleStatusChanged(socket, payload) {
  const { delivery_id, status } = payload;
  let data = { status };
  status === "picked-up" && (data.pickup_time = new Date());
  status === "in-transit" && (data.start_time = new Date());
  (status === "delivered" || status === "failed") && (data.end_time = new Date());
  let delivery_object = await updateDelivery(delivery_id, data);
  delivery_object && broadcastDeliveryUpdate("delivery_updated", delivery_object);
}

function handleSubscribe(socket, payload) {
  const { delivery_id } = payload;
  if (!subscriptions[delivery_id]) {
    subscriptions[delivery_id] = [];
  }
  subscriptions[delivery_id].push(socket);
}

module.exports = {
  handleLocationChanged,
  handleStatusChanged,
  handleSubscribe,
};
