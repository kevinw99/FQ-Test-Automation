import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { DashboardPage } from '../../pages/DashboardPage';
import { getEnvironment } from '../../config/environment';

test.describe('Login Page UI Tests', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  const config = getEnvironment();

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    await loginPage.goto();
  });

  test('should display login form elements', async () => {
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
    await expect(loginPage.forgotPasswordLink).toBeVisible();
  });

  test('should login with valid credentials', async () => {
    await loginPage.login(config.testUser.email, config.testUser.password);

    // Should redirect to dashboard
    await expect(dashboardPage.userNameDisplay).toBeVisible();
    await expect(dashboardPage.accountBalance).toBeVisible();
  });

  test('should show error message with invalid credentials', async () => {
    await loginPage.login('invalid@email.com', 'wrongpassword');

    await expect(loginPage.errorMessage).toBeVisible();
    const errorText = await loginPage.getErrorMessage();
    expect(errorText).toContain('Invalid email or password');
  });

  test('should validate required fields', async () => {
    await loginPage.loginButton.click();

    // Check for HTML5 validation or custom validation messages
    await expect(loginPage.emailInput).toHaveAttribute('required');
    await expect(loginPage.passwordInput).toHaveAttribute('required');
  });

  test('should handle password visibility toggle', async ({ page }) => {
    const passwordToggle = page.locator('[data-testid="password-toggle"]');

    await loginPage.passwordInput.fill('testpassword');
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');

    if (await passwordToggle.isVisible()) {
      await passwordToggle.click();
      await expect(loginPage.passwordInput).toHaveAttribute('type', 'text');
    }
  });

  // Intentional failing test to capture screenshots
  test('should demonstrate screenshot capture on failure', async ({ page }) => {
    await loginPage.login(config.testUser.email, config.testUser.password);

    // Wait for dashboard to load
    await expect(dashboardPage.userNameDisplay).toBeVisible();

    // This assertion will intentionally fail to trigger screenshot capture
    await expect(page.locator('[data-testid="non-existent-element"]')).toBeVisible({
      timeout: 5000
    });
  });
});
