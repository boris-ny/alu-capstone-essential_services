class CustomReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options;
  }

  onRunStart(results, options) {
    console.log('\n🚀 Starting test run...');
  }

  onTestStart(test) {
    console.log(`\n🧪 Running: ${test.path}`);
  }

  onTestResult(test, testResult, aggregatedResult) {
    console.log(`\n📝 Test: ${testResult.testFilePath}`);
    console.log(`✅ Passed: ${testResult.numPassingTests}`);
    console.log(`❌ Failed: ${testResult.numFailingTests}`);
    console.log(`⏱️ Duration: ${testResult.perfStats.end - testResult.perfStats.start}ms`);

    if (testResult.numFailingTests > 0) {
      console.log('\n⚠️ Failed Tests:');
      testResult.testResults.forEach(result => {
        if (result.status === 'failed') {
          console.log(`  - ${result.fullName}`);
          console.log(`    ${result.failureMessages.join('\n    ')}`);
        }
      });
    }
  }

  onRunComplete(contexts, results) {
    console.log('\n📊 Test Summary:');
    console.log(`✅ Passed: ${results.numPassedTests}`);
    console.log(`❌ Failed: ${results.numFailedTests}`);
    console.log(`⏭️ Skipped: ${results.numPendingTests}`);
    console.log(`⏱️ Total Duration: ${results.startTime ? (Date.now() - results.startTime) : 'unknown'}ms`);
  }
}

module.exports = CustomReporter;