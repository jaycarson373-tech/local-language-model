import test from "node:test";
import assert from "node:assert/strict";
import {collectNetwork,networkPreview} from "../server/network";
import {database} from "../server/database";
import {Service} from "../server/service";
const now=Date.parse("2026-10-01T22:00:00Z"),token="controlled-telemetry-read-token-32-characters";
const fixture=()=>({observedAt:new Date(now).toISOString(),gpus:[{id:"gpu0",online:true,vramBytes:"34359738368",utilizationBps:2500},{id:"gpu1",online:true,vramBytes:"34359738368",utilizationBps:7500},{id:"gpu2",online:false,vramBytes:"34359738368",utilizationBps:0}],requestsServed:"123456789012345678",tokensGenerated:"9000000000000000000",modelVersion:"fixture-model-v1",privatePrompt:"never expose",internalIp:"never expose"});
test("unconfigured preview and public network endpoint report unknown telemetry",async()=>{
 const preview=await collectNetwork({url:""});assert.deepEqual(preview,networkPreview());assert.equal(preview.inferenceConnected,false);assert.ok(Object.values(preview.metrics).every(x=>x===null));
 const service=new Service(database(":memory:"));const response=await service.handle(new Request("https://preview.example/api/network"));assert.equal(response.status,200);assert.equal(response.headers.get("cache-control"),"no-store");const body=await response.json();assert.equal(body.status,"model_in_development");assert.equal(body.metrics.gpusOnline,null);
});
test("authenticated collector normalizes measured counters exactly without activating inference or leaking private fields",async()=>{
 let auth="";const data=fixture();const result=await collectNetwork({url:"https://metrics.example/readings",token,now,fetcher:async(_url,options)=>{auth=new Headers(options?.headers).get("authorization")??"";return Response.json(data);}});
 assert.equal(auth,"Bearer "+token);assert.equal(result.telemetryStatus,"reporting");assert.deepEqual(result.metrics,{gpusOnline:2,aggregateVramBytes:"68719476736",requestsServed:"123456789012345678",tokensGenerated:"9000000000000000000",utilizationBps:5000,modelVersion:"fixture-model-v1"});assert.equal(result.inferenceConnected,false);assert.equal(JSON.stringify(result).includes("never expose"),false);assert.equal(JSON.stringify(result).includes(token),false);
});
test("stale, future, duplicate, oversized or insecure telemetry never becomes fake zero readings",async()=>{
 const bad:any[]=[{...fixture(),observedAt:new Date(now-61000).toISOString()},{...fixture(),observedAt:new Date(now+11000).toISOString()},{...fixture(),gpus:[fixture().gpus[0],fixture().gpus[0]]},{...fixture(),requestsServed:"1.5"},{...fixture(),gpus:[{...fixture().gpus[0],utilizationBps:10001}]}];
 for(const data of bad){const result=await collectNetwork({url:"https://metrics.example",token,now,fetcher:async()=>Response.json(data)});assert.equal(result.telemetryStatus,"unavailable");assert.ok(Object.values(result.metrics).every(x=>x===null));}
 const oversized=await collectNetwork({url:"https://metrics.example",token,now,fetcher:async()=>new Response("x".repeat(16385))});assert.equal(oversized.metrics.gpusOnline,null);
 let calls=0;const insecure=await collectNetwork({url:"http://metrics.example",token,now,fetcher:async()=>{calls++;return Response.json(fixture());}});assert.equal(calls,0);assert.equal(insecure.telemetryStatus,"unavailable");
});

test("GPU telemetry works before inference counters are measurable",async()=>{
 const data={...fixture(),requestsServed:null,tokensGenerated:null,modelVersion:null};const result=await collectNetwork({url:"https://metrics.example",token,now,fetcher:async()=>Response.json(data)});assert.equal(result.telemetryStatus,"reporting");assert.equal(result.metrics.gpusOnline,2);assert.equal(result.metrics.requestsServed,null);assert.equal(result.metrics.tokensGenerated,null);assert.equal(result.metrics.modelVersion,null);
});
