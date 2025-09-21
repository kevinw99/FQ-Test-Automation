import { Page, Locator } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly userNameDisplay: Locator;
  readonly accountBalance: Locator;
  readonly recentTransactions: Locator;
  readonly transferButton: Locator;
  readonly logoutButton: Locator;
  readonly notificationIcon: Locator;
  readonly notificationBadge: Locator;

  constructor(page: Page) {
    this.page = page;
    this.userNameDisplay = page.locator('[data-testid="user-name"]');
    this.accountBalance = page.locator('[data-testid="account-balance"]');
    this.recentTransactions = page.locator('[data-testid="recent-transactions"]');
    this.transferButton = page.locator('[data-testid="transfer-button"]');
    this.logoutButton = page.locator('[data-testid="logout-button"]');
    this.notificationIcon = page.locator('[data-testid="notification-icon"]');
    this.notificationBadge = page.locator('[data-testid="notification-badge"]');
  }

  async getUserName() {
    return await this.userNameDisplay.textContent();
  }

  async getAccountBalance() {
    const balanceText = await this.accountBalance.textContent();
    return parseFloat(balanceText?.replace(/[$,]/g, '') || '0');
  }

  async getRecentTransactionCount() {
    return await this.recentTransactions.locator('.transaction-item').count();
  }

  async clickTransferButton() {
    await this.transferButton.click();
  }

  async logout() {
    await this.logoutButton.click();
  }

  async getNotificationCount() {
    const badgeText = await this.notificationBadge.textContent();
    return parseInt(badgeText || '0');
  }
}
