const fs = require('fs').promises;
const { Pool } = require('pg');
(async ()=>{
  try{
    const keyFile = '/home/sandbox/workspace/MUIEEEACM_keys/supabase_db_key';
    let txt = (await fs.readFile(keyFile, 'utf8')).trim();
    txt = txt.replace(': ', ':');
    const pool = new Pool({ connectionString: txt, ssl: { rejectUnauthorized: false } });
    const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name");
    console.log('tables:');
    res.rows.forEach(r=>console.log(' -', r.table_name));

    async function showCols(table){
      try{
        const cols = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name=$1", [table]);
        console.log(`\ncolumns for ${table}:`);
        cols.rows.forEach(c=>console.log('   ', c.column_name, c.data_type));
        const sample = await pool.query(`SELECT * FROM public.${table} LIMIT 5`);
        console.log(`sample rows (${sample.rows.length}):`, JSON.stringify(sample.rows, null, 2));
      }catch(e){
        console.log('error inspecting', table, e.message);
      }
    }

    await showCols('admins').catch(()=>{});
    await showCols('admin_accounts').catch(()=>{});
    await showCols('registrations').catch(()=>{});

    await pool.end();
  }catch(err){
    console.error('ERROR', err.message || err);
    process.exit(2);
  }
})();
