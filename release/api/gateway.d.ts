import type {IncomingMessage,ServerResponse} from "node:http";
type Request=IncomingMessage & {query?:Record<string,unknown>;body?:unknown};
type Gateway=(req:Request,res:ServerResponse)=>Promise<void>;
export function normalizeBackendUrl(value:unknown):string;
export function createGateway(options?:{backendUrl?:string;allowHttpForTest?:boolean}):Gateway;
declare const gateway:Gateway;
export default gateway;
