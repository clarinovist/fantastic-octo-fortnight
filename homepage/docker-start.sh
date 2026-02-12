#!/bin/bash

echo "🚀 Starting Lesprivate Homepage with Docker..."
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Build and start the container
echo "📦 Building and starting the container..."
docker-compose up --build -d

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Container started successfully!"
    echo ""
    echo "🌐 Application is running at: http://localhost:3000"
    echo ""
    echo "📋 Useful commands:"
    echo "  - View logs: docker-compose logs -f"
    echo "  - Stop container: docker-compose down"
    echo "  - Restart: docker-compose restart"
    echo ""
else
    echo ""
    echo "❌ Failed to start the container"
    exit 1
fi
