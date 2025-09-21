export interface EnvironmentConfig {
  baseUrl: string;
  apiBaseUrl: string;
  services: {
    userService: string;
    transactionService: string;
    notificationService: string;
    apiGateway: string;
  };
  database: {
    mongodb: string;
    redis: string;
  };
  auth: {
    apiKey: string;
    testUserToken: string;
  };
  testUser: {
    email: string;
    password: string;
  };
}

export const environments: Record<string, EnvironmentConfig> = {
  development: {
    baseUrl: 'http://localhost:3000',
    apiBaseUrl: 'http://localhost:3001',
    services: {
      userService: 'http://localhost:3002',
      transactionService: 'http://localhost:3003',
      notificationService: 'http://localhost:3004',
      apiGateway: 'http://localhost:3001'
    },
    database: {
      mongodb: 'mongodb://localhost:27017/fintech_dev',
      redis: 'redis://localhost:6379'
    },
    auth: {
      apiKey: 'dev_api_key_123',
      testUserToken: 'dev_jwt_token'
    },
    testUser: {
      email: 'test@fintech.com',
      password: 'TestPassword123!'
    }
  },
  staging: {
    baseUrl: 'https://staging.fintech.com',
    apiBaseUrl: 'https://api-staging.fintech.com',
    services: {
      userService: 'https://user-staging.fintech.com',
      transactionService: 'https://transaction-staging.fintech.com',
      notificationService: 'https://notification-staging.fintech.com',
      apiGateway: 'https://api-staging.fintech.com'
    },
    database: {
      mongodb: 'mongodb://staging-db:27017/fintech_staging',
      redis: 'redis://staging-redis:6379'
    },
    auth: {
      apiKey: 'staging_api_key_456',
      testUserToken: 'staging_jwt_token'
    },
    testUser: {
      email: 'test@staging.fintech.com',
      password: 'StagingPassword123!'
    }
  },
  production: {
    baseUrl: 'https://fintech.com',
    apiBaseUrl: 'https://api.fintech.com',
    services: {
      userService: 'https://user.fintech.com',
      transactionService: 'https://transaction.fintech.com',
      notificationService: 'https://notification.fintech.com',
      apiGateway: 'https://api.fintech.com'
    },
    database: {
      mongodb: 'mongodb://prod-db:27017/fintech_prod',
      redis: 'redis://prod-redis:6379'
    },
    auth: {
      apiKey: process.env.PROD_API_KEY || '',
      testUserToken: process.env.PROD_TEST_TOKEN || ''
    },
    testUser: {
      email: 'test@prod.fintech.com',
      password: process.env.PROD_TEST_PASSWORD || ''
    }
  }
};

export function getEnvironmentConfig(): EnvironmentConfig {
  const env = process.env.NODE_ENV || 'development';
  return environments[env] || environments.development;
}
