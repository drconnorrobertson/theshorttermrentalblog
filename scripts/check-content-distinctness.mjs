import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

export function bodyFingerprint(post) {
  const body = post.sections
    ? post.sections.flatMap(section => section.paragraphs).join(' ')
    : post.body;
  if (typeof body !== 'string' || !body.trim()) throw Error('Missing body: ' + post.slug);
  let normalized = body.normalize('NFKC').toLowerCase();
  const title = String(post.title || '').normalize('NFKC').toLowerCase().trim();
  if (title) normalized = normalized.split(title).join('[title]');
  normalized = normalized.replace(/\s+/g, ' ').trim();
  return createHash('sha256').update(normalized).digest('hex');
}

export function duplicateGroups(posts) {
  const groups = new Map();
  for (const post of posts) {
    const fingerprint = bodyFingerprint(post);
    if (!groups.has(fingerprint)) groups.set(fingerprint, []);
    groups.get(fingerprint).push(post.slug);
  }
  return [...groups].filter(([, slugs]) => slugs.length > 1)
    .map(([fingerprint, slugs]) => ({fingerprint, slugs: slugs.sort()}));
}

export function auditDistinctness(posts, legacyGroups) {
  const allowed = new Map(legacyGroups.map(group => [group.fingerprint, new Set(group.slugs)]));
  const groups = duplicateGroups(posts);
  const errors = groups.filter(group => !allowed.has(group.fingerprint) ||
    group.slugs.some(slug => !allowed.get(group.fingerprint).has(slug)));
  return {groups, errors};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const {posts} = JSON.parse(fs.readFileSync(path.join(root, 'blog-posts.json'), 'utf8'));
  const baseline = JSON.parse(fs.readFileSync(path.join(root, 'editorial/legacy-duplicate-bodies.json'), 'utf8'));
  const result = auditDistinctness(posts, baseline.groups);
  if (result.errors.length) {
    console.error('New or expanded duplicate article bodies. Write distinct content; do not expand the legacy baseline to bypass review.');
    for (const group of result.errors) console.error(group.slugs.join(', '));
    process.exitCode = 1;
  } else {
    console.log(`Content distinctness: ${posts.length} posts checked; ${result.groups.length} known duplicate-body groups remain for editorial revision; no new or expanded groups.`);
  }
}
