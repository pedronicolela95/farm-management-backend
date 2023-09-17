require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const { PORT = 3000 } = process.env;

const { errors } = require("celebrate");
const userRoute = require("./routes/users");
const cardRoute = require("./routes/cards");

const NotFoundError = require("./errors/not-found-err");
const { requestLogger, errorLogger } = require("./middlewares/logger");

const app = express();

mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
});

app.use(cors());
app.options("*", cors());

app.use(bodyParser.json());

app.use(requestLogger);

app.use(userRoute);
app.use(cardRoute);

app.use((req, res, next) => {
  const error = new NotFoundError("A solicitação não foi encontrada");
  next(error);
});

app.use(errorLogger);

app.use(errors());

app.use((err, req, res, next) => {
  const error = { ...err };
  error.statusCode = err.statusCode || 500;
  error.message = err.message || "Um erro ocorreu no servidor";

  res.status(error.statusCode).send({ message: error.message });
});

app.listen(PORT);
