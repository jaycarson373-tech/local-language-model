import {existsSync} from "node:fs";
if(existsSync(".env"))process.loadEnvFile(".env");
const args=process.argv.slice(2),buffer=args.length===0?"1":args.length===2&&args[0]==="--buffer"?args[1]:"";
if(!/^\d{1,7}(\.\d{1,9})?$/.test(buffer)){console.error("Usage: node scripts/activate-router.mjs [--buffer EXACT_USD]");process.exit(1);}
let base;const key=process.env.ADMIN_KEY;
try{base=new URL(process.env.LLM_ADMIN_BASE_URL||process.env.PUBLIC_URL);if(base.protocol!=="https:"||base.username||base.password||base.pathname!=="/"||base.search||base.hash||!key||key.length<32)throw Error();}catch{console.error("Configure the account service HTTPS origin and private ADMIN_KEY.");process.exit(1);}
async function call(command,body={}){const response=await fetch(new URL("/api/admin/"+command,base),{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+key},body:JSON.stringify(body),redirect:"error",signal:AbortSignal.timeout(90000)});const result=await response.json();if(!response.ok)throw Error(result.error||"Router activation failed");return result;}
try{const check=await call("router/check");const exactBuffer=(()=>{const [whole,fraction=""]=buffer.split(".");return BigInt(whole)*1000000000n+BigInt(fraction.padEnd(9,"0"));})();
if(BigInt(check.capacity.free)-exactBuffer+BigInt(check.capacity.buffer)<1000000000n)throw Error("Record enough cleared operator funding for obligations, the buffer and a $1 package before activation.");
await call("provider/verify");console.log("Ready router model and complete streamed usage verified.");
const capacity=await call("budget",{dailyLimit:"0",buffer,pause:false});if(capacity.retailCapacity<1000000000){await call("budget",{dailyLimit:"0",buffer,pause:true});throw Error("New checkout paused: funded capacity is below the $1 package threshold.");}
console.log("FreeLM router connected. Only backed $1 orders can be signed. Daily issuance remains zero.");
}catch(e){console.error(e instanceof Error?e.message:"Router activation failed");process.exitCode=1;}
