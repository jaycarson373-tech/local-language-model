// Stateless Vercel relay only. Financial records live in the persistent backend.
// No provider credentials, balance mutation, or ephemeral SQLite database here.
const unavailable="Account service is not connected on this preview. Wallet sign-in, chat, credit claims, purchases and burns require the persistent backend.";
const model={id:"gpt-4.1-mini",name:"GPT-4.1 mini",provider:"OpenAI",inputPerMillion:400000000,outputPerMillion:1600000000,context:128000,maxOutput:4096,capabilities:["text","streaming"],available:false};
function json(res,status,value){res.statusCode=status;res.setHeader("Content-Type","application/json; charset=utf-8");res.setHeader("Cache-Control","no-store");res.end(JSON.stringify(value));}
export function createGateway(options={}){
 return async function gateway(req,res){
  res.setHeader("Cache-Control","no-store");res.setHeader("X-Content-Type-Options","nosniff");
  const incoming=new URL(req.url||"/","http://gateway.invalid");
  const target=incoming.searchParams.get("target")??(typeof req.query?.target==="string"?req.query.target:incoming.pathname.startsWith("/api/")?incoming.pathname.slice(5):"");
  if(!/^[a-zA-Z0-9][a-zA-Z0-9/_-]{0,160}$/.test(target)||target==="gateway"||target.includes("//"))return json(res,400,{error:"Invalid API route"});
  const method=req.method||"GET";
  if(!["GET","POST","HEAD"].includes(method))return json(res,405,{error:"Unsupported method"});
  const configured=options.backendUrl??process.env.LLM_BACKEND_URL;
  if(!configured){
   if(target==="status"&&method==="GET")return json(res,200,{name:"Local Language Model",ticker:"LLM",mode:"preview",backendConfigured:false,model,dailyBudget:0,paused:true,purchaseConfigured:false,burnConfigured:false,customModel:{name:"Local Language Model",available:false,status:"In development"},message:unavailable});
   return json(res,503,{error:unavailable});
  }
  let base;
  try{
   base=new URL(configured);
   if((base.protocol!=="https:"&&!(options.allowHttpForTest&&base.protocol==="http:"))||base.username||base.password||base.search||base.hash||base.pathname!=="/")throw new Error("Invalid backend");
   if(base.host===req.headers.host)throw new Error("Backend cannot point at this preview");
  }catch{return json(res,503,{error:"The persistent backend URL must be a different, valid HTTPS origin."});}
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
