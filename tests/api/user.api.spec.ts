import { test, expect } from '../fixtures';
import { ApiHelper } from '../../utils/apiHelper';
import { TestDataGenerator } from '../../utils/testDataGenerator';

test.describe('User Service API Tests', () => {
  test('should create a new user successfully', async ({ request }) => {
    const apiHelper = new ApiHelper(request);
    const userData = TestDataGenerator.generateUser();

    const response = await apiHelper.createUser(userData);

    expect(response.user).toBeDefined();
    expect(response.user.email).toBe(userData.email);
    expect(response.user.firstName).toBe(userData.firstName);
    expect(response.user.lastName).toBe(userData.lastName);
    expect(response.token).toBeDefined();
  });

  test('should retrieve user by ID', async ({ apiHelper, testUser }) => {
    const retrievedUser = await apiHelper.getUserById(testUser._id!, testUser.token);

    expect(retrievedUser._id).toBe(testUser._id);
    expect(retrievedUser.email).toBe(testUser.email);
  });

  test('should update user information', async ({ apiHelper, testUser }) => {
    const updateData = {
      firstName: 'UpdatedFirstName',
      lastName: 'UpdatedLastName'
    };

    const updatedUser = await apiHelper.updateUser(testUser._id!, updateData, testUser.token);

    expect(updatedUser.firstName).toBe(updateData.firstName);
    expect(updatedUser.lastName).toBe(updateData.lastName);
    expect(updatedUser.email).toBe(testUser.email); // Should remain unchanged
  });

  test('should delete user successfully', async ({ request }) => {
    const apiHelper = new ApiHelper(request);
    // Create a user first
    const userData = TestDataGenerator.generateUser();
    const createResponse = await apiHelper.createUser(userData);

    await apiHelper.deleteUser(createResponse.user._id!, createResponse.token);

    // Verify user is deleted by trying to retrieve it (should fail)
    await expect(async () => {
      await apiHelper.getUserById(createResponse.user._id!, createResponse.token);
    }).rejects.toThrow();
  });

  test('should handle invalid user creation data', async ({ request }) => {
    const invalidUserData = {
      email: 'invalid-email', // Invalid email format
      password: '123', // Too short password
      firstName: '',
      lastName: ''
    };

    const response = await request.post('/api/users', {
      data: invalidUserData,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'dev_api_key_123'
      }
    });

    expect(response.status()).toBe(400);
  });
});
