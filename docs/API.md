# API Specification

## Studio API

### POST /api/studio/projects
Create a new project.

**Request:**
```json
{
  "name": "My App",
  "description": "A cool app",
  "template": "dashboard"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "projectId": "proj_123456",
    "createdAt": "2024-01-01T00:00:00Z",
    "status": "active"
  }
}
```

### GET /api/studio/projects/:projectId
Fetch project details.

### PUT /api/studio/projects/:projectId/pages/:pageId
Update page configuration.

### POST /api/studio/components/preview
Generate real-time preview.

### POST /api/studio/bind-data
Bind Firebase collection to component.

## Workflow API

### POST /api/workflows/create
Create new workflow.

### POST /api/workflows/:workflowId/validate
Validate workflow structure.

### POST /api/workflows/:workflowId/execute
Execute workflow manually.

**Request:**
```json
{
  "inputData": { "ticketId": "123" },
  "variables": { "apiKey": "xxx" }
}
```

### GET /api/workflows/:workflowId/executions
Fetch execution history.

### POST /api/workflows/:workflowId/test-node
Test individual node.

## Agent API

### POST /api/agents/create
Create AI agent.

### POST /api/agents/:agentId/chat
Send message to agent.

**Request:**
```json
{
  "message": "Hello!",
  "conversationId": "conv_123",
  "context": { "temperature": 0.7 }
}
```

### POST /api/agents/:agentId/tools
Define agent tools.

### GET /api/agents/:agentId/memory
Retrieve conversation memory.

## Integration API

### GET /api/integrations/available
List available connectors.

### POST /api/integrations/authorize
Start OAuth flow.

### POST /api/integrations/callback
Handle OAuth callback.

### POST /api/integrations/webhook/test
Test webhook endpoint.

## Export API

### POST /api/export/generate
Generate deployable project.

### GET /api/export/:exportId/status
Check export status.

### GET /api/export/:exportId/download
Download ZIP file.

## Python API

### POST /api/python/execute
Execute Python script.

**Request:**
```json
{
  "script": "import pandas as pd\nprint(df.head())",
  "inputs": { "data": [{"name": "Alice"}] },
  "timeout": 30,
  "dependencies": ["pandas"]
}
```

### POST /api/python/validate
Validate Python syntax.

### GET /api/python/libraries
List available libraries.
