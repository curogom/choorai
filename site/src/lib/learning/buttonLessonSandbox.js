export const BUTTON_LESSON_STARTER = {
  html: `<main class="card">
  <h1>One button, one message</h1>
  <button id="change-message" type="button">Show the memo</button>
  <p id="message">Your reminder will appear here.</p>
</main>`,
  css: `body {
  margin: 0;
  padding: 2rem;
  font: 16px/1.5 system-ui, sans-serif;
  background: #f4f5f8;
  color: #172033;
}
.card {
  max-width: 34rem;
  margin: 2rem auto;
  padding: 2rem;
  border-radius: 1rem;
  background: white;
  box-shadow: 0 8px 28px #17203318;
}
button {
  padding: 0.7rem 1rem;
  border: 0;
  border-radius: 0.6rem;
  background: #4f46e5;
  color: white;
  font: inherit;
  cursor: pointer;
}`,
  // Intentional starter bug: the HTML uses #change-message, but this looks for #show-memo.
  javascript: `const button = document.querySelector("#show-memo");
const message = document.querySelector("#message");

button.addEventListener("click", () => {
  message.textContent = "The message changed.";
});`,
};

const PREVIEW_CSP = [
  "default-src 'none'",
  "base-uri 'none'",
  "connect-src 'none'",
  "font-src 'none'",
  "form-action 'none'",
  "frame-src 'none'",
  "img-src 'none'",
  "media-src 'none'",
  "object-src 'none'",
  "script-src 'unsafe-inline'",
  "style-src 'unsafe-inline'",
  "worker-src 'none'",
].join('; ');

