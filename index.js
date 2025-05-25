require('dotenv').config();
const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const validatePDF = require('./utils/validatePDF');

app.use(express.json());
app.use(fileUpload());

const PORT = process.env.PORT || 3000;

// Mensagem inicial
const welcomeMessage = `
Bem-vindo à *Zentara Exchange*! 🇦🇴

Escolha uma opção:
1️⃣ Comprar USDT (rede Polygon) – *1 USDT = 1100 Kz*  
2️⃣ Vender USDT – *1 USDT = 1130 Kz*  
3️⃣ Métodos de pagamento: Cartão, Multicaixa ou Criptomoeda  
4️⃣ Envie o comprovativo da transação (PDF até 30 KB)

Responda com o número da opção que deseja.
`;

// Webhook do WhatsApp
app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (!body.messages || body.messages.length === 0) {
    return res.sendStatus(200);
  }

  const message = body.messages[0];
  const from = message.from;
  const type = message.type;

  // Cliente envia texto
  if (type === 'text') {
    const text = message.text.body.trim();

    let response = '';

    if (text === '1') {
      response = `*Comprar USDT*\nTaxa: 1 USDT = 1100 Kz\nEnvie o valor em Kz que deseja trocar e o comprovativo em PDF (máx. 30 KB).`;
    } else if (text === '2') {
      response = `*Vender USDT*\nTaxa: 1 USDT = 1130 Kz\nIndique a quantidade e envie seu comprovativo.`;
    } else if (text === '3') {
      response = `*Formas de Pagamento*\n- Cartão (Visa / Mastercard)\n- Multicaixa\n- Criptomoeda (USDT - rede Polygon)\n\nIBANs e carteiras disponíveis após envio do valor.`;
    } else {
      response = welcomeMessage;
    }

    await sendMessage(from, response);
  }

  // Cliente envia documento
  else if (type === 'document') {
    const doc = message.document;

    if (doc.mime_type !== 'application/pdf') {
      await sendMessage(from, '❌ Apenas ficheiros *PDF* são aceites.');
      return res.sendStatus(200);
    }

    if (doc.size > 30000) {
      await sendMessage(from, '⚠️ O comprovativo excede 30 KB. Será analisado manualmente por um agente.');
    } else {
      await sendMessage(from, '✅ Comprovativo recebido. Estamos a verificar.');
    }

    // Aqui você pode implementar lógica para baixar e validar o PDF de verdade
  }

  res.sendStatus(200);
});

// Função para responder via WhatsApp
async function sendMessage(to, message) {
  await fetch(`https://graph.facebook.com/v18.0/${process.env.PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      text: { body: message }
    })
  });
}

app.listen(PORT, () => {
  console.log(`Servidor ativo na porta ${PORT}`);
});
