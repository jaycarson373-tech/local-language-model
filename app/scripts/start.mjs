import {existsSync} from "node:fs";
import {spawn} from "node:child_process";
if(existsSync(".env"))process.loadEnvFile(".env");
const child=spawn(process.execPath,["--import","tsx","server/index.ts"],{stdio:"inherit",env:process.env});
for(const signal of ["SIGINT","SIGTERM"])process.on(signal,()=>child.kill(signal));
child.on("exit",code=>process.exit(code??1));
