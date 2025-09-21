#!/bin/bash

# Start the complete FinTech mock system
echo "🚀 Starting FinTech Mock System with Request Logging..."
echo ""

# Kill any existing processes on these ports
echo "🧹 Cleaning up existing processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

echo ""
echo "📊 LOGGING ENABLED:"
echo "   🌐 UI Server (port 3000): All page requests, static files, user interactions"
echo "   🔗 API Gateway (port 3001): All REST calls, request/response data, auth tokens"
echo ""

# Start the UI server (port 3000)
echo "📱 Starting UI Server with request logging on port 3000..."
cd mock-backend
node server.js &
UI_PID=$!

# Wait a moment for UI server to start
sleep 2

# Start the API Gateway (port 3001)
echo "🔗 Starting API Gateway with comprehensive logging on port 3001..."
node services/api-gateway.js &
API_PID=$!

# Wait for services to start
sleep 3

echo ""
echo "✅ FinTech Mock System is running with FULL REQUEST LOGGING!"
echo ""
echo "🌐 URLs:"
echo "   UI Login:     http://localhost:3000/login"
echo "   UI Dashboard: http://localhost:3000/dashboard"
echo "   API Gateway:  http://localhost:3001/api/health"
echo ""
echo "📋 What You'll See in Logs:"
echo "   🌐 UI Calls: Page loads, static files, redirects"
echo "   🔗 API Calls: Authentication, CRUD operations, error responses"
echo "   📦 Request Data: Headers, body content, query parameters"
echo "   📤 Response Data: Status codes, response bodies, timing"
echo ""
echo "🧪 Test Commands:"
echo "   npm test              # Run all tests (watch logs for API calls)"
echo "   npm run test:api      # Run API tests only"
echo "   npm run test:ui       # Run UI tests only"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap 'echo ""; echo "🛑 Stopping services..."; kill $UI_PID $API_PID 2>/dev/null; exit 0' INT
wait
