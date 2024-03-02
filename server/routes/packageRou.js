const express = require("express");
const { getAllPackages, getPackageById, createNewPackage, updatePackage, deletePackage } = require("../controllers/packageCtrl.js");

const router = express.Router();

router.get("/", getAllPackages);
router.get("/:id", getPackageById);
router.post("/:id", createNewPackage);
router.put("/:id", updatePackage);
router.delete("/:id", deletePackage);

module.exports = router;
