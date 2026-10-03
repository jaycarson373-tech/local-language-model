import {useMemo, useRef, useState} from "react";
import {ProductStory} from "./story";
import {MAX_CONTEXT_BYTES, packContext} from "./context";

export function ContextMark() {
  return <svg viewBox="0 0 240 240" fill="none" aria-hidden="true"><circle cx="120" cy="120" r="94" stroke="currentColor" opacity=".12"/><circle cx="120" cy="120" r="64" stroke="currentColor" opacity=".2"/><path d="M27 99 99 27l114 114-72 72L27 99Z" stroke="currentColor" opacity=".2"/><path d="m75 96 45-26 45 26v49l-45 26-45-26V96Z" stroke="currentColor" strokeWidth="1.5"/><path d="m75 96 45 26 45-26m-45 26v49m0-101v25m-45 50 22-13m68 13-22-13" stroke="currentColor" strokeWidth="1.5"/><circle cx="120" cy="122" r="8" fill="currentColor"/><circle cx="120" cy="26" r="4" fill="currentColor"/><circle cx="202" cy="166" r="4" fill="currentColor"/><circle cx="38" cy="166" r="4" fill="currentColor"/></svg>;
}

export function Home({available}: {available: boolean}) {
  return <div className="product-home">
    <div className="home-kicker"><span className="status-dot"/>FREELM <span className="token-pill">$LLM</span></div>
    <div className="hero-grid"><div className="hero-copy"><h1>Your AI should<br/><span>be local.</span></h1><p>Your context. Your workspace. Your daily AI allowance. Hold $LLM, claim funded credits and put them to work.</p><div className="hero-actions"><a className="primary" href="/chat">Open workspace <span>↗</span></a><a className="secondary" href="/credits">View daily credits <span>→</span></a></div><div className="hero-caption">HOLD <span>/</span> CLAIM <span>/</span> CREATE</div></div><div className="context-visual"><div className="visual-top"><span>THE CONTEXT LAYER</span><span>01 / LLM</span></div><ContextMark/><div className="visual-bottom"><span>YOUR KNOWLEDGE</span><b>↓</b><span>A FOCUSED CONTEXT PACK</span></div><div className="visual-note">Prepared locally. Shared only when you send.</div></div></div>
    <div className="product-status"><span><i className={available?"status-dot":"status-dot muted-dot"}/>{available?"Workspace connected":"Private preview"}</span><span>Chat + API <b>·</b> one usage balance</span><a href="/credits">Explore holder access ↗</a></div>
    <div className="section-label"><span>BUILT AROUND YOUR WORK</span><span>01 — 03</span></div>
    <div className="product-grid"><a href="/chat"><span className="feature-number">01 / WORKSPACE</span><h2>Think it through.</h2><p>Research an idea, work through code or shape a draft in one conversation.</p><span className="feature-link">Open chat ↗</span></a><a href="/context"><span className="feature-number">02 / CONTEXT STUDIO</span><h2>Bring what matters.</h2><p>Prepare a text pack in your browser. Review repeated passages and inspect the actual size change.</p><span className="feature-link">Prepare context ↗</span></a><a href="/developers"><span className="feature-number">03 / DEVELOPER API</span><h2>Work in your tools.</h2><p>Connect supported text-chat clients with your own service key and the same usage balance.</p><span className="feature-link">Explore the API ↗</span></a></div>
    <ProductStory/>
    <footer className="product-footer"><span>FREELM</span><span>Context first. Clear accounting.</span><a href="/transparency">View funding & receipts ↗</a></footer>
  </div>;
}

