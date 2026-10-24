import {DatabaseSync} from 'node:sqlite';
const query=process.argv[2];if(!query){console.error('Usage: node scripts/query.mjs "DMA2" [limit]');process.exit(1);}
const limit=Number(process.argv[3]||10);if(!Number.isInteger(limit)||limit<1||limit>1000)throw Error('Limit must be 1–1000');
const db=new DatabaseSync(new URL('../offline/data/reference.sqlite',import.meta.url),{readOnly:true});
try{const rows=db.prepare("SELECT sections.id,sections.heading,sections.local_url,sections.source_url,snippet(search,3,'[',']','…',40) AS excerpt FROM search JOIN sections ON sections.id=search.id WHERE search MATCH ? ORDER BY rank LIMIT ?").all(query,limit);console.log(JSON.stringify(rows,null,2));}catch(e){console.error('Invalid FTS5 query: '+e.message);process.exitCode=1;}finally{db.close();}
