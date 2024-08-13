const Link = require("../model/Link");
const jwt = require("jsonwebtoken");

require("dotenv").config();

module.exports.verifyLinkIdentity = async (req, res, next) => {
  try {
    const { id } = req.params; // Assuming the resource ID is passed as a route parameter

    // Assuming the token is in the authorization header
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    // Verify token and extract user info
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (!decodedToken || !decodedToken.userId) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    const link = await Link.findById(id);

    if (!link) {
      return res.status(404).json({ message: "Resource not found" });
    }

    if (link.user.toString() !== decodedToken.userId) {
      return res
        .status(403)
        .json({ message: "You do not have access to this resource" });
    }

    // If ownership is verified, proceed to the next middleware or route handler
    next();
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

module.exports.verifyUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized access" });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decodedToken; // Attach user info to request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Invalid token", error: error.message });
  }
};