export function ContextStudio({onUse}: {onUse: (text: string)=>void}) {
  const [source,setSource] = useState("");
  const [deduplicate,setDeduplicate] = useState(true);
  const [notice,setNotice] = useState("");
  const file = useRef<HTMLInputElement>(null);
  const result = useMemo(()=>packContext(source,deduplicate),[source,deduplicate]);
  const reduction = result.originalBytes ? Math.max(0,100*(1-result.packedBytes/result.originalBytes)) : 0;
  const tooLarge = result.packedBytes > MAX_CONTEXT_BYTES;
  const exportPack = () => {
    const url=URL.createObjectURL(new Blob([result.text],{type:"text/plain;charset=utf-8"}));
    const link=document.createElement("a"); link.href=url; link.download="local-context.txt"; link.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  return <div className="page context-studio"><header className="page-heading"><span className="eyebrow">CONTEXT STUDIO / LOCAL TOOL</span><h1>Less repetition.<br/>More of what matters.</h1><p>Bring your notes into one context pack. Exact duplicate paragraphs can be removed locally. Review the result before using it in a conversation.</p></header>
    <div className="context-privacy"><span className="status-dot"/><span>This tool runs in your browser. Text is not uploaded or used for training. Sending it in chat shares it with the serving provider.</span></div>
    <div className="context-controls"><button className="secondary" onClick={()=>file.current?.click()}>Import text ↗</button><input hidden ref={file} aria-label="Import context file" type="file" accept=".txt,.md,.json,.jsonl,text/plain,text/markdown,application/json" onChange={async e=>{const selected=e.target.files?.[0]; if(!selected)return;try{if(selected.size>100_000)throw new Error("Use a text file under 100 KB.");if(!/\.(txt|md|json|jsonl)$/i.test(selected.name))throw new Error("Choose a .txt, .md, .json or .jsonl file.");const text=await selected.text();if(text.includes("\0"))throw new Error("This file does not appear to be text.");setSource(text);setNotice("");}catch(error){setNotice(error instanceof Error?error.message:"Could not read this file.");}finally{e.target.value="";}}}/><button className="copy" onClick={()=>{setSource("Project: Build a wallet research assistant.\n\nUse only verified public transactions. Explain uncertainty.\n\nProject: Build a wallet research assistant.\n\nThe output should be a concise research brief with source links.");setNotice("Example text loaded. These are sample notes, not your data.");}}>Try sample notes</button><label className="context-toggle"><input type="checkbox" checked={deduplicate} onChange={e=>setDeduplicate(e.target.checked)}/>Remove exact duplicate paragraphs</label></div>
    {notice&&<p role="status" className="context-notice">{notice}</p>}
    <div className="context-editors"><label><span>SOURCE NOTES <small>{result.originalBytes.toLocaleString()} bytes</small></span><textarea aria-label="Source notes" value={source} maxLength={100_000} onChange={e=>{setSource(e.target.value);setNotice("");}} placeholder="Paste notes, a project brief or reference text…" spellCheck={false}/></label><label><span>CONTEXT PACK <small>{result.packedBytes.toLocaleString()} bytes</small></span><textarea aria-label="Context pack" readOnly value={result.text} placeholder="Your prepared context appears here." spellCheck={false}/></label></div>
    <div className="context-results"><div><strong>{reduction.toFixed(1)}%</strong><span>TEXT SIZE REDUCTION</span></div><div><strong>{result.removed}</strong><span>DUPLICATE PARAGRAPHS REMOVED</span></div><p>Measured UTF-8 bytes, not model tokens or cost savings. This tool does not summarize text or train a model. Review repeats before removing them; repetition can carry meaning.</p></div>
    {result.protectedCode&&<p className="context-notice">Fenced code detected. The source is preserved exactly, including repeats.</p>}
    {tooLarge&&<p role="alert" className="context-notice">This pack exceeds the 24 KB chat input limit. Shorten your notes before continuing.</p>}
    <div className="context-actions"><button className="primary" disabled={!source.trim()||tooLarge} onClick={()=>onUse(result.text)}>Use in a new chat →</button><button className="secondary" disabled={!source.trim()} onClick={exportPack}>Download context pack ↓</button><span>Review first. Nothing is sent automatically.</span></div>
  </div>;
}
