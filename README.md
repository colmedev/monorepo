# Monorepo con Express, KafkaJS, React y Vercel AI SDK

Este es un monorepo configurado con pnpm workspaces que incluye:

- **Backend**: NestJS con Express, KafkaJS y Vercel AI SDK
- **Frontend**: React con TypeScript, Vite y Vercel AI SDK

## Estructura del Proyecto

```
monorepo/
├── apps/
│   ├── backend/          # API con NestJS + Express
│   │   ├── src/
│   │   │   ├── ai/       # Módulo de Vercel AI SDK
│   │   │   ├── kafka/    # Servicio de KafkaJS
│   │   │   └── ...
│   └── frontend/         # React con TypeScript
│       ├── src/
│       │   ├── components/
│       │   │   └── AIChat.tsx  # Componente de chat con AI
│       │   └── ...
└── packages/             # Paquetes compartidos (opcional)
```

## Requisitos Previos

- Node.js >= 18
- pnpm >= 8
- Apache Kafka (opcional, para desarrollo local)

## Instalación

```bash
# Instalar todas las dependencias
pnpm install
```

## Configuración

### Backend

Crea un archivo `.env` en `apps/backend/`:

```env
# OpenAI API Key para Vercel AI SDK
OPENAI_API_KEY=tu_api_key_aquí

# Kafka Broker (opcional)
KAFKA_BROKER=localhost:9092
```

### Frontend

El frontend se conecta al backend en `http://localhost:3000` por defecto.

## Desarrollo

### Iniciar todos los servicios

```bash
# Iniciar backend y frontend en paralelo
pnpm dev
```

### Iniciar servicios individualmente

```bash
# Solo backend (puerto 3000)
pnpm dev:backend

# Solo frontend (puerto 5173)
pnpm dev:frontend
```

## Tecnologías Incluidas

### Backend
- **NestJS**: Framework de Node.js
- **Express**: Servidor HTTP (integrado con NestJS)
- **KafkaJS**: Cliente de Apache Kafka
- **Vercel AI SDK**: `ai` y `@ai-sdk/openai` para streaming de IA
- **TypeScript**: Tipado estático

### Frontend
- **React 19**: Biblioteca de UI
- **TypeScript**: Tipado estático
- **Vite**: Build tool y dev server
- **Vercel AI SDK**: `ai` y `@ai-sdk/react` para hooks de IA

## Uso del SDK de Vercel AI

### Backend - Streaming de texto

```typescript
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

const result = streamText({
  model: openai('gpt-4-turbo'),
  messages: [{ role: 'user', content: 'Hello!' }],
});
```

### Frontend - Hook useChat

```typescript
import { useChat } from '@ai-sdk/react';

const { messages, input, handleInputChange, handleSubmit } = useChat({
  api: 'http://localhost:3000/ai/chat',
});
```

## Uso de KafkaJS

El servicio de Kafka está disponible en el backend:

```typescript
import { KafkaService } from './kafka/kafka.service';

// Enviar mensaje
await kafkaService.sendMessage('mi-topico', { data: 'mensaje' });

// Suscribirse a un tópico
await kafkaService.subscribe('mi-topico', (message) => {
  console.log('Mensaje recibido:', message);
});
```

## Scripts Disponibles

```bash
# Desarrollo
pnpm dev                 # Todos los servicios
pnpm dev:backend         # Solo backend
pnpm dev:frontend        # Solo frontend

# Build
pnpm build              # Build de todos los proyectos

# Otros
pnpm install:all        # Reinstalar dependencias
```

## Endpoints del Backend

- `POST /ai/chat` - Chat con streaming de IA
- `POST /ai/generate` - Generación de texto con prompt
- (Agrega tus propios endpoints aquí)

## Notas

- El backend corre en el puerto **3000**
- El frontend corre en el puerto **5173**
- Necesitas una API key de OpenAI para usar el SDK de Vercel AI
- Para usar Kafka, asegúrate de tener un broker corriendo (por ejemplo, con Docker)

## Iniciar Kafka con Docker (Opcional)

```bash
docker run -d --name kafka \
  -p 9092:9092 \
  -e KAFKA_ENABLE_KRAFT=yes \
  -e KAFKA_CFG_PROCESS_ROLES=broker,controller \
  -e KAFKA_CFG_CONTROLLER_LISTENER_NAMES=CONTROLLER \
  -e KAFKA_CFG_LISTENERS=PLAINTEXT://:9092,CONTROLLER://:9093 \
  -e KAFKA_CFG_LISTENER_SECURITY_PROTOCOL_MAP=CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT \
  -e KAFKA_CFG_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092 \
  -e KAFKA_BROKER_ID=1 \
  -e KAFKA_CFG_CONTROLLER_QUORUM_VOTERS=1@localhost:9093 \
  bitnami/kafka:latest
```

## Próximos Pasos

1. Configura tu API key de OpenAI en el `.env`
2. Personaliza los módulos de NestJS según tus necesidades
3. Importa el componente `AIChat` en tu aplicación React
4. Configura tus tópicos de Kafka y lógica de mensajería
5. Agrega pruebas unitarias y de integración

## Licencia

UNLICENSED
