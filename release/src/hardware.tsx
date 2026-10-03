import {useState} from "react";

const groups = {
  compute: [
    ["GPU ARRAY", "4× NVIDIA GeForce RTX 5090", "32GB GDDR7 per GPU · 128GB aggregate VRAM"],
    ["PROCESSOR", "AMD Threadripper PRO 7975WX", "32 cores · 64 threads"],
    ["MAINBOARD", "ASUS Pro WS WRX90E-SAGE SE", "sTR5 workstation platform"],
    ["SYSTEM MEMORY", "256GB DDR5 ECC RDIMM", "8× 32GB modules"],
    ["STORAGE", "2× 4TB PCIe 5.0 NVMe", "8TB raw capacity before formatting or redundancy"],
    ["NETWORK", "NVIDIA / Mellanox ConnectX", "25GbE adapter · exact model to be specified"],
  ],
  facility: [
    ["POWER SYSTEM", "3,000W+ server-grade supply", "Final capacity and headroom depend on measured system load"],
    ["ENCLOSURE", "4U/5U rack or purpose-built frame", "Four-card fit, risers and cable clearance require exact chassis selection"],
    ["GPU COOLING", "Dedicated intake + exhaust", "High-static-pressure fans across all four GPUs"],
    ["CPU COOLING", "sTR5-compatible cooler", "Sized for the Threadripper PRO thermal load"],
    ["ELECTRICAL", "200–240V dedicated service", "Professionally sized for continuous finished-server load"],
    ["BACKUP POWER", "240V online UPS", "Double-conversion · capacity and runtime sized to the finished server"],
  ],
};

export function HardwareSetup(){
  const [tab,setTab]=useState<"compute"|"facility">("compute");
  return <section className="story-section our-setup" id="our-setup" data-chapter>
    <div className="section-label"><span>03 / OUR HARDWARE CONFIGURATION</span><span>HARDWARE ONLINE · MODEL INTEGRATION NEXT</span></div>
    <div className="story-heading"><h2>Four GPUs.<br/><span>One focused stack.</span></h2><p>A dedicated NVIDIA compute configuration for the FreeLM serving roadmap. Our four-GPU server is assembled and running. Next comes the model serving layer: connecting inference, measuring performance and opening metered access.</p></div>
    <div className="hardware-metrics"><div><strong>4× 5090</strong><span>NVIDIA GPU ARRAY</span></div><div><strong>128GB</strong><span>AGGREGATE VRAM · 4× 32GB</span></div><div><strong>256GB</strong><span>ECC SYSTEM MEMORY</span></div><div><strong>25GbE</strong><span>NETWORK ADAPTER</span></div></div>
    <div className="setup-toggle" role="group" aria-label="Hardware configuration"><button aria-pressed={tab==="compute"} className={tab==="compute"?"selected":""} onClick={()=>setTab("compute")}>Compute hardware</button><button aria-pressed={tab==="facility"} className={tab==="facility"?"selected":""} onClick={()=>setTab("facility")}>Power & cooling</button></div>
    <div className="hardware-specs" aria-live="polite">{groups[tab].map(([label,value,note])=><article key={label}><small>{label}</small><h3>{value}</h3><p>{note}</p></article>)}</div>
    <div className="setup-notes"><p><b>How four GPUs work together</b>Each card has its own 32GB memory. Smaller models can run as independent replicas; larger models need supported sharding across cards. The 128GB total is not a single unified memory pool. The RTX 5090 has no NVLink, so topology and inter-GPU communication matter.</p><p><b>From hardware to an answer</b>Proposed serving path: authenticated API → credit reservation → request queue → a compatible vLLM runtime → usage settlement. Model weights, precision, cache isolation and GPU layout will be selected through workload benchmarks before inference opens.</p></div>
    <div className="hardware-sources"><a href="https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/" target="_blank" rel="noreferrer">NVIDIA GPU specs ↗</a><a href="https://www.asus.com/us/motherboards-components/motherboards/workstation/pro-ws-wrx90e-sage-se/techspec/" target="_blank" rel="noreferrer">ASUS platform specs ↗</a><a href="https://docs.vllm.ai/en/latest/serving/online_serving/" target="_blank" rel="noreferrer">Serving runtime reference ↗</a></div>
  </section>;
}
