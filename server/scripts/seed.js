require('dotenv').config();
const { initDatabase } = require('../db/database');

async function main() {
  console.log('Running database migration & seeding...');
  await initDatabase();
  console.log('Database initialized successfully.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
