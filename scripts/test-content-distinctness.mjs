import assert from 'node:assert/strict';
import {test} from 'node:test';
import {auditDistinctness, duplicateGroups} from './check-content-distinctness.mjs';

const post = (slug, title, body) => ({slug, title, body});
const original = [post('first', 'First topic', 'An explanation of first topic. Shared detail.'),
  post('second', 'Second topic', 'An explanation of second topic. Shared detail.')];

test('title-swapped copies are rejected without an explicit legacy record', () => {
  assert.equal(auditDistinctness(original, []).errors.length, 1);
});
test('known backlog can shrink as a guide is replaced with distinct content', () => {
  const revised = [original[0], post('second', 'Second topic', 'A different answer with its own evidence.')];
  assert.equal(auditDistinctness(revised, duplicateGroups(original)).errors.length, 0);
});
test('adding another copy to a known body group is rejected', () => {
  const expanded = [...original, post('third', 'Third topic', 'An explanation of third topic. Shared detail.')];
  assert.equal(auditDistinctness(expanded, duplicateGroups(original)).errors.length, 1);
});
test('a literal copied body with a different headline is also rejected', () => {
  const copied = [...original, post('third', 'Unrelated headline', original[0].body)];
  assert.equal(auditDistinctness(copied, duplicateGroups(original)).errors.length, 1);
});
test('moving the same slugs to a different duplicated body requires review', () => {
  const replaced = original.map(p => ({...p, body: 'Another shared template used everywhere.'}));
  assert.equal(auditDistinctness(replaced, duplicateGroups(original)).errors.length, 1);
});
test('section text actually rendered to readers controls the comparison', () => {
  const copies = original.map(p => ({...p, body: 'Unused field ' + p.slug,
    sections: [{heading: p.title, paragraphs: ['Identical rendered paragraph.']}]}));
  assert.equal(auditDistinctness(copies, []).errors.length, 1);
});
test('whitespace and capitalization cannot hide a title-swapped copy', () => {
  const copies = [original[0], post('second', 'Second topic', 'AN explanation of SECOND TOPIC.\nShared  detail.')];
  assert.equal(auditDistinctness(copies, []).errors.length, 1);
});

const {applyReviewedPosts} = await import('./article-data.mjs');
test('reviewed content is checked rather than allowing copies behind unique legacy bodies', () => {
  const data={posts:original.map((p,i)=>({...p,body:'Unique legacy answer '+i}))};
  const revised=applyReviewedPosts(data,{first:{sections:[{paragraphs:['Copied reviewed answer.']}]},second:{sections:[{paragraphs:['Copied reviewed answer.']}]}});
  assert.equal(auditDistinctness(revised.posts,[]).errors.length,1);
});
test('reviewed content cannot silently add a new URL or replace publication identity', () => {
  assert.throws(()=>applyReviewedPosts({posts:original},{unknown:{body:'New'}}),/no existing owner/);
  assert.throws(()=>applyReviewedPosts({posts:original},{first:{date:'2026-11-22'}}),/identity\/publication/);
});

const {applyRetiredPosts,validateRetiredRoutes}=await import('./article-data.mjs');
test('retirement rejects unknown slugs and retired or missing destinations',()=>{
 const rule={destination:'/blog/second',fragment:'evidence'};
 assert.throws(()=>applyRetiredPosts({posts:original},{redirects:{unknown:rule}}),/no existing owner/);
 assert.throws(()=>applyRetiredPosts({posts:original},{redirects:{first:rule,second:{destination:'/blog/first',fragment:'evidence'}}}),/Invalid retired destination/);
 assert.throws(()=>applyRetiredPosts({posts:original},{redirects:{first:{destination:'/blog/missing',fragment:'evidence'}}}),/Invalid retired destination/);
});
test('retirement requires every permanent URL form, not just a filtered sitemap',()=>{
 const manifest={redirects:{first:{destination:'/blog/second',fragment:'evidence'}}};
 const redirects=['','/','.html'].map(s=>({source:'/blog/first'+s,destination:'/blog/second#evidence',statusCode:301}));
 assert.doesNotThrow(()=>validateRetiredRoutes(manifest,{redirects}));
 assert.throws(()=>validateRetiredRoutes(manifest,{redirects:redirects.slice(1)}),/Missing permanent/);
 assert.throws(()=>validateRetiredRoutes(manifest,{redirects:redirects.map(r=>({...r,statusCode:302}))}),/Missing permanent/);
});
