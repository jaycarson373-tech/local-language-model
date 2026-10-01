import {test,expect} from "@playwright/test";
const site=process.env.OUR_PUBLIC_PREVIEW_URL??"https://local-language-model.vercel.app";
for(const width of [1440,390])test("public Vercel compute preview at "+width+"px",async({page,request})=>{
 test.setTimeout(180000);await page.setViewportSize({width,height:960});const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
 await page.goto(site,{waitUntil:"domcontentloaded"});await expect(page.getByRole("heading",{name:"HOLD $LLM. USE AI."})).toBeVisible({timeout:120000});
 const status=await request.get(site+"/api/status");expect(status.status()).toBe(200);const s=await status.json();expect(s.name).toBe("Local Language Model");expect(s.model.id).toBe("local-language-model");expect(JSON.stringify(s)).not.toContain("gpt-4.1");
 const network=await request.get(site+"/api/network");expect(network.status()).toBe(200);const n=await network.json();expect(n.metrics).toBeDefined();expect(n.architecture).toHaveLength(6);
 await expect(page.locator(".compute-telemetry dd")).toHaveCount(6);if(n.telemetryStatus!=="reporting")await expect(page.locator(".compute-telemetry dd")).toHaveText(["—","—","—","—","—","—"]);
 await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.locator(".compute-hero").getByRole("button",{name:"CONNECT WALLET",exact:true}).click();await expect(page.getByRole("heading",{name:"Connect your wallet"})).toBeVisible();await page.getByRole("button",{name:"Close",exact:true}).click();
 await page.screenshot({path:"test-results/public-compute-"+width+".png",fullPage:true});expect(errors).toEqual([]);
});
