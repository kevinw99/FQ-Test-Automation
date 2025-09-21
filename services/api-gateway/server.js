const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Service endpoints
const SERVICES = {
  user: 'http://localhost:3002',
  transaction: 'http://localhost:3003',
  notification: 'http://localhost:3004'
};

// Service health status
let serviceHealth = {
  user: false,
  transaction: false,
  notification: false
};

// Comprehensive logging middleware for API requests
const logAPIRequests = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const ip = req.ip || req.connection.remoteAddress;
  const apiKey = req.headers['x-api-key'];
  const authToken = req.headers['authorization'];

  console.log(`🔗 [API-GATEWAY-${PORT}] ${timestamp} | ${method} ${url}`);
  console.log(`   👤 Client: ${ip} | ${userAgent.split(' ')[0]}`);

  if (apiKey) {
    console.log(`   🔑 API Key: ${apiKey.substring(0, 10)}...`);
  }

  if (authToken) {
    console.log(`   🎫 Auth Token: ${authToken.substring(0, 20)}...`);
  }

  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`   📦 Request Body: ${JSON.stringify(req.body, null, 2)}`);
  }

  if (Object.keys(req.query).length > 0) {
    console.log(`   📋 Query Params: ${JSON.stringify(req.query)}`);
  }

  if (req.params && Object.keys(req.params).length > 0) {
    console.log(`   🎯 Route Params: ${JSON.stringify(req.params)}`);
  }

  // Log response when it finishes
  const originalJson = res.json;
  const originalSend = res.send;

  res.json = function(data) {
    console.log(`   ✅ JSON Response: ${res.statusCode}`);
    if (data && typeof data === 'object') {
      console.log(`   📤 Response Data: ${JSON.stringify(data, null, 2)}`);
    }
    console.log(`   ⏱️  Duration: ${Date.now() - req.startTime}ms\n`);
    return originalJson.call(this, data);
  };

  res.send = function(data) {
    console.log(`   ✅ Response: ${res.statusCode} | ${data ? data.length : 0} bytes`);
    console.log(`   ⏱️  Duration: ${Date.now() - req.startTime}ms\n`);
    return originalSend.call(this, data);
  };

  req.startTime = Date.now();
  next();
};

app.use(logAPIRequests);

// API Key validation middleware
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || !apiKey.includes('api_key')) {
    return res.status(401).json({ error: 'Invalid or missing API key' });
  }
  next();
};

// JWT token validation middleware
const validateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization token' });
  }
  next();
};

// Service forwarding utility
async function forwardRequest(serviceUrl, req, res) {
  try {
    console.log(`   🔄 Forwarding to: ${serviceUrl}${req.path}`);

    const response = await axios({
      method: req.method,
      url: `${serviceUrl}${req.path}`,
      data: req.body,
      headers: {
        'content-type': req.headers['content-type']
      },
      params: req.query,
      timeout: 10000 // 10 second timeout
    });

    console.log(`   ✅ Service responded: ${response.status}`);
    res.status(response.status).json(response.data);
  } catch (error) {
    console.log(`   ❌ Service error: ${error.message}`);

    if (error.code === 'ECONNREFUSED') {
      res.status(503).json({
        error: 'Service unavailable',
        message: 'Unable to connect to backend service'
      });
    } else if (error.response) {
      // Service responded with an error
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({
        error: 'Internal server error',
        message: 'Gateway error'
      });
    }
  }
}

// Health check for individual services
async function checkServiceHealth(serviceName, serviceUrl) {
  try {
    const response = await axios.get(`${serviceUrl}/health`, { timeout: 5000 });
    serviceHealth[serviceName] = response.status === 200;
    return true;
  } catch (error) {
    serviceHealth[serviceName] = false;
    return false;
  }
}

// Periodic health checks
setInterval(async () => {
  await checkServiceHealth('user', SERVICES.user);
  await checkServiceHealth('transaction', SERVICES.transaction);
  await checkServiceHealth('notification', SERVICES.notification);
}, 30000); // Check every 30 seconds

// Authentication endpoints (handled by gateway)
app.post('/api/auth/login', validateApiKey, (req, res) => {
  const { email, password } = req.body;

  if (email === 'test@fintech.com' && password === 'TestPassword123!') {
    const user = {
      id: 'user_12345',
      email: 'test@fintech.com',
      firstName: 'John',
      lastName: 'Doe'
    };

    res.json({
      token: 'mock_jwt_token_' + Date.now(),
      user: user
    });
  } else {
    res.status(401).json({ error: 'Invalid email or password' });
  }
});

