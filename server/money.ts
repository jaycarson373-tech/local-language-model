export const UNIT=1_000_000_000;
export const DAY=86_400_000;
export const MODEL={id:"gpt-4.1-mini",name:"GPT-4.1 mini",provider:"OpenAI",inputPerMillion:400_000_000,outputPerMillion:1_600_000_000,context:128_000,maxOutput:4096,capabilities:["text","streaming"]};
export class ServiceError extends Error {constructor(message:string,public status=400){super(message);}}
export function check(ok:unknown,message:string,status=400):asserts ok {if(!ok)throw new ServiceError(message,status);}
export function integer(n:number){check(Number.isSafeInteger(n)&&n>=0,"Invalid integer accounting amount");return n;}
export function units(s:string){check(typeof s==="string"&&/^\\d{1,7}(\\.\\d{1,9})?$/.test(s),"Use a positive USD decimal with at most nine decimal places");const [a,b=""]=s.split(".");const x=BigInt(a)*BigInt(UNIT)+BigInt(b.padEnd(9,"0"));check(x<=BigInt(Number.MAX_SAFE_INTEGER),"Amount exceeds accounting limit");return Number(x);}
export function money(n:number){const x=BigInt(integer(n));return "$"+(x/BigInt(UNIT)).toString()+"."+(x%BigInt(UNIT)).toString().padStart(9,"0").replace(/0+$/,"").padEnd(2,"0");}
export function cost(input:number,output:number){integer(input);integer(output);return integer(input*400+output*1600);}
