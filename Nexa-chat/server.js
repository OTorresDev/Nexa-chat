import dotenv from "dotenv";
import express from "express";
import OpenAI from "openai";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(express.json({ limit: "1mb" }));
app.use(express.static("public"));

const apiKey = process.env.APINEX_API_KEY;
const baseURL = process.env.APINEX_BASE_URL;

let openai;

if (apiKey && baseURL) {
  openai = new OpenAI({
    apiKey,
    baseURL,
  });
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    configured: Boolean(apiKey && baseURL),
  });
});

app.post("/api/chat", async (req, res) => {
  try {
    if (!apiKey || !baseURL || !openai) {
      return res.status(500).json({
        error:
          "Falta configurar APINEX_API_KEY o APINEX_BASE_URL en el archivo .env.",
      });
    }

    const { messages } = req.body ?? {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: "Envía al menos un mensaje para iniciar la conversación.",
      });
    }

    // Solo aceptamos mensajes de usuario y asistente; limitamos el historial
    // para evitar solicitudes demasiado grandes.
    const cleanMessages = messages
      .filter(
        (message) =>
          message &&
          ["user", "assistant"].includes(message.role) &&
          typeof message.content === "string" &&
          message.content.trim().length > 0
      )
      .slice(-20)
      .map((message) => ({
        role: message.role,
        content: message.content.slice(0, 12000),
      }));

    if (cleanMessages.length === 0) {
      return res.status(400).json({ error: "El historial está vacío." });
    }

    const completion = await openai.chat.completions.create({
      model: "free/deepseek-v4.1-flash",
      messages: [
        {
          role: "system",
          content:
            "Eres un asistente útil. Responde en español de forma clara y práctica, salvo que el usuario pida otro idioma.",
        },
        ...cleanMessages,
      ],
    });

    const answer = completion.choices?.[0]?.message?.content;

    if (!answer) {
      return res.status(502).json({
        error: "La API no devolvió una respuesta de texto.",
      });
    }

    return res.json({ answer });
  } catch (error) {
    console.error("Error al consultar ApiNex:", error);

    const message =
      error?.error?.message ||
      error?.message ||
      "No se pudo completar la solicitud.";

    return res.status(error?.status && error.status >= 400 && error.status < 600
      ? error.status
      : 500).json({ error: message });
  }
});

app.listen(port, () => {
  console.log(`\nChat ApiNex disponible en http://localhost:${port}`);
  console.log("Modelo configurado: free/deepseek-v4.1-flash");
  if (!apiKey || !baseURL) {
    console.warn(
      "Aviso: configura APINEX_API_KEY y APINEX_BASE_URL en .env antes de enviar mensajes."
    );
  }
});
