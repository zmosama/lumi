const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Starting Quality Control Cycle...');

try {
  // Execute Playwright Tests
  console.log('Running End-to-End Tests (Functional, Validation, Security)...');
  execSync('npx playwright test', { stdio: 'inherit' });
  
  console.log('✅ All tests passed successfully!');
  
  const report = `# QA Test Report\n\n- **Status**: ✅ PASSED\n- **Date**: ${new Date().toISOString()}\n- **Details**: All Functional, UI, Validation, and Security tests executed successfully.`;
  fs.writeFileSync('test-report.md', report);
  
} catch (error) {
  console.error('❌ Tests Failed. Generating failure report...');
  
  const report = `# QA Test Report\n\n- **Status**: ❌ FAILED\n- **Date**: ${new Date().toISOString()}\n- **Details**: Some tests failed. Please check the terminal output or Playwright HTML report for detailed logs.`;
  fs.writeFileSync('test-report.md', report);
  process.exit(1);
}
