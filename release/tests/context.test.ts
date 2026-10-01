import test from "node:test";
import assert from "node:assert/strict";
import {packContext,byteSize} from "../src/context";

test("context packing removes exact repeated paragraphs, retaining distinct instructions",()=>{
  const source="Use verified sources.\n\nDo not invent claims.\n\nUse verified sources.\n\nCite uncertainties.";
  const result=packContext(source);
  assert.equal(result.text,"Use verified sources.\n\nDo not invent claims.\n\nCite uncertainties.");
  assert.equal(result.removed,1);
  assert.ok(result.packedBytes<result.originalBytes);
});
test("disabled packing and fenced code remain byte-for-byte unchanged",()=>{
  for(const source of ["a\n\na\n\n", "```js\nrun();\nrun();\n```\n\na\n\na", "~~~\ncode\n~~~\n\na\n\na"]) {
    assert.equal(packContext(source,false).text,source);
    if(/```|~~~/.test(source)) assert.equal(packContext(source).text,source);
  }
});
test("unique text is not silently normalized, including CRLF and trailing whitespace",()=>{
  const source="  one \r\n\r\ntwo\r\n\r\n";
  assert.equal(packContext(source).text,source);
  assert.equal(packContext("").packedBytes,0);
});
test("measure UTF-8 bytes and retain near-duplicates rather than claiming token savings",()=>{
  const source="你好 🚀\n\n你好 🚀\n\n你好 🚀!";
  const result=packContext(source);
  assert.equal(result.text,"你好 🚀\n\n你好 🚀!");
  assert.equal(result.packedBytes,byteSize(result.text));
  assert.ok(result.packedBytes>result.text.length);
});
