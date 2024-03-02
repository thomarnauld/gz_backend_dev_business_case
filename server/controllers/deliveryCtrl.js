const asyncHandler = require("express-async-handler"); // Import asyncHandler
const Delivery = require("../models/deliveryMod"); // Assuming you have a Delivery model
const { getMatchedOne } = require("./matchedOneCtrl.js");

// GET all deliveries
const getAllDeliveries = asyncHandler(async (req, res) => {
  const deliveries = await Delivery.find();
  res.json(deliveries);
});

// GET delivery by ID
const getDeliveryById = asyncHandler(async (req, res) => {
  const delivery_id = req.params.id;
  const matchedDelivery = await getMatchedOne("delivery", { delivery_id });
  res.json(matchedDelivery);
});

// POST create new delivery
const createNewDelivery = asyncHandler(async (req, res) => {
  const package_id = req.body.package_id;
  const matchedPackage = await getMatchedOne("package", { package_id }, false);
  if (!matchedPackage) throw new Error(`Package ${req.body.package_id} not found`);

  const delivery_id = req.params.id;
  const matchedDelivery = await getMatchedOne("delivery", { delivery_id }, false);
  if (matchedDelivery) throw new Error("Duplicate entry");
  // Validate and extract data from request body
  const { ...deliveryData } = req.body; // Destructure body data
  // Create a new Delivery object with ID and data
  const newDelivery = new Delivery({
    delivery_id,
    ...deliveryData,
  });
  // Save the new delivery to the database
  const savedDelivery = await newDelivery.save();
  // Respond with the saved delivery and generated ID
  res.status(201).json(savedDelivery);
});

// PUT update delivery
const updateDelivery = asyncHandler(async (req, res) => {
  const delivery_id = req.params.id;
  const matchedDelivery = await getMatchedOne("delivery", { delivery_id });
  const updatedDelivery = await Delivery.findByIdAndUpdate(matchedDelivery._id, req.body, { new: true });
  res.json(updatedDelivery);
});

// DELETE delivery
const deleteDelivery = asyncHandler(async (req, res) => {
  const delivery_id = req.params.id;
  const matchedDelivery = await getMatchedOne("delivery", { delivery_id });
  await Delivery.findByIdAndDelete(matchedDelivery._id);
  res.json({ message: "Delivery deleted successfully" });
});

module.exports = {
  getAllDeliveries,
  getDeliveryById,
  createNewDelivery,
  updateDelivery,
  deleteDelivery,
};
