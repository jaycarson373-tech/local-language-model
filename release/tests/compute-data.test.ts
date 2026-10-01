import test from "node:test";
import assert from "node:assert/strict";
import {accountReadings,tokenAmount,count,vram} from "../src/compute-data";
test("compute account uses observed balance, funded epoch and exact credit units",()=>{
 assert.deepEqual(accountReadings(null),{held:"0 $LLM",daily:"—",remaining:"—",reset:null});
 const me={balance:2500000000,holder:{balance:"2500000123456",decimals:6,balanceVerified:true,epoch:"2026-10-01",allocation:123456789,deadline:1790985600000}};
 assert.deepEqual(accountReadings(me),{held:"2,500,000.123456 $LLM",daily:"$0.123456789",remaining:"$2.50",reset:1790985600000});
 assert.equal(accountReadings({...me,holder:{...me.holder,balanceVerified:false,epoch:null}}).held,"—");assert.equal(accountReadings({...me,holder:{...me.holder,epoch:null}}).daily,"—");
});
test("unmeasured values stay unknown and large telemetry integers preserve precision",()=>{
 assert.equal(tokenAmount("1000000",null),"—");assert.equal(count(null),"—");assert.equal(vram(null),"—");assert.equal(count("9000000000000000000"),"9,000,000,000,000,000,000");assert.equal(vram("137438953472"),"128 GiB");
});
