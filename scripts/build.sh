#!/bin/bash

# Production build script
# Builds all services for production deployment

set -e

echo "🏗️  Building Leo AI Platform (Production)"
echo "========================================="

echo ""
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

echo ""
echo "🔨 Building all services..."
pnpm run build

echo ""
echo "✅ Build complete!"
echo "Run 'npm run docker:up' to start services"
echo ""
