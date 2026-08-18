# Architecture Documentation

## System Overview

Leo AI is a modular microservices platform for building AI-powered applications.

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                   │
│                    http://localhost:3000                    │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
   ┌────▼────┐   ┌──────▼───────┐  ┌────▼────┐
   │ Studio  │   │  Workflow    │  │   AI    │
   │ Service │   │  Engine      │  │  Agent  │
   │  :3001  │   │   :3002      │  │ :3003   │
   └────┬────┘   └──────┬───────┘  └────┬────┘
        │                │              │
        └────────────────┼──────────────┘
                         │
        ┌────────────────┼─────────────────┐
        │                │                 │
   ┌────▼──────┐  ┌─────▼─────┐   ┌──────▼──┐
   │Integration│  │  Export   │   │  Redis  │
   │ Service   │  │  Service  │   │  Cache  │
   │  :3004    │  │  :3005    │   │ :6379   │
   └───────────┘  └───────────┘   └─────────┘
        │
   ┌────▼──────────────────────────────┐
   │   External Integrations            │
   │  (Slack, GitHub, Stripe, etc)      │
   └────────────────────────────────────┘
```

## Services

### 1. Studio Service (Port 3001)

**Purpose**: No-code app builder backend

**Key Features**:
- Project management
- Page/component creation
- Visual component preview
- Data binding

**Dependencies**:
- Express, Helmet, Firebase Admin SDK
- Zod for validation

**Key Endpoints**:
```
POST   /api/studio/projects
GET    /api/studio/projects/:projectId
PUT    /api/studio/projects/:projectId/pages/:pageId
POST   /api/studio/components/preview
POST   /api/studio/bind-data
```

### 2. Workflow Engine (Port 3002)

**Purpose**: DAG-based workflow execution

**Key Features**:
- Workflow creation and validation
- Node-based execution engine
- Cron/scheduled triggers
- Execution history

**Dependencies**:
- Express, node-cron
- Zod for validation

**Node Types**:
- `webhook` - HTTP trigger
- `http` - HTTP request
- `condition` - Branching logic
- `agent` - LLM call
- `python` - Python execution
- `email` - Send email
- `slack` - Slack notification
- `manual` - Approval required
- `schedule` - Cron trigger
- `event` - Event listener

**Key Endpoints**:
```
POST   /api/workflows/create
POST   /api/workflows/:workflowId/validate
POST   /api/workflows/:workflowId/execute
GET    /api/workflows/:workflowId/executions
POST   /api/workflows/:workflowId/test-node
GET    /api/workflows/:workflowId
DELETE /api/workflows/:workflowId
```

### 3. AI Agent Service (Port 3003)

**Purpose**: LLM orchestration and agent management

**Key Features**:
- Multi-model support (OpenAI, Anthropic)
- Conversation memory management
- Tool/function definitions
- Token tracking

**Supported Models**:
- OpenAI: gpt-4, gpt-4o
- Anthropic: claude-3-opus, claude-3-sonnet

**Key Endpoints**:
```
POST   /api/agents/create
POST   /api/agents/:agentId/chat
GET    /api/agents/:agentId
GET    /api/agents/:agentId/memory
```

### 4. Integration Service (Port 3004)

**Purpose**: External API and service integration

**Supported Providers**:
- Slack
- GitHub
- Stripe
- SendGrid
- Twilio

**Key Endpoints**:
```
POST   /api/integrations
GET    /api/integrations/:integrationId
POST   /api/integrations/:integrationId/test
GET    /api/integrations
```

### 5. Export Service (Port 3005)

**Purpose**: App export and deployment

**Export Formats**:
- `html` - Static HTML
- `react` - React components
- `next` - Next.js app
- `docker` - Docker container

**Key Endpoints**:
```
POST   /api/export/create
GET    /api/export/:exportId
POST   /api/export/:exportId/download
```

## Data Flow

### Typical Workflow Execution

```
1. Studio creates app/workflow
   └─> Stored in Firestore

2. User triggers workflow
   └─> Workflow Engine receives request
      └─> Validates DAG structure
      └─> Identifies trigger nodes
      └─> Executes sequentially with branching
      └─> Each node can call:
          ├─> AI Agent Service (for LLM)
          ├─> Integration Service (for external APIs)
          ├─> Python Service (for computation)
          └─> Other services
      └─> Stores execution history in Firestore
      └─> Returns results to caller
