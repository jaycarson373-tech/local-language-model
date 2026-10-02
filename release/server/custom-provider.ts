import {createHash} from "node:crypto";
import {check,integer,units} from "./money";
import type {Message,Usage} from "./provider";
export type CustomModel={endpoint:string,key:string,upstreamModel:string,provider:string,inputPrice:number,outputPrice:number,context:number,maxOutput:number,fingerprint:string,transport?:"hosted-credit-sse",providerTag?:string,allowedModelIds?:string[],providerInputPrice?:number,providerOutputPrice?:number,markupBps?:number,pricingObservedAt?:number};
export function configuredModel():CustomModel|null{try{
 const endpoint=process.env.LLM_MODEL_CHAT_URL,key=process.env.LLM_MODEL_API_KEY,upstreamModel=process.env.LLM_MODEL_ID,provider=process.env.LLM_MODEL_PROVIDER;
 if(process.env.LLM_MODEL_PROTOCOL!=="openai-chat-sse"||!endpoint||!key||!upstreamModel||!provider)return null;
 const u=new URL(endpoint);if(u.protocol!=="https:"||u.username||u.password||u.search||u.hash||!u.pathname.endsWith("/chat/completions")||key.length<16||key.length>1024||/[\r\n]/.test(key)||upstreamModel.length>200||provider.length>100||/[\x00-\x1f]/.test(upstreamModel+provider))return null;
 const inputPrice=units(process.env.LLM_INPUT_USD_PER_MILLION??""),outputPrice=units(process.env.LLM_OUTPUT_USD_PER_MILLION??""),context=Number(process.env.LLM_CONTEXT_TOKENS),maxOutput=Number(process.env.LLM_MAX_OUTPUT_TOKENS);
 if(!inputPrice||!outputPrice||!Number.isInteger(context)||context<2048||context>131072||!Number.isInteger(maxOutput)||maxOutput<8||maxOutput>4096||maxOutput>=context-1024)return null;
 const fingerprint=createHash("sha256").update(JSON.stringify([endpoint,key,upstreamModel,provider,inputPrice,outputPrice,context,maxOutput,"openai-chat-sse"])).digest("hex");
 return {endpoint,key,upstreamModel,provider,inputPrice,outputPrice,context,maxOutput,fingerprint};
 }catch{return null;}}
export function pricedCost(input:number,output:number,inputPrice:number,outputPrice:number){integer(input);integer(output);integer(inputPrice);integer(outputPrice);const exact=BigInt(input)*BigInt(inputPrice)+BigInt(output)*BigInt(outputPrice);const rounded=(exact+999999n)/1000000n;check(rounded<=BigInt(Number.MAX_SAFE_INTEGER),"Usage exceeds accounting limit");return Number(rounded);}
export async function executeCustom(model:CustomModel,messages:Message[],maxOutput:number,onToken:(text:string)=>void,stopped:()=>boolean,fetcher:typeof fetch=fetch):Promise<Usage>{
 check(maxOutput>0&&maxOutput<=model.maxOutput,"Invalid custom model output limit");
 const response=await fetcher(model.endpoint,{method:"POST",headers:{"Content-Type":"application/json",Accept:"text/event-stream",Authorization:"Bearer "+model.key},body:JSON.stringify({model:model.upstreamModel,messages,max_tokens:maxOutput,stream:true,stream_options:{include_usage:true}}),redirect:"error",signal:AbortSignal.timeout(45000)});
 check(response.ok&&response.body&&response.headers.get("content-type")?.includes("text/event-stream"),"Model request requires usage reconciliation",502);
 const reader=response.body.getReader(),decoder=new TextDecoder();let buffer="",done=false,providerId="",modelSeen=false,usage:Usage|undefined,total=0;
 try{while(true){const next=await reader.read();if(next.done)break;buffer+=decoder.decode(next.value,{stream:true});check(buffer.length<262144,"Model frame exceeds limits",502);let lineEnd;
 while((lineEnd=buffer.indexOf("\n"))>=0){const line=buffer.slice(0,lineEnd).trim();buffer=buffer.slice(lineEnd+1);if(!line.startsWith("data:"))continue;const raw=line.slice(5).trim();if(raw==="[DONE]"){check(!done,"Duplicate stream termination",502);done=true;continue;}check(!done&&!stopped(),"Model request requires usage reconciliation",502);const data=JSON.parse(raw);check(!data.error,"Model reported an error",502);
 if(data.model!==undefined){check(data.model===model.upstreamModel,"Model identity did not match the configured catalog",502);modelSeen=true;}
 if(data.id!==undefined){check(typeof data.id==="string"&&data.id.length>0&&data.id.length<=200&&!/[\x00-\x1f]/.test(data.id),"Invalid model request identifier",502);check(!providerId||providerId===data.id,"Model request identifier changed",502);providerId=data.id;}
 const token=data.choices?.[0]?.delta?.content;if(token!==undefined&&token!==null){check(typeof token==="string","Unsupported model content schema",502);total+=new TextEncoder().encode(token).length;check(total<=262144,"Model output exceeds limits",502);onToken(token);}
 if(data.usage){const input=integer(data.usage.prompt_tokens),output=integer(data.usage.completion_tokens);check(output<=maxOutput&&input+output<=model.context,"Model usage exceeds published limits",502);if(data.usage.total_tokens!==undefined)check(data.usage.total_tokens===input+output,"Inconsistent model usage",502);if(usage)check(usage.input===input&&usage.output===output,"Model usage changed",502);usage={input,output,providerId};}
 }}
 check(buffer.trim()===""&&done&&usage&&modelSeen&&providerId,"Model stream ended without verified identity and complete usage; reservation retained",502);
 return {...usage,providerId};
 }finally{await reader.cancel().catch(()=>{});}
}
