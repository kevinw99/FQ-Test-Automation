const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// In-memory notification store
let notifications = [
    {
        id: 'notif_001',
        userId: '12345',
        type: 'email',
        title: 'Transaction Alert',
        message: 'Your payment of $87.42 has been processed',
        status: 'sent',
        timestamp: new Date(Date.now() - 86400000).toISOString()
    },
    {
        id: 'notif_002',
        userId: '12345',
        type: 'sms',
        title: 'Deposit Confirmation',
        message: 'Salary deposit of $3,200.00 received',
        status: 'sent',
        timestamp: new Date(Date.now() - 172800000).toISOString()
    },
    {
        id: 'notif_003',
        userId: '12345',
        type: 'push',
        title: 'Security Alert',
        message: 'Login from new device detected',
        status: 'pending',
        timestamp: new Date(Date.now() - 3600000).toISOString()
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

// Create notification
router.post('/', validateToken, (req, res) => {
    try {
        const notificationData = req.body;

        // Validate required fields
        if (!notificationData.userId || !notificationData.type || !notificationData.title || !notificationData.message) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Validate notification type
        const validTypes = ['email', 'sms', 'push'];
        if (!validTypes.includes(notificationData.type)) {
            return res.status(400).json({ error: 'Invalid notification type' });
        }

        const notificationId = uuidv4();

        const newNotification = {
            id: notificationId,
            ...notificationData,
            status: 'pending',
            timestamp: new Date().toISOString()
        };

        notifications.push(newNotification);
        res.status(201).json(newNotification);
    } catch (error) {
        res.status(400).json({ error: 'Invalid notification data' });
    }
});

// Get notifications by user ID
router.get('/user/:userId', validateToken, (req, res) => {
    const userNotifications = notifications.filter(n => n.userId === req.params.userId);
    res.json(userNotifications);
});

// Get notification by ID
router.get('/:id', validateToken, (req, res) => {
    const notification = notifications.find(n => n.id === req.params.id);
    if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
    }
    res.json(notification);
});

// Update notification status
router.patch('/:id/status', validateToken, (req, res) => {
    const notification = notifications.find(n => n.id === req.params.id);
    if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
    }

    const { status } = req.body;
    const validStatuses = ['pending', 'sent', 'failed'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    notification.status = status;
    res.json(notification);
});

module.exports = router;
