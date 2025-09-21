const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Logging middleware for UI requests
const logUIRequests = (req, res, next) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.url;
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const ip = req.ip || req.connection.remoteAddress;

    console.log(`🌐 [UI-${PORT}] ${timestamp} | ${method} ${url}`);
    console.log(`   👤 Client: ${ip} | ${userAgent.split(' ')[0]}`);

    if (Object.keys(req.query).length > 0) {
        console.log(`   📋 Query: ${JSON.stringify(req.query)}`);
    }

    // Log response when it finishes
    const originalSend = res.send;
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
app.use(express.static(path.join(__dirname, '../mock-ui')));

// Add logging middleware before other routes
app.use(logUIRequests);

// Serve the UI files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../mock-ui/login.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../mock-ui/login.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../mock-ui/dashboard.html'));
});

app.get('/transactions', (req, res) => {
    res.sendFile(path.join(__dirname, '../mock-ui/transactions.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
            ui: 'running',
            backend: 'running'
        }
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Mock UI Server running on http://localhost:${PORT}`);
    console.log(`📱 Login page: http://localhost:${PORT}/login`);
    console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
    console.log(`💳 Transactions: http://localhost:${PORT}/transactions`);
});
