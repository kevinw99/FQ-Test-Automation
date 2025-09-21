# TODO: Refactor to True Microservices Architecture

## Current State vs Requirements

### ❌ Current Implementation (DOES NOT SATISFY REQUIREMENTS)
- Single API Gateway with embedded mock services
- In-memory data storage
- No real databases
- No service-to-service communication
- Ports: 3000 (UI), 3001 (API Gateway with everything bundled)

### ✅ Required Implementation (PER TECHNICAL ASSESSMENT)
- **Separate microservices** on different ports
- **Real databases**: MongoDB for User/Transaction services, Redis for Notification service
- **True API Gateway** that routes to separate services
- **Service-to-service communication**

## PHASE 1: Infrastructure Setup

### Task 1.1: Database Setup
- [ ] Install and configure MongoDB locally
- [ ] Install and configure Redis locally
- [ ] Create database schemas for users and transactions
- [ ] Add database connection utilities
- [ ] Add environment variables for database URLs

### Task 1.2: Service Separation
- [ ] Create separate service directories:
  ```
  services/
  ├── user-service/       (port 3002)
  ├── transaction-service/ (port 3003)
  ├── notification-service/ (port 3004)
  └── api-gateway/        (port 3001)
  ```

### Task 1.3: Service Dependencies
- [ ] Add MongoDB driver (mongoose) to user-service
- [ ] Add MongoDB driver (mongoose) to transaction-service  
- [ ] Add Redis client to notification-service
- [ ] Add HTTP client (axios) to api-gateway for service calls

## PHASE 2: Individual Microservices Implementation

### Task 2.1: User Service (Port 3002)
- [ ] Create standalone Express server
- [ ] Implement MongoDB connection
- [ ] Create User model/schema
- [ ] Implement endpoints:
  - `POST /users` - Create user
  - `GET /users/:id` - Get user details
  - `PUT /users/:id` - Update user
  - `DELETE /users/:id` - Delete user
- [ ] Add input validation
- [ ] Add error handling
- [ ] Add health check endpoint

### Task 2.2: Transaction Service (Port 3003)
- [ ] Create standalone Express server
- [ ] Implement MongoDB connection
- [ ] Create Transaction model/schema
- [ ] Implement endpoints:
  - `POST /transactions` - Create transaction
  - `GET /transactions/:userId` - Get user transactions
  - `GET /transactions/:id` - Get specific transaction
  - `GET /transactions` - Get all transactions (admin)
- [ ] Add business logic validation
- [ ] Add error handling
- [ ] Add health check endpoint

### Task 2.3: Notification Service (Port 3004)
- [ ] Create standalone Express server
- [ ] Implement Redis connection
- [ ] Create notification data structures
- [ ] Implement endpoints:
  - `POST /notifications` - Create notification
  - `GET /notifications/user/:userId` - Get user notifications
  - `PATCH /notifications/:id/status` - Update notification status
- [ ] Add notification types (email, SMS, push)
- [ ] Add error handling
- [ ] Add health check endpoint

### Task 2.4: API Gateway Refactor (Port 3001)
- [ ] Remove embedded service logic
- [ ] Implement service discovery/routing
- [ ] Add service-to-service HTTP calls
- [ ] Implement request forwarding to:
  - `/api/users/*` → User Service (3002)
  - `/api/transactions/*` → Transaction Service (3003)
  - `/api/notifications/*` → Notification Service (3004)
- [ ] Add service health checking
- [ ] Add authentication/authorization middleware
- [ ] Add request/response logging
- [ ] Add error aggregation

## PHASE 3: Service Communication & Integration

### Task 3.1: Inter-Service Communication
- [ ] Implement service registration/discovery
- [ ] Add retry mechanisms for service calls
- [ ] Add circuit breaker pattern for resilience
- [ ] Add timeout handling
- [ ] Add service health monitoring

### Task 3.2: Data Consistency
- [ ] Implement proper transaction handling
- [ ] Add data validation across services
- [ ] Handle cross-service data relationships
- [ ] Add data cleanup mechanisms

