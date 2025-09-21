export interface EnvironmentConfig {
  baseUrl: string;
  apiBaseUrl: string;
  services: {
    userService: string;
    transactionService: string;
    notificationService: string;
  };
  auth: {
    apiKey: string;
    testUserToken: string;
  };
  testUser: {
    email: string;
    password: string;
  };
  testConfig: {
    timeout: number;
    retryCount: number;
    parallelWorkers: number;
  };
}

export const environments: Record<string, EnvironmentConfig> = {
  development: {
    baseUrl: 'http://localhost:3000',     // UI Server
    apiBaseUrl: 'http://localhost:3001',  // API Gateway
    services: {
      userService: 'http://localhost:3002',        // User Service
      transactionService: 'http://localhost:3003', // Transaction Service
      notificationService: 'http://localhost:3004' // Notification Service
    },
    auth: {
      apiKey: 'dev_api_key_123',
      testUserToken: 'dev_jwt_token'
    },
    testUser: {
      email: 'test@fintech.com',
      password: 'TestPassword123!'
    },
    testConfig: {
      timeout: 30000,
      retryCount: 2,
      parallelWorkers: 4
    }
  },
  staging: {
    baseUrl: 'https://staging-ui.fintech.com',
    apiBaseUrl: 'https://staging-api.fintech.com',
    services: {
      userService: 'https://staging-user.fintech.com',
      transactionService: 'https://staging-transaction.fintech.com',
      notificationService: 'https://staging-notification.fintech.com'
    },
    auth: {
      apiKey: 'staging_api_key_456',
      testUserToken: 'staging_jwt_token'
    },
    testUser: {
      email: 'test@staging.fintech.com',
      password: 'StagingPassword123!'
    },
    testConfig: {
      timeout: 45000,
      retryCount: 3,
      parallelWorkers: 2
    }
  },
  production: {
    baseUrl: 'https://app.fintech.com',
    apiBaseUrl: 'https://api.fintech.com',
    services: {
      userService: 'https://user.fintech.com',
      transactionService: 'https://transaction.fintech.com',
      notificationService: 'https://notification.fintech.com'
    },
    auth: {
      apiKey: process.env.PROD_API_KEY || '',
      testUserToken: process.env.PROD_TEST_TOKEN || ''
    },
    testUser: {
      email: process.env.PROD_TEST_EMAIL || '',
      password: process.env.PROD_TEST_PASSWORD || ''
    },
    testConfig: {
      timeout: 60000,
      retryCount: 5,
      parallelWorkers: 1
    }
  }
};

export const getEnvironment = (envName: string = 'development'): EnvironmentConfig => {
  return environments[envName] || environments.development;
};
