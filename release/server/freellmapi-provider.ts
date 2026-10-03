import {createHash} from "node:crypto";
import {row,type DB} from "./database";
import {check,units} from "./money";
import {providerJson,exactInteger} from "./exact-json";
import {executeCustom,type CustomModel} from "./custom-provider";
import type {Message,Usage} from "./provider";
export const freeLLMAPISelected=()=>process.env.LLM_MODEL_PROTOCOL==="freellmapi-sse";
export function freeLLMAPIConfig(){try{
 if(!freeLLMAPISelected())return null;
 const value=process.env.FREELLMAPI_BASE_URL,key=process.env.FREELLMAPI_API_KEY,requested=process.env.FREELLMAPI_MODEL||"auto";
 if(!value||!key||key.length<16||key.length>1024||/[\r\n]/.test(key)||requested.length>200||/[\x00-\x1f]/.test(requested))return null;
 const base=new URL(value);if(base.protocol!=="https:"||base.username||base.password||base.search||base.hash||!/^\/v1\/?$/.test(base.pathname))return null;
 const inputPrice=units(process.env.LLM_INPUT_USD_PER_MILLION??""),outputPrice=units(process.env.LLM_OUTPUT_USD_PER_MILLION??""),context=Number(process.env.LLM_CONTEXT_TOKENS??4096),maxOutput=Number(process.env.LLM_MAX_OUTPUT_TOKENS??1024);
 if(!inputPrice||!outputPrice||!Number.isInteger(context)||context<2048||context>131072||!Number.isInteger(maxOutput)||maxOutput<8||maxOutput>4096||maxOutput>=context-1024)return null;
 const url=base.origin+"/v1",fingerprint=createHash("sha256").update(JSON.stringify([url,key,requested,inputPrice,outputPrice,context,maxOutput,"freellmapi-sse"])).digest("hex");
 return {base:url,key,requested,inputPrice,outputPrice,context,maxOutput,fingerprint};
 }catch{return null;}
}
type Catalog={configFingerprint:string;model:string;displayName:string;provider:string;context:number;observedAt:number};
export function freeLLMAPIModel(db:DB):CustomModel|null{
 const cfg=freeLLMAPIConfig(),record=row<{value:string}>(db,"SELECT value FROM settings WHERE key='freellmapi_catalog'");if(!cfg||!record)return null;
 try{const c=JSON.parse(record.value) as Catalog;if(c.configFingerprint!==cfg.fingerprint||c.observedAt>Date.now()||Date.now()-c.observedAt>=30000)return null;
 return {endpoint:cfg.base+"/chat/completions",key:cfg.key,upstreamModel:c.model,provider:"FreeLLMAPI",inputPrice:cfg.inputPrice,outputPrice:cfg.outputPrice,context:c.context,maxOutput:Math.min(cfg.maxOutput,c.context-1025),fingerprint:createHash("sha256").update(JSON.stringify([cfg.fingerprint,c.model,c.context,c.provider])).digest("hex"),transport:"freellmapi-sse",displayName:c.displayName,providerTag:c.provider};
 }catch{return null;}
}
const pending=new WeakMap<DB,Promise<CustomModel>>();
export async function refreshFreeLLMAPICatalog(db:DB,fetcher:typeof fetch=fetch){
 const cfg=freeLLMAPIConfig();check(cfg,"Configure the FreeLLMAPI router URL, unified key, exact service rates and limits",503);
 const existing=freeLLMAPIModel(db);if(existing)return existing;
 const running=pending.get(db);if(running)return running;
 const promise=(async()=>{try{
 const response=await fetcher(cfg.base+"/models?execution_status=ready",{headers:{Authorization:"Bearer "+cfg.key,Accept:"application/json"},redirect:"error",signal:AbortSignal.timeout(7000)});
 const data=await providerJson(response,1048576);check(data.object==="list"&&Array.isArray(data.data)&&data.data.length<=2000,"Invalid FreeLLMAPI model catalog",503);
 const candidates=data.data.flatMap((m:any)=>{try{if(!m||typeof m.id!=="string"||!m.id.length||m.id.length>200||/[\x00-\x1f]/.test(m.id)||typeof m.owned_by!=="string"||!/^[a-zA-Z0-9_.-]{1,80}$/.test(m.owned_by)||m.owned_by==="custom"||m.execution_status!=="ready"||m.available!==true||!Array.isArray(m.supported_parameters)||!m.supported_parameters.includes("max_tokens"))return [];const context=exactInteger(m.context_window??m.context_length);return context>=2048?[{...m,verifiedContext:context}]:[];}catch{return [];}});
 const selected=cfg.requested==="auto"?candidates[0]:candidates.find((m:any)=>m.id===cfg.requested);
 check(selected,"No configured free-tier text model is ready; add a usable provider key or wait for quota reset",503);
 const context=Math.min(cfg.context,selected.verifiedContext);check(cfg.maxOutput<context-1024,"Configured output exceeds the selected model context",503);
 const catalog:Catalog={configFingerprint:cfg.fingerprint,model:selected.id,displayName:typeof selected.name==="string"&&selected.name.length<=200&&!/[\x00-\x1f]/.test(selected.name)?selected.name:selected.id,provider:selected.owned_by,context,observedAt:Date.now()};
 db.prepare("INSERT INTO settings VALUES('freellmapi_catalog',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run(JSON.stringify(catalog));
 const model=freeLLMAPIModel(db);check(model,"FreeLLMAPI catalog could not be verified",503);return model;
 }catch(e){db.prepare("DELETE FROM settings WHERE key='freellmapi_catalog'").run();throw e;}
 })();pending.set(db,promise);try{return await promise;}finally{pending.delete(db);}
}
export async function executeFreeLLMAPI(model:CustomModel,messages:Message[],maxOutput:number,onToken:(text:string)=>void,stopped:()=>boolean,fetcher:typeof fetch=fetch):Promise<Usage>{
 check(model.transport==="freellmapi-sse","Incorrect serving adapter");
 const checked:typeof fetch=async(input,init)=>{
 const response=await fetcher(input,init);if(!response.ok)return response;
 let route="";try{route=decodeURIComponent(response.headers.get("x-routed-via")??"");}catch{}
 const separator=route.indexOf("/"),platform=route.slice(0,separator),served=route.slice(separator+1);
 check(separator>0&&/^[a-zA-Z0-9_.-]{1,80}$/.test(platform)&&platform!=="custom"&&served===model.upstreamModel,"FreeLLMAPI returned an unverified serving route; reconciliation required",502);
 if(model.providerTag!=="freellmapi")check(platform===model.providerTag,"FreeLLMAPI serving provider differs from its catalog",502);
 return response;
 };
 // Router-managed retries are pinned to one verified model ID. No application retry redispatches paid work.
 return executeCustom(model,messages,maxOutput,onToken,stopped,checked);
}
