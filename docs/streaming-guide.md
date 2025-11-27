# Guía: Streaming de Respuestas AI en React

Esta guía explica cómo funciona el streaming de mensajes de IA en nuestra aplicación, paso a paso, pensada para desarrolladores junior.

## 📚 Conceptos Previos

### ¿Qué es Streaming?

**Streaming** significa recibir datos en "pedazos" (chunks) en lugar de esperar a que toda la respuesta esté lista.

**Ejemplo:**
- ❌ **Sin streaming**: Esperas 10 segundos → Ves toda la respuesta de golpe
- ✅ **Con streaming**: Ves cada palabra aparecer en tiempo real mientras el AI la genera

### ¿Qué es un Stream en JavaScript?

Un **Stream** es como una manguera de agua:
- El agua (datos) fluye continuamente
- Puedes ir tomando el agua poco a poco
- No necesitas esperar a que se llene todo el tanque

## 🔍 Análisis del Código Paso a Paso

### Paso 1: Preparar el Mensaje del Usuario

```typescript
const userMessage = { 
  id: Date.now().toString(),  // ID único basado en timestamp
  role: 'user' as const,      // Tipo de mensaje: 'user' o 'assistant'
  text: input.trim()          // El texto que escribió el usuario
};
setMessages(prev => [...prev, userMessage]);  // Añadir a la lista de mensajes
setInput('');        // Limpiar el input
setIsLoading(true);  // Mostrar estado de "cargando"
```

**¿Por qué `Date.now()`?**
- Genera un ID único (número de milisegundos desde 1970)
- Ejemplo: `1732130000123`

**¿Qué es `as const`?**
- Le dice a TypeScript que `role` es exactamente `'user'`, no cualquier string
- Sin `as const`: `role: string` 
- Con `as const`: `role: 'user'`

### Paso 2: Hacer la Petición HTTP

```typescript
const response = await fetch('/api/ai/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [...messages, userMessage].map(m => ({
      role: m.role,
      parts: [{ type: 'text', text: m.text }],
      id: m.id
    }))
  }),
});
```

**Desglose:**
1. `fetch()` → Hace una petición HTTP al servidor
2. `method: 'POST'` → Tipo de petición (enviar datos)
3. `headers` → Le dice al servidor que estamos enviando JSON
4. `body` → Los datos que enviamos (todos los mensajes de la conversación)

**¿Por qué enviamos TODOS los mensajes?**
- El AI necesita contexto de toda la conversación
- Ejemplo: Si preguntas "¿y el precio?" después de hablar de un producto, el AI necesita saber de qué producto estás hablando

### Paso 3: Verificar que la Respuesta sea Exitosa

```typescript
if (!response.ok) throw new Error('Failed to get response');
```

**¿Qué es `response.ok`?**
- Es `true` si el código de status HTTP es 200-299 (éxito)
- Es `false` si es 400-599 (error)

**Ejemplo:**
- Status 200 → `response.ok = true` ✅
- Status 404 → `response.ok = false` ❌
- Status 500 → `response.ok = false` ❌

### Paso 4: Obtener el Reader del Stream

```typescript
const reader = response.body?.getReader();
const decoder = new TextDecoder();
```

**¿Qué es `response.body`?**
- Es un `ReadableStream` → una "manguera" de datos
- Puede ser `null` si no hay cuerpo, por eso usamos `?.`

**¿Qué es `getReader()`?**
- Te da un "lector" para leer el stream
- Como tener un vaso para ir tomando agua de la manguera

**¿Qué es `TextDecoder`?**
- Convierte bytes (datos binarios) en texto legible
- Ejemplo: `[72, 111, 108, 97]` → `"Hola"`

### Paso 5: Crear Mensaje Vacío del Asistente

```typescript
const assistantMessage = { 
  id: (Date.now() + 1).toString(), 
  role: 'assistant' as const, 
  text: '' 
};
setMessages(prev => [...prev, assistantMessage]);
```

**¿Por qué crear un mensaje vacío?**
- Para que aparezca en la UI de inmediato
- Iremos llenando el `text` con cada chunk que llegue
- El usuario ve que la IA está "escribiendo"

**¿Por qué `Date.now() + 1`?**
- Para que el ID sea diferente al del mensaje del usuario
- No pueden tener el mismo ID

### Paso 6: Leer el Stream Chunk por Chunk

```typescript
if (reader) {
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value, { stream: true });
    assistantMessage.text += chunk;
    setMessages(prev => [...prev.slice(0, -1), { ...assistantMessage }]);
  }
}
```

**Desglose línea por línea:**

#### 6.1: `while (true)`
- Loop infinito
- Solo saldrá cuando `done` sea `true`

#### 6.2: `const { done, value } = await reader.read()`
- **Espera** hasta que llegue el siguiente chunk
- Retorna un objeto con:
  - `done`: `true` si el stream terminó, `false` si hay más datos
  - `value`: Un `Uint8Array` (array de bytes)

**Ejemplo de lo que llega:**
```javascript
// Primera lectura
{ done: false, value: Uint8Array[72, 111, 108, 97] }  // "Hola"

// Segunda lectura
{ done: false, value: Uint8Array[32, 109, 117, 110, 100, 111] }  // " mundo"

// Tercera lectura
{ done: true, value: undefined }  // Terminó
```

