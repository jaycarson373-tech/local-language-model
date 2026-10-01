import {existsSync} from "node:fs";
import {spawn} from "node:child_process";
if(existsSync(".env"))process.loadEnvFile(".env");
const child=spawn(process.platform==="win32"?"npx.cmd":"npx",["concurrently","-k","tsx watch server/index.ts","vite --host 0.0.0.0"],{stdio:"inherit",env:process.env});
for(const signal of ["SIGINT","SIGTERM"])process.on(signal,()=>child.kill(signal));
child.on("exit",code=>process.exit(code??1));
