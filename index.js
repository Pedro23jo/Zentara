require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

app.post('/webhook', async (req, res) => {
  const msg = req.body.message?.body?.toLowerCase();
  const number = req.body.message?.from;

  if (!msg || !number) return res.sendStatus(400);

  let response = "";

  if (msg === "oi" || msg === "olá" || msg === "menu" || msg.includes("iniciar")) {
    response = "Olá! Bem-vindo à Zentara Exchange.

Escolha uma opção:
1 - Comprar USDT
2 - Vender USDT
3 - Consultar Taxas
4 - Falar com um atendente";
  } else if (msg === "1") {
    response = "Perfeito! Quantos USDT você deseja comprar?";
  } else if (msg === "2") {
    response = "Ótimo! Quantos USDT você deseja vender?";
  } else if (msg === "3") {
    response = "Taxas atuais:

Compramos 1 USDT por 1.100 Kz
Vendemos 1 USDT por 1.130 Kz.";
  } else if (msg === "4") {
    response = "Certo! Um atendente irá falar com você em breve.";
  } else {
    response = "Não entendi. Por favor, envie 'menu' para ver as opções disponíveis.";
  }

  await axios.post(`https://api.z-api.io/instances/${process.env.ZAPI_INSTANCE_ID}/token/${process.env.ZAPI_TOKEN}/send-text`, {
    phone: number,
    message: response
  }).catch(err => console.error(err.response?.data || err.message));

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Bot rodando na porta ${PORT}`));