// API Gateway health check
app.get('/api/health', (req, res) => {
  res.json({
    service: 'api-gateway',
    status: 'healthy',
    port: PORT,
    services: {
      'user-service': serviceHealth.user ? 'healthy' : 'unhealthy',
      'transaction-service': serviceHealth.transaction ? 'healthy' : 'unhealthy',
      'notification-service': serviceHealth.notification ? 'healthy' : 'unhealthy'
    },
    timestamp: new Date().toISOString()
  });
});

// Route to User Service
app.use('/api/users', validateApiKey, async (req, res) => {
  const servicePath = req.originalUrl.replace('/api', '');

  try {
    console.log(`   🔄 Forwarding to: ${SERVICES.user}${servicePath}`);

    const response = await axios({
      method: req.method,
      url: `${SERVICES.user}${servicePath}`,
      data: req.body,
      headers: {
        'content-type': req.headers['content-type']
      },
      params: req.query,
      timeout: 10000
    });

    console.log(`   ✅ Service responded: ${response.status}`);
    res.status(response.status).json(response.data);
  } catch (error) {
    console.log(`   ❌ Service error: ${error.message}`);

    if (error.code === 'ECONNREFUSED') {
      res.status(503).json({
        error: 'Service unavailable',
        message: 'Unable to connect to user service'
      });
    } else if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({
        error: 'Internal server error',
        message: 'Gateway error'
      });
    }
  }
});

// Route to Transaction Service
app.use('/api/transactions', validateToken, async (req, res) => {
  const servicePath = req.originalUrl.replace('/api', '');

  try {
    console.log(`   🔄 Forwarding to: ${SERVICES.transaction}${servicePath}`);

    const response = await axios({
      method: req.method,
      url: `${SERVICES.transaction}${servicePath}`,
      data: req.body,
      headers: {
        'content-type': req.headers['content-type']
      },
      params: req.query,
      timeout: 10000
    });

    console.log(`   ✅ Service responded: ${response.status}`);
    res.status(response.status).json(response.data);
  } catch (error) {
    console.log(`   ❌ Service error: ${error.message}`);

    if (error.code === 'ECONNREFUSED') {
      res.status(503).json({
        error: 'Service unavailable',
        message: 'Unable to connect to transaction service'
      });
    } else if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({
        error: 'Internal server error',
        message: 'Gateway error'
      });
    }
  }
});

// Route to Notification Service
app.use('/api/notifications', validateToken, async (req, res) => {
  const servicePath = req.originalUrl.replace('/api', '');

  try {
    console.log(`   🔄 Forwarding to: ${SERVICES.notification}${servicePath}`);

    const response = await axios({
      method: req.method,
      url: `${SERVICES.notification}${servicePath}`,
      data: req.body,
      headers: {
        'content-type': req.headers['content-type']
      },
      params: req.query,
      timeout: 10000
    });

    console.log(`   ✅ Service responded: ${response.status}`);
    res.status(response.status).json(response.data);
  } catch (error) {
    console.log(`   ❌ Service error: ${error.message}`);

    if (error.code === 'ECONNREFUSED') {
      res.status(503).json({
        error: 'Service unavailable',
        message: 'Unable to connect to notification service'
      });
    } else if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({
        error: 'Internal server error',
        message: 'Gateway error'
      });
    }
  }
});

// Catch-all for unmatched routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `No route found for ${req.method} ${req.originalUrl}`,
    availableRoutes: [
      'POST /api/auth/login',
      'GET /api/health',
      '/api/users/*',
      '/api/transactions/*',
      '/api/notifications/*'
    ]
  });
});

// Start server and perform initial health checks
app.listen(PORT, async () => {
  console.log(`🔗 API Gateway running on http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📊 Request logging: ENABLED`);

  // Initial health checks
  console.log('\n🏥 Checking service health...');
  await checkServiceHealth('user', SERVICES.user);
  await checkServiceHealth('transaction', SERVICES.transaction);
  await checkServiceHealth('notification', SERVICES.notification);

  console.log('📊 Service Status:');
  Object.entries(serviceHealth).forEach(([service, healthy]) => {
    console.log(`   ${healthy ? '✅' : '❌'} ${service}-service: ${healthy ? 'healthy' : 'unhealthy'}`);
  });
});
