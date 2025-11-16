#!/usr/bin/env node
/**
 * Apply Prisma migrations without advisory locks (Neon pooler workaround)
 *
 * This script directly executes migration SQL files, bypassing Prisma's
 * advisory lock mechanism that doesn't work well with Neon's connection pooler.
 */

const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

async function applyMigrations() {
  if (!process.env.DATABASE_URL) {
    console.log('⚠️  DATABASE_URL not set - skipping migrations (local dev mode)')
    return
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  })

  try {
    await client.connect()
    console.log('✓ Connected to database')

    // Ensure _prisma_migrations table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
        "id" VARCHAR(36) PRIMARY KEY,
        "checksum" VARCHAR(64) NOT NULL,
        "finished_at" TIMESTAMPTZ,
        "migration_name" VARCHAR(255) NOT NULL,
        "logs" TEXT,
        "rolled_back_at" TIMESTAMPTZ,
        "started_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "applied_steps_count" INTEGER NOT NULL DEFAULT 0
      )
    `)
    console.log('✓ Migration tracking table ready')

    // Get all migration directories
    const migrationsDir = path.join(__dirname, '..', 'prisma', 'migrations')
    const migrationDirs = fs.readdirSync(migrationsDir)
      .filter(name => {
        const migrationPath = path.join(migrationsDir, name)
        return fs.statSync(migrationPath).isDirectory() &&
               fs.existsSync(path.join(migrationPath, 'migration.sql'))
      })
      .sort() // Apply in chronological order

    if (migrationDirs.length === 0) {
      console.log('✓ No migrations to apply')
      return
    }

    console.log(`Found ${migrationDirs.length} migration(s)`)

    // Apply each migration
    for (const migrationName of migrationDirs) {
      // Check if migration already applied
      const existing = await client.query(
        'SELECT migration_name FROM "_prisma_migrations" WHERE migration_name = $1',
        [migrationName]
      )

      if (existing.rows.length > 0) {
        console.log(`✓ Migration ${migrationName} already applied - skipping`)
        continue
      }

      // Read migration SQL
      const migrationPath = path.join(migrationsDir, migrationName, 'migration.sql')
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8')

      console.log(`→ Applying migration: ${migrationName}`)

      // Execute migration SQL
      await client.query(migrationSQL)
      console.log('  ✓ Migration SQL executed')

      // Record migration as applied
      await client.query(`
        INSERT INTO "_prisma_migrations" (id, checksum, migration_name, logs, applied_steps_count, finished_at)
        VALUES ($1, $2, $3, $4, 1, NOW())
      `, [
        `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        'manual-application',
        migrationName,
        'Applied via custom script (advisory lock workaround)'
      ])
      console.log('  ✓ Migration recorded in tracking table')
    }

    console.log('\n✅ All migrations completed successfully!')

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message)
    console.error('Full error:', error)
    throw error
  } finally {
    await client.end()
  }
}

applyMigrations()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
