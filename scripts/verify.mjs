import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import crypto from 'node:crypto';import {pathToFileURL,fileURLToPath} from 'node:url';
import {load} from 'cheerio';import {launchBrowser} from './browser.mjs';import {DatabaseSync} from 'node:sqlite';
fs.mkdirSync('evidence',{recursive:true});
const dir=path.resolve('offline'),report={at:new Date().toISOString(),static:{},browser:{},source_anchor_issues:[],errors:[]};
const inv=JSON.parse(fs.readFileSync('archive/inventory.json')),catalog=JSON.parse(fs.readFileSync(dir+'/data/catalog.json'));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function walk(folder){return fs.readdirSync(folder,{withFileTypes:true}).flatMap(d=>d.isDirectory()?walk(path.join(folder,d.name)):[path.join(folder,d.name)]);}
const htmlFiles=walk(dir).filter(f=>f.endsWith('.html'));const docs=new Map(htmlFiles.map(f=>[path.resolve(f),load(fs.readFileSync(f,'utf8'))]));
for(const [file,$] of docs){
 assert.equal($('h1').length,1,'One h1 in '+file);
 $('script[src],link[rel=stylesheet],img[src],object[data]').each((i,el)=>{const value=$(el).attr('src')||$(el).attr('href')||$(el).attr('data');assert.ok(!/^https?:|^\/\//.test(value),'Remote runtime resource in '+file);if(!value.startsWith('data:'))assert.ok(fs.existsSync(fileURLToPath(new URL(value,pathToFileURL(file)))),'Missing resource '+value+' in '+file);});
 $('a[href]').each((i,el)=>{const a=$(el),href=a.attr('href');if(a.attr('data-external')||/^(https?:|mailto:|tel:|data:)/.test(href))return;const u=new URL(href,pathToFileURL(file)),target=fileURLToPath(u);assert.ok(fs.existsSync(target),'Broken link '+href+' from '+file);if(u.hash&&target.endsWith('.html')){const to=docs.get(path.resolve(target));const anchor=decodeURIComponent(u.hash.slice(1));if(!to?.('[id]').toArray().some(e=>to(e).attr('id')===anchor))report.source_anchor_issues.push({file:path.relative(dir,file),href});}});
}
let preCount=0,svgCount=0;
for(const p of inv.pages){const src=load(fs.readFileSync('archive/'+p.file,'utf8'))('article.md-content__inner'),dest=docs.get(path.resolve(dir,'pages',p.route,'index.html'))('.reference');
 src.find('[data-cfemail]').each((i)=>{const e=src.find('[data-cfemail]').eq(i),hex=e.attr('data-cfemail'),key=parseInt(hex.slice(0,2),16),email=Buffer.from([...Buffer.from(hex.slice(2),'hex')].map(b=>b^key)).toString('utf8');e.text(email);});
 const sourcePre=src.find('pre').map((i,e)=>load(e).text()).get(),destPre=dest.find('pre').map((i,e)=>load(e).text()).get();assert.deepEqual(destPre,sourcePre,'Exact preformatted content '+p.route);preCount+=sourcePre.length;
 assert.equal(dest.find('svg').length,src.find('svg').length,'Diagram count '+p.route);svgCount+=src.find('svg').length;
 const normalized=e=>{const c=e.clone();c.find('script,.md-content__button,.headerlink,[data-cfemail]').remove();return c.text().replace(/\s+/g,' ').trim();};
 // Email text is restored offline, so compare the remaining source separately.
 const d=dest.clone();d.find('a[href^="mailto:"]').remove();const s=src.clone();s.find('a:has([data-cfemail])').remove();assert.equal(normalized(d),normalized(s),'Complete article text '+p.route);
}
for(const file of walk('upstream/docs'))assert.equal(hash(fs.readFileSync(file)),hash(fs.readFileSync(path.join(dir,'markdown',path.relative('upstream/docs',file)))),'Source bytes '+file);
for(const f of inv.files)assert.equal(hash(fs.readFileSync('archive/'+f.file)),f.sha256,'Capture integrity '+f.file);
const db=new DatabaseSync(dir+'/data/reference.sqlite',{readOnly:true});assert.equal(db.prepare('SELECT count(*) AS n FROM pages').get().n,inv.pages.length);assert.equal(db.prepare('PRAGMA integrity_check').get().integrity_check,'ok');assert.ok(db.prepare("SELECT count(*) AS n FROM search WHERE search MATCH 'DMA2'").get().n>0);db.close();
report.static={html_pages:htmlFiles.length,reference_pages:inv.pages.length,exact_preformatted_blocks:preCount,preserved_svg:svgCount,all_source_files_byte_identical:true,capture_hashes_verified:inv.files.length,all_local_files_resolve:true,external_runtime_resources:0};
console.log('Static corpus and link checks passed. Original anchor gaps: '+report.source_anchor_issues.length);
const browser=await launchBrowser();
try{
 const context=await browser.newContext({viewport:{width:1440,height:1000},offline:true,reducedMotion:'reduce'}),page=await context.newPage(),remote=[];
 page.on('pageerror',e=>report.errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))remote.push(r.url());});
 const goto=async p=>{await page.goto(pathToFileURL(path.join(dir,p)).href);assert.deepEqual(report.errors,[],'No JavaScript errors after navigating to '+p);};
 await goto('index.html');
 assert.equal(await page.getByRole('tablist',{name:'Project controls'}).getByRole('tab').count(),5);
 await page.locator('#control-query').fill('texture cache');await page.getByRole('button',{name:'Search reference',exact:true}).click();await page.waitForFunction(()=>document.querySelectorAll('#results .result').length>0);assert.equal(await page.locator('#query').inputValue(),'texture cache');await page.keyboard.press('Escape');
 await page.getByRole('tab',{name:/^Reviews/}).click();assert.ok(await page.locator('#control-panel-reviews').isVisible());const review=JSON.parse(fs.readFileSync(dir+'/data/update-review.json'));assert.equal(await page.locator('.pending-evidence').count(),review.manual_evidence.length);assert.equal(await page.locator('#control-panel-reviews button').count(),0,'Dashboard cannot approve evidence');
 await page.getByRole('tab',{name:'Updates',exact:true}).click();assert.match(await page.locator('#control-panel-updates').innerText(),/not a live network check/);await page.keyboard.press('ArrowLeft');assert.equal(await page.getByRole('tab',{name:'Research',exact:true}).getAttribute('aria-selected'),'true');
 await page.getByRole('tab',{name:'Downloads',exact:true}).click();assert.equal(await page.getByRole('link',{name:'Download verified ZIP (internet)',exact:true}).getAttribute('href'),'https://github.com/raiinman/PSX-Atlas/releases/latest/download/PSX-Atlas-Offline.zip');
 await page.getByRole('tab',{name:'GitHub',exact:true}).click();assert.equal(await page.getByRole('link',{name:'Read the GitHub repository',exact:true}).getAttribute('href'),'https://github.com/raiinman/PSX-Atlas');
 for(const key of ['reviews','updates','downloads']){await page.locator('#control-tab-'+key).click();await page.setViewportSize({width:320,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1),'Control panel fits mobile: '+key);}
 await page.setViewportSize({width:1440,height:1000});await page.getByRole('tab',{name:'Research',exact:true}).click();
 const generatedHardware=JSON.parse(fs.readFileSync(dir+'/data/graph.json')).hardware,originalHardware=JSON.parse(fs.readFileSync('src/hardware.json'));assert.deepEqual(generatedHardware.nodes,originalHardware.nodes);assert.deepEqual(generatedHardware.edges.map(({review_status,evidence_hash,...edge})=>edge),originalHardware.edges);assert.deepEqual(generatedHardware.journeys,originalHardware.journeys);
 report.browser.control_center='Offline search, five panels, keyboard tabs, mobile layouts, source review and download/repository links passed; hardware model unchanged';
 assert.equal(await page.locator('#hardware-map .map-node').count(),14);
 await page.locator('[data-component=gpu]').click();assert.equal(await page.locator('#inspector h3').innerText(),'GPU');
 await page.locator('[data-journey=disc]').click();assert.ok((await page.locator('#journey').innerText()).includes('DMA3'));
 await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:'evidence/atlas-desktop.png',fullPage:false});
 await page.locator('#search-open').click();await page.locator('#query').fill('DMA2');await page.waitForFunction(()=>document.querySelectorAll('#results .result').length>0);assert.ok((await page.locator('#search-status').innerText()).includes('matching'));
 await page.screenshot({path:'evidence/search-offline.png'});await page.locator('#query').fill('"texture cache"');await page.waitForFunction(()=>document.querySelector('#results')?.textContent.toLowerCase().includes('texture cache'));
 await page.locator('#search-category').selectOption('Graphics');assert.ok((await page.locator('.result .result-meta').allTextContents()).every(t=>t.startsWith('Graphics')));
 await page.locator('#query').fill('zzzznonexistent987');await page.waitForFunction(()=>document.querySelector('#search-status').textContent.startsWith('No matching'));
 await page.keyboard.press('Escape');assert.equal(await page.locator('#search-dialog').evaluate(e=>e.open),false);assert.equal(await page.evaluate(()=>document.activeElement.id),'search-open');
 await page.keyboard.press('/');assert.equal(await page.locator('#search-dialog').evaluate(e=>e.open),true);await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'search-category');await page.keyboard.press('Tab');assert.ok(await page.evaluate(()=>document.querySelector('#search-dialog').contains(document.activeElement)));await page.keyboard.press('Escape');
 await page.locator('#library-filter').fill('DMA');assert.equal(await page.locator('#library-grid a:visible').count(),2);await page.locator('#library-filter').fill('');
 report.browser.search='term, exact phrase, category filter, empty state, keyboard shortcut and modal focus passed';
 await goto('pages/ps1/system/dmachannels/index.html');const widget=page.locator('.bit-widget').first();await widget.locator('summary').click();await widget.locator('.hex-value').fill('FFFFFFFF');assert.equal(await widget.locator('.bits [aria-pressed=true]').count(),32);await widget.locator('[data-bit="31"]').click();assert.equal(await widget.locator('.hex-value').inputValue(),'0x7FFFFFFF');await widget.locator('.hex-value').fill('badxyz');assert.ok((await widget.locator('.bit-error').innerText()).includes('hexadecimal'));
 await page.screenshot({path:'evidence/register-inspector.png'});const zoom=page.locator('.figure-zoom').first();if(await zoom.count()){await zoom.click();assert.equal(await page.locator('#figure-dialog').evaluate(e=>e.open),true);await page.keyboard.press('Escape');assert.equal(await zoom.evaluate(e=>e===document.activeElement),true);}
 await goto('pages/ps1/gpu/status-register/index.html');const gpuFields=page.locator('.bit-widget').first();await gpuFields.locator('summary').click();assert.match(await gpuFields.locator('.decoded').innerText(),/HDS\s+Horizontal/);assert.match(await gpuFields.locator('.decoded').innerText(),/DMD\s+DMA Direction/);
 report.browser.register_inspector='32-bit extraction, bit toggle, single-space field ranges and invalid-input handling passed';
 await goto('pages/ps1/gpu/index.html');const labels=page.locator('.tabbed-labels label');assert.equal(await labels.count(),2);await labels.nth(1).click();assert.equal(await page.locator('.tabbed-block:visible').count(),1);assert.equal(await labels.nth(1).getAttribute('aria-selected'),'true');await labels.nth(0).focus();await page.keyboard.press('Enter');assert.equal(await labels.nth(0).getAttribute('aria-selected'),'true');
 report.browser.gpu_tabs='both GPU variants reachable by pointer and keyboard';
 await goto('pages/index.html');await page.locator('.reference [data-external]').first().click();assert.equal(await page.locator('#external-dialog').evaluate(e=>e.open),true);assert.ok((await page.locator('#external-url').inputValue()).startsWith('http'));await page.keyboard.press('Escape');
 assert.equal(await page.locator('.source-notice').count(),0);await page.locator('.credit-details summary').click();assert.ok((await page.locator('.credit-details').innerText()).includes('Martin'));assert.ok((await page.locator('.credit-details').innerText()).includes('April 2026'));
 await goto('agents.html');assert.ok(await page.locator('.agent-entry').isVisible());assert.ok((await page.locator('.view-switch [aria-current=page]').innerText()).includes('Agent'));assert.equal(await page.locator('meta[name=agent-entry]').getAttribute('content'),'agent/START.md');
 await goto('index.html');
 report.browser.responsive={};for(const width of [320,768,1024,1440]){await page.setViewportSize({width,height:900});const w=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));assert.ok(w.scroll<=w.client+1,'No horizontal overflow at '+width+': '+JSON.stringify(w));report.browser.responsive[width]='passed';if(width===320){await page.locator('#menu').click();assert.equal(await page.locator('#menu').getAttribute('aria-expanded'),'true');await page.locator('#menu').click();await page.screenshot({path:'evidence/atlas-mobile.png'});}}
 await page.locator('#theme').click();assert.ok(await page.locator('body').evaluate(e=>e.classList.contains('dark')));await page.screenshot({path:'evidence/atlas-dark.png'});
 report.browser.accessibility=[];for(const file of ['index.html','agents.html','pages/ps1/system/dmachannels/index.html','pages/ps1/gpu/index.html']){await goto(file);await page.evaluate(fs.readFileSync('node_modules/axe-core/axe.min.js','utf8'));const result=await page.evaluate(()=>axe.run({runOnly:{type:'tag',values:['wcag2a','wcag2aa']}}));const violations=result.violations.map(v=>({id:v.id,impact:v.impact,targets:v.nodes.map(n=>n.target)}));report.browser.accessibility.push({file,violations});assert.deepEqual(violations,[],'Automated accessibility scan '+file);}
 report.browser.external_requests=remote;assert.deepEqual(remote,[],'No internet requests during offline interactions');assert.deepEqual(report.errors,[],'No JavaScript errors');report.browser.offline_file_protocol=true;
 await context.close();
}finally{await browser.close();fs.writeFileSync('evidence/verification.json',JSON.stringify(report,null,2));if(report.browser.accessibility)fs.writeFileSync('evidence/accessibility.json',JSON.stringify(report.browser.accessibility,null,2));}
console.log(JSON.stringify(report,null,2));
