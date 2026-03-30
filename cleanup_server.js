const fs = require('fs').promises;
(async ()=>{
  const p = '/home/sandbox/workspace/repos/muieeeacm/server.js';
  let txt = await fs.readFile(p,'utf8');
  // remove requires for pg, argon2, jwt
  txt = txt.replace(/\nconst \{ Pool \} = require\('pg'\);\nconst argon2 = require\('argon2'\);\nconst jwt = require\('jsonwebtoken'\);\n/,'\n');
  // remove SUPABASE_KEY_FILE and related functions block
  const start = txt.indexOf('// --- New: Supabase/Postgres connection and admin auth ---');
  const end = txt.indexOf('// --- End new auth code ---');
  if(start!==-1 && end!==-1){
    txt = txt.slice(0,start) + txt.slice(end + '// --- End new auth code ---'.length);
  }
  // remove call to initPostgres() in initializer
  txt = txt.replace(/\n\s*await initPostgres\(\)\;/, '');
  // write backup and new file
  await fs.writeFile(p + '.bak', await fs.readFile(p,'utf8'));
  await fs.writeFile(p, txt);
  console.log('server.js cleaned, backup saved to server.js.bak');
})();