```

## Technology Stack

### Backend
- **Runtime**: Node.js 22 (Alpine Linux)
- **Framework**: Express.js 4.19
- **Language**: TypeScript 5.4
- **Validation**: Zod 3.23
- **Security**: Helmet 7.1
- **Caching**: Redis 7
- **Package Manager**: pnpm

### Deployment
- **Containers**: Docker
- **Orchestration**: Docker Compose (dev) / Kubernetes (prod)
- **Database**: Firestore
- **Infrastructure**: Firebase/GCP

## Database Schema

### Firestore Collections

```
projects/
  ├── id: string
  ├── name: string
  ├── description: string
  ├── pages: array
  ├── workflows: array
  └── createdAt: timestamp

workflows/
  ├── id: string
  ├── projectId: string
  ├── name: string
  ├── nodes: array
  ├── edges: array
  ├── triggers: array
  ├── isActive: boolean
  └── createdAt: timestamp

executions/
  ├── id: string
  ├── workflowId: string
  ├── status: enum(running|success|failed)
  ├── nodeResults: array
  ├── startedAt: timestamp
  └── completedAt: timestamp

agents/
  ├── id: string
  ├── name: string
  ├── model: string
  ├── systemPrompt: string
  ├── temperature: number
  └── createdAt: timestamp

conversations/
  ├── id: string
  ├── agentId: string
  ├── messages: array
  └── updatedAt: timestamp
```

## Inter-Service Communication

### Service-to-Service Calls

```typescript
// Workflow Engine calling AI Agent Service
POST http://ai-agent-service:3003/api/agents/:agentId/chat
{
  "message": "Process this data",
  "conversationId": "conv_123"
}

// Workflow Engine calling Integration Service
POST http://integration-service:3004/api/integrations/:id/execute
{
  "action": "send_slack_message",
  "payload": {...}
}
```

## Deployment Architecture

### Development

```
Docker Compose
├── Redis (cache)
├── Studio Service
├── Workflow Engine
├── AI Agent Service
├── Integration Service
└── Export Service
```

### Production

```
Kubernetes / Cloud Run
├── Load Balancer
├── Service Mesh (Istio)
├── Redis Cluster
├── Firestore
├── Studio Service (autoscaled)
├── Workflow Engine (autoscaled)
├── AI Agent Service (autoscaled)
├── Integration Service (autoscaled)
├── Export Service (autoscaled)
├── Python Service (sandboxed)
└── Monitoring (Prometheus/Grafana)
```

## Performance Considerations

### Caching
- Redis for session/workflow state
- In-memory conversation history (TODO: migrate to Redis)
- HTTP response caching headers

### Scalability
- Stateless services (scale horizontally)
- Database queries optimized with indexes
- Async task queue for long-running operations (TODO)

### Rate Limiting
- Per-user/API-key limits (TODO)
- Global service limits
- Token bucket algorithm

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": "User-friendly message",
  "details": {
    "code": "ERROR_CODE",
    "field": "fieldName",
    "suggestion": "How to fix"
  }
}
```

### Error Classes

- `ValidationError` (400)
- `UnauthorizedError` (401)
- `ForbiddenError` (403)
- `NotFoundError` (404)
- `ServiceError` (500+)

## Monitoring & Observability

### Metrics to Track
- Request latency per endpoint
- Error rate by service
- LLM token usage
- Database query performance
- Cache hit rate

### Logging
- Structured JSON logs
- Service name + timestamp
- Request ID for tracing
- Error stack traces (dev only)

### Alerting
- Service health checks (30s interval)
- Error rate threshold (>5%)
- Response time SLA violation
- Database connection failures

## Future Enhancements

1. **Message Queue**: RabbitMQ/Kafka for async tasks
2. **Service Mesh**: Istio for advanced routing
3. **API Gateway**: Kong/Tyk for rate limiting/auth
4. **Event Sourcing**: Immutable event log
5. **CQRS**: Separate read/write models
6. **GraphQL**: Alternative to REST API
7. **Real-time**: WebSockets for live updates
8. **Multi-tenancy**: Proper isolation & billing

## References

- Express Best Practices: https://expressjs.com/en/advanced/best-practice-security.html
- TypeScript Handbook: https://www.typescriptlang.org/docs/
- Node.js Best Practices: https://github.com/goldbergyoni/nodebestpractices
