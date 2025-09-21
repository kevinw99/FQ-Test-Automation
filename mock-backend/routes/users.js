const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// In-memory user store
let users = [
    {
        id: '12345',
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
        }
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

// Create user
router.post('/', (req, res) => {
    try {
        const userData = req.body;

        // Validate required fields and data format
        if (!userData.email || !userData.password || !userData.firstName || !userData.lastName) {
            return res.status(400).json({ error: 'Missing required fields' });
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

        // Validate name fields are not empty
        if (!userData.firstName.trim() || !userData.lastName.trim()) {
            return res.status(400).json({ error: 'First name and last name cannot be empty' });
        }

        const userId = uuidv4();

        const newUser = {
            id: userId,
            ...userData,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);

        res.status(201).json({
            user: newUser,
            token: 'mock_jwt_token_' + Date.now()
        });
    } catch (error) {
        res.status(400).json({ error: 'Invalid user data' });
    }
});

// Get user by ID
router.get('/:id', validateToken, (req, res) => {
    const user = users.find(u => u.id === req.params.id);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
});

// Update user
router.put('/:id', validateToken, (req, res) => {
    const userIndex = users.findIndex(u => u.id === req.params.id);
    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
    }

    users[userIndex] = { ...users[userIndex], ...req.body };
    res.json(users[userIndex]);
});

// Delete user
router.delete('/:id', validateToken, (req, res) => {
    const userIndex = users.findIndex(u => u.id === req.params.id);
    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
    }

    users.splice(userIndex, 1);
    res.status(204).send();
});

module.exports = router;
