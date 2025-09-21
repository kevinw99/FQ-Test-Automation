# Fintech Test Automation Framework

A comprehensive test automation framework for testing a fintech application using Playwright with TypeScript.

## Architecture Overview

This framework implements a **true microservices architecture** with the following components:

### Microservices (Separate Services on Different Ports)
- **User Service** (port 3002) - User management with MongoDB-like smart mocks
- **Transaction Service** (port 3003) - Transaction processing with MongoDB-like smart mocks  
- **Notification Service** (port 3004) - Multi-channel notifications with Redis-like smart mocks
- **API Gateway** (port 3001) - Routes requests to individual microservices
- **UI Server** (port 3000) - Serves frontend application (login, dashboard, transactions)

### Key Architecture Features
- **True service-to-service HTTP communication** between microservices
- **Smart database mocks** that simulate MongoDB and Redis behavior
- **API Gateway pattern** with proper request routing and forwarding
- **Service health monitoring** and automatic server lifecycle management
- **Comprehensive logging** with request/response tracking

## Framework Features

### ✅ API Testing
- Comprehensive REST API test coverage (14 tests)
- Service-specific test suites (users, transactions, notifications)
- Authentication and authorization testing
- Data validation and error handling
- Automatic microservices startup via Playwright

### ✅ UI Testing  
- Page Object Model implementation (17 tests)
- Cross-browser testing support (Chrome, Firefox, WebKit)
- User journey automation across all pages
- Automatic backend server startup

### ✅ Test Data Management
- Faker.js integration for dynamic test data
- Test data generators for all entities
- Smart mock databases with realistic behavior
- Environment-specific configurations

### ✅ Reporting & Analytics
- HTML reports with screenshots and videos
- JSON and JUnit report formats
- Custom test metrics and summaries
- Failed test artifact collection

### ✅ Server Management
- Consistent server lifecycle management
- Fresh test runs with automatic server restart
- Health monitoring and service discovery
- Cross-platform compatibility

## Project Structure

```
├── services/                   # Microservices implementation
│   ├── api-gateway/           # API Gateway (port 3001)
│   ├── user-service/          # User Service (port 3002)
│   ├── transaction-service/   # Transaction Service (port 3003)
│   └── notification-service/  # Notification Service (port 3004)
├── config/
│   └── environment.ts         # Environment configurations
├── pages/                     # Page Object Model
│   ├── LoginPage.ts          # Login page object
│   ├── DashboardPage.ts      # Dashboard page object
│   └── TransactionPage.ts    # Transaction page object
├── tests/
│   ├── fixtures.ts           # Test fixtures and setup
│   ├── api/                  # API tests (14 tests)
│   │   ├── user.api.spec.ts         # User service API tests
│   │   ├── transaction.api.spec.ts  # Transaction service API tests
│   │   └── notification.api.spec.ts # Notification service API tests
│   └── ui/                   # UI tests (17 tests)
│       ├── login.ui.spec.ts         # Login UI tests
│       ├── dashboard.ui.spec.ts     # Dashboard UI tests
│       └── transaction.ui.spec.ts   # Transaction UI tests
├── utils/
│   ├── apiHelper.ts          # API testing utilities
│   ├── testDataGenerator.ts  # Test data generation
│   └── testReporter.ts       # Custom reporting
├── mock-backend/             # Legacy backend (kept for compatibility)
├── mock-ui/                  # Static HTML files
├── playwright.config.ts      # Playwright configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies and scripts
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- No databases required (uses smart mocks)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/kevinw99/FloQast-Test-Automation.git
cd FloQast-Test-Automation
```

2. Install dependencies:
```bash
npm install
```

3. Install Playwright browsers:
```bash
npm run install:browsers
```

4. Set up environment variables (optional):
```bash
cp .env.example .env
# Edit .env with your configuration if needed
```

## Running Tests

### Quick Commands (Recommended)
```bash
# All tests with server management
npm run test:all:fresh    # Restart servers + run all tests (65 tests)
npm run test:api:fresh    # Restart servers + run API tests (14 tests) 
npm run test:fresh        # Restart servers + run Chrome UI tests (17 tests)

# Individual test suites
npm run test:api          # API tests only
npm run test             # Chrome UI tests only  
npm run test:all         # All tests, all browsers
```

### Cross-Browser Testing
```bash
npm run test:ui:all      # UI tests in all browsers
npm run test:ui:firefox  # Firefox only
npm run test:ui:webkit   # WebKit/Safari only
```

