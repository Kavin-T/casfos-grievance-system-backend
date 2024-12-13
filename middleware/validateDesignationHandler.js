const asyncHandler = require("express-async-handler");

const validateDesignation = (validDesignations) => {
  return asyncHandler(async (req, res, next) => {
    const user = req.user;
    if (!validDesignations.includes(user.designation)) {
      res.status(403);
      throw new Error("Access denied: Insufficient permissions");
    }
    next();
  });
};

module.exports = validateDesignation;

