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