const SIMPLE_HTML = /^\s*<main\s+class="([A-Za-z][A-Za-z0-9_-]*(?:\s+[A-Za-z][A-Za-z0-9_-]*)*)">\s*<h1>([^<]*)<\/h1>\s*<button\s+id="([A-Za-z][A-Za-z0-9_-]{0,31})"\s+type="button">([^<]*)<\/button>\s*<p\s+id="([A-Za-z][A-Za-z0-9_-]{0,31})">([^<]*)<\/p>\s*<\/main>\s*$/s;
const SIMPLE_JAVASCRIPT = /^\s*const\s+button\s*=\s*document\.querySelector\(\s*(["'])#([A-Za-z][A-Za-z0-9_-]{0,31})\1\s*\)\s*;\s*const\s+message\s*=\s*document\.querySelector\(\s*(["'])#([A-Za-z][A-Za-z0-9_-]{0,31})\3\s*\)\s*;\s*button\.addEventListener\(\s*(["'])click\5\s*,\s*\(\s*\)\s*=>\s*\{\s*message\.textContent\s*=\s*("[^"\\\r\n]*"|'[^'\\\r\n]*')\s*;\s*\}\s*\)\s*;?\s*$/s;

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

function escapeInlineScriptString(value) {
  return JSON.stringify(value).replace(/[<>&\u2028\u2029]/g, (character) => ({
    '<': '\\u003c', '>': '\\u003e', '&': '\\u0026', '\u2028': '\\u2028', '\u2029': '\\u2029',
  })[character]);
}

function sourceLocation(source, offset) {
  const safeOffset = Math.max(0, Math.min(source.length, offset));
  const preceding = source.slice(0, safeOffset);
  const lineBreak = preceding.lastIndexOf('\n');
  return { line: (preceding.match(/\n/g) || []).length + 1, column: safeOffset - lineBreak };
}

function makeDiagnostic(file, source, offset, code) {
  return { file, ...sourceLocation(source, offset), code };
}

function missingMainClose(source) {
  if (!/<main\b/i.test(source) || /<\/main\s*>/i.test(source)) return null;
  const lastClose = source.lastIndexOf('>');
  return makeDiagnostic('html', source, lastClose < 0 ? source.length : lastClose + 1, 'html-missing-main-close');
}

function missingJavaScriptStringQuote(source) {
  const assignment = /message\.textContent\s*=\s*(["'])/g;
  let match;
  while ((match = assignment.exec(source))) {
    const quote = match[1];
    const valueStart = assignment.lastIndex;
    const lineEnd = source.indexOf('\n', valueStart);
    const semicolon = source.indexOf(';', valueStart);
    const end = Math.min(...[lineEnd, semicolon, source.length].filter((value) => value >= 0));
    if (!source.slice(valueStart, end).includes(quote)) {
      return makeDiagnostic('javascript', source, end, 'javascript-missing-string-quote');
    }
  }
  return null;
}

function unsupportedCalc(source) {
  const match = /\bcalc\s*\(/i.exec(source);
  return match ? makeDiagnostic('css', source, match.index, 'css-unsupported-calc') : null;
}

function firstUnsupportedHtmlToken(source) {
  const token = /<(?!\/?(?:main|h1|button|p)\b)[^>]*>|\s(?:href|src|style|on[a-z]+|target|action|name|value|data-[\w-]+)\s*=/i.exec(source);
  return token ? token.index : source.length;
}

function firstUnsupportedCssToken(source) {
  const token = /url\s*\(|@import|@font-face|expression\s*\(|var\s*\(|\\|["'<>]/i.exec(source);
  return token ? token.index : source.length;
}

function firstUnsupportedJavaScriptToken(source) {
  const forbidden = /\b(location|window|parent|top|frames|postMessage|fetch|XMLHttpRequest|WebSocket|EventSource|import)\b/i.exec(source);
  if (forbidden) return forbidden.index;
  const anchors = ['const button', 'document.querySelector', 'const message', 'button.addEventListener', 'message.textContent'];
  for (const anchor of anchors) if (!source.includes(anchor)) return Math.max(0, source.length - 1);
  return Math.max(0, source.length - 1);
}

function parseSimpleHtml(source) {
  const match = source.match(SIMPLE_HTML);
  if (!match || match[3] === match[5]) return null;
  const classes = match[1].split(/\s+/);
  return {
    classes,
    heading: match[2],
    buttonId: match[3],
    buttonText: match[4],
    messageId: match[5],
    messageText: match[6],
  };
}

function parseSimpleJavaScript(source) {
  const match = source.match(SIMPLE_JAVASCRIPT);
  if (match) {
    return {
      ok: true,
      buttonSelector: match[2],
      messageSelector: match[4],
      messageText: match[6].slice(1, -1),
    };
  }
  const forbidden = source.match(/\b(location|window|parent|top|frames|postMessage|fetch|XMLHttpRequest|WebSocket|EventSource|import)\b/i);
  if (forbidden) return { ok: false, error: 'unsupported-feature', feature: forbidden[1], diagnostic: makeDiagnostic('javascript', source, forbidden.index || 0, 'javascript-unsupported-feature') };
  return { ok: false, error: 'javascript' };
}

function normalizedMarkup(parsed) {
  const classes = parsed.classes.map(escapeHtml).join(' ');
  return `<main class="${classes}"><h1>${escapeHtml(parsed.heading)}</h1><button id="${escapeHtml(parsed.buttonId)}" type="button">${escapeHtml(parsed.buttonText)}</button><p id="${escapeHtml(parsed.messageId)}">${escapeHtml(parsed.messageText)}</p></main>`;
}

function normalizedScript(parsed) {
  const buttonSelector = escapeInlineScriptString(`#${parsed.buttonSelector}`);
  const messageSelector = escapeInlineScriptString(`#${parsed.messageSelector}`);
  const messageText = escapeInlineScriptString(parsed.messageText);
  return `const button = document.querySelector(${buttonSelector});\nconst message = document.querySelector(${messageSelector});\nbutton.addEventListener("click", () => {\n  message.textContent = ${messageText};\n});`;
}

const SAFE_CSS_PROPERTIES = new Set([
  'background', 'background-color', 'border', 'border-radius', 'box-shadow', 'color', 'cursor',
  'font', 'font-family', 'font-size', 'font-weight', 'line-height', 'margin', 'margin-bottom',
  'margin-left', 'margin-right', 'margin-top', 'max-width', 'min-height', 'padding',
  'padding-bottom', 'padding-left', 'padding-right', 'padding-top', 'text-align',
]);

function safeInlineCss(source) {
  if (typeof source !== 'string' || /[\\@"'()<>]/.test(source) || /\/\*|\*\//.test(source)) return false;
  let cursor = 0;
  let foundRule = false;
  while (cursor < source.length) {
    while (/\s/.test(source[cursor] || '')) cursor++;
    if (cursor >= source.length) break;
    const open = source.indexOf('{', cursor);
    const close = source.indexOf('}', open + 1);
    if (open < 0 || close < 0 || source.indexOf('{', open + 1) >= 0 && source.indexOf('{', open + 1) < close) return false;
    const selectors = source.slice(cursor, open).split(',').map((selector) => selector.trim());
    if (!selectors.length || selectors.some((selector) => !/^(?:body|main|h1|button|p|\.[A-Za-z][A-Za-z0-9_-]*)$/.test(selector))) return false;
    const declarations = source.slice(open + 1, close).split(';');
    for (const declaration of declarations) {
      const trimmed = declaration.trim();
      if (!trimmed) continue;
      const colon = trimmed.indexOf(':');
      if (colon <= 0 || colon !== trimmed.lastIndexOf(':')) return false;
      const property = trimmed.slice(0, colon).trim().toLowerCase();
      const value = trimmed.slice(colon + 1).trim();
      if (!SAFE_CSS_PROPERTIES.has(property) || !value || !/^[A-Za-z0-9#.,/%+\-\s]+$/.test(value)) return false;
    }
    foundRule = true;
    cursor = close + 1;
  }
  return foundRule || source.trim() === '';
}

/**
 * Accept a tiny HTML/JavaScript grammar and rebuild markup and script from
 * parsed values. CSS is separately restricted to simple allowlisted rules
 * before it is embedded in the preview document.
 */
export function prepareButtonLessonPreview(html, css, javascript) {
  const markup = parseSimpleHtml(html);
  if (!markup) {
    const diagnostic = missingMainClose(html) || makeDiagnostic('html', html, firstUnsupportedHtmlToken(html), 'html-unsupported-structure');
    return { ok: false, error: 'html', diagnostic };
  }
  if (!safeInlineCss(css)) {
    const diagnostic = unsupportedCalc(css) || makeDiagnostic('css', css, firstUnsupportedCssToken(css), 'css-unsupported-value');
    return { ok: false, error: 'css', diagnostic };
  }
  const behavior = parseSimpleJavaScript(javascript);
  if (!behavior.ok) {
    const diagnostic = behavior.diagnostic || missingJavaScriptStringQuote(javascript) || makeDiagnostic('javascript', javascript, firstUnsupportedJavaScriptToken(javascript), 'javascript-unsupported-structure');
    return { ok: false, error: behavior.error, feature: behavior.feature, diagnostic };
  }

  let mismatch = null;
  if (behavior.buttonSelector !== markup.buttonId) {
    mismatch = { selector: behavior.buttonSelector, expected: markup.buttonId, element: 'button' };
  } else if (behavior.messageSelector !== markup.messageId) {
    mismatch = { selector: behavior.messageSelector, expected: markup.messageId, element: 'message' };
  }

  const document = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="Content-Security-Policy" content="${PREVIEW_CSP}">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>${css}
    @media screen and (max-width: 600px) {
      body { padding: .75rem !important; }
      main { box-sizing: border-box; max-width: 100% !important; margin: .25rem auto !important; padding: 1rem !important; }
    }
  </style>
</head>
<body>
${normalizedMarkup(markup)}
<script>${normalizedScript(behavior)}</script>
</body>
</html>`;
  return { ok: true, document, mismatch, expectedMessage: behavior.messageText };
}

export const BUTTON_LESSON_STORAGE_KEY = 'choorai-html-button-lesson-v1';
export const BUTTON_LESSON_UNDO_STORAGE_KEY = 'choorai-html-button-lesson-reset-undo-v1';
export const BUTTON_LESSON_MAX_FIELD_LENGTH = 12_000;
export const BUTTON_LESSON_LAST_STAGE = 4;

export function readButtonLessonState(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const { html, css, javascript, stage, check } = value;
  if (![html, css, javascript].every((field) => typeof field === 'string' && field.length <= BUTTON_LESSON_MAX_FIELD_LENGTH)) return null;
  if (typeof html !== 'string' || typeof css !== 'string' || typeof javascript !== 'string') return null;
  if (typeof stage !== 'number' || !Number.isInteger(stage) || stage < 0 || stage > BUTTON_LESSON_LAST_STAGE) return null;
  if (check !== null && check !== 'changed' && check !== 'unchanged') return null;

  const revision = value.revision === undefined ? 0 : value.revision;
  if (typeof revision !== 'number' || !Number.isInteger(revision) || revision < 0 || revision > 1_000_000) return null;
  const unchangedRevision = value.unchangedRevision === undefined
    ? (check === 'unchanged' ? revision : null)
    : value.unchangedRevision;
  const repairRevision = value.repairRevision === undefined
    ? (stage >= 3 ? revision : null)
    : value.repairRevision;
  for (const checkpoint of [unchangedRevision, repairRevision]) {
    if (checkpoint !== null && (typeof checkpoint !== 'number' || !Number.isInteger(checkpoint) || checkpoint < 0 || checkpoint > revision)) return null;
  }
  return { html, css, javascript, stage, check, revision, unchangedRevision, repairRevision };
}

export function createButtonLessonUndoSnapshot(value) {
  const state = readButtonLessonState(value);
  return state ? { version: 1, state } : null;
}

export function readButtonLessonUndoSnapshot(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || value.version !== 1) return null;
  return readButtonLessonState(value.state);
}