### Task 3.3: Event-Driven Architecture (Optional Enhancement)
- [ ] Add message queue (RabbitMQ/Apache Kafka)
- [ ] Implement async notifications
- [ ] Add event publishing/subscribing
- [ ] Handle eventual consistency

## PHASE 4: Configuration & Environment Updates

### Task 4.1: Environment Configuration
- [ ] Update .env.example with all service URLs
- [ ] Update config/environment.ts with service endpoints
- [ ] Add database connection strings
- [ ] Add service discovery configuration

### Task 4.2: Docker Setup (Recommended)
- [ ] Create Dockerfile for each service
- [ ] Create docker-compose.yml for full stack
- [ ] Add database containers (MongoDB, Redis)
- [ ] Add service networking
- [ ] Add volume mounts for development

### Task 4.3: Startup Scripts
- [ ] Update start-mock-system.sh to launch all services
- [ ] Add service dependency checks
- [ ] Add database initialization scripts
- [ ] Add graceful shutdown handling

## PHASE 5: Test Framework Updates

### Task 5.1: Playwright Configuration
- [ ] Update webServer config to start all 4 services
- [ ] Add health check verification before tests
- [ ] Update service URLs in test configuration
- [ ] Add database cleanup between tests

### Task 5.2: Test Data Management
- [ ] Update test data generators for real databases
- [ ] Add database seeding/cleanup utilities
- [ ] Update API helpers for new service endpoints
- [ ] Add integration test scenarios

### Task 5.3: API Tests Updates
- [ ] Verify tests work against real microservices
- [ ] Add cross-service integration tests
- [ ] Add database state verification
- [ ] Add service failure scenarios

## PHASE 6: Documentation Updates

### Task 6.1: Architecture Documentation
- [ ] Update README.md with true microservices architecture
- [ ] Add service interaction diagrams
- [ ] Document API endpoints for each service
- [ ] Add database schema documentation

### Task 6.2: Setup Instructions
- [ ] Add database installation instructions
- [ ] Update development setup guide
- [ ] Add troubleshooting section
- [ ] Add service monitoring instructions

## PHASE 7: Quality & Performance

### Task 7.1: Service Monitoring
- [ ] Add logging to each service
- [ ] Add metrics collection
- [ ] Add distributed tracing
- [ ] Add health monitoring dashboards

### Task 7.2: Performance Testing
- [ ] Add load testing for individual services
- [ ] Add end-to-end performance tests
- [ ] Add database performance monitoring
- [ ] Add service latency measurement

### Task 7.3: Security
- [ ] Add service-to-service authentication
- [ ] Add API rate limiting
- [ ] Add input sanitization
- [ ] Add security headers

## ESTIMATED EFFORT

### Quick Implementation (Satisfies Requirements)
- **Phase 1-2**: ~6-8 hours - Basic microservices with databases
- **Phase 4.1 & 5**: ~2-3 hours - Configuration and test updates
- **Phase 6.1**: ~1 hour - Documentation updates
- **Total**: ~9-12 hours

### Complete Implementation (Production-Ready)
- **All Phases**: ~20-25 hours

## DECISION POINTS

1. **Database Choice**: Use local MongoDB/Redis vs Docker containers
2. **Service Discovery**: Simple HTTP calls vs service registry
3. **Message Queue**: Add async communication or keep HTTP-only
4. **Docker**: Local services vs containerized services
5. **Authentication**: JWT tokens vs OAuth2 vs API keys

## NEXT STEPS

1. Confirm approach with stakeholder
2. Set up development databases
3. Start with Phase 1.2 (Service Separation)
4. Implement services one by one
5. Update tests incrementally
6. Validate against original requirements

## SUCCESS CRITERIA

✅ **Requirements Satisfied When:**
- 4 separate services running on different ports
- Real MongoDB databases for user/transaction data
- Real Redis for notification data  
- API Gateway routes requests to individual services
- All original test scenarios pass
- True microservices architecture demonstrated
