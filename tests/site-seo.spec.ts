import { test, expect } from '@playwright/test';
import { composePageDescription, composePageTitle, getTwitterHandle, normalizePagePath, resolvePageMetadata, routeMetadata } from '../supabase/functions/_shared/siteSeo';

test('saved publisher replaces a legacy title suffix exactly once', () => {
  expect(composePageTitle('Forms — UISU SPACE', 'Campus Union')).toBe('Forms | Campus Union');
  expect(composePageTitle('Polls | UISU', 'Campus Union')).toBe('Polls | Campus Union');
  expect(composePageTitle('UISU SPACE', 'Campus Union')).toBe('Campus Union');
});

test('all registered pages use the saved site name', () => {
  for (const metadata of Object.values(routeMetadata)) {
    const title = composePageTitle(metadata.title, 'Campus Union');
    expect(title === 'Campus Union' || title.endsWith(' | Campus Union')).toBe(true);
    expect(title.endsWith(' | UISU SPACE | Campus Union')).toBe(false);
  }
});

test('the full saved description survives on every route within the 320 character limit', () => {
  const siteDescription = 'A'.repeat(320);
  expect(composePageDescription('Page detail', siteDescription)).toBe(siteDescription);
  for (const [path, metadata] of Object.entries(routeMetadata)) {
    const result = composePageDescription(metadata.description, 'Our student community.', path === '/');
    expect(result.endsWith('Our student community.')).toBe(true);
    expect(result.length).toBeLessThanOrEqual(320);
    expect(result.startsWith(' — ')).toBe(false);
  }
});

test('removing or replacing the X profile never restores the previous account', () => {
  expect(getTwitterHandle([])).toBeNull();
  expect(getTwitterHandle([{ platform: 'X', url: 'https://x.com/new_union' }])).toBe('new_union');
  expect(getTwitterHandle([{ platform: 'X', url: 'https://unrelated.example/new_union' }])).toBeNull();
});

test('query strings and trailing slashes preserve the page preview rather than choosing homepage metadata', () => {
  expect(normalizePagePath('/communities/?source=share')).toBe('/communities');
  expect(resolvePageMetadata('/communities/?source=share').image).toBe('/og/pages-screenshot/communities.png');
  expect(resolvePageMetadata('/gazette/issues?year=2026').title).not.toBe('UISU SPACE');
});

test('standalone and shared routes are covered without reading private records', () => {
  for (const path of ['/tutorials', '/tutorials/catalog', '/tutorials/lesson-123', '/tutorials/tutor/tutor-123', '/tutorials/upload', '/gazette', '/gazette/issues/issue-123', '/gazette/category/news', '/gazette/editor/editor-123', '/committee/finance', '/study/shared/token-123', '/forms/s/token-123', '/resources/quizlets/quiz-123']) {
    expect(resolvePageMetadata(path).title).not.toBe('Page Not Found');
  }
});