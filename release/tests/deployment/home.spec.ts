import {test,expect} from "@playwright/test";
const site=process.env.OUR_PUBLIC_PREVIEW_URL??"https://local-language-model.vercel.app";
for(const width of [1440,390])test("public Vercel compute preview at "+width+"px",async({page,request})=>{
 test.setTimeout(180000);await page.setViewportSize({width,height:960});const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
 await page.goto(site,{waitUntil:"domcontentloaded"});await expect(page.getByRole("heading",{name:"HOLD $LLM. USE AI."})).toBeVisible({timeout:120000});
 const status=await request.get(site+"/api/status");expect(status.status()).toBe(200);const s=await status.json();expect(s.name).toBe("Local Language Model");expect(s.model.id).toBe("local-language-model");expect(JSON.stringify(s)).not.toContain("gpt-4.1");
 const network=await request.get(site+"/api/network");expect(network.status()).toBe(200);const n=await network.json();expect(n.metrics).toBeDefined();expect(n.architecture).toHaveLength(6);
 await expect(page.locator(".compute-page")).not.toContainText(/the repository|operator.confirmation|operator-confirmed|operator-attested/i);
 await expect(page.locator(".compute-built")).toContainText("DEDICATED GPU INFRASTRUCTURE");
 await expect(page.locator(".compute-telemetry dd")).toHaveCount(6);if(n.telemetryStatus!=="reporting")await expect(page.locator(".compute-telemetry dd")).toHaveText(["—","—","—","—","—","—"]);
 await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.locator(".compute-hero").getByRole("button",{name:"CONNECT WALLET",exact:true}).click();await expect(page.getByRole("heading",{name:"Connect your wallet"})).toBeVisible();await page.getByRole("button",{name:"Close",exact:true}).click();
 await page.screenshot({path:"test-results/public-compute-"+width+".png",fullPage:true});expect(errors).toEqual([]);
});

test("deployed brand assets, blank copy control and X button are available",async({page,request})=>{
 test.setTimeout(180000);
 await expect.poll(async()=>{const r=await request.get(site+"/brand/llm-symbol.svg");return (await r.text()).includes('viewBox="0 0 32 32"');},{timeout:150000,intervals:[3000,5000,10000]}).toBe(true);
 const logo=await request.get(site+"/brand/llm-symbol.svg");expect(logo.headers()["content-type"]).toContain("image/svg+xml");expect(await logo.text()).not.toContain("<text");
 const banner=await request.get(site+"/brand/llm-banner.svg");expect(await banner.text()).toContain('width="1500" height="500"');
 for(const width of [1440,390,320]){await page.setViewportSize({width,height:900});await page.goto(site);await expect(page.getByRole("textbox",{name:"Contract address"})).toHaveValue("");await expect(page.getByRole("button",{name:"Copy contract address"})).toBeDisabled();await expect(page.getByRole("button",{name:"Local Language Model on X"})).toBeVisible();await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
});
