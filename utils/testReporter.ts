import { TestInfo } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

interface TestResult {
  duration: number;
  status: 'passed' | 'failed' | 'skipped' | 'flaky';
  errors: any[];
}

export class TestReporter {
  private static reportDir = 'test-results/custom-reports';

  static async generateCustomReport(testInfo: TestInfo, result: TestResult) {
    const reportData = {
      testName: testInfo.title,
      duration: result.duration,
      status: result.status,
      errors: result.errors,
      attachments: testInfo.attachments,
      timestamp: new Date().toISOString(),
      project: testInfo.project.name
    };

    await this.ensureReportDirectory();
    const reportFile = path.join(this.reportDir, `${testInfo.testId}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(reportData, null, 2));
  }

  static async generateSummaryReport(allResults: TestResult[]) {
    const summary = {
      totalTests: allResults.length,
      passed: allResults.filter(r => r.status === 'passed').length,
      failed: allResults.filter(r => r.status === 'failed').length,
      skipped: allResults.filter(r => r.status === 'skipped').length,
      flaky: allResults.filter(r => r.status === 'flaky').length,
      averageDuration: allResults.reduce((sum, r) => sum + r.duration, 0) / allResults.length,
      timestamp: new Date().toISOString()
    };

    await this.ensureReportDirectory();
    const summaryFile = path.join(this.reportDir, 'summary.json');
    fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));

    return summary;
  }

  private static async ensureReportDirectory() {
    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true });
    }
  }
}

export class TestDataManager {
  private static testDataFile = 'test-results/test-data.json';

  static async saveTestData(testId: string, data: any) {
    const allData = this.loadAllTestData();
    allData[testId] = {
      ...data,
      timestamp: new Date().toISOString()
    };

    fs.writeFileSync(this.testDataFile, JSON.stringify(allData, null, 2));
  }

  static loadTestData(testId: string) {
    const allData = this.loadAllTestData();
    return allData[testId];
  }

  private static loadAllTestData() {
    try {
      if (fs.existsSync(this.testDataFile)) {
        return JSON.parse(fs.readFileSync(this.testDataFile, 'utf8'));
      }
    } catch (error) {
      console.warn('Failed to load test data:', error);
    }
    return {};
  }

  static cleanup() {
    if (fs.existsSync(this.testDataFile)) {
      fs.unlinkSync(this.testDataFile);
    }
  }
}
