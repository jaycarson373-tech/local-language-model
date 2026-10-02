import test from "node:test";
import assert from "node:assert/strict";
import {createServer,type Server,type RequestListener} from "node:http";
import {once} from "node:events";
import {createGateway,normalizeBackendUrl} from "../api/gateway.js";
async function serve(handler:RequestListener){const server=createServer(handler);server.listen(0,"127.0.0.1");await once(server,"listening");const address=server.address();assert(address&&typeof address!=="string");return {server,url:"http://127.0.0.1:"+address.port};}
async function close(server:Server){server.closeAllConnections();await new Promise<void>(resolve=>server.close(()=>resolve()));}
test("Vercel preview reports no model and never simulates account or financial operations",async()=>{
 const app=await serve(createGateway({backendUrl:""}));
 try{
  const status=await fetch(app.url+"/api/status").then(r=>r.json());assert.equal(status.mode,"preview");assert.equal(status.model.available,false);assert.equal(status.purchaseConfigured,false);assert.equal(status.burnConfigured,false);assert.equal(status.paused,true);
  const network=await fetch(app.url+"/api/network").then(r=>r.json());assert.equal(network.telemetryStatus,"not_connected");assert.equal(network.inferenceConnected,false);assert.ok(Object.values(network.metrics).every(x=>x===null));
  for(const path of ["me","transparency","auth/nonce","credits/claim","chat"]){const r=await fetch(app.url+"/api/"+path,{method:path==="me"||path==="transparency"?"GET":"POST",headers:{"Content-Type":"application/json"},body:path==="me"||path==="transparency"?undefined:"{}"});assert.equal(r.status,503);assert.match((await r.json()).error,/Account access is not live yet/);}
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

test("backend URL failures report the exact configuration problem without disclosing its value",async()=>{
 const cases=[
  ["not-a-url","BACKEND_URL_NOT_PARSEABLE"],
  ["http://backend.example","BACKEND_URL_REQUIRES_HTTPS"],
  ["https://private-name:secret@backend.example","BACKEND_URL_CONTAINS_CREDENTIALS"],
  ["https://backend.example?token=secret","BACKEND_URL_CONTAINS_QUERY_OR_FRAGMENT"],
  ["https://backend.example/#secret","BACKEND_URL_CONTAINS_QUERY_OR_FRAGMENT"],
  ["https://backend.example/api","BACKEND_URL_MUST_BE_ORIGIN_ONLY"],
  ["https://backend.example/api/status","BACKEND_URL_MUST_BE_ORIGIN_ONLY"]
 ];
 for(const [backendUrl,issue] of cases){const app=await serve(createGateway({backendUrl}));
  try{const response=await fetch(app.url+"/api/status");assert.equal(response.status,503);assert.equal(response.headers.get("x-llm-gateway-version"),"url-diagnostics-2");const data=await response.json();assert.equal(data.configurationIssue,issue);assert.ok(!JSON.stringify(data).includes(backendUrl));assert.ok(!JSON.stringify(data).includes("secret"));}finally{await close(app.server);}
 }
});
test("a backend pointing at the frontend is specifically rejected",async()=>{
 let backendUrl="";const app=await serve(async(req,res)=>{await createGateway({backendUrl,allowHttpForTest:true})(req,res);});backendUrl=app.url;
 try{const response=await fetch(app.url+"/api/status");assert.equal(response.status,503);assert.equal((await response.json()).configurationIssue,"BACKEND_URL_POINTS_TO_FRONTEND");}finally{await close(app.server);}
});

test("backend URL copy-paste normalization preserves the URL security boundary",()=>{
 const origin="https://local-language-model-production.up.railway.app";
 for(const value of [origin," "+origin+" ","\""+origin+"\"","'"+origin+"'","LLM_BACKEND_URL="+origin,"LLM_BACKEND_URL=\""+origin+"\"","local-language-model-production.up.railway.app"])
  assert.equal(new URL(normalizeBackendUrl(value)).origin,origin);
 for(const value of ["http://backend.example","https://backend.example/api","https://private:secret@backend.example","https://backend.example?token=secret"])
  assert.equal(normalizeBackendUrl(value),value);
 assert.equal(normalizeBackendUrl("backend.example"),"backend.example");
 assert.equal(normalizeBackendUrl("railway.com/project/id"),"railway.com/project/id");
 assert.equal(normalizeBackendUrl("x.up.railway.app.attacker.example"),"x.up.railway.app.attacker.example");
});
test("a quoted backend assignment actually relays authenticated requests",async()=>{
 const upstream=await serve((req,res)=>{assert.equal(req.url,"/api/me");assert.equal(req.headers.cookie,"llm_session=our-session");res.setHeader("Content-Type","application/json");res.end(JSON.stringify({account:"actual upstream"}));});
 const app=await serve(createGateway({backendUrl:"LLM_BACKEND_URL=\""+upstream.url+"\"",allowHttpForTest:true}));
 try{const response=await fetch(app.url+"/api/me",{headers:{Cookie:"llm_session=our-session"}});assert.equal(response.status,200);assert.deepEqual(await response.json(),{account:"actual upstream"});}finally{await close(app.server);await close(upstream.server);}
});
