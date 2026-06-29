const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

const sqlFiles = [
    'schema.sql',
    'indexes.sql',
    'views.sql',
    'triggers.sql',
    'procedures.sql',
    'seed.sql'
];

async function runMigration() {
    console.log('🚀 Starting Neon database migration...');
    
    for (const file of sqlFiles) {
        const filePath = path.join(__dirname, '..', 'database', file);
        console.log(`\n📄 Reading ${file}...`);
        
        try {
            const sqlContent = fs.readFileSync(filePath, 'utf8');
            console.log(`⚙️ Executing query block from ${file}...`);
            await pool.query(sqlContent);
            console.log(`✅ Successfully executed ${file}`);
        } catch (err) {
            console.error(`❌ Error executing ${file}:`, err.message);
            process.exit(1);
        }
    }
    
    console.log('\n🎉 Neon database setup completed successfully!');
    await pool.end();
}

runMigration();
