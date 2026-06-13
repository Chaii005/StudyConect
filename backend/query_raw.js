const { Client } = require('pg');
const client = new Client({ host: 'db.auiksrjvcxbzemwdgmpb.supabase.co', port: 5432, user: 'postgres', password: 'vanhai005@@$$', database: 'postgres', ssl: { rejectUnauthorized: false } });

async function main() {
  await client.connect();

  const res = await client.query(`SELECT COUNT(*) FROM auth.users;`);
  console.log('auth.users count:', res.rows[0].count);

  await client.end();
}

main();
