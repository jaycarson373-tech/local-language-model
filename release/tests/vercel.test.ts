import test from "node:test";
import assert from "node:assert/strict";
import {createServer,type Server,type RequestListener} from "node:http";
import {once} from "node:events";
import {createGateway} from "../api/gateway.js";
async function serve(handler:RequestListener){const server=createServer(handler);server.listen(0,"127.0.0.1");await once(server,"listening");const address=server.address();assert(address&&typeof address!=="string");return {server,url:"http://127.0.0.1:"+address.port};}
async function close(server:Server){server.closeAllConnections();await new Promise<void>(resolve=>server.close(()=>resolve()));}
test("Vercel preview reports no model and never simulates account or financial operations",async()=>{
 const app=await serve(createGateway({backendUrl:""}));
 try{
  const status=await fetch(app.url+"/api/status").then(r=>r.json());assert.equal(status.mode,"preview");assert.equal(status.model.available,false);assert.equal(status.purchaseConfigured,false);assert.equal(status.burnConfigured,false);assert.equal(status.paused,true);
  const network=await fetch(app.url+"/api/network").then(r=>r.json());assert.equal(network.telemetryStatus,"not_connected");assert.equal(network.inferenceConnected,false);assert.ok(Object.values(network.metrics).every(x=>x===null));
  for(const path of ["me","transparency","auth/nonce","credits/claim","chat"]){const r=await fetch(app.url+"/api/"+path,{method:path==="me"||path==="transparency"?"GET":"POST",headers:{"Content-Type":"application/json"},body:path==="me"||path==="transparency"?undefined:"{}"});assert.equal(r.status,503);assert.match((await r.json()).error,/persistent backend/);}
 }finally{await close(app.server);}
});
test("Vercel relay preserves wallet cookie, API key, CSRF origin, query and real streamed bytes",async()=>{
 let seen:any;
 const upstream=await serve(async(req,res)=>{const parts=[];for await(const c of req)parts.push(c);seen={url:req.url,headers:req.headers,body:Buffer.concat(parts).toString()};res.setHeader("Content-Type","text/event-stream");res.setHeader("Set-Cookie","llm_session=test; Path=/; HttpOnly; SameSite=Strict; Secure");res.write("event: token\ndata: {\"text\":\"actual upstream\"}\n\n");setTimeout(()=>res.end("event: settled\ndata: {\"charge\":1600}\n\n"),15);});
 const app=await serve(createGateway({backendUrl:upstream.url,allowHttpForTest:true}));
 try{
  const response=await fetch(app.url+"/api/gateway?target=v1/chat/completions&trace=1",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer our-user-key",Cookie:"llm_session=our-session",Origin:"https://workspace.example"},body:'{"stream":true}'});
  assert.equal(response.status,200);assert.match(response.headers.get("set-cookie")??"",/HttpOnly/);assert.equal(response.headers.get("cache-control"),"no-store");
  const text=await response.text();assert.match(text,/actual upstream/);assert.match(text,/settled/);assert.equal(seen.url,"/api/v1/chat/completions?trace=1");assert.equal(seen.headers.authorization,"Bearer our-user-key");assert.equal(seen.headers.cookie,"llm_session=our-session");assert.equal(seen.headers.origin,"https://workspace.example");assert.equal(seen.body,'{"stream":true}');
 }finally{await close(app.server);await close(upstream.server);}
});
test("Vercel gateway rejects unsafe routes, insecure backend, redirects and oversized bodies",async()=>{
 const preview=await serve(createGateway({backendUrl:"http://example.com"}));
 try{assert.equal((await fetch(preview.url+"/api/status")).status,503);assert.equal((await fetch(preview.url+"/api/gateway?target=https://attacker.example")).status,400);}finally{await close(preview.server);}
 let calls=0;const upstream=await serve((_req,res)=>{calls++;res.writeHead(302,{Location:"https://attacker.example"});res.end();});
 const app=await serve(createGateway({backendUrl:upstream.url,allowHttpForTest:true}));
 try{
  assert.equal((await fetch(app.url+"/api/chat",{method:"POST",body:"x".repeat(48001)})).status,413);assert.equal(calls,0);
  assert.equal((await fetch(app.url+"/api/me")).status,502);assert.equal(calls,1);
 }finally{await close(app.server);await close(upstream.server);}
});
