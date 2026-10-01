import {existsSync} from "node:fs";
import {spawn,spawnSync} from "node:child_process";
if(existsSync(".env"))process.loadEnvFile(".env");
const cmd=process.argv[2]??"dev",npx=process.platform==="win32"?"npx.cmd":"npx";
function run(args){const p=spawnSync(npx,args,{stdio:"inherit",env:process.env});if(p.status!==0)process.exit(p.status??1);}
if(cmd==="typecheck")run(["tsc","--noEmit","-p","tsconfig.standalone.json"]);
else if(cmd==="build"){run(["vite","build","--config","vite.standalone.ts"]);run(["tsc","--noEmit","-p","tsconfig.standalone.json"]);}
else if(cmd==="dev"){const p=spawn(npx,["concurrently","-k","tsx watch server/index.ts","vite --config vite.standalone.ts"],{stdio:"inherit",env:process.env});for(const sig of ["SIGINT","SIGTERM"])process.on(sig,()=>p.kill(sig));p.on("exit",code=>process.exit(code??1));}
else if(cmd==="start"){const p=spawn(process.execPath,["--import","tsx","server/index.ts"],{stdio:"inherit",env:process.env});for(const sig of ["SIGINT","SIGTERM"])process.on(sig,()=>p.kill(sig));p.on("exit",code=>process.exit(code??1));}
else {console.error("Use dev, build, start or typecheck.");process.exit(1);}
