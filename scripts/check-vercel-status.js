#!/usr/bin/env node
/**
 * Vercel Deployment Status Checker
 *
 * Simpler approach: Provides deployment URL and instructions
 * Can be extended with Vercel API token for full automation
 */

const { execSync } = require('child_process')
const https = require('https')

// Configuration
const REPO_OWNER = 'tkevin55'
const REPO_NAME = 'believersmatrimony'
const CHECK_INTERVAL = 15000 // 15 seconds
const MAX_WAIT = 600000 // 10 minutes

console.log('🔍 Vercel Deployment Monitor\n')
console.log('================================\n')

// Get current commit
let commitSha
try {
  commitSha = execSync('git rev-parse HEAD').toString().trim()
  const shortSha = execSync('git rev-parse --short HEAD').toString().trim()
  console.log(`✓ Monitoring commit: ${shortSha}\n`)
} catch (error) {
  console.error('❌ Error getting commit SHA:', error.message)
  process.exit(1)
}

// GitHub API helper (no auth needed for public repos)
function checkGitHubStatus() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${REPO_OWNER}/${REPO_NAME}/commits/${commitSha}/status`,
      headers: {
        'User-Agent': 'Vercel-Monitor-Script',
        'Accept': 'application/vnd.github.v3+json'
      }
    }

    https.get(options, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          const status = JSON.parse(data)
          resolve(status)
        } catch (e) {
          reject(e)
        }
      })
    }).on('error', reject)
  })
}

// Main monitoring loop
let elapsed = 0
let lastState = null

async function monitor() {
  try {
    const status = await checkGitHubStatus()

    // Find Vercel deployment in statuses
    const vercelStatus = status.statuses?.find(s =>
      s.context && s.context.toLowerCase().includes('vercel')
    )

    if (!vercelStatus) {
      if (elapsed === 0) {
        console.log('⏳ Waiting for Vercel deployment to start...\n')
        console.log('💡 In the meantime, you can check:')
        console.log(`   https://vercel.com/${REPO_OWNER}/${REPO_NAME}/deployments\n`)
      }

      // Keep waiting
      if (elapsed < MAX_WAIT) {
        setTimeout(() => {
          elapsed += CHECK_INTERVAL
          monitor()
        }, CHECK_INTERVAL)
      } else {
        console.log('\n⏱️  Timeout reached')
        console.log('Check deployment manually at:')
        console.log(`https://vercel.com/${REPO_OWNER}/${REPO_NAME}/deployments`)
        process.exit(1)
      }
      return
    }

    const state = vercelStatus.state
    const url = vercelStatus.target_url
    const description = vercelStatus.description

    // Log state changes
    if (state !== lastState) {
      console.log(`\n📊 Status: ${state.toUpperCase()}`)
      if (description) console.log(`   ${description}`)
      if (url) console.log(`   🔗 ${url}`)
      lastState = state
    }

    if (state === 'success') {
      console.log('\n✅ DEPLOYMENT SUCCEEDED!\n')
      console.log('================================')
      console.log('🎉 Your app is live!\n')
      if (url) {
        console.log(`🔗 View deployment: ${url}\n`)
      }
      process.exit(0)
    } else if (state === 'failure' || state === 'error') {
      console.log('\n❌ DEPLOYMENT FAILED\n')
      console.log('================================')
      if (url) {
        console.log(`📋 Check logs at: ${url}\n`)
      }
      console.log('💡 Common issues:')
      console.log('   1. Database migration errors → Check DATABASE_URL env var')
      console.log('   2. Build errors → Check package.json build script')
      console.log('   3. Runtime errors → Check Vercel function logs\n')
      console.log('🔧 To fix and retry:')
      console.log('   1. Fix the issue locally')
      console.log('   2. Run: ./scripts/deploy-and-monitor.sh "fix: description"\n')
      process.exit(1)
    } else if (state === 'pending') {
      // Still in progress
      process.stdout.write(`\r⏳ Deployment in progress... (${Math.floor(elapsed / 1000)}s elapsed)`)

      if (elapsed < MAX_WAIT) {
        setTimeout(() => {
          elapsed += CHECK_INTERVAL
          monitor()
        }, CHECK_INTERVAL)
      } else {
        console.log('\n\n⏱️  Timeout reached')
        console.log('Deployment is taking longer than expected')
        console.log(`Check status at: https://vercel.com/${REPO_OWNER}/${REPO_NAME}/deployments`)
        process.exit(1)
      }
    }
  } catch (error) {
    console.error('\n❌ Error checking status:', error.message)
    console.log(`\nCheck manually: https://vercel.com/${REPO_OWNER}/${REPO_NAME}/deployments`)
    process.exit(1)
  }
}

// Start monitoring
console.log('⏳ Checking deployment status...\n')
monitor()
