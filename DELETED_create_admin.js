const fs = require('fs').promises;
const path = require('path');
const { Pool } = require('pg');
const argon2 = require('argon2');
const crypto = require('crypto');

(async ()=>{
  try{
    const keyFile = process.env.SUPABASE_KEY_FILE || '/home/sandbox/workspace/MUIEEEACM_keys/supabase_db_key';
    let txt = (await fs.readFile(keyFile, 'utf8')).trim();
    // Fix common formatting: remove stray space after protocol password separator
    txt = txt.replace(': ', ':');

    const pool = new Pool({ connectionString: txt, ssl: { rejectUnauthorized: false } });
    await pool.query('SELECT 1');

    // ensure pgcrypto exists (needed for gen_random_uuid in schema)
    await pool.query("CREATE EXTENSION IF NOT EXISTS pgcrypto;");

    // ensure admins table exists
    await pool.query(`CREATE TABLE IF NOT EXISTS public.admins (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      username text UNIQUE NOT NULL,
      password_hash text NOT NULL,
      created_at timestamptz DEFAULT now(),
      last_login timestamptz
    );`);

    // generate username/password
    const username = process.argv[2] || 'admin';
    const password = process.argv[3] || crypto.randomBytes(12).toString('base64');
    const hash = await argon2.hash(password);

    // insert or update: try insert, if conflict update password_hash
    const res = await pool.query('INSERT INTO public.admins(username, password_hash) VALUES($1, $2) ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash RETURNING id, username, created_at', [username, hash]);

    console.log('OK: admin created/updated');
    console.log('username:', res.rows[0].username);
    console.log('password:', password);

    await pool.end();
  }catch(err){
    console.error('ERROR', err.message || err);
    process.exit(2);
  }
})();
