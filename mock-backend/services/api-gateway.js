const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3001;

// Comprehensive logging middleware for API requests
const logAPIRequests = (req, res, next) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.url;
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const ip = req.ip || req.connection.remoteAddress;
    const apiKey = req.headers['x-api-key'];
    const authToken = req.headers['authorization'];

    console.log(`🔗 [API-${PORT}] ${timestamp} | ${method} ${url}`);
    console.log(`   👤 Client: ${ip} | ${userAgent.split(' ')[0]}`);

    if (apiKey) {
        console.log(`   🔑 API Key: ${apiKey.substring(0, 10)}...`);
    }

    if (authToken) {
        console.log(`   🎫 Auth Token: ${authToken.substring(0, 20)}...`);
    }

    if (req.body && Object.keys(req.body).length > 0) {
        const bodyLog = JSON.stringify(req.body, null, 2);
        console.log(`   📦 Request Body: ${bodyLog}`);
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

// Middleware
app.use(cors());
app.use(express.json());

// Add comprehensive logging middleware
app.use(logAPIRequests);

// In-memory data store (simulating database)
let users = [];
let transactions = [];
let notifications = [];

// API Key validation middleware
const validateApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || !apiKey.includes('api_key')) {
        return res.status(401).json({ error: 'Invalid or missing API key' });
    }
    next();
};

// Authentication endpoints
app.post('/api/auth/login', validateApiKey, (req, res) => {
    const { email, password } = req.body;

    if (email === 'test@fintech.com' && password === 'TestPassword123!') {
        const user = {
            id: '12345',
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

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        services: {
            'api-gateway': 'running',
            'user-service': 'running',
            'transaction-service': 'running',
            'notification-service': 'running'
        },
        timestamp: new Date().toISOString()
    });
});

// Proxy endpoints to individual services
app.use('/api/users', require('../routes/users'));
app.use('/api/transactions', require('../routes/transactions'));
app.use('/api/notifications', require('../routes/notifications'));

app.listen(PORT, () => {
    console.log(`🔗 API Gateway running on http://localhost:${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📊 Request logging: ENABLED`);
});
