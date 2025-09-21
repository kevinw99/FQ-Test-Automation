const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3004;

// Middleware
app.use(cors());
app.use(express.json());

// Smart Mock Redis Database for Notifications
class MockRedisClient {
  constructor() {
    this.store = new Map();
    this.expires = new Map();
    this.lists = new Map();

    // Seed with initial data
    this.seed();
  }

  seed() {
    const initialNotifications = [
      {
        id: 'notif_001',
        userId: 'user_12345',
        type: 'email',
        title: 'Transaction Alert',
        message: 'Your payment of $87.42 has been processed',
        status: 'sent',
        timestamp: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'notif_002',
        userId: 'user_12345',
        type: 'sms',
        title: 'Deposit Confirmation',
        message: 'Salary deposit of $3,200.00 received',
        status: 'sent',
        timestamp: new Date(Date.now() - 172800000).toISOString()
      },
      {
        id: 'notif_003',
        userId: 'user_12345',
        type: 'push',
        title: 'Security Alert',
        message: 'Login from new device detected',
        status: 'pending',
        timestamp: new Date(Date.now() - 3600000).toISOString()
      }
    ];

    // Store notifications in Redis-like structure
    initialNotifications.forEach(notif => {
      this.set(`notification:${notif.id}`, JSON.stringify(notif));
      this.lpush(`user:${notif.userId}:notifications`, notif.id);
    });
  }

  async set(key, value, ttl = null) {
    await this.simulateLatency();
    this.store.set(key, value);

    if (ttl) {
      const expireTime = Date.now() + (ttl * 1000);
      this.expires.set(key, expireTime);
      setTimeout(() => {
        if (this.expires.get(key) === expireTime) {
          this.store.delete(key);
          this.expires.delete(key);
        }
      }, ttl * 1000);
    }
  }

  async get(key) {
    await this.simulateLatency();

    // Check if key has expired
    const expireTime = this.expires.get(key);
    if (expireTime && Date.now() > expireTime) {
      this.store.delete(key);
      this.expires.delete(key);
      return null;
    }

    return this.store.get(key) || null;
  }

  async lpush(listKey, value) {
    await this.simulateLatency();
    if (!this.lists.has(listKey)) {
      this.lists.set(listKey, []);
    }
    this.lists.get(listKey).unshift(value);
    return this.lists.get(listKey).length;
  }

  async lrange(listKey, start = 0, end = -1) {
    await this.simulateLatency();
    const list = this.lists.get(listKey) || [];

    if (end === -1) {
      return list.slice(start);
    }
    return list.slice(start, end + 1);
  }

  async del(key) {
    await this.simulateLatency();
    const deleted = this.store.has(key) ? 1 : 0;
    this.store.delete(key);
    this.expires.delete(key);
    return deleted;
  }

  async exists(key) {
    await this.simulateLatency();

    // Check if key has expired
    const expireTime = this.expires.get(key);
    if (expireTime && Date.now() > expireTime) {
      this.store.delete(key);
      this.expires.delete(key);
      return false;
    }

    return this.store.has(key);
  }

  // Simulate network latency like real Redis
  async simulateLatency() {
    const delay = Math.random() * 20 + 5; // 5-25ms (Redis is faster than MongoDB)
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

const redisClient = new MockRedisClient();

// Logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`🔔 [NOTIFICATION-SERVICE-${PORT}] ${timestamp} | ${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`   📦 Body: ${JSON.stringify(req.body, null, 2)}`);
  }
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'notification-service',
    status: 'healthy',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Create notification
app.post('/notifications', async (req, res) => {
  try {
    const notificationData = req.body;

    // Validate required fields
    if (!notificationData.userId || !notificationData.type || !notificationData.title || !notificationData.message) {
      return res.status(400).json({ error: 'Missing required fields: userId, type, title, message' });
    }

    // Validate notification type
    const validTypes = ['email', 'sms', 'push'];
    if (!validTypes.includes(notificationData.type)) {
      return res.status(400).json({ error: 'Invalid notification type. Must be email, sms, or push' });
    }

    const notificationId = `notif_${uuidv4().replace(/-/g, '')}`;

    const newNotification = {
      id: notificationId,
      ...notificationData,
      status: 'pending',
      timestamp: new Date().toISOString()
    };

    // Store in Redis-like structure
    await redisClient.set(`notification:${notificationId}`, JSON.stringify(newNotification));
    await redisClient.lpush(`user:${notificationData.userId}:notifications`, notificationId);

    console.log(`   ✅ Created notification: ${notificationId}`);
    res.status(201).json(newNotification);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get notifications by user ID
app.get('/notifications/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Get notification IDs for user
    const notificationIds = await redisClient.lrange(`user:${userId}:notifications`);

    // Fetch each notification
    const notifications = [];
    for (const notificationId of notificationIds) {
      const notificationData = await redisClient.get(`notification:${notificationId}`);
      if (notificationData) {
        notifications.push(JSON.parse(notificationData));
      }
    }

    console.log(`   ✅ Found ${notifications.length} notifications for user: ${userId}`);
    res.json(notifications);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get notification by ID
app.get('/notifications/:id', async (req, res) => {
  try {
    const notificationData = await redisClient.get(`notification:${req.params.id}`);
    if (!notificationData) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    const notification = JSON.parse(notificationData);
    console.log(`   ✅ Found notification: ${notification.id}`);
    res.json(notification);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update notification status
app.patch('/notifications/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'sent', 'failed', 'delivered', 'read'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be pending, sent, failed, delivered, or read' });
    }

    const notificationData = await redisClient.get(`notification:${req.params.id}`);
    if (!notificationData) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    const notification = JSON.parse(notificationData);
    notification.status = status;
    notification.updatedAt = new Date().toISOString();

    await redisClient.set(`notification:${req.params.id}`, JSON.stringify(notification));

    console.log(`   ✅ Updated notification status: ${notification.id} -> ${status}`);
    res.json(notification);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete notification
app.delete('/notifications/:id', async (req, res) => {
  try {
    const deleted = await redisClient.del(`notification:${req.params.id}`);
    if (deleted === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    console.log(`   ✅ Deleted notification: ${req.params.id}`);
    res.status(204).send();
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`🔔 Notification Service running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
