const Link = require("../model/Link");
const User = require("../model/User");
const bcrypt = require("bcrypt");

// Function to generate a random short URL
const generateShortUrl = () => {
  return Math.random().toString(36).substring(2, 8);
};

const createLink = async (req, res) => {
  const userId = req.user.userId;
  const { destination, title, customUrl, tag } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    let shortUrl = customUrl || generateShortUrl();

    // Ensure the short URL is unique
    let existingLink = await Link.findOne({ shortUrl });
    while (existingLink) {
      if (customUrl) {
        return res.status(400).send("Custom short URL is already in use");
      }
      shortUrl = generateShortUrl();
      existingLink = await Link.findOne({ shortUrl });
    }

    const newLink = new Link({
      destination,
      shortUrl,
      title,
      tag,
      user: userId,
    });
    await newLink.save();

    res.status(201).json({ message: "Link created successfully", shortUrl });
  } catch (error) {
    console.log(error);
    res.status(400).send("Error creating link");
  }
};

const gotoLink = async (req, res) => {
  const { shortUrl } = req.params;

  console.log(shortUrl);

  try {
    const link = await Link.findOne({ shortUrl });
    if (!link) {
      return res.status(404).send("Link not found");
    }

    res.redirect(link.destination);
  } catch (error) {
    res.status(500).send("Error redirecting to the link");
  }
};

const getAllLinks = async (req, res) => {
  const userId = req.user.userId;

  try {
    const links = await Link.find({ user: userId });
    res.status(200).send({
      data: [{ status: "success", links: links }],
    });
  } catch (error) {
    console.log(error);
  }
};

const getSingleLink = async (req, res) => {
  const { id } = req.params;

  try {
    const link = await Link.findById(id); // Use findById to find the document by its _id
    if (link) {
      res.status(200).json({ message: "Link retrieved successfully", link });
    } else {
      res.status(404).json({ message: "Link not found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving link", error: error.message });
  }
};

const updateLink = async (req, res) => {
  const { id } = req.params;
  const { title, destination, tag, customUrl } = req.body;

  try {
    const updatedLink = await Link.findByIdAndUpdate(
      id,
      { title, destination, tag, customUrl },
      { new: true, runValidators: true }
    );

    if (updatedLink) {
      res
        .status(200)
        .json({ message: "Link updated successfully", link: updatedLink });
    } else {
      res.status(404).json({ message: "Link not found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating link", error: error.message });
  }
};

const deleteLink = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;
  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const link = await Link.findOneAndDelete({ _id: id, user: userId });

    if (!link) {
      return res
        .status(404)
        .json({ message: "Link not found or not associated with this user" });
    }

    res.status(200).json({ message: "Link deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const getLinkCount = async (req, res) => {
  const userId = req.user.userId;

  try {
    const userLinkCount = await Link.countDocuments({ user: userId });

    res.status(200).json({ userLinkCount });
  } catch (error) {
    console.error("Error fetching user link count:", error);
    res.status(500).json({ message: "Error fetching user link count" });
  }
};

const updatePassword = async (req, res) => {
  const userId = req.user.userId;

  try {
    const { oldPassword, newPassword } = req.body;

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the current password is correct
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createLink,
  gotoLink,
  getAllLinks,
  getSingleLink,
  updateLink,
  deleteLink,
  getLinkCount,
  updatePassword,
};
