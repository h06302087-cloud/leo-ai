# Architecture

## System Overview

Leo AI Platform is a microservices-based architecture built for scalability and reliability.

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  Next.js 14 + React 18 + TypeScript + TailwindCSS         │
│  React Flow (workflow designer) + React DnD (app builder) │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    API GATEWAY LAYER                         │
│  Next.js API Routes (reverse proxy to microservices)       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   MICROSERVICES LAYER                        │
│  Studio (3001) │ Workflow (3002) │ AI Agent (3003)        │
│  Integration (3004) │ Export (3005) │ Python (3006)       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   DATA & CACHE LAYER                         │
│  Firestore │ Redis │ Cloud Storage │ Pub/Sub               │
└─────────────────────────────────────────────────────────────┘
```

## Services

### Studio Service (Port 3001)
- Project management
- Page and component CRUD
- Real-time preview generation
- Firebase data binding

### Workflow Engine (Port 3002)
- Node-based workflow execution
- Cron scheduling with node-cron
- Bull queue for async processing
- Execution history and logs

### AI Agent Service (Port 3003)
- OpenAI GPT-4/4o integration
- Anthropic Claude integration
- Conversation memory management
- Tool/function calling framework

### Integration Service (Port 3004)
- OAuth2 flow management
- Webhook testing and routing
- Third-party API connectors
- Credential secure storage

### Export Service (Port 3005)
- ZIP package generation
- Code templating with Handlebars
- Deployment orchestration
- CI/CD pipeline generation

### Python Service (Port 3006)
- Sandboxed script execution
- Resource limits (CPU, memory)
- Pre-installed data science libraries
- Input/output mapping

## Database Schema

### Firestore Collections

```
users/{userId}
  - profile: { email, name, subscription }
  - preferences: { theme, language }

projects/{projectId}
  - metadata: { name, description, ownerId, createdAt }
  - pages: [ { id, name, route, layout, components } ]
  - workflows: [ { id, name, isActive } ]
  - integrations: [ { service, status, config } ]
  - deployments: [ { environment, status, url } ]

workflows/{workflowId}
  - definition: { nodes, edges, triggers }
  - executions: [ { status, startedAt, nodeResults } ]
  - variables: { key: value }

agents/{agentId}
  - config: { model, temperature, systemPrompt }
  - tools: [ { name, description, parameters } ]
  - memory: { shortTerm, longTerm, maxMessages }
```

## Security

- Firebase Authentication (JWT)
- Firestore Security Rules
- API rate limiting per user
- Input sanitization
- CORS configuration
- Secret management via environment variables
