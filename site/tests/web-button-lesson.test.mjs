import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as lesson from '../src/lib/learning/buttonLessonSandbox.js';

const componentSource = readFileSync('src/components/ButtonMessageLesson.tsx', 'utf8');
const starter = lesson.BUTTON_LESSON_STARTER;
const fixedJavaScript = starter.javascript.replace('#show-memo', '#change-message');

test('supported fixed HTML/CSS/JavaScript is parsed, normalized, and previewed under a restrictive CSP', () => {
  const result = lesson.prepareButtonLessonPreview(starter.html, starter.css, fixedJavaScript);
  assert.equal(result.ok, true);
  assert.equal(result.mismatch, null);
  const policyAt = result.document.indexOf('http-equiv="Content-Security-Policy"');
  const scriptAt = result.document.indexOf('<script>');
  assert.ok(policyAt >= 0 && policyAt < scriptAt, 'the fixed policy precedes normalized script');
  for (const directive of ["default-src 'none'", "base-uri 'none'", "connect-src 'none'", "font-src 'none'", "form-action 'none'", "frame-src 'none'", "img-src 'none'", "media-src 'none'", "object-src 'none'", "script-src 'unsafe-inline'", "style-src 'unsafe-inline'", "worker-src 'none'"]) {
    assert.ok(result.document.includes(directive), `missing CSP directive ${directive}`);
  }
  assert.doesNotMatch(result.document, /navigate-to/, 'navigation is prevented by the supported grammar, not a CSP directive');
  assert.match(result.document, /<main class="card"><h1>One button, one message<\/h1>/);
  assert.match(result.document, /document\.querySelector\("#change-message"\)/);
  assert.match(result.document, /message\.textContent = "The message changed\."/);
  assert.doesNotMatch(result.document, /\nconst button/, 'the original learner source is rebuilt rather than inserted verbatim');
});

test('the starter selector bug is previewed safely and gets a useful mismatch diagnostic', () => {
  const result = lesson.prepareButtonLessonPreview(starter.html, starter.css, starter.javascript);
  assert.equal(result.ok, true);
  assert.deepEqual(result.mismatch, { selector: 'show-memo', expected: 'change-message', element: 'button' });
  assert.match(result.document, /querySelector\("#show-memo"\)/, 'only the parsed selector token is emitted');
});

test('script-closing text is escaped when parsed learner text is rebuilt into JavaScript', () => {
  const javascript = fixedJavaScript.replace('The message changed.', '</script><img src=x>');
  const result = lesson.prepareButtonLessonPreview(starter.html, starter.css, javascript);
  assert.equal(result.ok, true);
  assert.doesNotMatch(result.document, /<script>[^]*?<\/script><img/);
  assert.match(result.document, /\\u003c\/script\\u003e\\u003cimg/);
});

test('supported message strings may contain words that resemble forbidden APIs', () => {
  const javascript = fixedJavaScript.replace('The message changed.', 'The word window is just text.');
  const result = lesson.prepareButtonLessonPreview(starter.html, starter.css, javascript);
  assert.equal(result.ok, true);
  assert.match(result.document, /The word window is just text\./);
});

test('supported HTML allows plain text but rejects tags, URL attributes, and unsupported attributes', () => {
  const escapedText = lesson.prepareButtonLessonPreview(starter.html.replace('One button, one message', 'A & "tiny" note'), starter.css, fixedJavaScript);
  assert.equal(escapedText.ok, true);
  assert.match(escapedText.document, /A &amp; &quot;tiny&quot; note/);

  const hostileInputs = [
    starter.html.replace('</main>', '<script>parent.postMessage({passed:true},"*")</script></main>'),
    starter.html.replace('type="button"', 'type="button" formaction="https://example.invalid/"'),
    starter.html.replace('type="button"', 'type="button" onclick="location.href=\'https://example.invalid/\'"'),
    starter.html.replace('<p id="message">', '<a href="https://example.invalid/">').replace('</p>', '</a>'),
    starter.html.replace('<p id="message">', '<form action="https://example.invalid/"><p id="message">'),
    starter.html.replace('</main>', '<iframe src="https://example.invalid/"></iframe></main>'),
    starter.html.replace('</main>', '<img src="https://example.invalid/pixel.png"></main>'),
  ];
  for (const html of hostileInputs) {
    const result = lesson.prepareButtonLessonPreview(html, starter.css, fixedJavaScript);
    assert.equal(result.ok, false);
    assert.equal(result.error, 'html');
    assert.equal(result.document, undefined);
  }
});

