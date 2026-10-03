import {createHash,randomBytes,timingSafeEqual} from "node:crypto";
import {ed25519} from "@noble/curves/ed25519";
import {PublicKey} from "@solana/web3.js";
import bs58 from "bs58";
import {row,transaction,type DB} from "./database";
import {check} from "./money";
export const hash=(s:string|Uint8Array)=>createHash("sha256").update(s).digest("hex");
export const secret=()=>randomBytes(32).toString("hex");
export function walletId(wallet:unknown){check(typeof wallet==="string"&&wallet.length<=44,"Invalid wallet");new PublicKey(wallet);return wallet;}
export type Principal={wallet:string,keyId:string|null};
export function principal(db:DB,r:Request):Principal|null{const bearer=r.headers.get("Authorization");if(bearer){const key=row<{id:string,wallet:string}>(db,"SELECT id,wallet FROM api_keys WHERE hash=? AND revoked=0",hash(bearer.replace(/^Bearer /,"")));return key?{wallet:key.wallet,keyId:key.id}:null;}const token=r.headers.get("cookie")?.match(/(?:^|; )llm_session=([a-f0-9]{64})(?:;|$)/)?.[1];if(!token)return null;const session=row<{wallet:string}>(db,"SELECT wallet FROM sessions WHERE hash=? AND expires>?",hash(token),Date.now());return session?{wallet:session.wallet,keyId:null}:null;}
export function nonce(db:DB,wallet:string,origin:string){const id=secret(),expires=Date.now()+300000;const message=["FreeLM wallet sign-in",new URL(origin).host,"Wallet: "+wallet,"Nonce: "+id,"Expires: "+new Date(expires).toISOString(),"This signature authenticates your account. It does not transfer or burn tokens."].join("\n");db.prepare("INSERT INTO nonces VALUES(?,?,?,?,0)").run(id,wallet,message,expires);return {id,message,expires};}
export function verifySignIn(db:DB,id:string,signature:string){return transaction(db,()=>{const n=row<{wallet:string,message:string,expires:number,used:number}>(db,"SELECT * FROM nonces WHERE id=?",id);check(n&&!n.used&&n.expires>Date.now(),"Nonce expired or already used",401);let valid=false;try{valid=ed25519.verify(bs58.decode(signature),new TextEncoder().encode(n.message),new PublicKey(n.wallet).toBytes());}catch{}check(valid,"Invalid wallet signature",401);db.prepare("UPDATE nonces SET used=1 WHERE id=? AND used=0").run(id);const token=secret(),expires=Date.now()+43200000;db.prepare("INSERT INTO sessions VALUES(?,?,?)").run(hash(token),n.wallet,expires);return {token,wallet:n.wallet};});}
export function isAdmin(r:Request){const expected=process.env.ADMIN_KEY;if(!expected||expected.length<32)return false;const supplied=r.headers.get("Authorization")?.replace(/^Bearer /,"")??"";return timingSafeEqual(Buffer.from(hash(supplied),"hex"),Buffer.from(hash(expected),"hex"));}
