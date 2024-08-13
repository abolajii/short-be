const express = require("express");
const {
  createLink,
  gotoLink,
  getAllLinks,
  getSingleLink,
  updateLink,
  getLinkCount,
  deleteLink,
  updatePassword,
} = require("../controllers/auth.controller");
const { verifyUser } = require("../middleware/verifyUser");

const router = express.Router();

router.post("/create-short", [verifyUser], createLink);

router.get("/links", [verifyUser], getAllLinks);

router.put("/password", [verifyUser], updatePassword);

router.get("/all/count", [verifyUser], getLinkCount);

router.get("/links/:id", [verifyUser], getSingleLink);

router.delete("/links/:id", [verifyUser], deleteLink);

router.put("/links/:id", [verifyUser], updateLink);

router.get("/:shortUrl", gotoLink);

module.exports = router;