#### 6.3: `if (done) break`
- Si `done` es `true`, sale del loop
- Significa que el servidor terminó de enviar datos

#### 6.4: `const chunk = decoder.decode(value, { stream: true })`
- Convierte los bytes en texto
- `{ stream: true }` → Le dice que puede haber más chunks viniendo

**Ejemplo:**
```javascript
value = Uint8Array[72, 111, 108, 97]
chunk = "Hola"
```

#### 6.5: `assistantMessage.text += chunk`
- Añade el chunk al texto del mensaje
- Ejemplo:
  ```javascript
  // Primera iteración: "" + "Hola" = "Hola"
  // Segunda iteración: "Hola" + " mundo" = "Hola mundo"
  ```

#### 6.6: `setMessages(prev => [...prev.slice(0, -1), { ...assistantMessage }])`
Esta línea es la más compleja, vamos paso a paso:

**¿Qué hace `prev.slice(0, -1)`?**
- Toma todos los mensajes EXCEPTO el último
- Ejemplo:
  ```javascript
  prev = [msg1, msg2, msg3]
  prev.slice(0, -1) = [msg1, msg2]
  ```

**¿Por qué quitamos el último mensaje?**
- El último mensaje es el mensaje del asistente (vacío o con texto parcial)
- Lo quitamos para reemplazarlo con la versión actualizada

**¿Qué hace `{ ...assistantMessage }`?**
- Crea una **copia** del mensaje del asistente
- Importante: React necesita un nuevo objeto para detectar el cambio

**Resultado final:**
```javascript
setMessages([msg1, msg2, assistantMessageConNuevoTexto])
```

**Visualización del proceso:**
```
Iteración 1: ["User: Hola", "AI: "]
Iteración 2: ["User: Hola", "AI: H"]
Iteración 3: ["User: Hola", "AI: Ho"]
Iteración 4: ["User: Hola", "AI: Hol"]
Iteración 5: ["User: Hola", "AI: Hola"]
Iteración 6: ["User: Hola", "AI: Hola,"]
...y así sucesivamente
```

### Paso 7: Manejo de Errores

```typescript
} catch (error) {
  console.error('Error:', error);
}
```

**¿Cuándo se ejecuta el `catch`?**
- Si el servidor está caído
- Si no hay conexión a internet
- Si la respuesta no es válida
- Si hay cualquier error en el código del `try`

**¿Qué hace `console.error`?**
- Imprime el error en la consola del navegador (DevTools)
- Ayuda a debuggear problemas

### Paso 8: Limpieza Final

```typescript
} finally {
  setIsLoading(false);
}
```

**¿Qué es `finally`?**
- Se ejecuta **SIEMPRE**, haya error o no
- Perfecto para limpiar estado

**Casos:**
- ✅ Todo funciona → `finally` se ejecuta
- ❌ Hay un error → `finally` se ejecuta de todas formas

## 🎯 Flujo Completo Resumido

1. Usuario escribe mensaje y presiona Enter
2. Añadimos mensaje del usuario a la UI
3. Hacemos petición POST al backend con todos los mensajes
4. Backend genera respuesta con IA y hace streaming
5. Leemos el stream chunk por chunk
6. Por cada chunk:
   - Lo convertimos de bytes a texto
   - Lo añadimos al mensaje del asistente
   - Actualizamos la UI (el usuario ve el texto aparecer)
7. Cuando termina el stream, marcamos `isLoading = false`

## 💡 Conceptos Importantes para Juniors

### 1. Async/Await
```typescript
await fetch(...)  // Espera a que termine la petición
await reader.read()  // Espera a que llegue el siguiente chunk
```
- `await` = "espera a que esto termine antes de continuar"
- Solo funciona dentro de funciones `async`

### 2. Spread Operator (`...`)
```typescript
[...prev, newItem]  // Copia array y añade item
{ ...object }  // Copia objeto
```

### 3. Immutability en React
```typescript
// ❌ MALO: Modifica directamente
messages.push(newMsg)

// ✅ BUENO: Crea nuevo array
setMessages([...messages, newMsg])
```

### 4. Optional Chaining (`?.`)
```typescript
response.body?.getReader()
// Si body es null → retorna undefined
// Si body existe → llama getReader()
```

## 🐛 Debugging Tips

1. **Ver qué llega del servidor:**
   ```typescript
   const chunk = decoder.decode(value, { stream: true });
   console.log('Chunk recibido:', chunk);
   ```

2. **Verificar estado de mensajes:**
   ```typescript
   console.log('Mensajes actuales:', messages);
   ```

3. **Ver errores de red:**
   - Abre DevTools → Network tab
   - Busca la petición a `/api/ai/chat`
   - Ve el status y la respuesta

## 📝 Resumen

Este código implementa **streaming** de respuestas de IA:
- ✅ Envía todos los mensajes al backend
- ✅ Lee la respuesta en tiempo real
- ✅ Actualiza la UI por cada chunk
- ✅ Maneja errores apropiadamente
- ✅ Limpia el estado al final

**Ventajas del streaming:**
- Mejor UX (usuario ve respuesta de inmediato)
- Sensación de velocidad
- Más natural (como chatear con una persona real)
