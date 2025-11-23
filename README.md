# Hedera x Chainlink Plugin Demo

Este repositorio contiene una aplicación full-stack que demuestra la integración de **Chainlink Price Feeds** con el **Hedera Agent Kit**, permitiendo a agentes de Inteligencia Artificial consultar precios de criptomonedas en tiempo real directamente desde la red de Hedera.

El núcleo de esta integración está disponible como un paquete npm independiente:
👉 **[hedera-chainlink-plugin](https://www.npmjs.com/package/hedera-chainlink-plugin)**

 **[Repositorio hedera-chainlink-plugin](https://github.com/BMPaiba/hedera-chainlik-plugin)**

## 🏗️ Arquitectura del Proyecto

El proyecto está dividido en dos partes principales:

### 1. Server (`/server`)
Un servidor Express que implementa el **Hedera Agent Kit** potenciado con el plugin de Chainlink.
- **Tecnologías**: Node.js, Express, LangChain, Hedera SDK, OpenAI.
- **Funcionalidad**: Provee una API y WebSockets para interactuar con el Agente de IA. El agente puede responder preguntas sobre precios de criptomonedas utilizando los oráculos de Chainlink en Hedera Testnet.

### 2. Client (`/client`)
Una interfaz de usuario moderna construida con Next.js.
- **Tecnologías**: Next.js 15, TypeScript, Tailwind CSS, Shadcn UI.
- **Funcionalidad**: Un dashboard que muestra precios en tiempo real y ofrece una interfaz de chat para interactuar con el Agente de IA del servidor.

## 📦 Paquete NPM: hedera-chainlink-plugin

La lógica de integración con Chainlink se ha extraído en un paquete reutilizable para que cualquier desarrollador pueda dotar a sus agentes de Hedera con capacidades de oráculos.

Instalación del plugin en tu propio proyecto:
```bash
npm install hedera-chainlink-plugin
```

Para más detalles sobre el uso del plugin, visita la [documentación en NPM](https://www.npmjs.com/package/hedera-chainlink-plugin).

## 🚀 Comenzando

Sigue estos pasos para ejecutar la demo completa en tu máquina local.

### Prerrequisitos
- Node.js 18+
- Una cuenta de [Hedera Testnet](https://portal.hedera.com/) (Account ID y Private Key).
- Una API Key de [OpenAI](https://platform.openai.com/) (para las funcionalidades de IA).

### Configuración del Servidor

1. Navega al directorio del servidor:
   ```bash
   cd server
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Crea un archivo `.env` basado en el ejemplo (si existe) o con las siguientes variables:
   ```env
   HEDERA_ACCOUNT_ID=0.0.xxxx
   HEDERA_PRIVATE_KEY=302...
   HEDERA_NETWORK=testnet
   OPENAI_API_KEY=sk-...
   PORT=3001
   ```

4. Inicia el servidor:
   ```bash
   npm run dev
   ```

### Configuración del Cliente

1. Navega al directorio del cliente (en una nueva terminal):
   ```bash
   cd client
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Inicia la aplicación de desarrollo:
   ```bash
   npm run dev
   ```

4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 💡 Uso

1. **Dashboard de Precios**: Verás precios de criptomonedas actualizados en tiempo real.
2. **Chat con IA**: Abre el widget de chat y pregúntale al agente:
   - *"¿Cuál es el precio de Bitcoin según Chainlink?"*
   - *"Dame el precio de LINK y ETH"*
   - *"¿Qué oráculos de precios están disponibles?"*

El agente utilizará el `hedera-chainlink-plugin` para consultar los contratos inteligentes de Chainlink en la red de Hedera y te dará la respuesta precisa.

## 📄 Licencia

Este proyecto está bajo la licencia MIT.