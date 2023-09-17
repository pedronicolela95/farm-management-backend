const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");

const { isValidAvatarURL } = require("../utils/helpers");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    validate: {
      validator: (v) => validator.isEmail(v),
      message: "E-mail no formato errado",
    },
  },

  password: {
    type: String,
    required: true,
    select: false,
  },

  farmName: {
    type: String,
    default: "Fazenda",
    minlength: 2,
    maxlength: 50,
    required: true,
  },

  city: {
    type: String,
    default: "São Paulo",
    minlength: 2,
    maxlength: 50,
    required: true,
  },

  state: {
    type: String,
    default: "São Paulo",
    minlength: 2,
    maxlength: 50,
    required: true,
  },

  farmPhoto: {
    type: String,
    default:
      "https://s2-g1.glbimg.com/PkAJ2BkF_dFex7M9JqMhJB8zUz4=/0x0:1920x1080/984x0/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_59edd422c0c84a879bd37670ae4f538a/internal_photos/bs/2020/B/8/GLxRVASxmeYcMAtKACTw/nc-fazenda-itu-061220.jpg",
    validate: {
      validator: isValidAvatarURL,
    },
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  cashFlowAtCreation: {
    type: Number,
    default: 0,
    required: true,
  },
});

userSchema.statics.findUserByCredentials = function findUserByCredentials(
  email,
  password
) {
  return this.findOne({ email })
    .select("+password")
    .then((user) => {
      if (!user) {
        return Promise.reject(new Error("Senha ou e-mail incorreto"));
      }

      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          return Promise.reject(new Error("Senha ou e-mail incorreto"));
        }

        return user;
      });
    });
};

module.exports = mongoose.model("user", userSchema);
