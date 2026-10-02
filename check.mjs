import fs from 'node:fs';
import path from 'node:path';
const root='dist';const files=[];function walk(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,item.name);if(item.isDirectory())walk(p);else files.push(p);}}walk(root);
const manifest=JSON.parse(fs.readFileSync('dist/content-manifest.json','utf8'));let count=0;const errors=[];
for(const file of files.filter(f=>f.endsWith('.html'))){const html=fs.readFileSync(file,'utf8');if((html.match(/<h1[ >]/g)||[]).length!==1)errors.push(file+': expected one H1');if(!html.includes('<link rel="canonical"'))errors.push(file+': missing canonical');for(const [,url]of html.matchAll(/href="(\/[^"#]*)(?:#[^"]*)?"/g)){const target=url==='/'?'dist/index.html':path.join('dist',url.slice(1));if(!fs.existsSync(target)&&!fs.existsSync(target+'.html'))errors.push(file+': missing '+url);}for(const [,json]of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)){try{JSON.parse(json);}catch{errors.push(file+': invalid JSON-LD');}}count++;}
if(new Set(manifest.articles.map(a=>a.slug)).size!==manifest.answerCount)errors.push('Duplicate answer URLs');
if(process.env.EXPECTED_ANSWERS&&manifest.answerCount!==Number(process.env.EXPECTED_ANSWERS))errors.push('Wrong answer count');
for(const article of manifest.articles){const html=fs.readFileSync('dist/answers/'+article.slug+'.html','utf8');if(!html.includes('A practical next step'))errors.push(article.slug+': missing next step');}
if(errors.length){console.error(errors.slice(0,30).join('\n'));process.exit(1);}console.log(`Checked ${count} HTML files: internal links, H1s, canonical tags, JSON-LD, unique URLs, and ${manifest.answerCount} answers.`);
