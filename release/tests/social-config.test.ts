import test from "node:test";
import assert from "node:assert/strict";
import {contractAddress,xProfile} from "../src/social-config";
test("branding accepts only real profile URLs and 32-byte Solana addresses",()=>{assert.equal(xProfile("https://x.com/valid_profile"),"https://x.com/valid_profile");for(const v of ["","https://x.com.evil.test/user","javascript:alert(1)","https://x.com/intent/post","https://x.com/user?key=secret","https://user:secret@x.com/person"])assert.equal(xProfile(v),"");assert.equal(contractAddress(""),"");assert.equal(contractAddress("CA COMING SOON"),"");assert.equal(contractAddress("1".repeat(33)),"");const mint="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";assert.equal(contractAddress(mint),mint);});
