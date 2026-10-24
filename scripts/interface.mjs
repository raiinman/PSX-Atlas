import fs from 'node:fs';import path from 'node:path';import {load} from 'cheerio';
export function finishInterface({out,meta,agentManifest}){
 const files=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(d,e.name)):[path.join(d,e.name)]);
 for(const file of files(out).filter(p=>p.endsWith('.html'))){
 const $=load(fs.readFileSync(file,'utf8')),r=$('body').attr('data-root'),agent=file===path.join(out,'agents.html');
 $('head').append(`<link rel="stylesheet" href="${r}assets/armor.css"><link rel="alternate" type="text/markdown" href="${r}agent/START.md" title="Agent entry point"><link rel="alternate" type="application/json" href="${r}agent/manifest.json" title="Agent manifest">`);
 $('script[src$="minisearch.js"]').remove();$('.edition').replaceWith(`<nav class="view-switch" aria-label="Reference view"><a ${!agent?'aria-current="page"':''} href="${r}index.html">Human view</a><a ${agent?'aria-current="page"':''} href="${r}agents.html">Agent view</a></nav>`);
 $('.source-notice').remove();$('.sidebar-foot').html(`<div class="snapshot-label">PSX-SPX development snapshot</div><div>${meta.captured_at.slice(0,10)} · ${meta.source_commit.slice(0,8)}</div><div>Original text and attribution preserved.</div><details class="credit-details"><summary>Credits & source notes</summary><p>Source text: Martin “nocash” Korth and PSX-SPX contributors.</p><p>Atlas, search and machine index are added navigation tools. No new license is asserted over the source material.</p><p>${meta.source_notice}</p><a href="${r}pages/aboutcredits/index.html">Original credits</a><a href="${r}pages/index.html">Source & rights statement</a><a data-external="https://psx-spx.consoledev.net/" href="#external-reference">Stable-version citation</a><a href="${r}licenses/MiniSearch-MIT.txt">MiniSearch · MIT license</a></details>`);
 if(!agent)$('footer').html(`<a href="${r}agents.html">Open the agent reference</a>`);
 if(agent){$('h1').text('Find the source. Follow the connection.');$('.lead').text('A compact map for agents. Route to the topic, inspect its links, then retrieve only the exact section you need.');
 $('.lead').after(`<section class="agent-entry"><div><span class="agent-tag">Machine entry point</span><h2>One small file to get oriented.</h2><p><a href="agent/START.md">agent/START.md</a> explains the retrieval path. The topic map contains ${meta.page_count} routes; full text stays in separate records.</p><div class="agent-actions"><a class="primary-link" href="agent/START.md">Read agent entry point</a><button id="copy-agent-start">Copy handoff instructions</button></div></div><div><pre><code>node agent/lookup.mjs "DMA2"
node agent/lookup.mjs "0x1F801810"
node agent/lookup.mjs "where does DMA3 go"
node agent/lookup.mjs "texture cache"</code></pre><p class="runtime-note">Command lookup requires Node.js 24+. Plain-file routing and the human website require no runtime.</p></div></section><section class="routing-strip" aria-label="Agent retrieval path"><div><b>Route</b><a href="agent/map.json">${meta.page_count}-topic map</a></div><span>→</span><div><b>Connect</b><a href="agent/entities.json">${agentManifest.entity_count} entities & typed links</a></div><span>→</span><div><b>Locate</b><a href="agent/symbols.json">${agentManifest.symbol_count} hex symbols</a></div><span>→</span><div><b>Read</b><a href="agent/pages/ps1--system--dmachannels.json">Exact section & citation</a></div></section>`);
 // Original upstream attribution lives in the source. Keep added provenance together in the sidebar.
 $('.agent-grid section').filter((i,e)=>$(e).find('h2').text()==='Scope and attribution').find('p').eq(1).remove();
 }
 // Structured discovery metadata without executing scripts or crawling UI controls.
 $('head').append(`<meta name="agent-entry" content="${r}agent/START.md"><meta name="agent-manifest" content="${r}agent/manifest.json">`);
 fs.writeFileSync(file,$.html());
 }
}
