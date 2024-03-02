const express = require("express");
const { getAllDeliveries, getDeliveryById, createNewDelivery, updateDelivery, deleteDelivery } = require("../controllers/deliveryCtrl.js");

const router = express.Router();

router.get("/", getAllDeliveries);
router.get("/:id", getDeliveryById);
router.post("/:id", createNewDelivery);
router.put("/:id", updateDelivery);
router.delete("/:id", deleteDelivery);

module.exports = router;
