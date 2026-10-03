// Stateless Vercel relay only. Financial records live in the persistent backend.
// No provider credentials, balance mutation, or ephemeral SQLite database here.
const unavailable="Account access is not live yet. Wallet sign-in, daily claims and transactions will open with the account service.";
const model={id:"free-lm",name:"FreeLM",provider:"FreeLM",inputPerMillion:null,outputPerMillion:null,context:null,maxOutput:null,capabilities:[],available:false,status:"In development"};
function json(res,status,value){res.statusCode=status;res.setHeader("Content-Type","application/json; charset=utf-8");res.setHeader("Cache-Control","no-store");res.end(JSON.stringify(value));}
// Normalize copy/paste formatting only. Never relax HTTPS, credential, path or self-loop checks.
export function normalizeBackendUrl(value){
 if(typeof value!=="string")return "";
 let normalized=value.trim();
 if(normalized.startsWith("LLM_BACKEND_URL="))normalized=normalized.slice("LLM_BACKEND_URL=".length).trim();
 if(normalized.length>=2&&((normalized.startsWith('"')&&normalized.endsWith('"'))||(normalized.startsWith("'")&&normalized.endsWith("'"))))normalized=normalized.slice(1,-1).trim();
 // Only Railway's canonical public-host suffix gets an inferred HTTPS scheme.
 if(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.up\.railway\.app\/?$/i.test(normalized))normalized="https://"+normalized;
 return normalized;
}
export function createGateway(options={}){
 return async function gateway(req,res){
  res.setHeader("Cache-Control","no-store");res.setHeader("X-Content-Type-Options","nosniff");res.setHeader("X-LLM-Gateway-Version","url-diagnostics-2");
  const incoming=new URL(req.url||"/","http://gateway.invalid");
  const target=incoming.searchParams.get("target")??(typeof req.query?.target==="string"?req.query.target:incoming.pathname.startsWith("/api/")?incoming.pathname.slice(5):"");
  if(!/^[a-zA-Z0-9][a-zA-Z0-9/_-]{0,160}$/.test(target)||target==="gateway"||target.includes("//"))return json(res,400,{error:"Invalid API route"});
  const method=req.method||"GET";
  if(!["GET","POST","HEAD"].includes(method))return json(res,405,{error:"Unsupported method"});
  const configured=normalizeBackendUrl(options.backendUrl??process.env.LLM_BACKEND_URL);
  if(!configured){
   if(target==="buybacks"&&method==="GET")return json(res,200,{status:"planned",network:"solana-mainnet",transactions:[],cumulativeBurnAtomic:null,decimals:null,mint:null,policy:null,observedAt:null});
   if(target==="network"&&method==="GET")return json(res,200,{status:"model_in_development",inferenceConnected:false,telemetryStatus:"not_connected",observedAt:null,source:null,metrics:{gpusOnline:null,aggregateVramBytes:null,requestsServed:null,tokensGenerated:null,utilizationBps:null,modelVersion:null},architecture:[{id:"user",label:"USER",state:"interface_ready",detail:"Workspace + developer API"},{id:"credit_layer",label:"LLM CREDIT LAYER",state:"backend_not_connected",detail:"Persistent account service pending"},{id:"request_router",label:"REQUEST ROUTER",state:"relay_ready",detail:"Same-origin API relay"},{id:"local_model",label:"LOCAL MODEL",state:"in_development",detail:"Custom endpoint not connected"},{id:"gpu_cluster",label:"GPU CLUSTER",state:"telemetry_not_connected",detail:"Awaiting hardware collector"},{id:"response",label:"RESPONSE",state:"awaiting_model",detail:"No serving model connected"}]});
   if(target==="status"&&method==="GET")return json(res,200,{name:"FreeLM",ticker:"LLM",mode:"preview",backendConfigured:false,model,dailyBudget:0,paused:true,purchaseConfigured:false,burnConfigured:false,customModel:{name:"FreeLM",available:false,status:"In development"},message:unavailable});
   return json(res,503,{error:unavailable});
  }
  let base,configurationIssue="BACKEND_URL_NOT_PARSEABLE";
  try{
   base=new URL(configured);
   if(base.protocol!=="https:"&&!(options.allowHttpForTest&&base.protocol==="http:")){configurationIssue="BACKEND_URL_REQUIRES_HTTPS";throw new Error();}
   if(base.username||base.password){configurationIssue="BACKEND_URL_CONTAINS_CREDENTIALS";throw new Error();}
   if(base.search||base.hash){configurationIssue="BACKEND_URL_CONTAINS_QUERY_OR_FRAGMENT";throw new Error();}
   if(base.pathname!=="/"){configurationIssue="BACKEND_URL_MUST_BE_ORIGIN_ONLY";throw new Error();}
   if(base.host===req.headers.host){configurationIssue="BACKEND_URL_POINTS_TO_FRONTEND";throw new Error();}
  }catch{return json(res,503,{error:"The persistent backend URL must be a different, valid HTTPS origin.",configurationIssue});}
  const url=new URL("/api/"+target,base);
  for(const [key,value] of incoming.searchParams)if(key!=="target")url.searchParams.append(key,value);
  const headers=new Headers();
  for(const name of ["authorization","cookie","origin","content-type","accept"]){
   const value=req.headers[name];if(typeof value==="string")headers.set(name,value);
  }
  let body;
  if(method==="POST"){
   const parts=[];let size=0;
   if(req.body!==undefined){
    body=Buffer.isBuffer(req.body)?req.body:Buffer.from(typeof req.body==="string"?req.body:JSON.stringify(req.body));
    if(body.length>48000)return json(res,413,{error:"Request exceeds service input limit"});
   }else{
    try{for await(const chunk of req){const part=Buffer.from(chunk);size+=part.length;if(size>48000)return json(res,413,{error:"Request exceeds service input limit"});parts.push(part);}}
    catch{return json(res,400,{error:"Request body could not be read"});}
    body=Buffer.concat(parts);
   }
  }
  try{
   const upstream=await fetch(url,{method,headers,...(body===undefined?{}:{body}),redirect:"manual",signal:AbortSignal.timeout(55000)});
   // A redirect must never forward account secrets to another origin.
   if(upstream.status>=300&&upstream.status<400)return json(res,502,{error:"The account backend returned an unsupported redirect"});
   res.statusCode=upstream.status;
   for(const name of ["content-type","cache-control","retry-after","x-request-id"]){const value=upstream.headers.get(name);if(value)res.setHeader(name,value);}
   const cookies=upstream.headers.getSetCookie();if(cookies.length)res.setHeader("Set-Cookie",cookies);
   res.setHeader("Cache-Control","no-store");
   if(upstream.headers.get("content-type")?.includes("text/event-stream"))res.setHeader("X-Accel-Buffering","no");
   if(method==="HEAD"||!upstream.body){res.end();return;}
   res.flushHeaders();
   const reader=upstream.body.getReader();
   // Continue reading if the browser disconnects. The backend owns settlement.
   while(true){const part=await reader.read();if(part.done)break;if(!res.destroyed&&!res.writableEnded)res.write(part.value);}
   if(!res.destroyed&&!res.writableEnded)res.end();
  }catch{
   if(!res.headersSent)return json(res,502,{error:"Account backend unavailable. A disconnected request may still incur provider usage; check request history before retrying."});
   if(!res.destroyed&&!res.writableEnded)res.end();
  }
 };
}
export default createGateway();
