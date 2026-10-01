import {test} from 'node:test';
import assert from 'node:assert/strict';
import {baselines,compareCost} from '../src/comparison';

test('target scenario is 95% below premium rates but equal to efficient tier',()=>{
 const premium=compareCost(1,.25,.1,.5,baselines[0]);
 assert.equal(premium.reference,4.5);
 assert.equal(premium.proposed,.225);
 assert.equal(premium.savings,95);
 assert.equal(compareCost(1,.25,.1,.5,baselines[2]).savings,0);
});
test('comparison supports higher cost, zero usage and invalid inputs without fabricated savings',()=>{
 assert.equal(compareCost(1,0,4,10,baselines[0]).savings,-100);
 assert.equal(compareCost(0,0,.1,.5,baselines[0]).savings,null);
 for(const n of [-1,Infinity,NaN])assert.throws(()=>compareCost(n,1,.1,.5,baselines[0]));
});