### Development & Debugging
```bash
npm run test:headed      # Run with visible browser
npm run test:debug       # Step-by-step debugging
npm run test:report      # View HTML reports
```

### Server Management
```bash
npm run servers:start    # Start all microservices manually
npm run servers:stop     # Stop all servers
npm run servers:restart  # Restart all servers
```

## Configuration

### Environment Variables
Configure in your `.env` file (optional):

```env
# Base URLs (Microservices)
BASE_URL=http://localhost:3000          # UI Server
API_BASE_URL=http://localhost:3001      # API Gateway

# Individual Services (for direct access)
USER_SERVICE_URL=http://localhost:3002
TRANSACTION_SERVICE_URL=http://localhost:3003  
NOTIFICATION_SERVICE_URL=http://localhost:3004

# Authentication
TEST_API_KEY=test_api_key_123
TEST_USER_TOKEN=test_jwt_token

# Test User Credentials
TEST_USER_EMAIL=test@fintech.com
TEST_USER_PASSWORD=TestPassword123!

# Test Configuration
TEST_TIMEOUT=30000
RETRY_COUNT=2
PARALLEL_WORKERS=4
```

**Note**: The system uses smart mock databases, so no external databases are required.

### Automatic Server Management
The framework automatically manages all microservices:
- **UI Server** (port 3000) - Serves HTML pages and static files
- **API Gateway** (port 3001) - Routes requests to microservices
- **User Service** (port 3002) - User management with mock MongoDB
- **Transaction Service** (port 3003) - Transaction processing with mock MongoDB
- **Notification Service** (port 3004) - Notifications with mock Redis

### Browser Configuration
Tests run on:
- Chromium (Desktop Chrome)
- Firefox (Desktop Firefox)
- WebKit (Desktop Safari)

## Test Results

### Current Status: ✅ All Tests Passing
- **API Tests**: 14/14 passing (microservices communication)
- **UI Tests**: 17/17 passing per browser
- **Cross-Browser**: Chrome, Firefox, WebKit all supported
- **Total**: 65/65 tests passing across all browsers and services

### Test Coverage
- **User Management**: Registration, login, profile updates
- **Transactions**: Creation, retrieval, validation, filtering
- **Notifications**: Email, SMS, push notifications
- **UI Workflows**: Complete user journeys across all pages
- **API Integration**: Service-to-service communication validation

## Architecture Validation

### Microservices Implementation ✅
- **Separate services** on different ports (3001-3004)
- **True API Gateway** that routes requests to services
- **Service-to-service HTTP communication** via axios
- **Smart database mocks** simulating MongoDB and Redis
- **Health monitoring** and service discovery

### Technical Assessment Requirements ✅
- **Node.js/Express microservices** ✅
- **API Gateway routing** ✅  
- **Database integration patterns** ✅ (smart mocks)
- **Test automation framework** ✅
- **Cross-browser testing** ✅
- **Service communication** ✅

## Troubleshooting

### Common Issues

1. **Port conflicts**
   ```bash
   npm run servers:stop    # Stop existing servers
   npm run servers:start   # Restart clean
   ```

2. **Tests failing after code changes**
   ```bash
   npm run test:fresh      # Restart servers + run tests
   ```

3. **Browser issues**
   ```bash
   npm run install:browsers  # Reinstall Playwright browsers
   ```

4. **Service health check**
   - API Gateway: http://localhost:3001/api/health
   - Individual services: http://localhost:3002/health (etc.)

### Debug Tips
- Use `npm run test:headed` for visual debugging
- Check server logs for service communication issues
- Use `npm run servers:restart` when changing server code
- View HTML reports with `npm run test:report`

## Development

### Adding New Tests
1. **API Tests**: Add to `tests/api/` directory
2. **UI Tests**: Add to `tests/ui/` directory  
3. **Page Objects**: Update `pages/` directory
4. **Test Data**: Modify `utils/testDataGenerator.ts`

### Adding New Services
1. Create service in `services/` directory
2. Add startup command to `start-microservices.sh`
3. Update `playwright.config.ts` webServer array
4. Add route in API Gateway

### Best Practices
- Use fixtures for test setup/cleanup
- Follow Page Object Model for UI tests
- Implement proper error handling
- Add comprehensive logging
- Use TypeScript for type safety

## Contributing

1. Follow TypeScript best practices
2. Add tests for new features
3. Update documentation for changes
4. Ensure all tests pass before committing
5. Use consistent server management commands

## License

MIT License - see LICENSE file for details
