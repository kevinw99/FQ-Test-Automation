const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3003;

// Middleware
app.use(cors());
app.use(express.json());

// Smart Mock MongoDB Database for Transactions
class MockTransactionDatabase {
  constructor() {
    this.transactions = new Map();
    this.autoIncrement = 1;

    // Seed with initial data
    this.seed();
  }

  seed() {
    const initialTransactions = [
      {
        _id: 'txn_001',
        userId: 'user_12345',
        amount: 87.42,
        currency: 'USD',
        type: 'debit',
        description: 'Grocery Store Purchase',
        merchantName: 'Whole Foods Market',
        category: 'groceries',
        status: 'completed',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        _id: 'txn_002',
        userId: 'user_12345',
        amount: 3200.00,
        currency: 'USD',
        type: 'credit',
        description: 'Salary Deposit',
        merchantName: 'TechCorp Inc',
        category: 'salary',
        status: 'completed',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 172800000).toISOString()
      },
      {
        _id: 'txn_003',
        userId: 'user_12345',
        amount: 250.00,
        currency: 'USD',
        type: 'debit',
        description: 'Online Transfer',
        merchantName: 'Savings Account',
        category: 'transfer',
        status: 'completed',
        createdAt: new Date(Date.now() - 259200000).toISOString(),
        updatedAt: new Date(Date.now() - 259200000).toISOString()
      }
    ];

    initialTransactions.forEach(txn => {
      this.transactions.set(txn._id, txn);
    });
  }

  async create(transactionData) {
    await this.simulateLatency();

    const transactionId = `txn_${uuidv4().replace(/-/g, '')}`;

    const transaction = {
      _id: transactionId,
      ...transactionData,
      status: transactionData.status || 'pending',
      currency: transactionData.currency || 'USD',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.transactions.set(transactionId, transaction);
    return transaction;
  }

  async findById(id) {
    await this.simulateLatency();
    return this.transactions.get(id) || null;
  }

  async findByUserId(userId) {
    await this.simulateLatency();
    const userTransactions = [];
    for (const transaction of this.transactions.values()) {
      if (transaction.userId === userId) {
        userTransactions.push(transaction);
      }
    }
    // Sort by creation date (newest first)
    return userTransactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async findAll() {
    await this.simulateLatency();
    return Array.from(this.transactions.values())
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async updateById(id, updateData) {
    await this.simulateLatency();
    const transaction = this.transactions.get(id);
    if (!transaction) return null;

    const updatedTransaction = {
      ...transaction,
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }

  // Simulate network latency like real MongoDB
  async simulateLatency() {
    const delay = Math.random() * 50 + 10; // 10-60ms
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

const transactionDB = new MockTransactionDatabase();

// Logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`💳 [TRANSACTION-SERVICE-${PORT}] ${timestamp} | ${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`   📦 Body: ${JSON.stringify(req.body, null, 2)}`);
  }
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'transaction-service',
    status: 'healthy',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Create transaction
app.post('/transactions', async (req, res) => {
  try {
    const transactionData = req.body;

    // Validate required fields
    if (!transactionData.userId || !transactionData.amount || !transactionData.type) {
      return res.status(400).json({ error: 'Missing required fields: userId, amount, type' });
    }

    // Validate amount (must be positive)
    if (transactionData.amount <= 0) {
      return res.status(400).json({ error: 'Amount must be positive' });
    }

    // Validate transaction type
    const validTypes = ['credit', 'debit'];
    if (!validTypes.includes(transactionData.type)) {
      return res.status(400).json({ error: 'Invalid transaction type. Must be credit or debit' });
    }

    // Validate amount limits (business rule)
    if (transactionData.amount > 50000) {
      return res.status(400).json({ error: 'Transaction amount exceeds maximum limit of $50,000' });
    }

    const newTransaction = await transactionDB.create(transactionData);

    console.log(`   ✅ Created transaction: ${newTransaction._id}`);
    res.status(201).json(newTransaction);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get transactions by user ID
app.get('/transactions/user/:userId', async (req, res) => {
  try {
    const userTransactions = await transactionDB.findByUserId(req.params.userId);

    console.log(`   ✅ Found ${userTransactions.length} transactions for user: ${req.params.userId}`);
    res.json(userTransactions);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get transaction by ID
app.get('/transactions/:id', async (req, res) => {
  try {
    const transaction = await transactionDB.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    console.log(`   ✅ Found transaction: ${transaction._id}`);
    res.json(transaction);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all transactions (admin endpoint)
app.get('/transactions', async (req, res) => {
  try {
    const allTransactions = await transactionDB.findAll();

    console.log(`   ✅ Retrieved ${allTransactions.length} transactions`);
    res.json(allTransactions);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update transaction status
app.patch('/transactions/:id', async (req, res) => {
  try {
    const updatedTransaction = await transactionDB.updateById(req.params.id, req.body);
    if (!updatedTransaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    console.log(`   ✅ Updated transaction: ${updatedTransaction._id}`);
    res.json(updatedTransaction);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`💳 Transaction Service running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
