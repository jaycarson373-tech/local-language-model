import {test,expect} from "@playwright/test";

for(const width of [1440,390,320]) {
  test(`workspace, daily credits and context handoff at ${width}px`,async({page})=>{
    await page.setViewportSize({width,height:960});
    const errors:string[]=[];
    page.on("pageerror",e=>errors.push(e.message));
    await page.goto("/");
    await expect(page.getByRole("heading",{name:"HOLD $LLM. USE AI."})).toBeVisible();
    await expect(page.getByRole("heading",{name:"YOUR COMPUTE",exact:true})).toBeVisible();
    await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.screenshot({path:`test-results/overview-${width}.png`,fullPage:true});
    await page.locator(".compute-workspace-tabs").getByRole("link",{name:"BUILD",exact:true}).click();
    await expect(page.getByRole("heading",{name:"Less repetition. More of what matters."})).toBeVisible();
    const use=page.getByRole("button",{name:"Use in a new chat"});
    await expect(use).toBeDisabled();
    await page.getByRole("textbox",{name:"Source notes"}).fill("Keep evidence.\n\nKeep evidence.\n\nExplain uncertainty.");
    await expect(page.getByRole("textbox",{name:"Context pack"})).toHaveValue("Keep evidence.\n\nExplain uncertainty.");
    await page.getByRole("checkbox").uncheck();
    await expect(page.getByRole("textbox",{name:"Context pack"})).toHaveValue("Keep evidence.\n\nKeep evidence.\n\nExplain uncertainty.");
    await page.getByRole("checkbox").check();
    await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.screenshot({path:`test-results/context-${width}.png`,fullPage:true});
    await use.click();
    await expect(page.getByRole("textbox",{name:"Message"})).toHaveValue("Keep evidence.\n\nExplain uncertainty.");
    await expect(page.getByRole("button",{name:/FREELM/})).toBeVisible();
    await page.getByRole("button",{name:/FREELM/}).click();
    await expect(page.locator(".model-menu")).toContainText("FreeLM · Model workspace");
    await page.getByRole("button",{name:/FREELM/}).click();
    await page.getByRole("button",{name:"Send message"}).click();
    await expect(page.getByRole("heading",{name:"Connect your wallet"})).toBeVisible();
    await page.getByRole("button",{name:"Close",exact:true}).click();
    await page.screenshot({path:`test-results/chat-${width}.png`,fullPage:true});
    for(const route of ["/credits","/developers","/pricing","/transparency","/docs","/account"]){
      await page.goto(route);
      await expect(page.locator("main h1")).toBeVisible();
      await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    }
    await page.goto("/credits");
    await expect(page.getByRole("heading",{name:"Daily holder allowance"})).toBeVisible();
    await expect(page.getByRole("button",{name:"Claim daily credits"})).toBeDisabled();
    await expect(page.getByRole("button",{name:"Get purchase quote"})).toBeDisabled();
    await expect(page.getByRole("button",{name:"Get burn quote"})).toBeDisabled();
    expect(errors).toEqual([]);
  });
}

test("large context stays local and cannot bypass the chat input limit",async({page})=>{
  await page.goto("/context");
  await page.getByRole("textbox",{name:"Source notes"}).fill("🚀".repeat(6001));
  await expect(page.getByRole("alert")).toContainText("24 KB");
  await expect(page.getByRole("button",{name:"Use in a new chat"})).toBeDisabled();
  await expect(page.getByRole("button",{name:"Download context pack"})).toBeEnabled();
});

for(const width of [1440,390])test("network, inventory and cost methodology at "+width+"px",async({page})=>{
 await page.setViewportSize({width,height:960});await page.goto("/");
 await expect(page.locator(".compute-route")).toContainText("LOCAL MODEL");await expect(page.locator(".compute-route")).toContainText("IN DEVELOPMENT");
 await expect(page.locator(".compute-built")).toContainText("DEDICATED GPU INFRASTRUCTURE");await expect(page.locator(".compute-inventory")).toContainText("4× RTX 5090");await expect(page.locator(".compute-telemetry dd")).toHaveText(["—","—","—","—","—","—"]);
 await page.locator("#llm-network").screenshot({path:"test-results/network-"+width+".png"});
 await page.goto("/pricing");await expect(page.getByRole("heading",{name:"1 USDC → $1.00 compute credit."})).toBeVisible();await expect(page.getByRole("table",{name:"Current model prices"})).toContainText("Awaiting verification");await expect(page.locator(".pricing-page")).not.toContainText("95%");await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.goto("/docs#revenue");await expect(page.getByRole("heading",{name:"Revenue and token supply"})).toBeVisible();
});
