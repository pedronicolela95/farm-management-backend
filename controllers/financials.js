const moment = require("moment");
const Financial = require("../models/financial");
const BadRequestError = require("../errors/bad-request-err");
const ForbiddenError = require("../errors/forbidden-err");
const NotFoundError = require("../errors/not-found-err");
const {
  calculateTwelveMonths,
  calculateFinancialsCategory,
} = require("../utils/helpers");

module.exports.getFinancials = (req, res, next) => {
  Financial.find({ farm: req.user._id })
    .then((financials) => res.send({ financials }))
    .catch((err) => {
      next(err);
    });
};

module.exports.createFinancial = (req, res, next) => {
  const {
    description, category, type, date, amount, hasOcurred,
  } = req.body;

  const inputDate = moment(date).startOf("day");
  const today = moment().startOf("day");

  if (hasOcurred === true && inputDate.isAfter(today)) {
    throw new BadRequestError("Finança ocorrida com data de criação no futuro");
  } else if (hasOcurred === false && inputDate.isBefore(today)) {
    throw new BadRequestError(
      "Finança projetada com data de criação no passado",
    );
  }
  Financial.create({
    description,
    category,
    type,
    date,
    amount,
    hasOcurred,
    farm: req.user._id,
  })
    .then((financial) => res.send({ financial }))
    .catch((err) => {
      if (err.name === "ValidationError") {
        const error = new BadRequestError("Os dados fornecidos são inválidos");
        next(error);
      }
      next(err);
    });
};

module.exports.deleteFinancial = (req, res, next) => {
  Financial.findById(req.params.financialId)
    .orFail(() => {
      throw new NotFoundError("Nenhum registro encontrado com esse id");
    })
    .then((financial) => {
      if (financial.farm.toString() !== req.user._id.toString()) {
        throw new ForbiddenError("Usuário não possui autorização");
      }
      return Financial.findByIdAndDelete(req.params.financialId);
    })
    .then(() => res.send({ message: "Registro excluído com sucesso" }))
    .catch((err) => {
      if (err.name === "CastError") {
        const error = new BadRequestError("Formato de ID não válido");
        next(error);
      }
      next(err);
    });
};

module.exports.convertProjectedFinancial = (req, res, next) => {
  Financial.findById(req.params.financialId)
    .orFail(() => {
      throw new NotFoundError("Nenhum registro encontrado com esse id");
    })
    .then((financial) => {
      if (financial.farm.toString() !== req.user._id.toString()) {
        throw new ForbiddenError("Usuário não possui autorização");
      } else if (financial.hasOcurred === true) {
        throw new BadRequestError(
          "Resgistro já está classificado como realizada",
        );
      }
      return Financial.findByIdAndUpdate(req.params.financialId, {
        hasOcurred: true,
      });
    })
    .then(() => res.send({ message: "Registro convertido com sucesso" }))
    .catch((err) => {
      if (err.name === "ValidationError") {
        const error = new BadRequestError("Formato de ID não válido");
        next(error);
      }
      next(err);
    });
};

module.exports.calculateFinancialsMonthly = (req, res, next) => {
  const { type, hasOcurred } = req.body;
  Financial.find({ farm: req.user._id, type, hasOcurred })
    .then((financial) => calculateTwelveMonths(financial, hasOcurred))
    .then((calculateFinancials) => res.send({ calculateFinancials }))
    .catch((err) => {
      if (err.name === "CastError") {
        const error = new BadRequestError("Formato de ID não válido");
        next(error);
      }
      next(err);
    });
};

module.exports.calculateProfitMonthly = (req, res, next) => {
  const { hasOcurred } = req.body;
  Financial.find({ farm: req.user._id, hasOcurred })
    .then((financial) => {
      const costFinancials = financial.filter(
        (unidade) => unidade.type === "Custo",
      );
      const revenueFinancials = financial.filter(
        (unidade) => unidade.type === "Receita",
      );

      const costMonthly = calculateTwelveMonths(costFinancials, hasOcurred);
      const revenueMonthly = calculateTwelveMonths(
        revenueFinancials,
        hasOcurred,
      );

      const profit = {};

      Object.keys(revenueMonthly).forEach((key) => {
        profit[key] = revenueMonthly[key] - costMonthly[key];
      });
      return profit;
    })
    .then((profit) => res.send({ profit }))
    .catch((err) => {
      if (err.name === "CastError") {
        const error = new BadRequestError("Formato de ID não válido");
        next(error);
      }
      next(err);
    });
};

module.exports.calculateCategoryPercentage = (req, res, next) => {
  const { type, hasOcurred } = req.body;
  Financial.find({ farm: req.user._id, type, hasOcurred })
    .then((financial) => calculateFinancialsCategory(financial, hasOcurred))
    .then((financial) => res.send({ financial }))
    .catch((err) => {
      if (err.name === "CastError") {
        const error = new BadRequestError("Formato de ID não válido");
        next(error);
      }
      next(err);
    });
};
