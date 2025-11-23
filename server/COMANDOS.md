# 🤖 Guía de Comandos - Hedera AI Assistant

Esta es una guía completa de todos los comandos que puedes usar con el AI Assistant.

---

## 📊 Consultas de Precios (Chainlink)

### Precios Individuales
```
"precio de bitcoin"
"cuánto vale BTC"
"cotización de ethereum"
"precio de ETH"
"precio de HBAR"
"cuánto vale LINK"
"precio del DAI"
"precio de USDC"
"precio de USDT"
```

### Múltiples Precios
```
"todos los precios"
"lista de precios"
"precios disponibles"
"muéstrame todos los precios"
```

### Ejemplos de Respuesta:
```
Usuario: "precio de bitcoin"
AI: ₿ Bitcoin (BTC/USD)
    💵 Precio actual: $88,234.56
    🕐 Actualizado: 23/11/2025 15:30:45
    📍 Fuente: Chainlink Oracle en Hedera Testnet
```

---

## 💰 Consultas de Blockchain

### Saldo de HBAR
```
"cuál es mi saldo"
"mi balance"
"mi saldo de HBAR"
"balance de mi cuenta"
"cuánto HBAR tengo"
```

### Información de Cuenta
```
"información de mi cuenta"
"info de la cuenta 0.0.7307100"
"detalles de mi wallet"
```

### Balance de Tokens
```
"balance de tokens"
"mis tokens"
"qué tokens tengo"
```

---

## 💸 Transacciones de HBAR

### Transferencias
```
"transfiere 5 HBAR a 0.0.1234"
"envía 10 HBAR a la cuenta 0.0.5678"
"manda 2.5 HBAR a 0.0.9999"
"transfer 1 HBAR to 0.0.4444"
```

### Crear Cuenta
```
"crea una nueva cuenta"
"crear cuenta en Hedera"
"nueva wallet"
```

---

## 🪙 Gestión de Tokens

### Crear Token Fungible
```
"crea un token llamado MiToken con símbolo MTK"
"crear token fungible MiMoneda MTK supply 1000000"
"nuevo token TestCoin símbolo TST"
```

### Información Requerida:
- **Nombre del token**: "MiToken"
- **Símbolo**: "MTK" (3-4 letras)
- **Supply inicial**: 1000000 (opcional, default: 1000000)

---

## 📝 Consensus Service (HCS)

### Crear Topic
```
"crea un topic"
"crear topic de mensajería"
"nuevo topic para chat"
"crea un topic con memo 'Mi Topic'"
```

### Enviar Mensajes
```
"envía el mensaje 'Hola mundo'"
"publica 'Este es un mensaje de prueba'"
"envía mensaje al topic"
```

---

## ❓ Ayuda e Información

### Comandos de Ayuda
```
"ayuda"
"help"
"qué puedes hacer"
"comandos disponibles"
"lista de comandos"
"qué funciones tienes"
```

### Preguntas sobre Capacidades
```
"qué necesitas para hacer una transacción"
"cómo creo un token"
"qué necesitas para transferir HBAR"
"qué información necesitas para crear un topic"
```

---

## 🎯 Ejemplos de Conversaciones Completas

### Ejemplo 1: Consultar y Transferir
```
Usuario: "cuál es mi saldo"
AI: "Tu cuenta 0.0.7307100 tiene un saldo de 999.90 HBAR"

Usuario: "transfiere 5 HBAR a 0.0.1234"
AI: "✅ Transferencia exitosa. Enviaste 5 HBAR a la cuenta 0.0.1234"
```

### Ejemplo 2: Precios de Crypto
```
Usuario: "precio de bitcoin"
AI: "₿ Bitcoin (BTC/USD)
     💵 Precio actual: $88,234.56
     🕐 Actualizado: 23/11/2025 15:30:45"

Usuario: "y ethereum?"
AI: "Ξ Ethereum (ETH/USD)
     💵 Precio actual: $3,456.78
     🕐 Actualizado: 23/11/2025 15:30:50"

Usuario: "todos los precios"
AI: "📊 Precios en Tiempo Real:
     ₿ BTC/USD: $88,234.56
     Ξ ETH/USD: $3,456.78
     ℏ HBAR/USD: $0.12
     🔗 LINK/USD: $15.43
     💵 USDC/USD: $1.00
     💵 USDT/USD: $1.00
     💵 DAI/USD: $1.00"
```

### Ejemplo 3: Crear Token
```
Usuario: "quiero crear un token"
AI: "Para crear un token necesito:
     1. 📝 Nombre del token
     2. 🔤 Símbolo (3-4 letras)
     3. 💰 Supply inicial (opcional)"

Usuario: "crea un token llamado MiMoneda con símbolo MMO"
AI: "✅ Token creado exitosamente!
     📝 Nombre: MiMoneda
     🔤 Símbolo: MMO
     🆔 Token ID: 0.0.12345678"
```

---

## 🚀 Tips Avanzados

### Lenguaje Natural
El AI entiende múltiples formas de expresar lo mismo:
```
✅ "precio de bitcoin"
✅ "cuánto vale BTC"
✅ "cotización de bitcoin"
✅ "qué precio tiene el BTC"
✅ "dame el precio del bitcoin"
```

### Combinaciones
Puedes hacer preguntas relacionadas en secuencia:
```
1. "precio de HBAR"
2. "mi saldo"
3. "transfiere 10 HBAR a 0.0.1234"
```

### Contexto
El AI recuerda el contexto de la conversación:
```
Usuario: "qué necesitas para transferir HBAR"
AI: "Necesito la cuenta destino y el monto"
Usuario: "envía 5 a 0.0.1234"
AI: [Ejecuta la transferencia]
```

---

## 🔗 Recursos Adicionales

- **Interfaz de Precios**: http://localhost:3000/prices
- **Chat Principal**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

---

## 📌 Notas Importantes

1. **Formato de Cuentas**: Siempre usa el formato `0.0.XXXXX`
2. **Cantidades HBAR**: Usa números decimales (ej: 5.5 HBAR)
3. **Precios**: Actualizados desde Chainlink Oracles en Hedera Testnet
4. **Idioma**: El AI responde principalmente en español, pero entiende inglés

---

## 🐛 Solución de Problemas

### "No entiendo tu pregunta"
- Intenta reformular usando los ejemplos de esta guía
- Usa palabras clave como "precio", "transferir", "crear", "saldo"

### "Error al procesar"
- Verifica que el formato de la cuenta sea correcto (0.0.XXXXX)
- Asegúrate de tener suficiente HBAR para transacciones
- Revisa que el servidor esté corriendo

### "Precio no disponible"
- Algunos precios pueden estar temporalmente indisponibles
- Intenta con otro par de precios
- Visita la interfaz web en /prices

---

¡Disfruta usando tu Hedera AI Assistant! 🎉
