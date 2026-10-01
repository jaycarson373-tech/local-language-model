import {test,expect} from "@playwright/test";
for(const width of [1440,390,320])test("compute account, network and workspace preview at "+width+"px",async({page})=>{
 await page.setViewportSize({width,height:960});const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
 await page.goto("/");await expect(page.getByRole("heading",{name:"HOLD $LLM. USE AI."})).toBeVisible();
 await expect(page.locator(".compute-readings")).toContainText("0 $LLM");await expect(page.locator(".compute-account-bottom")).toContainText("Connect wallet to calculate your allowance.");
 await expect(page.locator(".compute-telemetry dd")).toHaveText(["—","—","—","—","—","—"]);await expect(page.locator(".compute-network-panel")).toContainText("No live GPU or model counters are published before measurement.");
 await expect(page.locator(".compute-route li")).toHaveCount(6);await expect(page.locator(".compute-page")).not.toContainText("GPT-4.1");await expect(page.locator(".compute-page")).not.toContainText("95%");
 await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:"test-results/compute-home-"+width+".png",fullPage:true});
 await page.locator(".compute-hero").getByRole("link",{name:"EXPLORE COMPUTE"}).click();await expect(page.getByRole("heading",{name:"YOUR COMPUTE",exact:true})).toBeInViewport();
 await page.locator(".compute-hero").getByRole("button",{name:"CONNECT WALLET",exact:true}).click();await expect(page.getByRole("heading",{name:"Connect your wallet"})).toBeVisible();await page.getByRole("button",{name:"Close",exact:true}).click();
 await page.locator(".compute-workspace-preview").getByRole("link",{name:"OPEN WORKSPACE"}).click();await expect(page.locator(".model-picker")).toContainText("LOCAL LLM");await expect(page.locator(".model-picker")).toContainText("LLM-1 // PREVIEW");await expect(page.locator(".preview-note")).toContainText("MODEL IN DEVELOPMENT");
 await page.getByRole("button",{name:/LOCAL LLM/}).click();await expect(page.locator(".model-menu")).toContainText("MODEL IN DEVELOPMENT");await expect(page.locator(".model-menu")).not.toContainText("GPT");
 await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(errors).toEqual([]);
});
test("compute dashboard renders returned account values, not a holding multiplier or invented pool",async({page})=>{
 const deadline=Date.now()+3600000;
 await page.route("**/api/me",route=>route.fulfill({json:{wallet:"11111111111111111111111111111111",balance:2500000000,conversations:[],holder:{balance:"2500000123456",decimals:6,balanceVerified:true,observedAt:Date.now(),qualified:true,reason:"Controlled account fixture: qualified.",epoch:"controlled-epoch",allocation:123456789,claimAvailable:true,deadline}}}));
 await page.goto("/");await expect(page.locator(".compute-readings")).toContainText("2,500,000.123456 $LLM");await expect(page.locator(".compute-readings")).toContainText("$0.123456789");await expect(page.locator(".compute-readings")).toContainText("$2.50");await expect(page.locator(".compute-readings time")).toHaveAttribute("datetime",new Date(deadline).toISOString());await expect(page.getByRole("link",{name:"CLAIM DAILY CREDITS"})).toBeVisible();
});
test("live collector values appear only when returned by network state and never activate model access",async({page})=>{
 await page.route("**/api/network",route=>route.fulfill({json:{status:"model_in_development",inferenceConnected:false,telemetryStatus:"reporting",observedAt:new Date().toISOString(),source:"authenticated_hardware_collector",architecture:[],metrics:{gpusOnline:2,aggregateVramBytes:"68719476736",requestsServed:"123456789012345678",tokensGenerated:null,utilizationBps:5000,modelVersion:null}}}));
 await page.goto("/");await expect(page.locator(".compute-telemetry dd")).toHaveText(["2","64 GiB","123,456,789,012,345,678","—","50.00%","—"]);await expect(page.locator(".compute-workspace-header")).toContainText("MODEL IN DEVELOPMENT");await expect(page.locator(".compute-network-bottom")).toContainText("MODEL NOT CONNECTED");
});
test("account and telemetry failures stay unknown without crashing",async({page})=>{
 await page.route("**/api/me",route=>route.fulfill({status:503,json:{error:"Account service unavailable"}}));await page.route("**/api/network",route=>route.fulfill({status:503,json:{error:"Collector unavailable"}}));
 await page.goto("/");await expect(page.locator(".compute-account-note")).toContainText("Account service is not connected");await expect(page.locator(".compute-telemetry dd")).toHaveText(["—","—","—","—","—","—"]);await expect(page.locator(".compute-telemetry-top")).toContainText("TELEMETRY UNAVAILABLE");
});
