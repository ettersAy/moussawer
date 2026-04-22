#!/usr/bin/env node
/**
 * Reusable Playwright script for login automation
 * Usage: node scripts/login-and-screenshot.js [output-path]
 */

import { chromium } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function loginAndScreenshot(outputPath = null) {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🚀 Starting login automation...');
    console.log('📋 Target URL: http://localhost/login');
    
    // Navigate to login page
    console.log('🌐 Navigating to http://localhost/login...');
    await page.goto('http://localhost/login');
    
    // Fill credentials
    console.log('📧 Filling email: photographer-one@example.com');
    await page.fill('input[type="email"], input[name="email"], #email, [data-testid="email-input"]', 'photographer-one@example.com');
    
    console.log('🔑 Filling password: password');
    await page.fill('input[type="password"], input[name="password"], #password, [data-testid="password-input"]', 'password');
    
    // Submit form
    console.log('⏎ Pressing Enter to submit...');
    await page.keyboard.press('Enter');
    
    // Wait for navigation
    console.log('⏳ Waiting for navigation to complete...');
    await page.waitForLoadState('networkidle');
    
    // Generate output path if not provided
    if (!outputPath) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      outputPath = join(__dirname, '..', `login-result-${timestamp}.png`);
    }
    
    // Ensure directory exists
    const outputDir = dirname(outputPath);
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }
    
    // Take screenshot
    console.log('📸 Taking screenshot...');
    await page.screenshot({ path: outputPath, fullPage: true });
    
    console.log(`✅ Screenshot saved to: ${outputPath}`);
    
    // Get current URL for verification
    const currentUrl = page.url();
    console.log(`📍 Current URL after login: ${currentUrl}`);
    
    // Wait a bit to see the result
    await page.waitForTimeout(2000);
    
    return { success: true, screenshotPath: outputPath, finalUrl: currentUrl };
    
  } catch (error) {
    console.error('❌ Error during login automation:', error);
    
    // Take screenshot on error
    if (page) {
      const errorPath = join(__dirname, '..', `login-error-${Date.now()}.png`);
      await page.screenshot({ path: errorPath, fullPage: true });
      console.log(`📸 Error screenshot saved to: ${errorPath}`);
    }
    
    return { success: false, error: error.message };
    
  } finally {
    await browser.close();
    console.log('👋 Browser closed.');
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const outputPath = args[0] || null;

// Run the function
loginAndScreenshot(outputPath).then(result => {
  if (result.success) {
    console.log('🎉 Login automation completed successfully!');
    process.exit(0);
  } else {
    console.error('💥 Login automation failed.');
    process.exit(1);
  }
});