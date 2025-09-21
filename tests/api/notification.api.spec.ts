import { test, expect } from '@playwright/test';
import { ApiHelper } from '../../utils/apiHelper';
import { TestDataGenerator } from '../../utils/testDataGenerator';

test.describe('Notification Service API Tests', () => {
  let testUser: any;
  let userToken: string;

  test.beforeEach(async ({ request }) => {
    const apiHelper = new ApiHelper(request);

    // Create a test user for notification tests
    const userData = TestDataGenerator.generateUser();
    const response = await apiHelper.createUser(userData);
    testUser = response.user;
    userToken = response.token;
  });

  test('should create email notification successfully', async ({ request }) => {
    const apiHelper = new ApiHelper(request);
    const notificationData = TestDataGenerator.generateNotification(testUser.id, {
      type: 'email',
      title: 'Test Email Notification',
      message: 'This is a test email notification'
    });

    const createdNotification = await apiHelper.createNotification(notificationData, userToken);

    expect(createdNotification.id).toBeDefined();
    expect(createdNotification.userId).toBe(testUser.id);
    expect(createdNotification.type).toBe('email');
    expect(createdNotification.title).toBe('Test Email Notification');
    expect(createdNotification.status).toBe('pending');
  });

  test('should create SMS notification successfully', async ({ request }) => {
    const apiHelper = new ApiHelper(request);
    const notificationData = TestDataGenerator.generateNotification(testUser.id, {
      type: 'sms',
      title: 'SMS Alert',
      message: 'Your transaction has been processed'
    });

    const createdNotification = await apiHelper.createNotification(notificationData, userToken);

    expect(createdNotification.type).toBe('sms');
    expect(createdNotification.title).toBe('SMS Alert');
  });

  test('should retrieve notifications by user ID', async ({ request }) => {
    const apiHelper = new ApiHelper(request);
    // Create multiple notifications
    const emailNotification = TestDataGenerator.generateNotification(testUser.id, {
      type: 'email',
      title: 'Email Test'
    });
    const smsNotification = TestDataGenerator.generateNotification(testUser.id, {
      type: 'sms',
      title: 'SMS Test'
    });
    const pushNotification = TestDataGenerator.generateNotification(testUser.id, {
      type: 'push',
      title: 'Push Test'
    });

    await apiHelper.createNotification(emailNotification, userToken);
    await apiHelper.createNotification(smsNotification, userToken);
    await apiHelper.createNotification(pushNotification, userToken);

    const notifications = await apiHelper.getNotificationsByUserId(testUser.id, userToken);

    expect(notifications.length).toBeGreaterThanOrEqual(3);
    expect(notifications.every(n => n.userId === testUser.id)).toBe(true);

    const types = notifications.map(n => n.type);
    expect(types).toContain('email');
    expect(types).toContain('sms');
    expect(types).toContain('push');
  });

  test('should validate notification data', async ({ request }) => {
    const invalidNotification = {
      userId: testUser.id,
      type: 'invalid_type', // Invalid notification type
      title: '',
      message: ''
    };

    const response = await request.post('/api/notifications', {
      data: invalidNotification,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      }
    });

    expect(response.status()).toBe(400);
  });
});
