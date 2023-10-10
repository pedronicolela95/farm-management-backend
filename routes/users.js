const router = require("express").Router();
const { celebrate, Joi, Segments } = require("celebrate");
const { auth } = require("../middlewares/auth");
const { validateURL } = require("../utils/helpers");

const {
  getUserInfo,
  createUsers,
  login,
  updateUserProfile,
  updateUserAvatar,
} = require("../controllers/users");

const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  farmName: Joi.string().min(2).max(50).required(),
  city: Joi.string().min(2).max(50).required(),
  state: Joi.string().min(2).max(50).required(),
  farmPhoto: Joi.string().custom(validateURL),
  createdAt: Joi.date().default(new Date()),
});

router.get("/crash-test", () => {
  setTimeout(() => {
    throw new Error("O servidor travará agora");
  }, 0);
});

router.post("/signup", celebrate({ [Segments.BODY]: userSchema }), createUsers);

router.post(
  "/signin",
  celebrate({
    [Segments.BODY]: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    }),
  }),
  login,
);

router.get("/farm-info", auth, getUserInfo);

router.patch(
  "/farm-info",
  auth,
  celebrate({
    [Segments.BODY]: Joi.object({
      farmName: Joi.string().min(2).max(50).required(),
      city: Joi.string().min(2).max(50).required(),
      state: Joi.string().min(2).max(50).required(),
    }),
  }),
  updateUserProfile,
);

router.patch(
  "/farm-info/farm-photo",
  auth,
  celebrate({
    [Segments.BODY]: Joi.object({
      farmPhoto: Joi.string().custom(validateURL),
    }),
  }),
  updateUserAvatar,
);

module.exports = router;
