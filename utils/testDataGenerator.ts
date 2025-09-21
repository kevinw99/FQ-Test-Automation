import { faker } from '@faker-js/faker';

export interface UserData {
  id?: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export interface TransactionData {
  id?: string;
  userId: string;
  amount: number;
  currency: string;
  type: 'credit' | 'debit';
  description: string;
  merchantName?: string;
  category: string;
  timestamp?: string;
}

export interface NotificationData {
  id?: string;
  userId: string;
  type: 'email' | 'sms' | 'push';
  title: string;
  message: string;
  status: 'pending' | 'sent' | 'failed';
  timestamp?: string;
}

export class TestDataGenerator {
  static generateUser(overrides: Partial<UserData> = {}): UserData {
    return {
      email: faker.internet.email(),
      password: 'TestPassword123!',
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      phoneNumber: faker.phone.number(),
      dateOfBirth: faker.date.birthdate().toISOString().split('T')[0],
      address: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zipCode: faker.location.zipCode(),
        country: 'US'
      },
      ...overrides
    };
  }

  static generateTransaction(userId?: string, overrides: Partial<TransactionData> = {}): TransactionData {
    const amount = faker.number.float({ min: 1, max: 10000, precision: 0.01 });
    const types: ('credit' | 'debit')[] = ['credit', 'debit'];
    const categories = ['groceries', 'gas', 'restaurant', 'online', 'transfer', 'atm'];

    return {
      userId: userId || faker.string.uuid(),
      amount,
      currency: 'USD',
      type: faker.helpers.arrayElement(types),
      description: faker.commerce.productDescription(),
      merchantName: faker.company.name(),
      category: faker.helpers.arrayElement(categories),
      timestamp: faker.date.recent().toISOString(),
      ...overrides
    };
  }

  static generateNotification(userId?: string, overrides: Partial<NotificationData> = {}): NotificationData {
    const types: ('email' | 'sms' | 'push')[] = ['email', 'sms', 'push'];
    const statuses: ('pending' | 'sent' | 'failed')[] = ['pending', 'sent', 'failed'];

    return {
      userId: userId || faker.string.uuid(),
      type: faker.helpers.arrayElement(types),
      title: faker.lorem.sentence(3),
      message: faker.lorem.sentence(),
      status: faker.helpers.arrayElement(statuses),
      timestamp: faker.date.recent().toISOString(),
      ...overrides
    };
  }

  static generateMultipleUsers(count: number): UserData[] {
    return Array.from({ length: count }, () => this.generateUser());
  }

  static generateMultipleTransactions(userId: string, count: number): TransactionData[] {
    return Array.from({ length: count }, () => this.generateTransaction(userId));
  }

  static generateMultipleNotifications(userId: string, count: number): NotificationData[] {
    return Array.from({ length: count }, () => this.generateNotification(userId));
  }
}
