import test from "node:test";
import assert from "node:assert/strict";
import {mkdtempSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {spawn,execFileSync} from "node:child_process";
import {createServer} from "node:net";
import {Keypair} from "@solana/web3.js";
import {ed25519} from "@noble/curves/ed25519";
import bs58 from "bs58";
async function freePort(){const server=createServer();await new Promise<void>(r=>server.listen(0,"127.0.0.1",r));const port=(server.address() as {port:number}).port;await new Promise<void>(r=>server.close(()=>r()));return port;}
test("HTTP wallet authentication and API revocation work; custom-only inference cannot fall back or charge",async()=>{
 const dir=mkdtempSync(join(tmpdir(),"llm-http-")),path=join(dir,"ledger.sqlite"),port=await freePort(),base="http://127.0.0.1:"+port,wallet=Keypair.generate(),admin="controlled-http-admin-secret-key-long-enough";
 // Explicit controlled purchase fixture. No chain broadcast or serving provider.
 const code='import {database} from "./server/database.ts";import {Finance} from "./server/finance.ts";import {units} from "./server/money.ts";const db=database('+JSON.stringify(path)+');const f=new Finance(db);f.fund(units("10"),"controlled-http-fixture","https://example.invalid/cleared");f.configure(0,0,false);const q=f.quote('+JSON.stringify(wallet.publicKey.toBase58())+',"purchase","1000000",units("1"));db.prepare("UPDATE quotes SET state=\'issued\' WHERE id=?").run(q.id);f.receipt(q.id,'+JSON.stringify(wallet.publicKey.toBase58())+',"controlled-http-receipt");db.close();await import("./server/index.ts");';
 const child=spawn(process.execPath,["--import","tsx","--input-type=module","-e",code],{env:{...process.env,PORT:String(port),PUBLIC_URL:base,NODE_ENV:"test",DB_PATH:path,ADMIN_KEY:admin,OPENAI_API_KEY:"legacy-credentials-must-not-activate-custom-model"},stdio:["ignore","pipe","pipe"]});
 let logs="";child.stdout.on("data",d=>logs+=d);child.stderr.on("data",d=>logs+=d);
 try{
  await new Promise<void>((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error(logs)),15000);child.stdout.on("data",()=>{if(logs.includes("server ready")){clearTimeout(timer);resolve();}});child.once("exit",()=>{clearTimeout(timer);reject(new Error(logs));});});
  const status=await(await fetch(base+"/api/status")).json();assert.equal(status.model.id,"local-language-model");assert.equal(status.customModel.available,false);assert.equal(status.model.status,"In development");assert.equal(status.model.inputPerMillion,null);assert.equal(JSON.stringify(status).includes("gpt-4.1"),false);
  const headers={"Content-Type":"application/json",Origin:base};
  const nResponse=await fetch(base+"/api/auth/nonce",{method:"POST",headers,body:JSON.stringify({wallet:wallet.publicKey.toBase58()})});assert.equal(nResponse.status,200);const n=await nResponse.json();
  const signature=bs58.encode(ed25519.sign(new TextEncoder().encode(n.message),wallet.secretKey.slice(0,32)));
  const signed=await fetch(base+"/api/auth/verify",{method:"POST",headers,body:JSON.stringify({id:n.id,signature})});assert.equal(signed.status,200);const cookie=signed.headers.get("set-cookie")!.split(";")[0];
  const replay=await fetch(base+"/api/auth/verify",{method:"POST",headers,body:JSON.stringify({id:n.id,signature})});assert.equal(replay.status,401);
  const keyResponse=await fetch(base+"/api/keys",{method:"POST",headers:{...headers,Cookie:cookie},body:JSON.stringify({name:"API examples",cap:"0.1"})});assert.equal(keyResponse.status,200);const key=await keyResponse.json();
  const OUR_API_BASE_URL=base+"/api/v1",OUR_USER_API_KEY=key.secret;
  const body=JSON.stringify({model:"local-language-model",stream:true,max_tokens:1024,messages:[{role:"user",content:"Hello"}]});
  const curl=execFileSync("curl",["-sS","-N","-w","\n%{http_code}",OUR_API_BASE_URL+"/chat/completions","-H","Authorization: Bearer "+OUR_USER_API_KEY,"-H","Content-Type: application/json","-d",body],{encoding:"utf8"});assert.match(curl,/in development/);assert.ok(curl.endsWith("\n503"));
  const response=await fetch(OUR_API_BASE_URL+"/chat/completions",{method:"POST",headers:{Authorization:"Bearer "+OUR_USER_API_KEY,"Content-Type":"application/json"},body});assert.equal(response.status,503);assert.match((await response.json()).error,/custom endpoint/);
  const old=await fetch(OUR_API_BASE_URL+"/chat/completions",{method:"POST",headers:{Authorization:"Bearer "+OUR_USER_API_KEY,"Content-Type":"application/json"},body:body.replace("local-language-model","gpt-4.1-mini")});assert.equal(old.status,503);
  const probe=await fetch(base+"/api/admin/provider/verify",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+admin},body:"{}"});assert.equal(probe.status,503);
  const me=await(await fetch(base+"/api/me",{headers:{Cookie:cookie}})).json();assert.equal(me.balance,1000000000);assert.equal(me.requests.length,0);assert.equal(JSON.stringify(me).includes(OUR_USER_API_KEY),false);
  const transparency=await(await fetch(base+"/api/transparency")).json();assert.equal(transparency.capacity.overhead,0);
  const revoke=await fetch(base+"/api/keys/revoke",{method:"POST",headers:{...headers,Cookie:cookie},body:JSON.stringify({id:key.id})});assert.equal(revoke.status,200);
  assert.equal((await fetch(OUR_API_BASE_URL+"/chat/completions",{method:"POST",headers:{Authorization:"Bearer "+OUR_USER_API_KEY,"Content-Type":"application/json"},body})).status,401);
 }finally{
  child.kill("SIGTERM");await new Promise<void>(resolve=>{if(child.exitCode!==null)resolve();else child.once("exit",()=>resolve());});rmSync(dir,{recursive:true,force:true});
 }
});
