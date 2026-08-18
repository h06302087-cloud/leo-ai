# Setup Guide

## Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Firebase CLI
- Git

## Quick Start

### 1. Clone and Install

```bash
git clone <repo-url>
cd leo-ai-platform
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
# Edit .env with your API keys
```

### 3. Start with Docker (Recommended)

```bash
npm run docker:up
```

This starts all services:
- Frontend: http://localhost:3000
- Studio Service: http://localhost:3001
- Workflow Engine: http://localhost:3002
- AI Agent Service: http://localhost:3003
- Integration Service: http://localhost:3004
- Export Service: http://localhost:3005
- Python Service: http://localhost:3006
- Redis: localhost:6379

### 4. Start Firebase Emulators

```bash
npm run db:emulator
```

### 5. Development Mode

```bash
# Terminal 1 - Frontend
cd frontend && npm run dev

# Terminal 2 - Workflow Engine
cd backend/workflow-engine && npm run dev

# Terminal 3 - AI Agent Service
cd backend/ai-agent-service && npm run dev
```

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed system design.

## API Documentation

See [API.md](API.md) for endpoint specifications.
