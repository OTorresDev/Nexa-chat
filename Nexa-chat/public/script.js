const form = document.querySelector("#chat-form");
const input = document.querySelector("#message-input");
const messagesElement = document.querySelector("#messages");
const welcome = document.querySelector("#welcome");
const sendButton = document.querySelector("#send-button");
const newChatButton = document.querySelector("#new-chat-button");
const clearButton = document.querySelector("#clear-button");
const modelSelect = document.querySelector("#model-select");
const sidebarModelName = document.querySelector("#sidebar-model-name");

let conversation = [];
let busy = false;

function getModelName() {
  return modelSelect.options[modelSelect.selectedIndex].text;
}

function updateModelName() {
  const modelName = getModelName();

  if (sidebarModelName) {
    sidebarModelName.textContent = modelName;
  }

  const welcomeCopy = document.querySelector(".welcome-copy");

  if (welcomeCopy) {
    welcomeCopy.textContent = `Pregunta, aprende y crea con ${modelName}.`;
  }
}

function scrollToBottom() {
  window.requestAnimationFrame(() => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  });
}

function updateWelcome() {
  welcome.hidden = conversation.length > 0;
}

function addMessage(role, content, modelName = getModelName()) {
  const wrapper = document.createElement("article");
  wrapper.className = `message ${role}`;

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = role === "assistant" ? "✦" : "T";

  const body = document.createElement("div");
  body.className = "message-body";

  const label = document.createElement("div");
  label.className = "message-label";
  label.textContent = role === "assistant" ? modelName : "Tú";

  const text = document.createElement("div");
  text.className = "message-text";
  text.textContent = content;

  body.append(label, text);

  if (role === "assistant") {
    const actions = document.createElement("div");
    actions.className = "message-actions";

    const copy = document.createElement("button");
    copy.type = "button";
    copy.className = "copy-button";
    copy.textContent = "Copiar respuesta";

    copy.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(content);
        copy.textContent = "¡Copiado!";
        setTimeout(() => {
          copy.textContent = "Copiar respuesta";
        }, 1400);
      } catch {
        copy.textContent = "No se pudo copiar";
      }
    });

    actions.append(copy);
    body.append(actions);
  }

  wrapper.append(avatar, body);
  messagesElement.append(wrapper);
  scrollToBottom();

  return wrapper;
}

function showTyping() {
  const wrapper = document.createElement("article");
  wrapper.className = "message assistant";
  wrapper.id = "typing-indicator";

  wrapper.innerHTML = `
    <div class="avatar">✦</div>
    <div class="message-body">
      <div class="message-label" id="typing-label"></div>
      <div class="typing" aria-label="Generando respuesta">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;

  wrapper.querySelector("#typing-label").textContent =
    `${getModelName()} está escribiendo`;

  messagesElement.append(wrapper);
  scrollToBottom();
}

function setBusy(value) {
  busy = value;
  sendButton.disabled = value;
  input.disabled = value;
  modelSelect.disabled = value;

  sendButton.querySelector("span:first-child").textContent = value
    ? "Enviando"
    : "Enviar";
}

async function sendMessage(text) {
  const content = text.trim();

  if (!content || busy) return;

  // Guardamos el modelo usado para esta petición.
  const selectedModel = modelSelect.value;
  const selectedModelName = getModelName();

  conversation.push({
    role: "user",
    content,
  });

  updateWelcome();
  addMessage("user", content);

  input.value = "";
  input.style.height = "auto";

  setBusy(true);
  showTyping();

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: conversation,
        model: selectedModel,
      }),
    });

    const data = await response.json().catch(() => ({}));

    document.querySelector("#typing-indicator")?.remove();

    if (!response.ok) {
      throw new Error(data.error || `Error HTTP ${response.status}`);
    }

    const answer = String(data.answer ?? "").trim();

    if (!answer) {
      throw new Error("La API devolvió una respuesta vacía.");
    }

    conversation.push({
      role: "assistant",
      content: answer,
    });

    addMessage("assistant", answer, selectedModelName);
  } catch (error) {
    const errorText =
      `No se pudo obtener una respuesta.\n\n${error.message}\n\n` +
      "Revisa la API key, la base URL, el identificador del modelo " +
      "y su disponibilidad en ApiNex.";

    addMessage("assistant", errorText, selectedModelName);
  } finally {
    document.querySelector("#typing-indicator")?.remove();
    setBusy(false);
    input.focus();
  }
}

function resetConversation() {
  if (busy) return;

  conversation = [];
  messagesElement.replaceChildren();
  updateWelcome();
  input.value = "";
  input.style.height = "auto";
  input.focus();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  sendMessage(input.value);
});

input.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});

input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = `${Math.min(input.scrollHeight, 180)}px`;
});

newChatButton.addEventListener("click", resetConversation);
clearButton.addEventListener("click", resetConversation);

modelSelect.addEventListener("change", () => {
  updateModelName();

  // Empezamos una conversación nueva para no mezclar
  // el historial de modelos diferentes.
  resetConversation();
});

document.querySelectorAll("[data-prompt]").forEach((button) => {
  button.addEventListener("click", () => {
    if (busy) return;
    sendMessage(button.dataset.prompt || "");
  });
});

updateModelName();
updateWelcome();
