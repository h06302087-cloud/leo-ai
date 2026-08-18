# Comprehensive Development Guide

## Prerequisites

- Node.js 20+
- pnpm 8+
- Docker & Docker Compose (for containerized services)
- Redis (included in docker-compose)

## Quick Start

### 1. Setup Project

```bash
# Make setup script executable
chmod +x scripts/setup.sh

# Run setup
./scripts/setup.sh
```

### 2. Configure Environment

```bash
# Copy example env file
cp .env.example.local .env

# Edit .env with your configuration
vim .env
```

### 3. Run Services

**Option A: Docker Compose (Recommended)**

```bash
npm run docker:up
```

**Option B: Development Mode (Direct)**

```bash
./scripts/dev.sh
```

## Service Architecture

### Backend Services (Node.js + Express)

| Service | Port | Purpose |
|---------|------|----------|
| Studio Service | 3001 | No-code app builder |
| Workflow Engine | 3002 | DAG workflow execution |
| AI Agent Service | 3003 | LLM orchestration |
| Integration Service | 3004 | External API management |
| Export Service | 3005 | App export/deployment |

### API Documentation

#### Studio Service (`POST /api/studio/projects`)

```bash
curl -X POST http://localhost:3001/api/studio/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My App",
    "description": "Test app",
    "template": "blank"
  }'
```

#### Workflow Engine (`POST /api/workflows/create`)

```bash
curl -X POST http://localhost:3002/api/workflows/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Workflow",
    "nodes": [
      {"id": "node1", "type": "webhook", "data": {}}
    ],
    "edges": []
  }'
```

#### AI Agent Service (`POST /api/agents/create`)

```bash
curl -X POST http://localhost:3003/api/agents/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ChatBot",
    "model": "gpt-4o",
    "systemPrompt": "You are a helpful assistant."
  }'
```

## Development Workflow

### Modifying Services

1. Edit service code in `backend/<service>/src/`
2. Changes auto-reload in development mode
3. TypeScript errors appear in console immediately

### Adding Dependencies

```bash
# Add to specific workspace
pnpm add <package> -w backend/<service>

# Add to all workspaces
pnpm add -r <package>
```

### Building for Production

```bash
./scripts/build.sh
```

## Testing

### Health Checks

```bash
# Test all services
for port in 3001 3002 3003 3004 3005; do
  echo "Service :$port"
  curl http://localhost:$port/health
  echo ""
done
```

### API Testing with curl

```bash
# Create project
PROJ_ID=$(curl -X POST http://localhost:3001/api/studio/projects \
  -H "Content-Type: application/json" \
  -d '{"name": "Test"}' | jq -r '.data.projectId')

echo "Created project: $PROJ_ID"

# Get project
curl http://localhost:3001/api/studio/projects/$PROJ_ID | jq
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :3001

# Kill process
kill -9 <PID>
```

### Docker Issues

```bash
# View logs
docker-compose logs -f <service-name>

# Restart services
npm run docker:down
npm run docker:up
```

### TypeScript Errors

```bash
# Type check all services
pnpm run typecheck

# Type check specific service
cd backend/<service> && pnpm run typecheck
```

## Performance Monitoring

### View Service Logs

```bash
# Docker logs
docker-compose logs -f studio-service

# Development logs
# Services output to stdout/stderr
```

### Health Endpoint Response

```json
{
  "status": "ok",
  "service": "studio",
  "timestamp": "2024-08-18T16:30:00.000Z"
}
```

## Security Notes

- Never commit `.env` files
- Always use HTTPS in production
- Rotate JWT secrets regularly
- Validate all API inputs (Zod schemas)
- Use environment variables for secrets
- Run services as non-root (Docker)

## Next Steps

1. Configure Firebase project
2. Add AI API keys (OpenAI, Anthropic)
3. Implement database persistence (Firestore)
4. Add authentication middleware
5. Set up monitoring & logging
6. Deploy to production infrastructure

## Resources

- [Node.js Best Practices](https://nodejs.org/en/docs/guides/nodejs-best-practices/)
- [Express Security](https://expressjs.com/en/advanced/best-practice-security.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Docker Documentation](https://docs.docker.com/)
