// Public network status never infers GPU activity from application credit records.
const architecture=[
 {id:"user",label:"USER",state:"interface_ready",detail:"Workspace + developer API"},
 {id:"credit_layer",label:"LLM CREDIT LAYER",state:"implemented",detail:"Reserve · settle · release"},
 {id:"request_router",label:"REQUEST ROUTER",state:"implemented",detail:"Authenticated requests"},
 {id:"local_model",label:"LOCAL MODEL",state:"in_development",detail:"Custom endpoint not connected"},
 {id:"gpu_cluster",label:"GPU CLUSTER",state:"telemetry_not_connected",detail:"Awaiting hardware collector"},
 {id:"response",label:"RESPONSE",state:"awaiting_model",detail:"No serving model connected"},
];
const emptyMetrics=()=>({gpusOnline:null as number|null,aggregateVramBytes:null as string|null,requestsServed:null as string|null,tokensGenerated:null as string|null,utilizationBps:null as number|null,modelVersion:null as string|null});
export function networkPreview(){
 return {status:"model_in_development",inferenceConnected:false,telemetryStatus:"not_connected",observedAt:null as string|null,source:null as string|null,metrics:emptyMetrics(),architecture:architecture.map(n=>({...n}))};
}
type Options={url?:string;token?:string;now?:number;fetcher?:typeof fetch};
const counter=(v:unknown)=>typeof v==="string"&&/^\d{1,20}$/.test(v)&&BigInt(v)<=18446744073709551615n;
export async function collectNetwork(options:Options={}){
 const result=networkPreview(),url=options.url??process.env.LLM_TELEMETRY_URL,token=options.token??process.env.LLM_TELEMETRY_TOKEN;
 if(!url)return result;
 result.telemetryStatus="unavailable";
 try{
  const endpoint=new URL(url);
  if(endpoint.protocol!=="https:"||endpoint.username||endpoint.password||endpoint.hash||!token||token.length<32)throw new Error("Invalid collector configuration");
  const response=await(options.fetcher??fetch)(endpoint,{headers:{Authorization:"Bearer "+token,Accept:"application/json"},redirect:"error",signal:AbortSignal.timeout(2500)});
  if(!response.ok||!response.body)throw new Error("Collector unavailable");
  const reader=response.body.getReader(),chunks:Uint8Array[]=[];let size=0;
  try{while(true){const p=await reader.read();if(p.done)break;size+=p.value.byteLength;if(size>16384)throw new Error("Telemetry exceeded limits");chunks.push(p.value);}}finally{await reader.cancel().catch(()=>{});}
  const data=JSON.parse(Buffer.concat(chunks).toString("utf8")),now=options.now??Date.now(),time=typeof data.observedAt==="string"?Date.parse(data.observedAt):NaN;
  if(!Number.isFinite(time)||time>now+10000||now-time>60000||!Array.isArray(data.gpus)||data.gpus.length>64)throw new Error("Invalid or stale telemetry");
  const ids=new Set<string>();let online=0,vram=0n,utilization=0;
  for(const gpu of data.gpus){
   if(!gpu||typeof gpu.id!=="string"||gpu.id.length===0||gpu.id.length>128||ids.has(gpu.id)||typeof gpu.online!=="boolean"||!counter(gpu.vramBytes)||BigInt(gpu.vramBytes)>1099511627776n||!Number.isInteger(gpu.utilizationBps)||gpu.utilizationBps<0||gpu.utilizationBps>10000)throw new Error("Invalid GPU readings");
   ids.add(gpu.id);if(gpu.online){online++;vram+=BigInt(gpu.vramBytes);utilization+=gpu.utilizationBps;}
  }
  if((data.requestsServed!==null&&!counter(data.requestsServed))||(data.tokensGenerated!==null&&!counter(data.tokensGenerated))||(data.modelVersion!==null&&(typeof data.modelVersion!=="string"||data.modelVersion.length===0||data.modelVersion.length>100||/[\x00-\x1f]/.test(data.modelVersion))))throw new Error("Invalid model counters");
  result.telemetryStatus="reporting";result.observedAt=new Date(time).toISOString();result.source="authenticated_hardware_collector";
  result.metrics={gpusOnline:online,aggregateVramBytes:vram.toString(),requestsServed:data.requestsServed===null?null:BigInt(data.requestsServed).toString(),tokensGenerated:data.tokensGenerated===null?null:BigInt(data.tokensGenerated).toString(),utilizationBps:online?Math.floor(utilization/online):0,modelVersion:data.modelVersion};
  result.architecture=result.architecture.map(n=>n.id==="gpu_cluster"?{...n,state:"hardware_reporting",detail:"Authenticated collector readings"}:n);
  // Collector counters do not activate chat, grants, or a custom inference adapter.
  return result;
 }catch{return result;}
}
let cache:{key:string;expires:number;value:ReturnType<typeof networkPreview>}|undefined,inflight:Promise<ReturnType<typeof networkPreview>>|undefined;
export async function readNetwork(){
 const key=(process.env.LLM_TELEMETRY_URL??"")+"\n"+(process.env.LLM_TELEMETRY_TOKEN??"");
 if(cache?.key===key&&cache.expires>Date.now())return cache.value;
 if(inflight)return inflight;
 inflight=collectNetwork().then(value=>{cache={key,expires:Date.now()+15000,value};return value;}).finally(()=>{inflight=undefined;});
 return inflight;
}
