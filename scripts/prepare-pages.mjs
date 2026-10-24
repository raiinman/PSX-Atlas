import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {unzipSync} from 'fflate';
import {load} from 'cheerio';

const base='https://raiinman.github.io/PSX-Atlas/';
const zip=fs.readFileSync('_release/PSX-Atlas-Offline.zip');
const digest=crypto.createHash('sha256').update(zip).digest('hex');
if(!fs.readFileSync('_release/PSX-Atlas-Offline.zip.sha256','utf8').startsWith(digest+' '))throw Error('Pages ZIP checksum failed');
const entries=unzipSync(zip),checks=JSON.parse(Buffer.from(entries['data/checksums.json']));
for(const item of checks)if(!entries[item.file]||crypto.createHash('sha256').update(entries[item.file]).digest('hex')!==item.sha256)throw Error('Pages file checksum failed: '+item.file);
const verified=JSON.parse(Buffer.from(entries['data/verification.json']));
if(!verified.browser.offline_file_protocol||verified.errors.length)throw Error('Unverified Pages candidate');
const root=path.resolve('_site');
if(fs.existsSync(root))throw Error('Pages staging directory must be fresh');
fs.mkdirSync(root);
const urls=[];
for(const [name,bytes]of Object.entries(entries)){
 if(name.endsWith('/'))continue;
 const target=path.resolve(root,name);
 if(!target.startsWith(root+path.sep)||/[\\:\0]/.test(name))throw Error('Invalid Pages archive path');
 fs.mkdirSync(path.dirname(target),{recursive:true});
 let output=bytes;
 if(name.endsWith('.html')){
  const $=load(Buffer.from(bytes).toString('utf8'));
  const url=new URL(name,base).href;
  $('head').append(`<link rel="canonical" href="${url}">`);
  $('.offline-badge').text('● LOCAL DATA');
  output=$.html();urls.push(url);
 }
 fs.writeFileSync(target,output);
}
fs.writeFileSync(root+'/.nojekyll','');
fs.writeFileSync(root+'/robots.txt','User-agent: *\nAllow: /\nSitemap: '+base+'sitemap.xml\n');
fs.writeFileSync(root+'/sitemap.xml','<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+urls.map(url=>'<url><loc>'+url+'</loc></url>').join('')+'</urlset>');
console.log('Prepared verified Atlas for Pages: '+urls.length+' HTML pages.');
