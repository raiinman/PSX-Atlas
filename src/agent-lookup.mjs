import fs from 'node:fs';import {fileURLToPath} from 'node:url';import {DatabaseSync} from 'node:sqlite';
const started=performance.now(),root=new URL('../',import.meta.url),read=p=>JSON.parse(fs.readFileSync(new URL(p,root),'utf8'));
const args=process.argv.slice(2),entities=read('agent/entities.json');
function section(id){const page=id.split('#')[0],card=read('agent/pages/'+page+'.json'),entry=card.sections.find(s=>s.id===id);if(!entry)throw Error('Unknown section: '+id);const fd=fs.openSync(new URL(card.records,root),'r');try{const b=Buffer.alloc(entry.bytes);fs.readSync(fd,b,0,b.length,entry.offset);return JSON.parse(b.toString());}finally{fs.closeSync(fd);}}
function output(value){console.log(JSON.stringify({...value,lookup_ms:Math.round((performance.now()-started)*100)/100},null,2));}
if(args[0]==='--section'){output({section:section(args[1])});process.exit(0);}
if(args[0]==='--page'){output({page:read('agent/pages/'+args[1]+'.json')});process.exit(0);}
const query=args.join(' ').trim();if(!query){console.error('Usage: node agent/lookup.mjs "DMA2" | "0x1F801810" | "texture cache"\n       node agent/lookup.mjs --section "section-id"\n       node agent/lookup.mjs --page "page-id"\nRequires Node.js 24+. No packages, server or internet.');process.exit(1);}
const normalize=s=>s.toLowerCase().replace(/0x([a-f\d]{8})\b|\b([a-f\d]{8})h\b/g,(_,a,b)=>a||b).replace(/[^a-z\d]+/g,' ').trim();
const q=normalize(query),stop=new Set('what where does do is are the a an it this that to from how which me tell goes go connects connect connected with and in of for find show'.split(' '));
const tokens=q.split(' ').filter(t=>!stop.has(t));
const matches=entities.filter(e=>e.aliases.some(a=>{const v=normalize(a);return q===v||(' '+q+' ').includes(' '+v+' ');})).sort((a,b)=>Math.max(...b.aliases.filter(x=>q.includes(normalize(x))).map(x=>x.length),0)-Math.max(...a.aliases.filter(x=>q.includes(normalize(x))).map(x=>x.length),0)).slice(0,3);
const symbols=read('agent/symbols.json');let address=tokens.find(t=>/^[a-f\d]{8}$/.test(t));if(address){const n=parseInt(address,16);if(n>=0x80000000&&n<0xc0000000)address=(n&0x1fffffff).toString(16).padStart(8,'0');}
const allRefs=address?(symbols[address]||[]):[],refs=allRefs.slice(0,12).map(ref=>{const s=section(ref.section_id);return {...ref,local_url:s.local_url,source_url:s.source_url};});
const db=new DatabaseSync(fileURLToPath(new URL('data/reference.sqlite',root)),{readOnly:true});let hits=[];
try{if(tokens.length){const terms=tokens.map(t=>'"'+t.replaceAll('"','')+'"');const sql="SELECT sections.id,sections.page_id,sections.heading,sections.local_url,sections.source_url,snippet(search,3,'[',']','…',48) AS excerpt FROM search JOIN sections ON sections.id=search.id WHERE search MATCH ? ORDER BY rank LIMIT 6";hits=db.prepare(sql).all(terms.join(' AND '));if(!hits.length&&terms.length>1)hits=db.prepare(sql).all(terms.join(' OR '));}}finally{db.close();}
output({query,entities:matches,symbol:address?{address:'0x'+address,references:refs,total_references:allRefs.length}:undefined,hits,next:'Read a matching section with --section ID, or its topic card with --page PAGE_ID. Connections include their evidence and relation type. Explicit hyperlinks indicate navigation only.'});
