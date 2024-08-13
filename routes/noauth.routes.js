const express = require("express");
const { logIn, register } = require("../controllers/noauth.controller");

const router = express.Router();

router.post("/login", logIn);

router.post("/create/user", register);

module.exports = router;