test('navigation and network JavaScript are rejected before any preview document is built', () => {
  const hostileScripts = [
    starter.javascript.replace('button.addEventListener', 'window.location.href = "https://example.invalid/"; button.addEventListener'),
    starter.javascript.replace('button.addEventListener', 'location.assign("https://example.invalid/"); button.addEventListener'),
    starter.javascript.replace('button.addEventListener', 'parent.postMessage({passed:true}, "*"); button.addEventListener'),
    starter.javascript.replace('button.addEventListener', 'fetch("https://example.invalid/"); button.addEventListener'),
  ];
  for (const javascript of hostileScripts) {
    const result = lesson.prepareButtonLessonPreview(starter.html, starter.css, javascript);
    assert.equal(result.ok, false);
    assert.equal(result.error, 'unsupported-feature');
    assert.equal(result.document, undefined);
  }
  assert.match(componentSource, /javascript-unsupported-feature/, 'rejected features have a dedicated learner-facing diagnostic');
});

test('inline CSS rejects breakout, direct and obfuscated resource syntax', () => {
  const unsafeCss = [
    '@import "https://example.invalid/a.css";',
    'body { background: url(https://example.invalid/pixel.png) }',
    String.raw`body { background: u\72l(https://example.invalid/pixel.png) }`,
    String.raw`@im\70 ort "https://example.invalid/a.css";`,
    'body { background: image-set("https://example.invalid/a.png" 1x) }',
    '</style><script>parent.postMessage({passed:true},"*")</script>',
  ];
  for (const css of unsafeCss) {
    const result = lesson.prepareButtonLessonPreview(starter.html, css, fixedJavaScript);
    assert.equal(result.ok, false);
    assert.equal(result.error, 'css');
  }
});

test('manual observations require a current preview, expose pressed state, and gate repair and variation on fresh edits', () => {
  assert.match(componentSource, /const canRecordBehavior = previewIsCurrent && freshAfterUnchanged/);
  assert.match(componentSource, /disabled=\{!canRecordBehavior\}/);
  assert.match(componentSource, /aria-pressed=\{check === 'changed'\}/);
  assert.match(componentSource, /aria-pressed=\{check === 'unchanged'\}/);
  assert.match(componentSource, /const canConfirmRepair = previewIsCurrent && check === 'changed' && unchangedRevision === null/);
  assert.match(componentSource, /const canConfirmVariation = previewIsCurrent && repairRevision !== null && revision > repairRevision/);
  assert.match(componentSource, /setRevision\(\(current\) => current \+ 1\)/);
  const run = componentSource.slice(componentSource.indexOf('const runPreview ='), componentSource.indexOf('const recordBehavior ='));
  assert.match(run, /setCheck\(null\)/, 'every preview attempt clears any observation from a prior run');
  assert.match(componentSource, /!previewIsCurrent\s*\?\s*ui\.previewRequired/, 'selector guidance is hidden until the current source has parsed and run');
});

test('reset re-enables writes after an invalid saved draft is removed', () => {
  const reset = componentSource.slice(componentSource.indexOf('const resetLesson ='), componentSource.indexOf('return <div'));
  assert.match(reset, /removeItem\(BUTTON_LESSON_STORAGE_KEY\)/);
  assert.match(reset, /setStorageReady\(canWrite\)/);
});

test('saved state is bounded and migrates prior manual records safely', () => {
  const oldState = lesson.readButtonLessonState({ html: starter.html, css: starter.css, javascript: starter.javascript, stage: 2, check: 'unchanged' });
  assert.equal(oldState.unchangedRevision, 0);
  assert.equal(lesson.readButtonLessonState({ html: 'x'.repeat(lesson.BUTTON_LESSON_MAX_FIELD_LENGTH + 1), css: '', javascript: '', stage: 0, check: null }), null);
  assert.equal(lesson.readButtonLessonState({ html: '', css: '', javascript: '', stage: 99, check: 'changed' }), null);
});

test('both localized routes and the single learning-map link point to this lesson', () => {
  assert.match(readFileSync('src/pages/learn/web-button/index.astro', 'utf8'), /ButtonMessageLesson client:load locale="ko"/);
  assert.match(readFileSync('src/pages/en/learn/web-button/index.astro', 'utf8'), /ButtonMessageLesson client:load locale="en"/);
  assert.match(readFileSync('src/i18n/navigation.ts', 'utf8'), /href: lp\('\/learn\/web-button'\)/);
});
