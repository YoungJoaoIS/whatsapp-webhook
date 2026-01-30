import express from "express";

const app = express();
app.use(express.json());

const VERIFY_TOKEN = "meubot123"; // TEM QUE SER IGUAL AO DA META

// 👉 VERIFICAÇÃO DO WEBHOOK (META)
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verificado");
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

// 👉 RECEBER MENSAGENS
app.post("/webhook", (req, res) => {
  console.log("Mensagem recebida:");
  console.log(JSON.stringify(req.body, null, 2));

  res.sendStatus(200);
});

// 👉 PORTA DO RENDER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
});

