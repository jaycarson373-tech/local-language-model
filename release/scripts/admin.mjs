import {existsSync,readFileSync} from "node:fs";
if(existsSync(".env"))process.loadEnvFile(".env");
const allowed=new Set(["compute/check","compute/stock","fund","budget","provider/verify","provider/reconcile","index/start","index/tick","epoch","recover","reconcile"]);
const [command,flag,path]=process.argv.slice(2);
if(!allowed.has(command)||((flag||path)&&(flag!=="--body-file"||!path))){console.error("Usage: node scripts/admin.mjs COMMAND [--body-file PRIVATE_JSON_FILE]");process.exit(1);}
const origin=process.env.LLM_ADMIN_BASE_URL||process.env.PUBLIC_URL,key=process.env.ADMIN_KEY;
try{const url=new URL(origin);if(url.protocol!=="https:"||url.username||url.password||url.pathname!=="/"||url.search||url.hash||!key||key.length<32)throw Error();
 const body=path?JSON.parse(readFileSync(path,"utf8")):{};const response=await fetch(new URL("/api/admin/"+command,url),{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+key},body:JSON.stringify(body),redirect:"error",signal:AbortSignal.timeout(55000)});const result=await response.json();console.log(JSON.stringify(result,null,2));if(!response.ok)process.exitCode=1;
}catch{console.error("Admin request failed. Check the HTTPS origin, server-side ADMIN_KEY, private JSON file and service availability.");process.exitCode=1;}
