#!/bin/bash

# Leo AI Platform - Setup Script
# This script installs dependencies and prepares the project for development

set -e

echo "🚀 Leo AI Platform - Setup"
echo "============================="

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+"
    exit 1
fi

echo "✓ Node.js version: $(node --version)"

# Check for pnpm
if ! command -v pnpm &> /dev/null; then
    echo "⚠️  pnpm not found. Installing pnpm globally..."
    npm install -g pnpm
fi

echo "✓ pnpm version: $(pnpm --version)"

# Install root dependencies
echo ""
echo "📦 Installing root dependencies..."
pnpm install

# Install workspace dependencies
echo ""
echo "📦 Installing workspace dependencies..."
pnpm install -r

# Build shared packages
echo ""
echo "🔨 Building shared packages..."
pnpm -w run build

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Copy .env.example to .env and configure"
echo "  2. Run 'npm run dev' to start all services"
echo "  3. Or run 'npm run docker:up' to start with Docker"
echo ""
