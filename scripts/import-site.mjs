import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {load} from 'cheerio';
const site=path.resolve(process.argv[2]||'rendered'),root='archive',base='https://psx-spx.consoledev.net/dev/';fs.mkdirSync(root,{recursive:true});
const files=[],failures=[],pages=[],media=new Map();const save=(source,rel,url)=>{const dest=path.join(root,rel);fs.mkdirSync(path.dirname(dest),{recursive:true});const bytes=fs.readFileSync(source);fs.writeFileSync(dest,bytes);files.push({url,file:rel,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});return bytes;};
const sitemap=save(path.join(site,'sitemap.xml'),'sitemap.xml',base+'sitemap.xml').toString();
const routes=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>new URL(m[1]).pathname.replace(/^\/(?:dev\/)?/,''));
for(const route of routes){const file='html/'+route+'index.html',bytes=save(path.join(site,route,'index.html'),file,base+route),$=load(bytes.toString()),article=$('article.md-content__inner');if(!article.length)throw Error('Missing article '+route);
 pages.push({route,file,title:article.find('h1').first().text().trim(),canonical:$('link[rel=canonical]').attr('href'),source_url:base+route});
 article.find('[src],object[data],a[href]').each((i,el)=>{const e=$(el),value=e.attr('src')||e.attr('data')||e.attr('href');if(!value||/^(data:|#|mailto:)/.test(value))return;const u=new URL(value,base+route);if(u.origin!==new URL(base).origin)return;const rel=u.pathname.replace(/^\/(?:dev\/)?/,'');if(e.attr('href')&&!/\.(pdf|png|jpe?g|svg|gif|webp|zip|txt)$/i.test(rel))return;media.set(rel,u.href);});
}
for(const [rel,url]of media){const file=path.resolve(site,rel);if(!file.startsWith(site+path.sep))throw Error('Media outside rendered tree');if(fs.existsSync(file))save(file,'assets/'+rel,url);else failures.push({url,error:'Missing from pinned source render'});}
save(path.join(site,'css/extra.css'),'extra.css',base+'css/extra.css');save(path.join(site,'search/search_index.json'),'original-search-index.json',base+'search/search_index.json');
const sha=process.env.ATLAS_SOURCE_COMMIT;if(!/^[a-f0-9]{40}$/.test(sha||''))throw Error('ATLAS_SOURCE_COMMIT must identify the exact rendered revision');
fs.writeFileSync(root+'/inventory.json',JSON.stringify({base,captured_at:new Date().toISOString(),source_commit:sha,acquisition:'local render from pinned upstream commit',pages:pages.sort((a,b)=>a.route.localeCompare(b.route)),files,failures},null,2));
const fatal=failures.filter(f=>!f.url.endsWith('.pdf'));if(fatal.length)throw Error(JSON.stringify(fatal));console.log('Imported '+pages.length+' pages from pinned render '+sha);
