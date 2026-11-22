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
export function readArticleData(root) {
 return applyReviewedPosts(JSON.parse(fs.readFileSync(path.join(root,'blog-posts.json'),'utf8')),JSON.parse(fs.readFileSync(path.join(root,'editorial/reviewed-posts.json'),'utf8')));
}
