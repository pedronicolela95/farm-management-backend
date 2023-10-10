const mongoose = require("mongoose");

const financialSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
  category: {
    type: String,
    required: true,
    enum: [
      "Insumos Agrícolas",
      "Mão de Obra",
      "Despesas com Animais",
      "Despesas Administrativas",
      "Facilities",
      "Custos de Marketing e Vendas",
      "Venda de Animais",
      "Venda de Produtos Agrícolas",
      "Arrendamento de Terras",
      "Outros",
    ],
  },
  type: {
    type: String,
    required: true,
    enum: ["Receita", "Custo"],
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  amount: {
    type: Number,
    default: 0,
    required: true,
    validate: {
      validator(value) {
        return value > 0;
      },
      message: "O campo 'amount' deve ser maior que zero.",
    },
  },
  hasOcurred: {
    type: Boolean,
    default: true,
  },
  farm: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("financial", financialSchema);
