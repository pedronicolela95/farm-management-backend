const router = require("express").Router();
const { celebrate, Joi, Segments } = require("celebrate");
const mongoose = require("mongoose");
const { auth } = require("../middlewares/auth");

const {
  createFinancial,
  getFinancials,
  deleteFinancial,
  convertProjectedFinancial,
  calculateFinancialsMonthly,
  calculateProfitMonthly,
  calculateCategoryPercentage,
} = require("../controllers/financials");

const objectIdSchema = Joi.string().custom((value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.message("ID inválido");
  }
  return value;
}, "object id validation");

const financialValidationSchema = {
  body: Joi.object().keys({
    description: Joi.string().min(2).max(30).required(),
    category: Joi.string()
      .valid(
        "Insumos Agrícolas",
        "Mão de Obra",
        "Despesas com Animais",
        "Despesas Administrativas",
        "Facilities",
        "Custos de Marketing e Vendas",
        "Venda de Animais",
        "Venda de Produtos Agrícolas",
        "Arrendamento de Terras",
        "Outros"
      )
      .required(),
    type: Joi.string().valid("Receita", "Custo").required(),
    date: Joi.date().iso().required(),
    amount: Joi.number().min(0.01).required(),
    hasOcurred: Joi.boolean().default(true).required(),
  }),
};

router.get("/financials", auth, getFinancials);

router.post("/financials", auth, createFinancial);
// fix me celebrate

router.delete(
  "/financials/:financialId",
  auth,
  celebrate({
    [Segments.PARAMS]: Joi.object({
      financialId: objectIdSchema.required(),
    }),
  }),
  deleteFinancial
);

router.patch(
  "/financials/convert/:financialId",
  auth,
  celebrate({
    [Segments.PARAMS]: Joi.object({
      financialId: objectIdSchema.required(),
    }),
  }),
  convertProjectedFinancial
);

router.post(
  "/financials/financials-monthly",
  auth,
  celebrate({
    [Segments.BODY]: Joi.object({
      type: Joi.string().valid("Receita", "Custo").required(),
      hasOcurred: Joi.boolean().required(),
    }),
  }),
  calculateFinancialsMonthly
);

router.post(
  "/financials/profit-monthly",
  auth,
  celebrate({
    [Segments.BODY]: Joi.object({
      hasOcurred: Joi.boolean().required(),
    }),
  }),
  calculateProfitMonthly
);

router.post(
  "/financials/financials-category",
  auth,
  celebrate({
    [Segments.BODY]: Joi.object({
      type: Joi.string().valid("Receita", "Custo").required(),
      hasOcurred: Joi.boolean().required(),
    }),
  }),
  calculateCategoryPercentage
);

module.exports = router;
