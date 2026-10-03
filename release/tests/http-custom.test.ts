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
async function port(){const s=createServer();await new Promise<void>(r=>s.listen(0,"127.0.0.1",r));const p=(s.address() as {port:number}).port;await new Promise<void>(r=>s.close(()=>r()));return p;}
test("documented curl and JavaScript stream and bill against the actual HTTP API using a controlled custom upstream",async()=>{
 const dir=mkdtempSync(join(tmpdir(),"llm-custom-http-")),dbPath=join(dir,"ledger.sqlite"),base="http://127.0.0.1:"+await port(),wallet=Keypair.generate(),admin="controlled-http-custom-admin-more-than-32-characters",endpoint="https://controlled-protocol.example/v1/chat/completions";
 const frames='data: '+JSON.stringify({id:"controlled-custom-result",model:"controlled-model",choices:[{delta:{content:"Hello"}}]})+'\n\ndata: '+JSON.stringify({id:"controlled-custom-result",model:"controlled-model",choices:[],usage:{prompt_tokens:10,completion_tokens:2,total_tokens:12}})+'\n\ndata: [DONE]\n\n';
 const code='import {database} from "./server/database.ts";import {Finance} from "./server/finance.ts";import {units} from "./server/money.ts";const originalFetch=globalThis.fetch;globalThis.fetch=async(input,init)=>String(input)==='+JSON.stringify(endpoint)+'?new Response('+JSON.stringify(frames)+',{headers:{"Content-Type":"text/event-stream"}}):originalFetch(input,init);const db=database('+JSON.stringify(dbPath)+');const f=new Finance(db);f.fund(units("10"),"controlled-http-custom-funding","https://example.test/cleared");f.configure(0,0,false);const q=f.quote('+JSON.stringify(wallet.publicKey.toBase58())+',"purchase","1000000",units("1"));db.prepare("UPDATE quotes SET state=\'issued\' WHERE id=?").run(q.id);f.receipt(q.id,'+JSON.stringify(wallet.publicKey.toBase58())+',"controlled-http-custom-receipt");db.close();await import("./server/index.ts");';
 const child=spawn(process.execPath,["--import","tsx","--input-type=module","-e",code],{env:{...process.env,PORT:new URL(base).port,PUBLIC_URL:base,NODE_ENV:"test",DB_PATH:dbPath,ADMIN_KEY:admin,LLM_MODEL_PROTOCOL:"openai-chat-sse",LLM_MODEL_CHAT_URL:endpoint,LLM_MODEL_API_KEY:"controlled-custom-endpoint-secret",LLM_MODEL_ID:"controlled-model",LLM_MODEL_PROVIDER:"Controlled CI endpoint",LLM_INPUT_USD_PER_MILLION:"0.4",LLM_OUTPUT_USD_PER_MILLION:"1.6",LLM_CONTEXT_TOKENS:"4096",LLM_MAX_OUTPUT_TOKENS:"1024"},stdio:["ignore","pipe","pipe"]});
 let logs="";child.stdout.on("data",d=>logs+=d);child.stderr.on("data",d=>logs+=d);
 try{await new Promise<void>((resolve,reject)=>{const t=setTimeout(()=>reject(new Error(logs)),15000);child.stdout.on("data",()=>{if(logs.includes("server ready")){clearTimeout(t);resolve();}});child.once("exit",()=>{clearTimeout(t);reject(new Error(logs));});});
 const verify=await fetch(base+"/api/admin/provider/verify",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+admin},body:"{}"});assert.equal(verify.status,200);assert.equal((await verify.json()).verified,true);
 const headers={"Content-Type":"application/json",Origin:base},n=await(await fetch(base+"/api/auth/nonce",{method:"POST",headers,body:JSON.stringify({wallet:wallet.publicKey.toBase58()})})).json();
 const signature=bs58.encode(ed25519.sign(new TextEncoder().encode(n.message),wallet.secretKey.slice(0,32))),signed=await fetch(base+"/api/auth/verify",{method:"POST",headers,body:JSON.stringify({id:n.id,signature})});assert.equal(signed.status,200);const cookie=signed.headers.get("set-cookie")!.split(";")[0];
 const key=await(await fetch(base+"/api/keys",{method:"POST",headers:{...headers,Cookie:cookie},body:JSON.stringify({name:"Example acceptance",cap:"0.1"})})).json(),OUR_API_BASE_URL=base+"/api/v1",OUR_USER_API_KEY=key.secret;
 const body=JSON.stringify({model:"free-lm",stream:true,max_tokens:1024,messages:[{role:"user",content:"Hello"}]});
 const curl=execFileSync("curl",["-sS","-N","-w","\n%{http_code}",OUR_API_BASE_URL+"/chat/completions","-H","Authorization: Bearer "+OUR_USER_API_KEY,"-H","Content-Type: application/json","-d",body],{encoding:"utf8"});assert.ok(curl.endsWith("\n200"));assert.match(curl,/"content":"Hello"/);assert.match(curl,/"charge":7200/);
 const response=await fetch(OUR_API_BASE_URL+"/chat/completions",{method:"POST",headers:{Authorization:"Bearer "+OUR_USER_API_KEY,"Content-Type":"application/json"},body});assert.equal(response.status,200);let answer="";for await(const chunk of response.body!)answer+=Buffer.from(chunk).toString();assert.match(answer,/"content":"Hello"/);assert.match(answer,/\[DONE\]/);
 const me=await(await fetch(base+"/api/me",{headers:{Cookie:cookie}})).json();assert.equal(me.balance,1000000000-14400);assert.equal(me.requests.length,2);assert.ok(me.requests.every((r:{state:string})=>r.state==="settled"));assert.equal(me.keys[0].spent,14400);assert.equal(JSON.stringify(me).includes(OUR_USER_API_KEY),false);
 }finally{child.kill("SIGTERM");await new Promise<void>(r=>{if(child.exitCode!==null)r();else child.once("exit",()=>r());});rmSync(dir,{recursive:true,force:true});}
});
