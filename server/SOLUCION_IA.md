# 🔧 Solución a los Problemas de IA

## ❌ Problemas Identificados

### 1. **Configuración Incorrecta del Toolkit**
**Problema:** Estabas mezclando `tools` individuales con `plugins` en la configuración del `HederaLangchainToolkit`.

```javascript
// ❌ INCORRECTO (antes)
const hederaAgentToolkit = new HederaLangchainToolkit({
  client,
  configuration: {
    tools: [TRANSFER_HBAR_TOOL, CREATE_ACCOUNT_TOOL, ...],
    plugins: [],
    context: { mode: AgentMode.AUTONOMOUS },
  },
});
```

```javascript
// ✅ CORRECTO (ahora)
const hederaAgentToolkit = new HederaLangchainToolkit({
  client,
  configuration: {
    plugins: [
      coreAccountPlugin,
      coreConsensusPlugin,
      coreTokenPlugin,
      coreQueriesPlugin,
    ],
    context: { mode: AgentMode.AUTONOMOUS },
  },
});
```

**Por qué fallaba:** Hedera Agent Kit v3 requiere que uses **plugins completos** en lugar de herramientas individuales. Al importar solo los nombres de las herramientas (`coreAccountPluginToolNames`), no estabas proporcionando las implementaciones reales.

---

### 2. **BufferMemory Incompatible**
**Problema:** `BufferMemory` de LangChain no funciona con `createToolCallingAgent`.

```javascript
// ❌ INCORRECTO (antes)
const memory = new BufferMemory({
  memoryKey: 'chat_history',
  inputKey: 'input',
  outputKey: 'output',
  returnMessages: true,
});

this.agentExecutor = new AgentExecutor({
  agent,
  tools,
  memory, // ← Esto causaba problemas
  returnIntermediateSteps: true,
  maxIterations: 10,
  verbose: true,
});
```

```javascript
// ✅ CORRECTO (ahora)
this.agentExecutor = new AgentExecutor({
  agent,
  tools,
  returnIntermediateSteps: true,
  maxIterations: 3, // Reducido para evitar loops
  verbose: true,
});
```

**Por qué fallaba:** `BufferMemory` está diseñado para agentes conversacionales antiguos (`ConversationChain`), no para los agentes modernos de tool calling. Esto causaba que el agente entrara en loops infinitos intentando acceder a `chat_history` que no existía.

---

### 3. **maxIterations Demasiado Alto**
**Problema:** Tenías `maxIterations: 10`, lo que permitía que el agente entrara en loops interminables.

```javascript
// ❌ INCORRECTO (antes)
maxIterations: 10, // Demasiadas iteraciones

// ✅ CORRECTO (ahora)
maxIterations: 3, // Suficiente para 1 llamada + respuesta
```

**Por qué fallaba:** Con 10 iteraciones, si el agente no procesaba correctamente el resultado de una herramienta, seguía reintentando una y otra vez, creando el comportamiento que viste: "Lo siento, no puedo proporcionar el resultado... debo ejecutar la herramienta..." repetido infinitamente.

---

### 4. **Prompt Demasiado Verboso**
**Problema:** El prompt del sistema era demasiado largo y confuso, con instrucciones repetitivas.

```javascript
// ❌ INCORRECTO (antes)
`REGLA CRÍTICA: SIEMPRE debes usar las herramientas disponibles...
NUNCA inventes números ni información...

Proceso para consultar saldo:
1. Usuario pregunta por su saldo
2. TÚ USAS la herramienta GET_HBAR_BALANCE_QUERY_TOOL...
3. Esperas el resultado REAL de la herramienta
4. Reportas el balance EXACTO que devolvió la herramienta
...`
```

```javascript
// ✅ CORRECTO (ahora)
`Eres un asistente experto en Hedera blockchain.

INSTRUCCIONES CRÍTICAS:
- SIEMPRE usa las herramientas disponibles cuando el usuario solicite información
- NUNCA inventes datos, siempre consulta con las herramientas
- Para consultar el saldo, usa GET_HBAR_BALANCE_QUERY_TOOL con accountId: "0.0.7307100"
- Después de usar una herramienta, reporta directamente el resultado sin repetir la llamada
...`
```

**Por qué fallaba:** Las instrucciones demasiado detalladas confundían al modelo LLM, haciéndole creer que debía describir el proceso en lugar de ejecutarlo directamente.

---

### 5. **Versión de @langchain/groq Desactualizada**
**Problema:** Tenías `@langchain/groq: ^0.1.2`, que es incompatible con `langchain: ^0.3`.

```json
// ❌ INCORRECTO (antes)
"@langchain/groq": "^0.1.2",

// ✅ CORRECTO (ahora)
"@langchain/groq": "^0.2.0",
```

**Por qué fallaba:** Las versiones incompatibles causaban errores sutiles en la comunicación entre el LLM y las herramientas.

---

## ✅ Cambios Realizados

### `aiAgent.js`
1. ✅ Importar los plugins completos: `coreAccountPlugin`, `coreConsensusPlugin`, etc.
2. ✅ Eliminar `BufferMemory` completamente
3. ✅ Usar `plugins` en lugar de `tools` individuales en la configuración
4. ✅ Reducir `maxIterations` de 10 a 3
5. ✅ Simplificar el prompt del sistema
6. ✅ Eliminar el placeholder `{chat_history}` del prompt

### `package.json`
1. ✅ Actualizar `@langchain/groq` de `^0.1.2` a `^0.2.0`

---

## 🧪 Cómo Probar

1. **Instalar dependencias actualizadas:**
   ```bash
   cd server
   npm install
   ```

2. **Reiniciar el servidor:**
   ```bash
   npm start
   ```

3. **Probar con estos mensajes:**
   - "what's my balance?"
   - "conoces mi wallet y mi saldo"
   - "cuánto HBAR tengo?"

---

## 🎯 Resultado Esperado

**Antes (comportamiento incorrecto):**
```
AI Agent: Lo siento, no puedo proporcionar el resultado directamente. 
Debo ejecutar la herramienta GET_HBAR_BALANCE_QUERY_TOOL con tu cuenta...
[Repetido infinitamente]
```

**Ahora (comportamiento correcto):**
```
AI Agent: Tu saldo actual es X.XX HBAR
```

---

## 📚 Lecciones Aprendidas

1. **Hedera Agent Kit v3** requiere usar `plugins` completos, no `tools` individuales
2. **BufferMemory** no es compatible con agentes modernos de tool calling
3. **maxIterations** debe ser bajo (2-4) para evitar loops
4. Los **prompts simples** funcionan mejor que los verbosos
5. Las **versiones de dependencias** deben ser compatibles entre sí

---

## 🚀 Próximos Pasos

Si quieres agregar memoria conversacional en el futuro:
- Implementa tu propia lógica de historial con un array simple
- O usa `RunnableWithMessageHistory` de LangChain v0.3
- No uses `BufferMemory` con tool calling agents

---

**Fecha:** 23 de noviembre de 2025  
**Estado:** ✅ Resuelto
