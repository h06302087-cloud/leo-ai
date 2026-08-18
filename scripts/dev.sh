#!/bin/bash

# Development startup script
# Starts all backend services in development mode

set -e

echo "🚀 Starting Leo AI Platform (Development)"
echo "=========================================="

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies first..."
    pnpm install
fi

echo ""
echo "Starting services..."
echo "  Studio Service:       http://localhost:3001"
echo "  Workflow Engine:      http://localhost:3002"
echo "  AI Agent Service:     http://localhost:3003"
echo "  Integration Service:  http://localhost:3004"
echo "  Export Service:       http://localhost:3005"
echo ""

pnpm run dev
