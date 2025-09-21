import { test, expect } from '../fixtures';
import { ApiHelper } from '../../utils/apiHelper';
import { TestDataGenerator } from '../../utils/testDataGenerator';

test.describe('Notification Service API Tests', () => {
  test('should create email notification successfully', async ({ apiHelper, testUser }) => {
    const notificationData = TestDataGenerator.generateNotification(testUser._id!, {
      type: 'email',
      title: 'Test Email Notification',
      message: 'This is a test email notification'
    });

    const createdNotification = await apiHelper.createNotification(notificationData, testUser.token);

    expect(createdNotification.id).toBeDefined();
    expect(createdNotification.userId).toBe(testUser._id);
    expect(createdNotification.type).toBe('email');
    expect(createdNotification.title).toBe(notificationData.title);
  });

  test('should create SMS notification successfully', async ({ apiHelper, testUser }) => {
    const notificationData = TestDataGenerator.generateNotification(testUser._id!, {
      type: 'sms',
      title: 'SMS Alert',
      message: 'Your transaction has been processed'
    });

    const createdNotification = await apiHelper.createNotification(notificationData, testUser.token);

    expect(createdNotification.id).toBeDefined();
    expect(createdNotification.type).toBe('sms');
    expect(createdNotification.status).toBe('pending');
  });

  test('should retrieve notifications by user ID', async ({ apiHelper, testUser }) => {
    // Create multiple notifications
    const emailNotification = TestDataGenerator.generateNotification(testUser._id!, {
      type: 'email',
      title: 'Email Test'
    });
    const smsNotification = TestDataGenerator.generateNotification(testUser._id!, {
      type: 'sms',
      title: 'SMS Test'
    });

    await apiHelper.createNotification(emailNotification, testUser.token);
    await apiHelper.createNotification(smsNotification, testUser.token);

    const notifications = await apiHelper.getNotificationsByUserId(testUser._id!, testUser.token);

    expect(notifications).toBeDefined();
    expect(notifications.length).toBeGreaterThanOrEqual(2);
    notifications.forEach(notification => {
      expect(notification.userId).toBe(testUser._id);
    });
  });

  test('should validate notification data', async ({ request, testUser }) => {
    const invalidNotification = {
      userId: testUser._id,
      type: 'invalid_type', // Invalid notification type
      title: '',
      message: ''
    };

    const response = await request.post('/api/notifications', {
      data: invalidNotification,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testUser.token}`
      }
    });

    expect(response.status()).toBe(400);
  });
});
