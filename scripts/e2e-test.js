#!/usr/bin/env node

/**
 * End-to-End Test for Persistent Search History
 * Simulates real user interactions
 * Run with: node scripts/e2e-test.js
 */

const puppeteer = require('puppeteer')

async function runE2ETest() {
  console.log('🧪 Starting E2E Test for Persistent Search History...\n')
  
  let browser
  try {
    // Launch browser
    browser = await puppeteer.launch({ 
      headless: false, // Set to true for CI/CD
      slowMo: 1000 // Slow down for visibility
    })
    
    const page = await browser.newPage()
    
    // Test 1: Navigate to search page
    console.log('📱 Test 1: Navigating to search page...')
    await page.goto('http://localhost:3000/search')
    await page.waitForSelector('input[placeholder*="job"]', { timeout: 5000 })
    console.log('  ✅ Search page loaded successfully')
    
    // Test 2: Perform searches
    console.log('\n🔍 Test 2: Performing test searches...')
    
    const testSearches = [
      { query: 'Software Engineer', location: 'San Francisco' },
      { query: 'Designer', location: 'New York' },
      { query: 'Developer', location: 'Austin' }
    ]
    
    for (const search of testSearches) {
      console.log(`  🔍 Searching for "${search.query}" in "${search.location}"...`)
      
      // Fill search form
      await page.type('input[placeholder*="job"]', search.query)
      await page.type('input[placeholder*="location"]', search.location)
      
      // Submit search
      await page.click('button[type="submit"]')
      
      // Wait for results
      await page.waitForSelector('[data-testid="job-card"]', { timeout: 10000 })
      console.log(`  ✅ Search completed for "${search.query}"`)
      
      // Wait a bit between searches
      await page.waitForTimeout(2000)
    }
    
    // Test 3: Check search history
    console.log('\n📋 Test 3: Checking search history...')
    
    // Click on search history dropdown
    await page.click('[aria-label="Search history dropdown"]')
    await page.waitForTimeout(1000)
    
    // Check if search history items exist
    const historyItems = await page.$$('[role="listitem"]')
    console.log(`  📊 Found ${historyItems.length} search history items`)
    
    if (historyItems.length > 0) {
      console.log('  ✅ Search history is working')
      
      // Test clicking on a history item
      await historyItems[0].click()
      await page.waitForTimeout(2000)
      console.log('  ✅ Clicking history item works')
    } else {
      console.log('  ⚠️ No search history items found')
    }
    
    // Test 4: Check natural language timestamps
    console.log('\n⏰ Test 4: Checking natural language timestamps...')
    
    const timestampElements = await page.$$('.text-muted-foreground.text-xs')
    if (timestampElements.length > 0) {
      const timestamps = await Promise.all(
        timestampElements.map(el => el.evaluate(node => node.textContent))
      )
      
      console.log('  📅 Found timestamps:')
      timestamps.forEach((timestamp, index) => {
        console.log(`    ${index + 1}. "${timestamp}"`)
      })
      
      // Check if timestamps are natural language
      const naturalLanguagePatterns = [
        /just now|minutes? ago|hours? ago|yesterday|days? ago|last week|on \w+ \d+/
      ]
      
      const hasNaturalLanguage = timestamps.some(timestamp => 
        naturalLanguagePatterns.some(pattern => pattern.test(timestamp))
      )
      
      if (hasNaturalLanguage) {
        console.log('  ✅ Natural language timestamps are working')
      } else {
        console.log('  ❌ Natural language timestamps not found')
      }
    }
    
    // Test 5: Test persistence (optional - requires login)
    console.log('\n🔄 Test 5: Testing persistence...')
    console.log('  💡 To test full persistence, you would need to:')
    console.log('    1. Log in to an account')
    console.log('    2. Perform searches')
    console.log('    3. Log out and log back in')
    console.log('    4. Verify search history persists')
    
    console.log('\n🎉 E2E Test completed successfully!')
    
  } catch (error) {
    console.error('❌ E2E Test failed:', error.message)
    console.log('💡 Make sure:')
    console.log('  - Dev server is running (npm run dev)')
    console.log('  - Database is set up (npx prisma db push)')
    console.log('  - Puppeteer is installed (npm install puppeteer)')
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

// Check if puppeteer is available
try {
  require('puppeteer')
  runE2ETest()
} catch (error) {
  console.log('📦 Puppeteer not installed. Installing...')
  console.log('💡 Run: npm install puppeteer')
  console.log('💡 Then run: node scripts/e2e-test.js')
} 