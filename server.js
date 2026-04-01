const cors = require("cors");
app.use(cors());
const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const API_KEY = process.env.API_KEY;

// Rota principal
app.get("/", (req, res) => {
  res.send("SatsFlow API ONLINE 🚀");
});

// Enviar sats
app.post("/pagar", async (req, res) => {
  const { amount, lightning } = req.body;

  if (!amount || !lightning) {
    return res.status(400).send("Dados inválidos");
  }

  if (amount > 100) {
    return res.send("Limite máximo de 100 sats");
  }

  try {
    const response = await axios.post(
      "https://api.opennode.com/v2/withdrawals",
      {
        type: "ln",
        amount: amount,
        address: lightning
      },
      {
        headers: {
          Authorization: API_KEY
        }
      }
    );

    res.json(response.data);
  } catch (err) {
    console.log(err.response?.data);
    res.status(500).send("Erro ao enviar sats");
  }
});

// Gerar cobrança (QR)
app.post("/invoice", async (req, res) => {
  const { amount } = req.body;

  try {
    const response = await axios.post(
      "https://api.opennode.com/v1/charges",
      {
        amount: amount,
        currency: "BRL"
      },
      {
        headers: {
          Authorization: API_KEY
        }
      }
    );

    res.json({
      lightning_invoice: response.data.data.lightning_invoice.payreq,
      qr: response.data.data.lightning_invoice.qr_code
    });

  } catch (err) {
    console.log(err.response?.data || err.message);
    res.status(500).send("Erro ao gerar cobrança");
  }
});

// Porta correta para Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor rodando 🚀"));
