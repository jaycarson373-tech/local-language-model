import test from "node:test";
import assert from "node:assert/strict";
import {parseGPUCsv} from "../scripts/gpu-collector";
test("hardware collector parses actual nvidia-smi units without inventing inference counters",()=>{
 assert.deepEqual(parseGPUCsv("GPU-a, 32768, 25\nGPU-b, 32768, 0\n"),[{id:"GPU-a",online:true,vramBytes:"34359738368",utilizationBps:2500},{id:"GPU-b",online:true,vramBytes:"34359738368",utilizationBps:0}]);assert.deepEqual(parseGPUCsv(""),[]);
 for(const text of ["GPU-a, N/A, 0","GPU-a, 32768, 101","GPU-a, 32768, 1\nGPU-a, 32768, 2","GPU-a, 1.5, 0"])assert.throws(()=>parseGPUCsv(text));
});
