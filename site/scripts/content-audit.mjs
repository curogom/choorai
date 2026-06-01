import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const siteRoot = path.resolve(__dirname, '..');
const pagesRoot = path.join(siteRoot, 'src', 'pages');

const outArg = process.argv.find((arg) => arg.startsWith('--out='));
const outPath = outArg ? outArg.slice('--out='.length) : null;

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return walk(fullPath);
      return [fullPath];
    }),
  );
  return files.flat();
}

function percent(part, total) {
  if (total === 0) return '0.0%';
  return `${((part / total) * 100).toFixed(1)}%`;
}

function sectionFromPath(relPath) {
  const parts = relPath.split('/');
  if (parts.length === 1) return 'root';
  return parts[0];
}

function checkSignals(content) {
  const hasTLDR = /TL;DR/i.test(content);
  const hasPrompt = /<PromptBox/.test(content);
  const hasChecklist = /<Checklist/.test(content);
  const hasCode = /<CodeBlock/.test(content);
  const hasDoneCriteria = /완료 조건|검증|성공!|Definition of Done|DoD/i.test(content);
  const hasSteps = /<SectionHeader number=|<Stepper|1\.|2\.|3\./.test(content);

  return {
    hasTLDR,
    hasPrompt,
    hasChecklist,
    hasCode,
    hasDoneCriteria,
    hasSteps,
    isMissionReady: hasPrompt && hasChecklist && hasDoneCriteria,
  };
}

function summarizeCategory(items) {
  const total = items.length;
  const count = (key) => items.filter((item) => item[key]).length;
  return {
    total,
    tldr: count('hasTLDR'),
    prompt: count('hasPrompt'),
    checklist: count('hasChecklist'),
    done: count('hasDoneCriteria'),
    steps: count('hasSteps'),
    missionReady: count('isMissionReady'),
  };
}

const allFiles = await walk(pagesRoot);
const koAstroFiles = allFiles
  .filter((file) => file.endsWith('.astro'))
  .filter((file) => !file.includes(`${path.sep}en${path.sep}`));

const pageSignals = [];
for (const file of koAstroFiles) {
  const content = await fs.readFile(file, 'utf8');
  const relPath = path.relative(pagesRoot, file).replace(/\\/g, '/');

  pageSignals.push({
    path: relPath,
    section: sectionFromPath(relPath),
    ...checkSignals(content),
  });
}

const categories = [...new Set(pageSignals.map((page) => page.section))].sort();
const byCategory = categories.map((category) => {
  const items = pageSignals.filter((page) => page.section === category);
  return { category, ...summarizeCategory(items) };
});

const total = summarizeCategory(pageSignals);

const missionWeakPages = pageSignals
  .filter((page) => !page.isMissionReady)
  .sort((a, b) => a.section.localeCompare(b.section) || a.path.localeCompare(b.path))
  .slice(0, 20);

const categoryPriority = byCategory
  .filter((item) => item.total >= 3)
  .sort((a, b) => {
    const rateA = a.missionReady / a.total;
    const rateB = b.missionReady / b.total;
    return rateA - rateB || b.total - a.total;
  })
  .slice(0, 4);

const today = new Date().toISOString().slice(0, 10);

const lines = [];
lines.push(`# Content Audit Baseline (${today})`);
lines.push('');
lines.push('## Snapshot');
lines.push(`- Total KO pages audited: **${total.total}**`);
lines.push(`- Mission-ready pages (Prompt + Checklist + Done Criteria): **${total.missionReady} / ${total.total}** (${percent(total.missionReady, total.total)})`);
lines.push(`- Prompt coverage: **${total.prompt} / ${total.total}** (${percent(total.prompt, total.total)})`);
lines.push(`- Checklist coverage: **${total.checklist} / ${total.total}** (${percent(total.checklist, total.total)})`);
lines.push(`- Done criteria coverage: **${total.done} / ${total.total}** (${percent(total.done, total.total)})`);
lines.push('');

lines.push('## Category Coverage');
lines.push('| Category | Pages | Prompt | Checklist | Done Criteria | Mission-ready |');
lines.push('| --- | ---: | ---: | ---: | ---: | ---: |');
for (const item of byCategory) {
  lines.push(
    `| ${item.category} | ${item.total} | ${item.prompt} (${percent(item.prompt, item.total)}) | ${item.checklist} (${percent(item.checklist, item.total)}) | ${item.done} (${percent(item.done, item.total)}) | ${item.missionReady} (${percent(item.missionReady, item.total)}) |`,
  );
}
lines.push('');

lines.push('## Priority Gaps');
for (const item of categoryPriority) {
  lines.push(`- ${item.category}: mission-ready ${item.missionReady}/${item.total} (${percent(item.missionReady, item.total)})`);
}
lines.push('');

lines.push('## Sample Pages Missing Mission Signals');
for (const page of missionWeakPages) {
  const missing = [];
  if (!page.hasPrompt) missing.push('prompt');
  if (!page.hasChecklist) missing.push('checklist');
  if (!page.hasDoneCriteria) missing.push('done criteria');
  lines.push(`- ${page.path} (missing: ${missing.join(', ')})`);
}
lines.push('');

lines.push('## Audit Rule');
lines.push('- Mission-ready = PromptBox + Checklist + explicit done criteria text.');

const report = `${lines.join('\n')}\n`;

if (outPath) {
  const resolved = path.isAbsolute(outPath) ? outPath : path.resolve(siteRoot, outPath);
  await fs.mkdir(path.dirname(resolved), { recursive: true });
  await fs.writeFile(resolved, report, 'utf8');
}

process.stdout.write(report);
