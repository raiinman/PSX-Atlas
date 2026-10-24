import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {load} from 'cheerio';
const base='https://psx-spx.consoledev.net/dev/';
const root='archive';fs.mkdirSync(root,{recursive:true});
const records=[], failures=[];
async function get(url,file){
  const dest=path.join(root,file);fs.mkdirSync(path.dirname(dest),{recursive:true});
  if(!fs.existsSync(dest)){
    let error;
    for(let n=0;n<3;n++)try{const r=await fetch(url);if(!r.ok)throw Error(`HTTP ${r.status}`);fs.writeFileSync(dest,Buffer.from(await r.arrayBuffer()));error=null;break;}catch(e){error=e;}
    if(error){failures.push({url,error:String(error)});return null;}
  }
  const bytes=fs.readFileSync(dest);records.push({url,file,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});return bytes;
}
const sitemap=(await get(base+'sitemap.xml','sitemap.xml')).toString();
// /dev emits root canonical locations. Fetch the corresponding /dev pages explicitly.
const urls=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1].replace('https://psx-spx.consoledev.net/',''));
const pages=[], media=new Map();
let index=0;
await Promise.all(Array.from({length:5},async()=>{
 while(index<urls.length){const route=urls[index++];const file='html/'+(route||'')+'index.html';const bytes=await get(base+route,file);if(!bytes)continue;
 const $=load(bytes.toString()),article=$('article.md-content__inner');
 if(!article.length){failures.push({url:base+route,error:'Missing main article'});continue;}
 article.find('[src],object[data]').each((i,el)=>{const val=$(el).attr('src')||$(el).attr('data');if(!val||/^(data:|#)/.test(val))return;const u=new URL(val,base+route);if(u.origin===new URL(base).origin){const rel=u.pathname.replace(/^\/dev\//,'');media.set(u.href,'assets/'+rel);}});
 article.find('a[href]').each((i,el)=>{const u=new URL($(el).attr('href'),base+route);if(u.origin===new URL(base).origin&&/\.(pdf|png|jpe?g|svg|gif|webp|zip|txt)$/i.test(u.pathname)){media.set(u.href,'assets/'+u.pathname.replace(/^\/dev\//,''));}});
 pages.push({route,file,title:article.find('h1').first().text().trim(),canonical:$('link[rel=canonical]').attr('href'),source_url:base+route});
 console.log(`Captured ${pages.length}/${urls.length}: ${route||'Home'}`);
 }
}));
await get(base+'css/extra.css','extra.css');
await get(base+'search/search_index.json','original-search-index.json');
// The downloadable PDF is linked from the homepage even when PDF generation is disabled upstream.
for(const [url,file] of media)await get(url,file);
pages.sort((a,b)=>a.route.localeCompare(b.route));
fs.writeFileSync(root+'/inventory.json',JSON.stringify({base,captured_at:new Date().toISOString(),pages,files:records,failures},null,2));
console.log(JSON.stringify({pages:pages.length,files:records.length,failures},null,2));
if(failures.some(f=>!f.url.endsWith('.pdf')))process.exitCode=1;
