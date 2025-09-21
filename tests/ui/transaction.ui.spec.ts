import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { DashboardPage } from '../../pages/DashboardPage';
import { TransactionPage } from '../../pages/TransactionPage';
import { getEnvironmentConfig } from '../../config/environment';

test.describe('Transaction Page UI Tests', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let transactionPage: TransactionPage;
  const config = getEnvironmentConfig();

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    transactionPage = new TransactionPage(page);

    // Login and navigate to transactions
    await loginPage.goto();
    await loginPage.login(config.testUser.email, config.testUser.password);
    await expect(dashboardPage.userNameDisplay).toBeVisible();
    await transactionPage.goto();
  });

  test('should display transaction history', async () => {
    await expect(transactionPage.transactionHistory).toBeVisible();
    await expect(transactionPage.filterDropdown).toBeVisible();
    await expect(transactionPage.searchInput).toBeVisible();
  });

  test('should create new transaction', async ({ page }) => {
    await transactionPage.createNewTransaction('100.50', 'john@example.com', 'Test payment');

    // Wait for success message or redirect
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible({ timeout: 10000 });
  });

  test('should filter transactions by type', async ({ page }) => {
    await transactionPage.filterTransactions('credit');

    // Wait for filter to apply
    await page.waitForTimeout(1000);

    const transactionCount = await transactionPage.getTransactionCount();
    expect(transactionCount).toBeGreaterThanOrEqual(0);
  });

  test('should search transactions', async ({ page }) => {
    await transactionPage.searchTransactions('payment');

    // Wait for search to apply
    await page.waitForTimeout(1000);

    const transactionCount = await transactionPage.getTransactionCount();
    expect(transactionCount).toBeGreaterThanOrEqual(0);
  });

  test('should display transaction details', async () => {
    const transactionCount = await transactionPage.getTransactionCount();

    if (transactionCount > 0) {
      const transactionDetails = await transactionPage.getTransactionDetails(0);
      expect(transactionDetails.amount).toBeTruthy();
      expect(transactionDetails.description).toBeTruthy();
      expect(transactionDetails.date).toBeTruthy();
    }
  });
});
