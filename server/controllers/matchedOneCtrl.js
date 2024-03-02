const asyncHandler = require("express-async-handler");
const Package = require("../models/packageMod.js");
const Delivery = require("../models/deliveryMod.js");

const getModel = (docLabel) => {
  switch (docLabel) {
    case "package":
      return Package;
    case "delivery":
      return Delivery;
    default:
      throw new Error(`Invalid document label: ${docLabel}`);
  }
};

const getMatchedOne = asyncHandler(async (docLabel, ope, retrieveError = true) => {
  const Model = getModel(docLabel);
  const matchedItem = await Model.findOne(ope);
  if (!matchedItem && retrieveError) throw new Error(`${docLabel} not found`);
  return matchedItem;
});

module.exports = { getMatchedOne };
