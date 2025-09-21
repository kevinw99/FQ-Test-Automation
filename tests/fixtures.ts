import { test as base } from '@playwright/test';
import { ApiHelper } from '../utils/apiHelper';
import { TestDataGenerator, UserData } from '../utils/testDataGenerator';

// Extend the base test to include fixtures
export const test = base.extend<{
  apiHelper: ApiHelper;
  testUser: { user: UserData; token: string };
}>({
  apiHelper: async ({ request }, use) => {
    const apiHelper = new ApiHelper(request);
    await use(apiHelper);
  },

  testUser: async ({ apiHelper }, use) => {
    // Create a test user for each test
    const userData = TestDataGenerator.generateUser();
    const response = await apiHelper.createUser(userData);

    await use(response);

    // Cleanup: Delete the test user after the test
    try {
      await apiHelper.deleteUser(response.user.id!, response.token);
    } catch (error) {
      console.warn('Failed to cleanup test user:', error);
    }
  }
});

export { expect } from '@playwright/test';
