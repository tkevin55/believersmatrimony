#!/usr/bin/env node
/**
 * Database Setup Script
 *
 * This script sets up the database using Prisma migrations.
 * Run this once after deploying to Vercel to initialize your database.
 */

const { execSync } = require('child_process');

console.log('🚀 Starting database setup...\n');

try {
  console.log('📊 Running Prisma migrations...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });

  console.log('\n✅ Database setup complete!');
  console.log('\n📝 Next steps:');
  console.log('1. Your database tables have been created');
  console.log('2. You can now register users on your site');
  console.log('3. Consider running the seed script to add test data\n');

  process.exit(0);
} catch (error) {
  console.error('\n❌ Database setup failed:', error.message);
  console.log('\nTroubleshooting:');
  console.log('- Ensure DATABASE_URL environment variable is set');
  console.log('- Check that your Neon database is accessible');
  console.log('- Verify your database credentials\n');
  process.exit(1);
}
