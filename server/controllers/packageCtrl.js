const asyncHandler = require("express-async-handler");
const Package = require("../models/packageMod.js");
const { getMatchedOne } = require("./matchedOneCtrl.js");

// GET all packages
const getAllPackages = asyncHandler(async (req, res) => {
  const packages = await Package.find();
  res.json(packages);
});

// GET package by id
const getPackageById = asyncHandler(async (req, res) => {
  const package_id = req.params.id;
  const matchedPackage = await getMatchedOne("package", { package_id });
  res.json(matchedPackage);
});

// POST create new package
const createNewPackage = asyncHandler(async (req, res) => {
  const package_id = req.params.id;
  // Validate and extract data from request body
  const { ...packageData } = req.body; // Destructure body data

  const matchedPackage = await getMatchedOne("package", { package_id }, false);
  if (matchedPackage) throw new Error("Duplicate entry");

  const delivery_id = packageData?.active_delivery_id;
  if (delivery_id) {
    const matchedDelivery = await getMatchedOne("delivery", { delivery_id }, false);
    if (!matchedDelivery) throw new Error(`Delivery ${delivery_id} not found, you have to put correct delivery_id or leave input empty `);
  }

  // Create a new Package object with ID and data
  const newPackage = new Package({
    ...packageData,
  });
  // Save the new package to the database
  const savedPackage = await newPackage.save();
  // Respond with the saved package and generated ID
  res.status(201).json(savedPackage);
});

// PUT update package
const updatePackage = asyncHandler(async (req, res) => {
  const package_id = req.params.id;
  const matchedPackage = await getMatchedOne("package", { package_id });
  const updatedPackage = await Package.findByIdAndUpdate(matchedPackage._id, req.body, { new: true });
  res.json(updatedPackage);
});

// DELETE delete package
const deletePackage = asyncHandler(async (req, res) => {
  const package_id = req.params.id;
  const matchedPackage = await getMatchedOne("package", { package_id });
  await Package.findByIdAndDelete(matchedPackage._id);
  res.json({ message: "Package deleted successfully" });
});

module.exports = {
  getAllPackages,
  getPackageById,
  createNewPackage,
  updatePackage,
  deletePackage,
};
