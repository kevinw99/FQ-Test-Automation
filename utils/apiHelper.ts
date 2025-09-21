import { APIRequestContext, expect } from '@playwright/test';
import { getEnvironment } from '../config/environment';
import { UserData, TransactionData, NotificationData } from './testDataGenerator';

export class ApiHelper {
  private request: APIRequestContext;
  private config = getEnvironment();

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  // User Service API methods
  async createUser(userData: UserData): Promise<{ user: UserData; token: string }> {
    const response = await this.request.post(`${this.config.apiBaseUrl}/api/users`, {
      data: userData,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.auth.apiKey
      }
    });

    expect(response.status()).toBe(201);
    return await response.json();
  }

  async getUserById(userId: string, token: string): Promise<UserData> {
    const response = await this.request.get(`${this.config.apiBaseUrl}/api/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-api-key': this.config.auth.apiKey
      }
    });

    expect(response.status()).toBe(200);
    return await response.json();
  }

  async updateUser(userId: string, userData: Partial<UserData>, token: string): Promise<UserData> {
    const response = await this.request.put(`${this.config.apiBaseUrl}/api/users/${userId}`, {
      data: userData,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-api-key': this.config.auth.apiKey
      }
    });

    expect(response.status()).toBe(200);
    return await response.json();
  }

  async deleteUser(userId: string, token: string): Promise<void> {
    const response = await this.request.delete(`${this.config.apiBaseUrl}/api/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-api-key': this.config.auth.apiKey
      }
    });

    expect(response.status()).toBe(204);
  }

  // Transaction Service API methods
  async createTransaction(transactionData: TransactionData, token: string): Promise<TransactionData> {
    const response = await this.request.post(`${this.config.apiBaseUrl}/api/transactions`, {
      data: transactionData,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-api-key': this.config.auth.apiKey
      }
    });

    expect(response.status()).toBe(201);
    return await response.json();
  }

  async getTransactionsByUserId(userId: string, token: string): Promise<TransactionData[]> {
    const response = await this.request.get(`${this.config.apiBaseUrl}/api/transactions/user/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-api-key': this.config.auth.apiKey
      }
    });

    expect(response.status()).toBe(200);
    return await response.json();
  }

  async getTransactionById(transactionId: string, token: string): Promise<TransactionData> {
    const response = await this.request.get(`${this.config.apiBaseUrl}/api/transactions/${transactionId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-api-key': this.config.auth.apiKey
      }
    });

    expect(response.status()).toBe(200);
    return await response.json();
  }

  // Notification Service API methods
  async createNotification(notificationData: NotificationData, token: string): Promise<NotificationData> {
    const response = await this.request.post(`${this.config.apiBaseUrl}/api/notifications`, {
      data: notificationData,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-api-key': this.config.auth.apiKey
      }
    });

    expect(response.status()).toBe(201);
    return await response.json();
  }

  async getNotificationsByUserId(userId: string, token: string): Promise<NotificationData[]> {
    const response = await this.request.get(`${this.config.apiBaseUrl}/api/notifications/user/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-api-key': this.config.auth.apiKey
      }
    });

    expect(response.status()).toBe(200);
    return await response.json();
  }

  // API Gateway methods
  async authenticateUser(email: string, password: string): Promise<{ token: string; user: UserData }> {
    const response = await this.request.post(`${this.config.apiBaseUrl}/api/auth/login`, {
      data: { email, password },
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.auth.apiKey
      }
    });

    expect(response.status()).toBe(200);
    return await response.json();
  }

  async healthCheck(): Promise<{ status: string; services: Record<string, string> }> {
    const response = await this.request.get(`${this.config.apiBaseUrl}/api/health`);
    expect(response.status()).toBe(200);
    return await response.json();
  }
}
