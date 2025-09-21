import { test, expect } from '../fixtures';
import { ApiHelper } from '../../utils/apiHelper';
import { TestDataGenerator } from '../../utils/testDataGenerator';

test.describe('Transaction Service API Tests', () => {
  test('should create a new transaction successfully', async ({ apiHelper, testUser }) => {
    const transactionData = TestDataGenerator.generateTransaction(testUser._id!, {
      amount: 100.50,
      type: 'credit',
      description: 'Test payment'
    });

    const createdTransaction = await apiHelper.createTransaction(transactionData, testUser.token);

    expect(createdTransaction._id).toBeDefined();
    expect(createdTransaction.userId).toBe(testUser._id);
    expect(createdTransaction.amount).toBe(transactionData.amount);
    expect(createdTransaction.type).toBe(transactionData.type);
  });

  test('should retrieve transactions by user ID', async ({ apiHelper, testUser }) => {
    // Create multiple transactions for the user
    const transaction1 = TestDataGenerator.generateTransaction(testUser._id!, {
      amount: 50.00,
      type: 'debit'
    });
    const transaction2 = TestDataGenerator.generateTransaction(testUser._id!, {
      amount: 75.25,
      type: 'credit'
    });

    await apiHelper.createTransaction(transaction1, testUser.token);
    await apiHelper.createTransaction(transaction2, testUser.token);

    const transactions = await apiHelper.getTransactionsByUserId(testUser._id!, testUser.token);

    expect(transactions).toBeDefined();
    expect(transactions.length).toBeGreaterThanOrEqual(2);
    transactions.forEach(transaction => {
      expect(transaction.userId).toBe(testUser._id);
    });
  });

  test('should retrieve specific transaction by ID', async ({ apiHelper, testUser }) => {
    const transactionData = TestDataGenerator.generateTransaction(testUser._id!, {
      amount: 200.00,
      type: 'credit',
      description: 'Specific transaction test'
    });

    const createdTransaction = await apiHelper.createTransaction(transactionData, testUser.token);
    const retrievedTransaction = await apiHelper.getTransactionById(createdTransaction._id!, testUser.token);

    expect(retrievedTransaction._id).toBe(createdTransaction._id);
    expect(retrievedTransaction.amount).toBe(transactionData.amount);
    expect(retrievedTransaction.description).toBe(transactionData.description);
  });

  test('should validate transaction amount limits', async ({ request, testUser }) => {
    const invalidTransaction = TestDataGenerator.generateTransaction(testUser._id!, {
      amount: -100, // Negative amount
      type: 'credit'
    });

    const response = await request.post('/api/transactions', {
      data: invalidTransaction,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testUser.token}`
      }
    });

    expect(response.status()).toBe(400);
  });

  test('should handle large transaction amounts', async ({ apiHelper, testUser }) => {
    const largeTransaction = TestDataGenerator.generateTransaction(testUser._id!, {
      amount: 9999.99,
      type: 'credit',
      description: 'Large amount transaction'
    });

    const createdTransaction = await apiHelper.createTransaction(largeTransaction, testUser.token);

    expect(createdTransaction._id).toBeDefined();
    expect(createdTransaction.amount).toBe(largeTransaction.amount);
  });
});
