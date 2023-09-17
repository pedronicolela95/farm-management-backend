const { NODE_ENV, JWT_SECRET } = process.env;
const validator = require("validator");

const secret = NODE_ENV === "production" ? JWT_SECRET : "dev-secret";

function isValidAvatarURL(v) {
  const regex = /^https?:\/\/(www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}/;
  if (!regex.test(v)) {
    throw new Error(`${v} não é uma URL válida`);
  }
}

function validateURL(value, helpers) {
  if (validator.isURL(value)) {
    return value;
  }
  return helpers.error("string.uri");
}

module.exports = {
  secret,
  isValidAvatarURL,
  validateURL,
};
