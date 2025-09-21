#!/bin/bash

# Start the complete FinTech microservices system
echo "🚀 Starting FinTech Microservices Architecture..."
echo ""

# Kill any existing processes on these ports
echo "🧹 Cleaning up existing processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:3002 | xargs kill -9 2>/dev/null || true
lsof -ti:3003 | xargs kill -9 2>/dev/null || true
lsof -ti:3004 | xargs kill -9 2>/dev/null || true

echo ""
echo "🏗️  MICROSERVICES ARCHITECTURE:"
echo "   👤 User Service (port 3002): User management + Mock MongoDB"
echo "   💳 Transaction Service (port 3003): Transaction processing + Mock MongoDB"
echo "   🔔 Notification Service (port 3004): Notifications + Mock Redis"
echo "   🔗 API Gateway (port 3001): Routes requests to services"
echo "   🌐 UI Server (port 3000): Frontend application"
echo ""

# Start User Service (port 3002)
echo "👤 Starting User Service on port 3002..."
cd services/user-service
node server.js &
USER_PID=$!
cd ../..

# Wait a moment for User Service to start
sleep 2

# Start Transaction Service (port 3003)
echo "💳 Starting Transaction Service on port 3003..."
cd services/transaction-service
node server.js &
TRANSACTION_PID=$!
cd ../..

# Wait a moment for Transaction Service to start
sleep 2

# Start Notification Service (port 3004)
echo "🔔 Starting Notification Service on port 3004..."
cd services/notification-service
node server.js &
NOTIFICATION_PID=$!
cd ../..

# Wait a moment for Notification Service to start
sleep 2

# Start API Gateway (port 3001)
echo "🔗 Starting API Gateway on port 3001..."
cd services/api-gateway
node server.js &
API_GATEWAY_PID=$!
cd ../..

# Wait a moment for API Gateway to start
sleep 3

# Start UI Server (port 3000)
echo "🌐 Starting UI Server on port 3000..."
cd mock-backend
node server.js &
UI_PID=$!
cd ..

# Wait for all services to start
sleep 5

echo ""
echo "✅ FinTech Microservices System is running!"
echo ""
echo "🏗️  ARCHITECTURE:"
echo "   🌐 UI Server:           http://localhost:3000"
echo "   🔗 API Gateway:         http://localhost:3001/api/health"
echo "   👤 User Service:        http://localhost:3002/health"
echo "   💳 Transaction Service: http://localhost:3003/health"
echo "   🔔 Notification Service: http://localhost:3004/health"
echo ""
echo "🌐 APPLICATION URLS:"
echo "   Login Page:    http://localhost:3000/login"
echo "   Dashboard:     http://localhost:3000/dashboard"
echo "   Transactions:  http://localhost:3000/transactions"
echo ""
echo "🔗 API ENDPOINTS (via Gateway):"
echo "   Authentication: POST http://localhost:3001/api/auth/login"
echo "   Users:         http://localhost:3001/api/users"
echo "   Transactions:  http://localhost:3001/api/transactions"
echo "   Notifications: http://localhost:3001/api/notifications"
echo ""
echo "🧪 TEST COMMANDS:"
echo "   npm test              # Chrome UI tests only"
echo "   npm run test:api      # API tests against microservices"
echo "   npm run test:all      # All tests, all browsers"
echo ""
echo "💡 TIP: Watch the console logs to see service-to-service communication!"
echo ""
echo "Press Ctrl+C to stop all services..."

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping all microservices..."
    kill $USER_PID $TRANSACTION_PID $NOTIFICATION_PID $API_GATEWAY_PID $UI_PID 2>/dev/null
    echo "✅ All services stopped."
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Keep script running
wait
