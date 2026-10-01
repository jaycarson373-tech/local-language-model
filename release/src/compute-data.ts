import {money} from "../server/money";
export function tokenAmount(atomic:unknown,decimals:unknown){
 if(typeof atomic!=="string"||!/^\d+$/.test(atomic)||!Number.isInteger(decimals)||Number(decimals)<0||Number(decimals)>18)return "—";
 const d=Number(decimals),value=BigInt(atomic),scale=10n**BigInt(d);
 const whole=(value/scale).toString().replace(/\B(?=(\d{3})+(?!\d))/g,",");
 const fraction=d?(value%scale).toString().padStart(d,"0").replace(/0+$/,""):"";
 return whole+(fraction?"."+fraction:"")+" $LLM";
}
export function count(value:unknown){
 if(typeof value!=="string"||!/^\d{1,30}$/.test(value))return "—";
 return BigInt(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g,",");
}
export function vram(value:unknown){
 if(typeof value!=="string"||!/^\d{1,30}$/.test(value))return "—";
 const unit=1073741824n,bytes=BigInt(value),fraction=(bytes%unit)*100n/unit;
 return (bytes/unit).toString()+(fraction?"."+fraction.toString().padStart(2,"0").replace(/0+$/,""):"")+" GiB";
}
export function accountReadings(me:any){
 if(!me)return {held:"0 $LLM",daily:"—",remaining:"—",reset:null as number|null};
 const h=me.holder;
 return {held:h?.balanceVerified===false?"—":tokenAmount(h?.balance,h?.decimals),daily:h?.epoch?money(h.allocation):"—",remaining:money(me.balance),reset:Number.isSafeInteger(h?.deadline)?h.deadline as number:null};
}
