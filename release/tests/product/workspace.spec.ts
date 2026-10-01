import {test,expect} from "@playwright/test";

for(const width of [1440,390,320]) {
  test(`workspace, daily credits and context handoff at ${width}px`,async({page})=>{
    await page.setViewportSize({width,height:960});
    const errors:string[]=[];
    page.on("pageerror",e=>errors.push(e.message));
    await page.goto("/");
    await expect(page.getByRole("heading",{name:"Your AI should be local."})).toBeVisible();
    await expect(page.getByRole("link",{name:"View daily credits"})).toBeVisible();
    await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.screenshot({path:`test-results/overview-${width}.png`,fullPage:true});
    await page.getByRole("link",{name:"Prepare context"}).click();
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
    await expect(page.getByRole("button",{name:"Local LLM Workspace"})).toBeVisible();
    await page.getByRole("button",{name:"Local LLM Workspace"}).click();
    await expect(page.getByText("Custom model · endpoint pending")).toBeVisible();
    await page.getByRole("button",{name:"Local LLM Workspace"}).click();
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

for(const width of [1440,390])test(`infrastructure, setup and cost scenario at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:960});
 await page.goto('/');
 await page.getByRole('button',{name:'04 Local LLM Our custom inference endpoint'}).click();
 await expect(page.locator('.architecture-detail')).toContainText('IN DEVELOPMENT');
 await page.getByRole('button',{name:'GPU server',exact:true}).click();
 await expect(page.locator('.setup-stack')).toContainText('vLLM');
 await page.getByRole('button',{name:'Apple Silicon',exact:true}).click();
 await expect(page.locator('.setup-stack')).toContainText('MLX LM');
 await expect(page.locator('.comparison-result')).toContainText('95.0%');
 await page.getByLabel('Compare with').selectOption('luna');
 await expect(page.locator('.comparison-result')).toContainText('Same assumed cost.');
 await page.getByLabel('Monthly input · million tokens').fill('');
 await expect(page.getByRole('alert')).toContainText('Enter non-negative');
 await page.getByLabel('Monthly input · million tokens').fill('1');
 await page.getByLabel('Compare with').selectOption('sonnet');
 await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.locator('#infrastructure').screenshot({path:`test-results/infrastructure-${width}.png`});
 await page.locator('#cost-lab').screenshot({path:`test-results/cost-lab-${width}.png`});
 await page.getByRole('link',{name:'Revenue & reserve accounting'}).click();
 await expect(page.locator('#revenue')).toBeInViewport();
 await expect(page.getByRole('heading',{name:'Compute has a real cost.'})).toBeVisible();
});
