require('dotenv').config();
const express = require('express');
const fileUpload = require('express-fileupload');
const axios = require('axios');
const validatePDF = require('./utils/validatePDF');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(fileUpload());

const welcomeMessage = `
Bem-vindo à *Zentara Exchange*! 🇦🇴

Escolha uma opção:
1️⃣ Comprar USDT – *1 USDT = 1100 Kz*  
2️⃣ Vender USDT – *1 USDT = 1130 Kz*  
3️⃣ Formas de pagamento: Cartão, Multicaixa ou Criptomoeda  
4️⃣ Envie seu comprovativo em PDF (até 30 KB)
`;

// Endpoint que o Z-API chama quando há nova mensagem
app.post('/webhook', async (req, res) => {
  const data = req.body;

  if (!data.message || !data.message.type) return res.sendStatus(200);

  const sender = data.phone;
  const message = data.message;

  // Texto
  if (message.type === 'text') {
    const text = message.text.body.trim();

    let reply = '';

    if (text === '1') {
      reply = `*Comprar USDT*\nTaxa: 1 USDT = 1100 Kz\nEnvie o valor e o comprovativo em PDF (até 30 KB).`;
    } else if (text === '2') {
      reply = `*Vender USDT*\nTaxa: 1 USDT = 1130 Kz\nIndique a quantidade e envie o comprovativo.`;
    } else if (text === '3') {
      reply = `*Formas de pagamento*\n- Cartão\n- Multicaixa\n- Criptomoeda (USDT - Polygon)\n\nVocê receberá os dados após envio do valor.`;
    } else {
      reply = welcomeMessage;
    }

    await sendMessage(sender, reply);
  }

  // Documento PDF
  else if (message.type === 'document') {
    const mime = message.document.mime_type;
    const size = message.document.file_size;

    if (mime !== 'application/pdf') {
      await sendMessage(sender, '❌ Apenas ficheiros *PDF* são aceites.');
      return res.sendStatus(200);
    }

    if (size > 30000) {
      await sendMessage(sender, '⚠️ O comprovativo excede 30 KB. Um agente irá verificar manualmente.');
    } else {
      await sendMessage(sender, '✅ Comprovativo recebido. Estamos a verificar.');
    }
  }

  res.sendStatus(200);
});

// Função que envia mensagem pelo Z-API
async function sendMessage(phone, message) {
  try {
    await axios.post(`${process.env.ZAPI_URL}/send-message`, {
      phone,
      message
    }, {
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.ZAPI_TOKEN
      }
    });
  } catch (err) {
    console.error('Erro ao enviar mensagem:', err.message);
  }
}

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
