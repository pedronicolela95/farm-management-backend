require("dotenv").config();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const { secret } = require("../utils/helpers");

const NotFoundError = require("../errors/not-found-err");
const BadRequestError = require("../errors/bad-request-err");
const NotAuthorizedError = require("../errors/not-authorized-err");
const ConflictError = require("../errors/conflict-err");

module.exports.createUsers = (req, res, next) => {
  const { email, farmName, city, state, farmPhoto } = req.body;

  User.findOne({ email })
    .then((existingUser) => {
      if (existingUser) {
        throw new ConflictError("E-mail já está em uso");
      }

      return bcrypt.hash(req.body.password, 10);
    })
    .then((hash) =>
      User.create({
        email,
        password: hash,
        farmName,
        city,
        state,
        farmPhoto,
      })
    )
    .then((user) => res.send({ user }))
    .catch((err) => {
      if (err.name === "ValidationError") {
        const error = new BadRequestError("Os dados fornecidos são inválidos");
        next(error);
      }
      next(err);
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      res.send({
        token: jwt.sign({ _id: user._id }, secret, {
          expiresIn: "7d",
        }),
      });
    })
    .catch((err) => {
      const error = new NotAuthorizedError(err.message);
      next(error);
    });
};

module.exports.getUserInfo = (req, res, next) => {
  User.findById(req.user._id)
    .select("+password")
    .then((user) => {
      if (!user) {
        throw new NotFoundError("Nenhum usuário encontrado com esse id");
      }
      res.send({ user });
    })
    .catch((err) => {
      if (err.name === "CastError") {
        const error = new BadRequestError("Formato de ID não válido");
        next(error);
      }
      next(err);
    });
};

module.exports.updateUserProfile = (req, res, next) => {
  const { farmName, city, state } = req.body;
  User.findByIdAndUpdate(req.user._id, { farmName, city, state }, { new: true })
    .then((user) => {
      res.send({ user });
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        const error = new BadRequestError("Formato de ID não válido");
        next(error);
      }
      next(err);
    });
};

module.exports.updateUserAvatar = (req, res, next) => {
  const { farmPhoto } = req.body;
  User.findByIdAndUpdate(req.user._id, { farmPhoto }, { new: true })
    .then((user) => {
      res.send({ user });
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        const error = new BadRequestError("Os dados fornecidos são inválidos");
        next(error);
      }
      next(err);
    });
};
