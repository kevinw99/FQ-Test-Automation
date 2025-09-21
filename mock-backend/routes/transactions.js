const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// In-memory transaction store
let transactions = [
    {
        id: 'txn_001',
        userId: '12345',
        amount: 87.42,
        currency: 'USD',
        type: 'debit',
        description: 'Grocery Store Purchase',
        merchantName: 'Whole Foods Market',
        category: 'groceries',
        timestamp: new Date(Date.now() - 86400000).toISOString() // 1 day ago
    },
    {
        id: 'txn_002',
        userId: '12345',
        amount: 3200.00,
        currency: 'USD',
        type: 'credit',
        description: 'Salary Deposit',
        merchantName: 'TechCorp Inc',
        category: 'salary',
        timestamp: new Date(Date.now() - 172800000).toISOString() // 2 days ago
    },
    {
        id: 'txn_003',
        userId: '12345',
        amount: 250.00,
        currency: 'USD',
        type: 'debit',
        description: 'Online Transfer',
        merchantName: 'Savings Account',
        category: 'transfer',
        timestamp: new Date(Date.now() - 259200000).toISOString() // 3 days ago
    }
];

// Middleware to validate JWT token
const validateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid authorization token' });
    }
    next();
};

// Create transaction
router.post('/', validateToken, (req, res) => {
    try {
        const transactionData = req.body;

        // Validate required fields
        if (!transactionData.userId || !transactionData.amount || !transactionData.type) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Validate amount
        if (transactionData.amount <= 0) {
            return res.status(400).json({ error: 'Amount must be positive' });
        }

        const transactionId = uuidv4();

        const newTransaction = {
            id: transactionId,
            ...transactionData,
            timestamp: new Date().toISOString()
        };

        transactions.push(newTransaction);
        res.status(201).json(newTransaction);
    } catch (error) {
        res.status(400).json({ error: 'Invalid transaction data' });
    }
});

// Get transactions by user ID
router.get('/user/:userId', validateToken, (req, res) => {
    const userTransactions = transactions.filter(t => t.userId === req.params.userId);
    res.json(userTransactions);
});

// Get transaction by ID
router.get('/:id', validateToken, (req, res) => {
    const transaction = transactions.find(t => t.id === req.params.id);
    if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json(transaction);
});

// Get all transactions (for admin/testing)
router.get('/', validateToken, (req, res) => {
    res.json(transactions);
});

module.exports = router;
