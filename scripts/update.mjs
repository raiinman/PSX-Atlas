import fs from 'node:fs';import path from 'node:path';import {spawnSync,execFileSync} from 'node:child_process';import {writeReview} from './review.mjs';import {promoteDirectory} from './transaction.mjs';
const root=process.cwd(),policy=JSON.parse(fs.readFileSync('state/update-policy.json')),flags=new Set(process.argv.slice(2));
const run=(cmd,args,cwd=root,extra={})=>{const p=spawnSync(cmd,args,{cwd,stdio:'inherit',windowsHide:true,env:{...process.env,...extra}});if(p.status!==0)throw Error(cmd+' failed with status '+p.status);};
const sha=process.env.ATLAS_UPSTREAM_SHA||execFileSync('git',['ls-remote',policy.upstream,'refs/heads/'+policy.branch],{encoding:'utf8'}).split(/\s/)[0];if(!/^[a-f0-9]{40}$/.test(sha))throw Error('Invalid upstream commit');
const stage=path.resolve('_updates',sha.slice(0,12)+'-'+Date.now());fs.mkdirSync(stage,{recursive:true});for(const p of ['scripts','src'])fs.cpSync(p,path.join(stage,p),{recursive:true});for(const p of ['package.json','package-lock.json'])fs.copyFileSync(p,path.join(stage,p));fs.mkdirSync(stage+'/evidence');
fs.symlinkSync(path.join(root,'node_modules'),stage+'/node_modules',process.platform==='win32'?'junction':'dir');
fs.writeFileSync('_updates/last-attempt.json',JSON.stringify({stage,source_commit:sha,status:'building',at:new Date().toISOString()},null,2));
try{
 run('git',['clone','--no-checkout',policy.upstream,'upstream'],stage);run('git',['fetch','origin','+refs/heads/*:refs/remotes/origin/*','--tags'],stage+'/upstream');run('git',['checkout','--detach',sha],stage+'/upstream');
 const python=process.env.ATLAS_PYTHON||(process.platform==='win32'?path.join(root,'.venv-updater/Scripts/python.exe'):path.join(root,'.venv-updater/bin/python'));if(!fs.existsSync(python)&&!process.env.ATLAS_PYTHON)throw Error('Set ATLAS_PYTHON to Python with requirements-upstream.txt installed');
 // PDF generation is optional upstream; the archive retains HTML and print support without native PDF libraries.
 const config=fs.readFileSync(stage+'/upstream/mkdocs.yml','utf8').replace(/^  - with-pdf:\r?\n(?:^    .*\r?\n)*/gm,'');fs.writeFileSync(stage+'/upstream/.atlas-mkdocs.yml',config);
 run(python,['-m','mkdocs','build','--config-file','upstream/.atlas-mkdocs.yml','--site-dir',stage+'/rendered'],stage,{ENABLE_PDF_EXPORT:'0'});
 run(process.execPath,['scripts/import-site.mjs',stage+'/rendered'],stage,{ATLAS_SOURCE_COMMIT:sha});run(process.execPath,['scripts/build.mjs'],stage);
 const baselinePath=process.env.ATLAS_BASELINE||path.join(root,'state/source-snapshot.json'),previous=JSON.parse(fs.readFileSync(baselinePath)),accepted=JSON.parse(fs.readFileSync('state/accepted-evidence.json')).edges;
 const {snapshot,report}=writeReview(stage,previous,accepted);
 // Evidence status is carried into the generated graph and agent model without changing source connections.
 const reviewState={...report,manual_evidence:report.manual_evidence};fs.writeFileSync(stage+'/review-state.json',JSON.stringify(reviewState));
 run(process.execPath,['scripts/annotate-review.mjs'],stage);run(process.execPath,['scripts/verify.mjs'],stage);run(process.execPath,['scripts/verify-agent.mjs'],stage);run(process.execPath,['scripts/test-updater.mjs'],stage);run(process.execPath,['scripts/package.mjs'],stage);
 const zip=fs.readFileSync(stage+'/PSX-Atlas-Offline.zip');const crypto=await import('node:crypto');fs.writeFileSync(stage+'/PSX-Atlas-Offline.zip.sha256',crypto.createHash('sha256').update(zip).digest('hex')+'  PSX-Atlas-Offline.zip\n');fs.writeFileSync(stage+'/source-snapshot.json',JSON.stringify(snapshot,null,2));fs.copyFileSync(stage+'/offline/data/update-review.md',stage+'/update-review.md');fs.copyFileSync(stage+'/offline/data/update-review.json',stage+'/update-review.json');
 if(!flags.has('--stage-only')){const promoted=promoteDirectory({workspace:root,candidate:stage+'/offline',afterSwitch(){fs.copyFileSync(stage+'/PSX-Atlas-Offline.zip','PSX-Atlas-Offline.zip');fs.writeFileSync('state/source-snapshot.json.tmp',JSON.stringify(snapshot,null,2));fs.renameSync('state/source-snapshot.json.tmp','state/source-snapshot.json');}});console.log(JSON.stringify(promoted));}
 fs.writeFileSync('_updates/last-attempt.json',JSON.stringify({stage,source_commit:sha,status:'verified',review_required:report.review_required,at:new Date().toISOString()},null,2));console.log('Verified update ready in '+stage);
}catch(error){fs.writeFileSync('_updates/last-attempt.json',JSON.stringify({stage,source_commit:sha,status:'failed',error:String(error),working_archive_untouched:true,at:new Date().toISOString()},null,2));throw error;}
