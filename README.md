# Fintech Test Automation Framework

A comprehensive test automation framework for testing a fintech application using Playwright with TypeScript.

## Architecture Overview

This framework tests a **mock fintech system** with the following components:
- **UI Server** (port 3000) - Serves the frontend application (login, dashboard, transactions pages)
- **API Gateway** (port 3001) - Single entry point that includes mock implementations of:
  - User Service (authentication, user management)
  - Transaction Service (transaction processing, history)
  - Notification Service (email, SMS, push notifications)

The system uses an **API Gateway pattern** with mock in-memory data stores rather than separate microservices.

## Framework Features

### ✅ API Testing
- Comprehensive REST API test coverage
- Service-specific test suites (users, transactions, notifications)
- Authentication and authorization testing
- Data validation and error handling
- Automatic backend server startup

### ✅ UI Testing
- Page Object Model implementation
- Cross-browser testing support (Chrome, Firefox, WebKit)
- User journey automation
- Automatic backend server startup

### ✅ Test Data Management
- Faker.js integration for dynamic test data
- Test data generators for all entities
- In-memory data isolation between tests
- Environment-specific configurations

### ✅ Reporting & Analytics
- HTML reports with screenshots and videos
- JSON and JUnit report formats
- Custom test metrics and summaries
- Failed test artifact collection

### ✅ Environment Configuration
- Multi-environment support (dev, staging, prod)
- Configurable service endpoints
- Environment-specific test data
- Secure credential management

## Project Structure

```
├── config/
│   └── environment.ts          # Environment configurations
├── pages/
│   ├── LoginPage.ts           # Login page object
│   ├── DashboardPage.ts       # Dashboard page object
│   └── TransactionPage.ts     # Transaction page object
├── tests/
│   ├── fixtures.ts            # Test fixtures and setup
│   ├── api/
│   │   ├── user.api.spec.ts          # User service API tests
│   │   ├── transaction.api.spec.ts   # Transaction service API tests
│   │   └── notification.api.spec.ts  # Notification service API tests
│   └── ui/
│       ├── login.ui.spec.ts          # Login UI tests
│       ├── dashboard.ui.spec.ts      # Dashboard UI tests
│       └── transaction.ui.spec.ts    # Transaction UI tests
├── utils/
│   ├── apiHelper.ts           # API testing utilities
│   ├── testDataGenerator.ts   # Test data generation
│   └── testReporter.ts        # Custom reporting
├── playwright.config.ts       # Playwright configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies and scripts
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npm run install:browsers
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

### Running Tests

#### API Tests
```bash
npm run test:api
```

#### UI Tests
```bash
npm run test:ui
```

#### All Tests
```bash
npm test
```

#### Headed Mode (with browser UI)
```bash
npm run test:headed
```

#### Debug Mode
```bash
npm run test:debug
```

### Viewing Reports
```bash
npm run test:report
```

## Configuration

### Environment Variables
Configure the following in your `.env` file:

```env
# Base URLs (Main servers)
BASE_URL=http://localhost:3000          # UI Server
API_BASE_URL=http://localhost:3001      # API Gateway

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

**Note**: The mock system uses in-memory storage, so no external databases are required.

### Automatic Server Management
The framework automatically starts and stops the backend servers:
- **UI Server** (port 3000) - Serves HTML pages and static files
- **API Gateway** (port 3001) - Handles all API requests with mock data

### Browser Configuration
Tests run on:
- Chromium (Desktop Chrome)
- Firefox (Desktop Firefox) 
- WebKit (Desktop Safari)

## Test Data Management

### Dynamic Data Generation
The framework uses Faker.js to generate realistic test data:

```typescript
// Generate a test user
const user = TestDataGenerator.generateUser();

// Generate a transaction
const transaction = TestDataGenerator.generateTransaction(userId);

// Generate multiple notifications
const notifications = TestDataGenerator.generateMultipleNotifications(userId, 5);
```

### Test Isolation
- Each test gets fresh test data
- Automatic cleanup after test completion
- No test interdependencies

## API Testing Examples

### User Service Tests
- User creation and validation
- User retrieval and updates
- User deletion and error handling
- Authentication flows

### Transaction Service Tests
- Transaction creation and validation
- Transaction history retrieval
- Amount limit validation
- Transaction categorization

### Notification Service Tests
- Multi-channel notifications (email, SMS, push)
- Notification status tracking
- User-specific notification retrieval

## UI Testing Examples

### Login Tests
- Valid/invalid credential handling
- Form validation
- Password visibility toggle
- Error message display

### Dashboard Tests
- User information display
- Account balance verification
- Recent transactions
- Navigation functionality

### Transaction Tests
- Transaction creation flow
- Transaction filtering and search
- Transaction history display
- Form validation

## Continuous Integration

### GitHub Actions Example
```yaml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install
      - run: npm test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: test-results/
```

## Best Practices

### Test Organization
- Group related tests in describe blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

### Page Objects
- Keep selectors in page objects
- Use data-testid attributes for stability
- Implement reusable methods

### Error Handling
- Use proper assertions
- Handle async operations correctly
- Implement retry mechanisms for flaky tests

### Performance
- Run tests in parallel where possible
- Use fixtures for expensive setup
- Clean up resources after tests

## Troubleshooting

### Common Issues

1. **Tests timing out**
   - Increase timeout in playwright.config.ts
   - Check for slow network requests
   - Verify element selectors

2. **Browser not launching**
   - Run `npm run install:browsers`
   - Check system dependencies

3. **API tests failing**
   - Verify service endpoints are running
   - Check authentication tokens
   - Validate request/response formats

### Debug Tips
- Use `--debug` flag for step-by-step debugging
- Add `await page.pause()` for manual inspection
- Check browser developer tools in headed mode

## Contributing

1. Follow TypeScript best practices
2. Add tests for new features
3. Update documentation for changes
4. Ensure all tests pass before committing

## License

MIT License - see LICENSE file for details
