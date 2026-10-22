# Nexa Chat — ApiNex + DeepSeek V4.1 Flash 1017

Aplicación de chat local creada con Node.js, Express, JavaScript, HTML y CSS. Usa `pnpm` y el SDK de OpenAI para conectarse al endpoint compatible con OpenAI de ApiNex.

## Requisitos

- Node.js LTS instalado.
- pnpm instalado.
- Una API key válida de ApiNex y la base URL que indique ApiNex para tu cuenta.

## 1. Instalar dependencias

Abre una terminal dentro de esta carpeta y ejecuta:

```bash
pnpm install
```

## 2. Configurar las variables

Copia `.env.example` y crea un archivo llamado `.env` en la raíz del proyecto.

En macOS o Linux:

```bash
cp .env.example .env
```

Abre `.env` y sustituye los valores de ejemplo:

```env
APINEX_API_KEY=tu_api_key_real
APINEX_BASE_URL=la_base_url_oficial_de_apinex
PORT=3000
```

**Importante:** no inventes la base URL. Usa exactamente la misma `APINEX_BASE_URL` que te funcionó en el proyecto anterior. No compartas tu archivo `.env`, no subas la clave a GitHub y no la escribas en el frontend.

## 3. Ejecutar el chat

Para desarrollo, con reinicio automático del servidor al cambiar `server.js`:

```bash
pnpm dev
```

También puedes usar:

```bash
pnpm start
```

Abre esta dirección en el navegador:

http://localhost:3000

## 4. Probarlo

1. Envía un mensaje de ejemplo desde las sugerencias o escribe una pregunta.
2. Espera la respuesta de DeepSeek.
3. Continúa conversando; el historial reciente se envía para conservar el contexto.
4. Usa **Copiar respuesta** para copiar una respuesta o **Nueva conversación** para empezar de cero.

## Modelo configurado

El servidor usa exactamente el identificador que compartiste:

```js
model: "free/deepseek-v4.1-flash"
```

Si ApiNex cambió el identificador, la disponibilidad gratuita o la base URL, verifica los valores actuales en tu panel/documentación de ApiNex. El proyecto no puede garantizar la disponibilidad del proveedor.

## Archivos principales

- `server.js`: servidor y llamada segura a la API.
- `public/index.html`: estructura de la interfaz.
- `public/styles.css`: diseño adaptable a móvil y escritorio.
- `public/script.js`: envío de mensajes, historial y copia de respuestas.
- `.env`: tus credenciales locales; no se incluye en el ZIP.

## Seguridad

Esta es una demo local para aprender. La clave permanece en el servidor y no se envía al navegador. Antes de publicar la app en internet, agrega autenticación, límites de uso, protección contra abuso y controles de costos.
