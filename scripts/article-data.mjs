import fs from 'node:fs';
import path from 'node:path';
export function applyReviewedPosts(data, overrides) {
 const known=new Set(data.posts.map(p=>p.slug));
 for(const [slug,patch] of Object.entries(overrides)) {
  if(!known.has(slug)) throw new Error('Reviewed override has no existing owner: '+slug);
  for(const key of ['id','slug','date','category','categoryName']) if(Object.hasOwn(patch,key)) throw new Error('Reviewed override changes identity/publication: '+key);
 }
 return {...data,posts:data.posts.map(p=>({...p,...(overrides[p.slug]||{})}))};
}
export function applyRetiredPosts(data, manifest) {
 const rules=manifest.redirects;
 const known=new Set(data.posts.map(p=>p.slug));
 for(const [slug,rule] of Object.entries(rules)) {
  if(!known.has(slug)) throw new Error('Retired slug has no existing owner: '+slug);
  const target=rule.destination.replace(/^\/blog\//,'');
  if(!rule.destination.startsWith('/blog/') || !known.has(target) || Object.hasOwn(rules,target) || !/^[a-z0-9-]+$/.test(rule.fragment)) throw new Error('Invalid retired destination: '+slug);
 }
 return {...data,posts:data.posts.filter(p=>!Object.hasOwn(rules,p.slug))};
}
export function validateRetiredRoutes(manifest, config) {
 for(const [slug,rule] of Object.entries(manifest.redirects)) for(const suffix of ['', '/', '.html']) {
  const matches=(config.redirects||[]).filter(r=>r.source==='/blog/'+slug+suffix);
  if(matches.length!==1 || ![301,308].includes(matches[0].statusCode) || matches[0].destination!==rule.destination+'#'+rule.fragment) throw new Error('Missing permanent retired route: '+slug+suffix);
 }
}
export function readArticleData(root) {
 const retired=JSON.parse(fs.readFileSync(path.join(root,'editorial/retired-market-roundups.json'),'utf8'));
 validateRetiredRoutes(retired,JSON.parse(fs.readFileSync(path.join(root,'vercel.json'),'utf8')));
 return applyRetiredPosts(applyReviewedPosts(JSON.parse(fs.readFileSync(path.join(root,'blog-posts.json'),'utf8')),JSON.parse(fs.readFileSync(path.join(root,'editorial/reviewed-posts.json'),'utf8'))),JSON.parse(fs.readFileSync(path.join(root,'editorial/retired-market-roundups.json'),'utf8')));
}
