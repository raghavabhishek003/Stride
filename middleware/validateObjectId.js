const mongoose = require('mongoose');

const validateObjectId = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ message: `Invalid ${paramName} format` });
    }
    next();
  };
};

module.exports = validateObjectId;
