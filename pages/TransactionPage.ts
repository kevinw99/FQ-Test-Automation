import { Page, Locator } from '@playwright/test';

export class TransactionPage {
  readonly page: Page;
  readonly transactionHistory: Locator;
  readonly filterDropdown: Locator;
  readonly searchInput: Locator;
  readonly transactionItems: Locator;
  readonly newTransactionButton: Locator;
  readonly amountInput: Locator;
  readonly recipientInput: Locator;
  readonly descriptionInput: Locator;
  readonly submitButton: Locator;
  readonly transactionDetails: Locator;

  constructor(page: Page) {
    this.page = page;
    this.transactionHistory = page.locator('[data-testid="transaction-history"]');
    this.filterDropdown = page.locator('[data-testid="filter-dropdown"]');
    this.searchInput = page.locator('[data-testid="search-input"]');
    this.transactionItems = page.locator('[data-testid="transaction-item"]');
    this.newTransactionButton = page.locator('[data-testid="new-transaction-button"]');
    this.amountInput = page.locator('[data-testid="amount-input"]');
    this.recipientInput = page.locator('[data-testid="recipient-input"]');
    this.descriptionInput = page.locator('[data-testid="description-input"]');
    this.submitButton = page.locator('[data-testid="submit-button"]');
    this.transactionDetails = page.locator('[data-testid="transaction-details"]');
  }

  async goto() {
    await this.page.goto('/transactions');
  }

  async createNewTransaction(amount: string, recipient: string, description: string) {
    await this.newTransactionButton.click();
    await this.amountInput.fill(amount);
    await this.recipientInput.fill(recipient);
    await this.descriptionInput.fill(description);
    // Select a category (required field)
    await this.page.locator('#category').selectOption('transfer');
    await this.submitButton.click();
  }

  async filterTransactions(filterType: string) {
    await this.filterDropdown.selectOption(filterType);
  }

  async searchTransactions(searchTerm: string) {
    await this.searchInput.fill(searchTerm);
  }

  async getTransactionCount() {
    return await this.transactionItems.count();
  }

  async getTransactionDetails(index: number) {
    const transaction = this.transactionItems.nth(index);
    return {
      amount: await transaction.locator('[data-testid="transaction-amount"]').textContent(),
      description: await transaction.locator('[data-testid="transaction-description"]').textContent(),
      date: await transaction.locator('[data-testid="transaction-date"]').textContent()
    };
  }
}
