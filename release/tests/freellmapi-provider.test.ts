import test from "node:test";
import assert from "node:assert/strict";
import {database,row} from "../server/database";
import {freeLLMAPIConfig,freeLLMAPIModel,refreshFreeLLMAPICatalog,executeFreeLLMAPI} from "../server/freellmapi-provider";
import {Service} from "../server/service";
import {units} from "../server/money";
import {hash} from "../server/auth";
const config={LLM_MODEL_PROTOCOL:"freellmapi-sse",FREELLMAPI_BASE_URL:"https://router.example.test/v1",FREELLMAPI_API_KEY:"freellmapi-controlled-private-key",FREELLMAPI_MODEL:"auto",LLM_INPUT_USD_PER_MILLION:"0.4",LLM_OUTPUT_USD_PER_MILLION:"1.6",LLM_CONTEXT_TOKENS:"4096",LLM_MAX_OUTPUT_TOKENS:"1024",ADMIN_KEY:"controlled-router-admin-more-than-32-characters"};
async function controlled(fn:()=>Promise<void>){const saved=Object.fromEntries(Object.keys(config).map(k=>[k,process.env[k]])),fetcher=globalThis.fetch;Object.assign(process.env,config);try{await fn();}finally{globalThis.fetch=fetcher;for(const [k,v]of Object.entries(saved))if(v===undefined)delete process.env[k];else process.env[k]=v;}}
const ready={id:"controlled-free-model",owned_by:"groq",name:"Controlled free model",available:true,execution_status:"ready",context_window:8192,supported_parameters:["max_tokens"]};
function catalog(entries:any[]=[ready]){return Response.json({object:"list",data:entries});}
function completion({model=ready.id,route="groq/"+ready.id,estimated=false,done=true,usage=true}:{model?:string,route?:string,estimated?:boolean,done?:boolean,usage?:boolean}={}){
 return new Response('data: '+JSON.stringify({id:"controlled-request",model,choices:[{delta:{content:"OK"}}]})+'\n\n'+(usage?'data: '+JSON.stringify({id:"controlled-request",model,choices:[],usage:{prompt_tokens:10,completion_tokens:2,total_tokens:12,...(estimated?{estimated:true}:{})}})+'\n\n':"")+(done?'data: [DONE]\n\n':""),{headers:{"Content-Type":"text/event-stream","X-Routed-Via":route}});
}
test("FreeLLMAPI configuration requires a private HTTPS /v1 router and exact service rates",()=>controlled(async()=>{
 assert.ok(freeLLMAPIConfig());for(const [key,value]of [["FREELLMAPI_BASE_URL","https://freellmapi.co"],["FREELLMAPI_BASE_URL","http://router.example/v1"],["FREELLMAPI_BASE_URL","https://secret@router.example/v1"],["FREELLMAPI_API_KEY",""],["LLM_INPUT_USD_PER_MILLION","0.1e2"],["LLM_MAX_OUTPUT_TOKENS","9000"]]){const before=process.env[key];process.env[key]=value;assert.equal(freeLLMAPIConfig(),null);process.env[key]=before;}
}));
test("only ready connected text models enter the pinned catalog",()=>controlled(async()=>{
 const db=database(":memory:");const aliases={...ready,id:"auto",owned_by:"freellmapi",execution_status:undefined},custom={...ready,id:"paid-custom",owned_by:"custom"},exhausted={...ready,id:"exhausted",execution_status:"exhausted"};
 let calls=0;const fetcher:typeof fetch=async(input,init)=>{calls++;assert.equal(String(input),config.FREELLMAPI_BASE_URL+"/models?execution_status=ready");assert.equal(new Headers(init?.headers).get("authorization"),"Bearer "+config.FREELLMAPI_API_KEY);return catalog([aliases,custom,exhausted,ready]);};
 const model=await refreshFreeLLMAPICatalog(db,fetcher);assert.equal(model.upstreamModel,ready.id);assert.equal(model.context,4096);assert.equal(model.provider,"FreeLLMAPI");assert.equal(model.inputPrice,units("0.4"));assert.ok(!JSON.stringify(row(db,"SELECT value FROM settings WHERE key='freellmapi_catalog'")).includes(config.FREELLMAPI_API_KEY));
 await refreshFreeLLMAPICatalog(db,fetcher);assert.equal(calls,1);
 const c=JSON.parse(row<{value:string}>(db,"SELECT value FROM settings WHERE key='freellmapi_catalog'")!.value);c.observedAt=Date.now()-31000;db.prepare("UPDATE settings SET value=? WHERE key='freellmapi_catalog'").run(JSON.stringify(c));assert.equal(freeLLMAPIModel(db),null);
 await assert.rejects(refreshFreeLLMAPICatalog(db,async()=>catalog([aliases,custom,exhausted])),/No configured free-tier/);assert.equal(freeLLMAPIModel(db),null);db.close();
}));
test("a real SSE-shaped router response checks route identity and complete usage",()=>controlled(async()=>{
 const db=database(":memory:"),model=await refreshFreeLLMAPICatalog(db,async()=>catalog());let text="";
 const usage=await executeFreeLLMAPI(model,[{role:"user",content:"Hello"}],8,t=>text+=t,()=>false,async(_input,init)=>{const body=JSON.parse(String(init?.body));assert.equal(body.model,ready.id);assert.equal(body.stream_options.include_usage,true);return completion();});
 assert.equal(text,"OK");assert.deepEqual(usage,{input:10,output:2,providerId:"controlled-request"});
 for(const options of [{route:"custom/"+ready.id},{route:"other/"+ready.id},{model:"unverified-model"},{estimated:true},{usage:false},{done:false}])await assert.rejects(executeFreeLLMAPI(model,[{role:"user",content:"Hello"}],8,()=>{},()=>false,async()=>completion(options)));
 db.close();
}));
function post(path:string,body:unknown,key=config.ADMIN_KEY){return new Request("https://freelm.example"+path,{method:"POST",headers:{Authorization:"Bearer "+key,"Content-Type":"application/json"},body:JSON.stringify(body)});}
test("FreeLM verification, legacy model alias, settlement and API revocation share the durable account",()=>controlled(async()=>{
 const db=database(":memory:"),service=new Service(db);service.f.fund(units("10"),"controlled-funding","https://example.test/cleared");service.f.configure(0,0,false);
 const q=service.f.quote("wallet","purchase","1000000",units("1"));db.prepare("UPDATE quotes SET state='issued' WHERE id=?").run(q.id);service.f.receipt(q.id,"wallet","controlled-receipt");db.prepare("INSERT INTO api_keys(id,wallet,name,hash,created) VALUES('key','wallet','tool',?,?)").run(hash("llm_controlled"),Date.now());
 globalThis.fetch=async(input)=>String(input).includes("/models?")?catalog():completion();
 const verify=await service.handle(post("/api/admin/provider/verify",{}));assert.equal(verify.status,200);assert.equal((await verify.json()).verified,true);
 const status=service.status();assert.equal(status.name,"FreeLM");assert.equal(status.model.id,"free-lm");assert.equal(status.model.servingModel,ready.id);assert.ok(!JSON.stringify(status).includes(config.FREELLMAPI_API_KEY));
 const before=service.f.available("wallet");for(const model of ["free-lm","local-language-model"]){const response=await service.handle(post("/api/v1/chat/completions",{model,messages:[{role:"user",content:"Hello"}],stream:true,max_tokens:8},"llm_controlled"));assert.equal(response.status,200);assert.match(await response.text(),/\[DONE\]/);}
 assert.equal(service.f.available("wallet"),before-14400);assert.equal(row<{n:number}>(db,"SELECT COUNT(*) n FROM requests WHERE state='settled'")!.n,2);
 db.prepare("UPDATE api_keys SET revoked=1 WHERE id='key'").run();assert.equal((await service.handle(post("/api/v1/chat/completions",{model:"free-lm",messages:[{role:"user",content:"Hello"}],stream:true,max_tokens:8},"llm_controlled"))).status,401);db.close();
}));
test("estimated router usage retains a reservation instead of fabricating a charge or refund",()=>controlled(async()=>{
 const db=database(":memory:"),service=new Service(db);service.f.fund(units("10"),"controlled-uncertain-funding","https://example.test/cleared");service.f.configure(0,0,false);
 const q=service.f.quote("wallet","purchase","1000000",units("1"));db.prepare("UPDATE quotes SET state='issued' WHERE id=?").run(q.id);service.f.receipt(q.id,"wallet","controlled-uncertain-receipt");db.prepare("INSERT INTO api_keys(id,wallet,name,hash,created) VALUES('key','wallet','tool',?,?)").run(hash("llm_controlled"),Date.now());
 globalThis.fetch=async(input)=>String(input).includes("/models?")?catalog():completion();assert.equal((await service.handle(post("/api/admin/provider/verify",{}))).status,200);
 globalThis.fetch=async(input)=>String(input).includes("/models?")?catalog():completion({estimated:true});
 const response=await service.handle(post("/api/v1/chat/completions",{model:"free-lm",messages:[{role:"user",content:"Hello"}],stream:true,max_tokens:8},"llm_controlled"));assert.equal(response.status,200);assert.match(await response.text(),/reservation retained/);
 assert.equal(row<{n:number}>(db,"SELECT COUNT(*) n FROM requests WHERE state='uncertain' AND charge=0")!.n,1);assert.equal(row<{n:number}>(db,"SELECT COUNT(*) n FROM ledger WHERE kind='usage_settlement'")!.n,0);db.close();
}));
