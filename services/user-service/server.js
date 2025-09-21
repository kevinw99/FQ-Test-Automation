const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Smart Mock MongoDB Database
class MockUserDatabase {
  constructor() {
    this.users = new Map();
    this.autoIncrement = 1;

    // Seed with initial data
    this.seed();
  }

  seed() {
    const initialUser = {
      _id: 'user_12345',
      email: 'test@fintech.com',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+1-555-0123',
      dateOfBirth: '1990-01-15',
      address: {
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        country: 'US'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.users.set(initialUser._id, initialUser);
  }

  async create(userData) {
    // Simulate MongoDB operations with validation
    await this.simulateLatency();

    // Generate MongoDB-like ID
    const userId = `user_${uuidv4().replace(/-/g, '')}`;

    const user = {
      _id: userId,
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.users.set(userId, user);
    return user;
  }

  async findById(id) {
    await this.simulateLatency();
    return this.users.get(id) || null;
  }

  async updateById(id, updateData) {
    await this.simulateLatency();
    const user = this.users.get(id);
    if (!user) return null;

    const updatedUser = {
      ...user,
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteById(id) {
    await this.simulateLatency();
    return this.users.delete(id);
  }

  async findByEmail(email) {
    await this.simulateLatency();
    for (const user of this.users.values()) {
      if (user.email === email) return user;
    }
    return null;
  }

  // Simulate network latency like real MongoDB
  async simulateLatency() {
    const delay = Math.random() * 50 + 10; // 10-60ms
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

const userDB = new MockUserDatabase();

// Logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`👤 [USER-SERVICE-${PORT}] ${timestamp} | ${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`   📦 Body: ${JSON.stringify(req.body, null, 2)}`);
  }
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'user-service',
    status: 'healthy',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Create user
app.post('/users', async (req, res) => {
  try {
    const userData = req.body;

    // Validate required fields
    if (!userData.email || !userData.password || !userData.firstName || !userData.lastName) {
      return res.status(400).json({ error: 'Missing required fields: email, password, firstName, lastName' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password length
    if (userData.password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existingUser = await userDB.findByEmail(userData.email);
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    const newUser = await userDB.create(userData);

    // Don't return password in response
    const { password, ...userResponse } = newUser;

    console.log(`   ✅ Created user: ${newUser._id}`);
    res.status(201).json(userResponse);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user by ID
app.get('/users/:id', async (req, res) => {
  try {
    const user = await userDB.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Don't return password
    const { password, ...userResponse } = user;

    console.log(`   ✅ Found user: ${user._id}`);
    res.json(userResponse);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user
app.put('/users/:id', async (req, res) => {
  try {
    const updatedUser = await userDB.updateById(req.params.id, req.body);
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Don't return password
    const { password, ...userResponse } = updatedUser;

    console.log(`   ✅ Updated user: ${updatedUser._id}`);
    res.json(userResponse);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user
app.delete('/users/:id', async (req, res) => {
  try {
    const deleted = await userDB.deleteById(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`   ✅ Deleted user: ${req.params.id}`);
    res.status(204).send();
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`👤 User Service running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
