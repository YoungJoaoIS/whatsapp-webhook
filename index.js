import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const VERIFY_TOKEN = "verify123"; // TEM QUE SER O MESMO DA META

// ===============================
// 🔐 VERIFICAÇÃO DO WEBHOOK (META)
// ===============================
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verificado com sucesso");
    return res.status(200).send(challenge);
  }

  console.log("❌ Falha na verificação do webhook");
  return res.sendStatus(403);
});

// ===============================
// 📩 RECEBER E RESPONDER MENSAGENS
// ===============================
app.post("/webhook", async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;

    const message = value?.messages?.[0];

    // Se não for mensagem, ignora
    if (!message) {
      return res.sendStatus(200);
    }

    const from = message.from; // número de quem enviou
    const text = message.text?.body || "";

    console.log("📨 Mensagem recebida:", text);

    // 👉 RESPONDER NO WHATSAPP
    const response = await fetch(
      `https://graph.facebook.com/v24.0/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: from,
          text: {
            body: `🤖 Bot ativo!\nVocê disse: ${text}`
          }
        })
      }
    );

    const data = await response.json();
    console.log("📤 Resposta enviada:", data);

    res.sendStatus(200);
  } catch (error) {
    console.error("🔥 Erro no webhook:", error);
    res.sendStatus(500);
  }
});

// ===============================
// 🚀 INICIAR SERVIDOR
// ===============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
