import {check} from "./money";
export const CREDIT_PACKAGES=[{id:"usd_2",usd:"2",usdcAtomic:"2000000",credits:2000000000},{id:"usd_5",usd:"5",usdcAtomic:"5000000",credits:5000000000},{id:"usd_10",usd:"10",usdcAtomic:"10000000",credits:10000000000}] as const;
export function purchaseCredits(atomic:bigint){const pack=CREDIT_PACKAGES.find(p=>BigInt(p.usdcAtomic)===atomic);check(pack,"Choose a $2, $5 or $10 credit package");return pack.credits;}
