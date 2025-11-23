# Hedera Simple Chat

Chat en tiempo real usando Hedera Consensus Service (HCS) para almacenar mensajes en blockchain.

## 🚀 Características

- ✅ Mensajes almacenados en Hedera blockchain (inmutables y verificables)
- ✅ WebSockets para comunicación en tiempo real
- ✅ Interfaz web simple y responsiva
- ✅ Fácil de deployar en Render
- ✅ Topic ID personalizable

## 📋 Requisitos Previos

1. Cuenta de Hedera Testnet (gratis)
   - Crea una cuenta en: https://portal.hedera.com/
   - Obten tu `ACCOUNT_ID` y `PRIVATE_KEY`

2. Node.js 18+ instalado

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

Edita el archivo `.env` y agrega tus credenciales de Hedera:
```
ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID
PRIVATE_KEY=YOUR_PRIVATE_KEY_ECDSA
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

1. **Servidor**: Express + Socket.io manejan las conexiones en tiempo real

2. **Hedera Service**: 
   - Crea un Topic en Hedera Consensus Service (HCS) si no existe
   - Envía mensajes al topic (cada mensaje es una transacción en blockchain)
   - Se suscribe al topic para recibir mensajes en tiempo real

3. **Cliente**: Interfaz HTML que se conecta via WebSocket y muestra mensajes

## 🔧 Arquitectura

```
Cliente (Browser)
    ↕ WebSocket
Servidor Express + Socket.io
    ↕ Hedera SDK
Hedera Consensus Service (HCS)
```

Cada mensaje del chat:
- Se envía via WebSocket al servidor
- El servidor lo publica en el Topic de Hedera
- Hedera almacena el mensaje en blockchain
- Todos los clientes suscritos reciben el mensaje en tiempo real

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
