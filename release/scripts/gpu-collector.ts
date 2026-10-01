import {createServer} from "node:http";
import {execFile} from "node:child_process";
import {promisify} from "node:util";
import {createHash,timingSafeEqual} from "node:crypto";
import {pathToFileURL} from "node:url";
const execute=promisify(execFile);
export function parseGPUCsv(csv:string){
 const lines=csv.trim()?csv.trim().split("\n"):[];if(lines.length>64)throw new Error("GPU limit exceeded");
 const ids=new Set<string>();return lines.map(line=>{
  const fields=line.split(",").map(x=>x.trim());if(fields.length!==3||!fields[0]||ids.has(fields[0])||!/^\d+$/.test(fields[1])||!/^\d+$/.test(fields[2]))throw new Error("GPU metrics unavailable");
  const [id,memory,utilization]=fields;ids.add(id);const mib=BigInt(memory),percent=Number(utilization);if(mib<=0n||mib>1048576n||percent>100)throw new Error("Invalid GPU readings");
  return {id,online:true,vramBytes:(mib*1048576n).toString(),utilizationBps:percent*100};
 });
}
export async function sampleGPUs(){
 const {stdout}=await execute("nvidia-smi",["--query-gpu=uuid,memory.total,utilization.gpu","--format=csv,noheader,nounits"],{timeout:2000,maxBuffer:16384});
 return {observedAt:new Date().toISOString(),gpus:parseGPUCsv(stdout),requestsServed:null,tokensGenerated:null,modelVersion:null};
}
export function startCollector(){
 const token=process.env.LLM_TELEMETRY_TOKEN;if(!token||token.length<32)throw new Error("A read-only telemetry token of at least 32 characters is required");
 const hash=(value:string)=>createHash("sha256").update(value).digest();const expected=hash(token);let cached:Awaited<ReturnType<typeof sampleGPUs>>|undefined,pending:Promise<Awaited<ReturnType<typeof sampleGPUs>>>|undefined,expires=0;
 const server=createServer(async(req,res)=>{
  res.setHeader("Content-Type","application/json");res.setHeader("Cache-Control","no-store");
  if(!timingSafeEqual(hash(req.headers.authorization?.replace(/^Bearer /,"")??""),expected)){res.writeHead(401);res.end('{"error":"Unauthorized"}');return;}
  if(req.method!=="GET"||new URL(req.url??"/","http://collector").pathname!=="/metrics"){res.writeHead(404);res.end('{"error":"Not found"}');return;}
  try{
   if(!cached||expires<Date.now()){pending??=sampleGPUs().then(value=>{cached=value;expires=Date.now()+5000;return value;}).finally(()=>pending=undefined);await pending;}
   res.end(JSON.stringify(cached));
  }catch{res.writeHead(503);res.end('{"error":"Measured GPU telemetry unavailable"}');}
 });
 server.listen(Number(process.env.LLM_TELEMETRY_PORT??9108),process.env.LLM_TELEMETRY_BIND??"127.0.0.1");return server;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)startCollector();
