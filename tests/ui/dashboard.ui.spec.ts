import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { DashboardPage } from '../../pages/DashboardPage';
import { TransactionPage } from '../../pages/TransactionPage';
import { getEnvironment } from '../../config/environment';

test.describe('Dashboard UI Tests', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let transactionPage: TransactionPage;
  const config = getEnvironment();

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    transactionPage = new TransactionPage(page);

    // Login before each test
    await loginPage.goto();
    await loginPage.login(config.testUser.email, config.testUser.password);
    await expect(dashboardPage.userNameDisplay).toBeVisible();
  });

  test('should display dashboard elements correctly', async () => {
    await expect(dashboardPage.userNameDisplay).toBeVisible();
    await expect(dashboardPage.accountBalance).toBeVisible();
    await expect(dashboardPage.recentTransactions).toBeVisible();
    await expect(dashboardPage.transferButton).toBeVisible();
    await expect(dashboardPage.notificationIcon).toBeVisible();
  });

  test('should show correct user information', async () => {
    const userName = await dashboardPage.getUserName();
    expect(userName).toBeTruthy();
    expect(userName?.length).toBeGreaterThan(0);
  });

  test('should display account balance', async () => {
    const balance = await dashboardPage.getAccountBalance();
    expect(balance).toBeGreaterThanOrEqual(0);
    expect(typeof balance).toBe('number');
  });

  test('should show recent transactions', async () => {
    const transactionCount = await dashboardPage.getRecentTransactionCount();
    expect(transactionCount).toBeGreaterThanOrEqual(0);
  });

  test('should navigate to transfer page', async ({ page }) => {
    await dashboardPage.clickTransferButton();
    await expect(page).toHaveURL(/.*transactions.*/);
  });

  test('should display notification count', async () => {
    const notificationCount = await dashboardPage.getNotificationCount();
    expect(notificationCount).toBeGreaterThanOrEqual(0);
  });

  test('should logout successfully', async ({ page }) => {
    await dashboardPage.logout();
    await expect(page).toHaveURL(/.*login.*/);
  });
});
