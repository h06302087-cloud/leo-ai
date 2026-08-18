# API Reference

## Base URLs

- Development: `http://localhost:3001` (Studio)
- Production: `https://api.leo-ai.app`

## Authentication (TODO)

Currently unauthenticated. Implement JWT bearer tokens:

```
Authorization: Bearer <jwt_token>
```

## Response Format

All endpoints return:

```json
{
  "success": true|false,
  "data": {...},
  "error": "error message if success=false"
}
```

## Studio Service (Port 3001)

### Create Project

```http
POST /api/studio/projects
Content-Type: application/json

{
  "name": "My App",
  "description": "App description",
  "template": "blank"
}

Response 201:
{
  "success": true,
  "data": {
    "projectId": "proj_1234567_abc123",
    "createdAt": "2024-08-18T16:30:00.000Z"
  }
}
```

### Get Project

```http
GET /api/studio/projects/:projectId

Response 200:
{
  "success": true,
  "data": {
    "id": "proj_1234567_abc123",
    "name": "My App",
    "description": "App description",
    "pages": [],
    "workflows": [],
    "createdAt": "2024-08-18T16:30:00.000Z",
    "status": "active"
  }
}
```

### Create/Update Page

```http
PUT /api/studio/projects/:projectId/pages/:pageId
Content-Type: application/json

{
  "name": "Home Page",
  "components": [...],
  "layout": {...}
}

Response 200:
{
  "success": true,
  "data": {
    "pageId": "page_1234567_abc123",
    "updatedAt": "2024-08-18T16:30:00.000Z"
  }
}
```

### Preview Component

```http
POST /api/studio/components/preview
Content-Type: application/json

{
  "componentTree": {
    "type": "button",
    "props": {"label": "Click me"}
  }
}

Response 200:
{
  "success": true,
  "data": {
    "html": "<div class=\"component-preview\">button</div>",
    "errors": []
  }
}
```

### Bind Data

```http
POST /api/studio/bind-data
Content-Type: application/json

{
  "sourceField": "user.name",
  "targetField": "input.value",
  "transformFn": "toLowerCase()"
}

Response 201:
{
  "success": true,
  "data": {
    "bindingId": "bind_1234567_abc123",
    "status": "active"
  }
}
```

## Workflow Engine (Port 3002)

### Create Workflow

```http
POST /api/workflows/create
Content-Type: application/json

{
  "name": "Send Email on Trigger",
  "description": "Sends email when webhook triggered",
  "nodes": [
    {
      "id": "webhook1",
      "type": "webhook",
      "data": {"path": "/trigger"}
    },
    {
      "id": "email1",
      "type": "email",
      "data": {
        "config": {
          "to": "user@example.com",
          "subject": "Triggered",
          "body": "Workflow executed"
        }
      }
    }
  ],
  "edges": [
    {"source": "webhook1", "target": "email1"}
  ]
}

Response 201:
{
  "success": true,
  "data": {
    "workflowId": "wf_1234567_abc123",
    "createdAt": "2024-08-18T16:30:00.000Z"
  }
}
```

### Validate Workflow

```http
POST /api/workflows/:workflowId/validate

Response 200:
{
  "success": true,
  "data": {
    "isValid": true,
    "errors": [],
    "warnings": []
  }
}
```

### Execute Workflow

```http
POST /api/workflows/:workflowId/execute
Content-Type: application/json

{
  "inputData": {
    "userId": "user123",
    "action": "clicked_button"
  }
}

Response 200:
{
  "success": true,
  "data": {
    "executionId": "exec_1234567_abc123",
    "status": "success",
    "nodeResults": [
      {
        "nodeId": "webhook1",
        "status": "success",
        "output": {...},
        "executionTime": 45
      }
    ]
  }
}
```

### Get Execution History

```http
GET /api/workflows/:workflowId/executions?limit=20&offset=0

Response 200:
{
  "success": true,
  "data": [...],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 100,
    "pages": 5
  }
}
```

### Test Node

```http
POST /api/workflows/:workflowId/test-node
Content-Type: application/json

{
  "nodeId": "email1",
  "inputData": {"recipient": "test@example.com"}
}

Response 200:
{
  "success": true,
  "data": {
    "output": {"queued": true, "messageId": "msg_123"},
    "executionTime": 120,
    "errors": []
  }
}
```

## AI Agent Service (Port 3003)

### Create Agent

```http
POST /api/agents/create
Content-Type: application/json

{
  "name": "Customer Support Bot",
  "model": "gpt-4o",
  "systemPrompt": "You are a helpful customer support agent.",
  "temperature": 0.7,
  "maxTokens": 2000,
  "memory": {"maxMessages": 20}
}

Response 201:
{
  "success": true,
  "data": {
    "agentId": "agent_1234567_abc123",
    "createdAt": "2024-08-18T16:30:00.000Z"
  }
}
```

### Chat with Agent

```http
POST /api/agents/:agentId/chat
Content-Type: application/json

{
  "message": "How do I reset my password?",
  "conversationId": "conv_1234567_abc123"
}

Response 200:
{
  "success": true,
  "data": {
    "response": "To reset your password, click the 'Forgot Password' link...",
    "tokens": 245,
    "conversationId": "conv_1234567_abc123"
  }
}
```

### Get Agent Memory

```http
GET /api/agents/:agentId/memory?limit=50

Response 200:
{
  "success": true,
  "data": {
    "memories": [
      {"role": "user", "content": "..."},
      {"role": "assistant", "content": "..."}
    ],
    "metadata": {"count": 50, "limit": 50}
  }
}
```

## Integration Service (Port 3004)

### Create Integration

```http
POST /api/integrations
Content-Type: application/json

{
  "name": "Support Slack",
  "provider": "slack",
  "config": {
    "webhookUrl": "https://hooks.slack.com/...",
    "channel": "#support"
  }
}

Response 201:
{
  "success": true,
  "data": {
    "integrationId": "int_1234567_abc123",
    "status": "active"
  }
}
```

### Test Integration

```http
POST /api/integrations/:integrationId/test

Response 200:
{
  "success": true,
  "data": {
    "status": "connected",
    "provider": "slack"
  }
}
```

## Export Service (Port 3005)

### Create Export Job

```http
POST /api/export/create
Content-Type: application/json

{
  "projectId": "proj_1234567_abc123",
  "format": "next",
  "options": {"includeTypes": true}
}

Response 201:
{
  "success": true,
  "data": {
    "exportId": "exp_1234567_abc123",
    "status": "pending"
  }
}
```

### Get Export Status

```http
GET /api/export/:exportId

Response 200:
{
  "success": true,
  "data": {
    "id": "exp_1234567_abc123",
    "projectId": "proj_1234567_abc123",
    "format": "next",
    "status": "completed",
    "downloadUrl": "https://...",
    "createdAt": "2024-08-18T16:30:00.000Z"
  }
}
```

## Error Codes

| Code | Status | Meaning |
|------|--------|----------|
| VALIDATION_ERROR | 400 | Input validation failed |
| UNAUTHORIZED | 401 | Missing/invalid authentication |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Resource already exists |
| RATE_LIMITED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |
| SERVICE_UNAVAILABLE | 503 | Dependency unavailable |

## Rate Limits

Current limits (TODO: implement):
- 100 requests/minute per IP
- 1000 requests/hour per user
- 10,000 token/minute for LLM calls

## Pagination

List endpoints support:
```
?limit=20&offset=0
```

Response includes:
```json
{
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 150,
    "pages": 8
  }
}
```
