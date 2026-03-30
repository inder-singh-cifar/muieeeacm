const fs = require('fs').promises;
const path = require('path');
const { Pool } = require('pg');
const argon2 = require('argon2');
const crypto = require('crypto');

(async ()=>{
  try{
    const keyFile = '/home/sandbox/workspace/MUIEEEACM_keys/supabase_db_key';
    let txt = (await fs.readFile(keyFile, 'utf8')).trim();
    txt = txt.replace(': ', ':');

    const pool = new Pool({ connectionString: txt, ssl: { rejectUnauthorized: false } });
    await pool.query('SELECT 1');

    await pool.query("CREATE EXTENSION IF NOT EXISTS pgcrypto;");

    await pool.query(`CREATE TABLE IF NOT EXISTS public.admin_accounts (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      username text UNIQUE NOT NULL,
      password_hash text NOT NULL,
      created_at timestamptz DEFAULT now(),
      last_login timestamptz
    );`);

    const username = process.argv[2] || 'admin';
    const password = process.argv[3] || crypto.randomBytes(12).toString('base64');
    const hash = await argon2.hash(password);

    const res = await pool.query('INSERT INTO public.admin_accounts(username, password_hash) VALUES($1, $2) ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash RETURNING id, username, created_at', [username, hash]);

    console.log('OK: admin account created/updated');
    console.log('username:', res.rows[0].username);
    console.log('password:', password);

    await pool.end();
  }catch(err){
    console.error('ERROR', err.message || err);
    process.exit(2);
  }
})();
