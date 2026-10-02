import {check} from "./money";
export const CREDIT_PACKAGES=[{id:"usd_1",usd:"1",usdcAtomic:"1000000",credits:1000000000}] as const;
export const PLANNED_CREDIT_PACKAGES=["5","10","20"] as const;
export function purchaseCredits(atomic:bigint){const pack=CREDIT_PACKAGES.find(p=>BigInt(p.usdcAtomic)===atomic);check(pack,"Choose the $1 credit package. Larger packages are coming soon");return pack.credits;}
