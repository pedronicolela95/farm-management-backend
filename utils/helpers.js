const { NODE_ENV, JWT_SECRET } = process.env;
const validator = require("validator");
const moment = require("moment");
const financial = require("../models/financial");

moment.utc();

const secret = NODE_ENV === "production" ? JWT_SECRET : "dev-secret";

function isValidAvatarURL(v) {
  const regex =
    /^https?:\/\/(www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}/;
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

function calculateTwelveMonths(data, hasOcurred) {
  const today = moment();

  const monthlyValues = {};
  if (hasOcurred === true) {
    for (let i = 0; i < 12; i++) {
      const month = today.clone().subtract(i, "months").format("YYYY-MM");
      monthlyValues[month] = 0;
    }
  } else if (hasOcurred === false) {
    for (let i = 0; i < 12; i++) {
      const month = today.clone().add(i, "months").format("YYYY-MM");
      monthlyValues[month] = 0;
    }
  }

  data.forEach((item) => {
    const dataItem = moment.utc(item.date);
    const monthYear = dataItem.format("YYYY-MM");

    if (monthlyValues[monthYear] !== undefined) {
      monthlyValues[monthYear] += item.amount;
    }
  });

  return monthlyValues;
}

function calculateFinancialsCategory(data, hasOcurred) {
  const today = moment();
  let financialFiltered = [];
  if (hasOcurred === true) {
    financialFiltered = data.filter(
      (financial) => financial.date >= today.clone().subtract(30, "days")
    );
  } else {
    financialFiltered = data.filter(
      (financial) => financial.date <= today.clone().add(30, "days")
    );
  }

  let category = {};

  for (let i = 0; i < financialFiltered.length; i++) {
    if (category[financialFiltered[i].category]) {
      category[financialFiltered[i].category] += financialFiltered[i].amount;
    } else {
      category[financialFiltered[i].category] = financialFiltered[i].amount;
    }
  }
  return category;
}

module.exports = {
  secret,
  isValidAvatarURL,
  validateURL,
  calculateTwelveMonths,
  calculateFinancialsCategory,
};
