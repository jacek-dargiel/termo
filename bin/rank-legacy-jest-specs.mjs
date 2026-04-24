#!/usr/bin/env node

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const LEGACY_SPEC_SUFFIX = '.jest-spec.ts';
const IGNORED_DIRS = new Set([
  '.git',
  '.angular',
  'node_modules',
  'dist',
  'coverage',
  'playwright-report',
  'test-results'
]);

const WEIGHTS = {
  nonempty: 0.2,
  imports: 0.4,
  it: 1,
  beforeEach: 1.5,
  jestFns: 1.2,
  spyOn: 2,
  testbed: 3,
  rxjs: 2.5,
  ngrx: 4,
  dom: 3
};

function countMatches(content, pattern) {
  const matches = content.match(pattern);
  return matches ? matches.length : 0;
}

function analyzeFile(content) {
  const lines = content.split(/\r?\n/);
  const nonempty = lines.filter((line) => line.trim().length > 0).length;

  const metrics = {
    nonempty,
    imports: countMatches(content, /^import\s/mg),
    it: countMatches(content, /\b(?:it|test)\s*\(/g),
    beforeEach: countMatches(content, /\bbeforeEach\s*\(/g),
    jestFns: countMatches(content, /\bjest\./g),
    spyOn:
      countMatches(content, /\bspyOn\s*\(/g) +
      countMatches(content, /\bjest\.spyOn\s*\(/g),
    testbed: countMatches(content, /\bTestBed\b/g),
    rxjs: countMatches(
      content,
      /\b(?:of|from|throwError|Subject|BehaviorSubject|Observable|cold|hot|pipe|switchMap|mergeMap|concatMap|exhaustMap)\b/g
    ),
    ngrx: countMatches(
      content,
      /\b(?:Store|Actions|provideMockStore|createAction|createReducer|createFeature|createSelector|select|on)\b/g
    ),
    dom: countMatches(
      content,
      /\b(?:fixture|nativeElement|querySelector|DebugElement|By\.|detectChanges|dispatchEvent)\b/g
    )
  };

  let score = 0;
  for (const [key, weight] of Object.entries(WEIGHTS)) {
    score += metrics[key] * weight;
  }

  return { metrics, score: Number(score.toFixed(2)) };
}

async function findLegacySpecFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) {
        continue;
      }
      files.push(...(await findLegacySpecFiles(fullPath)));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(LEGACY_SPEC_SUFFIX)) {
      files.push(fullPath);
    }
  }

  return files;
}

function parseArgs(argv) {
  let top = 5;
  let json = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--json') {
      json = true;
      continue;
    }

    if (arg === '--top') {
      const value = Number(argv[i + 1]);
      if (!Number.isNaN(value) && value > 0) {
        top = value;
        i += 1;
      }
      continue;
    }

    if (arg.startsWith('--top=')) {
      const value = Number(arg.slice('--top='.length));
      if (!Number.isNaN(value) && value > 0) {
        top = value;
      }
    }
  }

  return { top, json };
}

function printHuman(results, top) {
  const winner = results[0];
  const topResults = results.slice(0, top);

  console.log('Legacy Jest spec complexity ranking (lower is simpler)');
  console.log('');
  console.log(`Winner: ${winner.file} (score ${winner.score.toFixed(2)})`);
  console.log('');
  console.log('Top easiest files:');

  for (const result of topResults) {
    const m = result.metrics;
    console.log(
      [
        `${result.score.toFixed(2).padStart(7)} score`,
        `${String(m.nonempty).padStart(3)} nonempty`,
        `${String(m.it).padStart(2)} tests`,
        `TB ${String(m.testbed).padStart(2)}`,
        `DOM ${String(m.dom).padStart(2)}`,
        `NGRX ${String(m.ngrx).padStart(2)}`,
        `${result.file}`
      ].join(' | ')
    );
  }
}

async function main() {
  const { top, json } = parseArgs(process.argv.slice(2));
  const cwd = process.cwd();
  const files = await findLegacySpecFiles(cwd);

  if (files.length === 0) {
    console.log('No legacy *.jest-spec.ts files found.');
    return;
  }

  const analyzed = await Promise.all(
    files.map(async (filePath) => {
      const content = await readFile(filePath, 'utf8');
      const { metrics, score } = analyzeFile(content);
      return {
        file: path.relative(cwd, filePath).split(path.sep).join('/'),
        score,
        metrics
      };
    })
  );

  analyzed.sort((a, b) => a.score - b.score || a.metrics.nonempty - b.metrics.nonempty);

  if (json) {
    const payload = {
      weights: WEIGHTS,
      winner: analyzed[0],
      results: analyzed
    };
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  printHuman(analyzed, top);
}

main().catch((error) => {
  console.error('Failed to rank legacy Jest specs.');
  console.error(error);
  process.exitCode = 1;
});
