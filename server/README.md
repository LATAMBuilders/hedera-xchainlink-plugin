# Hedera AI Chat

Chat en tiempo real usando Hedera Consensus Service (HCS) con AI Agent integrado usando Langchain y OpenAI.

## 🚀 Características

- ✅ Mensajes almacenados en Hedera blockchain (inmutables y verificables)
- ✅ WebSockets para comunicación en tiempo real
- ✅ **AI Agent con acceso a herramientas de Hedera blockchain**
- ✅ Interfaz web simple y responsiva con dos modos: Chat Normal y AI Agent
- ✅ Fácil de deployar en Render
- ✅ Topic ID personalizable

## 🤖 Capacidades del AI Agent

El AI Agent puede ayudarte con:
- 💰 Consultar balances de HBAR
- 💸 Transferir HBAR entre cuentas
- 👤 Crear cuentas nuevas en Hedera
- 🪙 Crear tokens fungibles
- 📝 Crear topics de consenso
- 📨 Enviar mensajes a topics

**Ejemplos de preguntas:**
- "¿Cuál es mi balance de HBAR?"
- "Transfiere 10 HBAR a la cuenta 0.0.123456"
- "Crea una nueva cuenta con 5 HBAR de balance inicial"
- "Crea un token fungible llamado MiToken con símbolo MTK"

## 📋 Requisitos Previos

1. Cuenta de Hedera Testnet (gratis)
   - Crea una cuenta en: https://portal.hedera.com/
   - Obten tu `ACCOUNT_ID` y `PRIVATE_KEY`

2. OpenAI API Key (para AI Agent)
   - Crea una cuenta en: https://platform.openai.com/
   - Genera una API key en: https://platform.openai.com/api-keys
   - **Nota**: El chat funciona sin OpenAI, pero el AI Agent estará deshabilitado

3. Node.js 18+ instalado

## 🛠️ Instalación Local

1. **Instalar dependencias**
```bash
cd server
npm install
```

2. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Edita el archivo `.env` y agrega tus credenciales:
```
ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID
PRIVATE_KEY=YOUR_PRIVATE_KEY_ECDSA
OPENAI_API_KEY=sk-your-openai-key-here
PORT=3000
```

3. **Ejecutar el servidor**
```bash
npm start
```

4. **Abrir en el navegador**
```
http://localhost:3000
```

## 🌐 Deploy en Render

### Opción 1: Deploy desde GitHub

1. Sube tu código a GitHub

2. Ve a [Render](https://render.com) y crea una cuenta

3. Click en "New +" → "Web Service"

4. Conecta tu repositorio de GitHub

5. Configura el servicio:
   - **Name**: hedera-chat
   - **Root Directory**: `server`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

6. Agrega las variables de entorno:
   - `ACCOUNT_ID`: tu Account ID de Hedera
   - `PRIVATE_KEY`: tu Private Key de Hedera
   - `OPENAI_API_KEY`: tu OpenAI API Key
   - `TOPIC_ID`: (opcional) si ya tienes un topic creado

7. Click en "Create Web Service"

### Opción 2: Deploy Manual

```bash
# En Render Dashboard
render create web --name hedera-chat \
  --region oregon \
  --env-var ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID \
  --env-var PRIVATE_KEY=YOUR_PRIVATE_KEY
```

## 📝 Cómo Funciona

### Modo Chat Normal
1. Usuario escribe mensaje → WebSocket al servidor
2. Servidor envía mensaje → Hedera Topic (blockchain)
3. Hedera notifica → Servidor recibe el mensaje
4. Servidor emite → Todos los usuarios conectados lo ven

### Modo AI Agent
1. Usuario hace pregunta → WebSocket al servidor
2. Servidor envía pregunta → AI Agent (OpenAI + Langchain)
3. AI Agent ejecuta → Herramientas de Hedera según necesite
4. AI Agent responde → Respuesta se guarda en blockchain
5. Todos los usuarios ven la interacción completa

## 🔧 Arquitectura

```
Cliente (Browser)
    ↕ WebSocket
Servidor Express + Socket.io
    ↕ Hedera SDK        ↕ AI Agent (Langchain + OpenAI)
Hedera Consensus Service (HCS) + Hedera Toolkit
```

**Componentes:**
- `index.js`: Servidor Express + Socket.io
- `hederaService.js`: Manejo de HCS (topics y mensajes)
- `aiAgent.js`: Agente AI con herramientas de Hedera
- `public/index.html`: Interfaz del chat con dos modos

## 💡 Ventajas de Usar Hedera

- **Inmutabilidad**: Los mensajes no pueden ser modificados o eliminados
- **Verificabilidad**: Cualquiera puede verificar la autenticidad de los mensajes
- **Bajo Costo**: ~$0.0001 por mensaje
- **Rápido**: 3-5 segundos de finalidad
- **Ecológico**: Certificado carbon-negative

## 🎨 Personalización

### Cambiar el estilo del chat
Edita `server/public/index.html` (sección `<style>`)

### Agregar autenticación
Modifica `server/index.js` para agregar middleware de autenticación

### Límites de mensajes
Ajusta `maxlength` en los inputs del HTML

## 🐛 Troubleshooting

**Error: "Invalid Account ID or Private Key"**
- Verifica que las credenciales en `.env` sean correctas
- Asegúrate de estar usando la testnet

**No se reciben mensajes**
- Los mensajes pueden tardar 3-5 segundos en aparecer (tiempo de consenso de Hedera)
- Verifica la consola del servidor para errores

**Puerto en uso**
```bash
# Cambiar el puerto en .env
PORT=3001
```

## 📚 Recursos

- [Hedera Docs](https://docs.hedera.com)
- [Hedera SDK](https://github.com/hashgraph/hedera-sdk-js)
- [Portal Hedera](https://portal.hedera.com)

## 📄 Licencia

MIT
