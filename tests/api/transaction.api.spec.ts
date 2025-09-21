import { test, expect } from '@playwright/test';
import { ApiHelper } from '../../utils/apiHelper';
import { TestDataGenerator } from '../../utils/testDataGenerator';

test.describe('Transaction Service API Tests', () => {
  let testUser: any;
  let userToken: string;

  test.beforeEach(async ({ request }) => {
    const apiHelper = new ApiHelper(request);

    // Create a test user for transaction tests
    const userData = TestDataGenerator.generateUser();
    const response = await apiHelper.createUser(userData);
    testUser = response.user;
    userToken = response.token;
  });

  test('should create a new transaction successfully', async ({ request }) => {
    const apiHelper = new ApiHelper(request);
    const transactionData = TestDataGenerator.generateTransaction(testUser.id, {
      amount: 100.50,
      type: 'credit',
      description: 'Test payment'
    });

    const createdTransaction = await apiHelper.createTransaction(transactionData, userToken);

    expect(createdTransaction.id).toBeDefined();
    expect(createdTransaction.userId).toBe(testUser.id);
    expect(createdTransaction.amount).toBe(100.50);
    expect(createdTransaction.type).toBe('credit');
    expect(createdTransaction.description).toBe('Test payment');
  });

  test('should retrieve transactions by user ID', async ({ request }) => {
    const apiHelper = new ApiHelper(request);
    // Create multiple transactions for the user
    const transaction1 = TestDataGenerator.generateTransaction(testUser.id, {
      amount: 50.00,
      type: 'debit'
    });
    const transaction2 = TestDataGenerator.generateTransaction(testUser.id, {
      amount: 75.25,
      type: 'credit'
    });

    await apiHelper.createTransaction(transaction1, userToken);
    await apiHelper.createTransaction(transaction2, userToken);

    const transactions = await apiHelper.getTransactionsByUserId(testUser.id, userToken);

    expect(transactions.length).toBeGreaterThanOrEqual(2);
    expect(transactions.every(t => t.userId === testUser.id)).toBe(true);
  });

  test('should retrieve specific transaction by ID', async ({ request }) => {
    const apiHelper = new ApiHelper(request);
    const transactionData = TestDataGenerator.generateTransaction(testUser.id, {
      amount: 200.00,
      type: 'credit',
      description: 'Specific transaction test'
    });

    const createdTransaction = await apiHelper.createTransaction(transactionData, userToken);
    const retrievedTransaction = await apiHelper.getTransactionById(createdTransaction.id!, userToken);

    expect(retrievedTransaction.id).toBe(createdTransaction.id);
    expect(retrievedTransaction.amount).toBe(200.00);
    expect(retrievedTransaction.description).toBe('Specific transaction test');
  });

  test('should validate transaction amount limits', async ({ request }) => {
    const invalidTransaction = TestDataGenerator.generateTransaction(testUser.id, {
      amount: -100, // Negative amount
      type: 'credit'
    });

    const response = await request.post('/api/transactions', {
      data: invalidTransaction,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      }
    });

    expect(response.status()).toBe(400);
  });

  test('should handle large transaction amounts', async ({ request }) => {
    const apiHelper = new ApiHelper(request);
    const largeTransaction = TestDataGenerator.generateTransaction(testUser.id, {
      amount: 9999.99,
      type: 'credit',
      description: 'Large amount transaction'
    });

    const createdTransaction = await apiHelper.createTransaction(largeTransaction, userToken);

    expect(createdTransaction.amount).toBe(9999.99);
    expect(createdTransaction.type).toBe('credit');
  });
});
