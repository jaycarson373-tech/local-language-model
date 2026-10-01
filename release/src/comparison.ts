export const priceSources = {
  openai:"https://developers.openai.com/api/docs/pricing",
  anthropic:"https://platform.claude.com/docs/en/about-claude/pricing",
};
// Standard, uncached text API rates per million tokens, checked 2026-10-01.
// These are comparison baselines, not models offered by this product.
export const baselines = [
  {id:"sol",name:"GPT-6.1 Sol",company:"OpenAI",input:2,output:10,source:priceSources.openai},
  {id:"sonnet",name:"Claude Sonnet 5.5",company:"Anthropic",input:2,output:10,source:priceSources.anthropic},
  {id:"luna",name:"GPT-6 Luna",company:"OpenAI · efficient tier",input:.1,output:.5,source:priceSources.openai},
];
export function compareCost(inputMillions:number,outputMillions:number,inputRate:number,outputRate:number,base:typeof baselines[number]) {
  for(const value of [inputMillions,outputMillions,inputRate,outputRate]) if(!Number.isFinite(value)||value<0) throw new Error("Use finite, non-negative amounts.");
  const reference=inputMillions*base.input+outputMillions*base.output;
  const proposed=inputMillions*inputRate+outputMillions*outputRate;
  return {reference,proposed,savings:reference>0?100*(1-proposed/reference):null};
}
