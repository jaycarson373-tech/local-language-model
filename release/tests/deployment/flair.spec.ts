import {test,expect} from "@playwright/test";
const site=process.env.OUR_PUBLIC_PREVIEW_URL??"https://local-language-model.vercel.app";
for(const width of [1440,390,320])test("deployed motion, creator policy and disabled daily claim at "+width+"px",async({page})=>{
 test.setTimeout(180000);await page.setViewportSize({width,height:960});await page.emulateMedia({reducedMotion:"no-preference"});
 await expect.poll(async()=>{await page.goto(site);return page.locator(".compute-motion-toggle").count();},{timeout:150000,intervals:[3000,5000,10000]}).toBe(1);
 await expect(page.locator(".compute-atmosphere")).toBeVisible();await expect(page.locator(".compute-atmosphere")).toContainText("ARCHITECTURE PREVIEW");
 await page.getByRole("button",{name:"Pause decorative motion"}).click();await expect(page.getByRole("button",{name:"Resume decorative motion"})).toBeVisible();expect(await page.locator(".compute-circuit-run").first().evaluate(n=>getComputedStyle(n).animationPlayState)).toBe("paused");
 await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:"test-results/public-kinetic-"+width+".png"});
 await page.locator(".compute-funding-policy").scrollIntoViewIfNeeded();await expect(page.locator(".compute-funding-policy")).toContainText("100% of creator fees received");
 await page.goto(site+"/credits");await expect(page.getByRole("button",{name:"Claim daily credits"})).toBeDisabled();
});
