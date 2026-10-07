// @ts-nocheck
import { parentPort } from 'node:worker_threads';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { performance } from 'node:perf_hooks';
const context = vm.createContext({ WebAssembly, Uint8Array, TextDecoder, TextEncoder, performance, setTimeout, clearTimeout, atob, btoa, console, self: {}, postMessage: (data) => parentPort.postMessage(data) });
const contracts = readFileSync(new URL('../../src/lib/sql/contracts.js', import.meta.url), 'utf8').replace(/export \{[^}]+\};/, '');
const source = readFileSync(new URL('../../src/lib/sql/engine.worker.js', import.meta.url), 'utf8').replace(/^import .*$/m, '');
vm.runInContext("'use strict';\n" + contracts + '\n' + source, context);
parentPort.on('message', (data) => context.self.onmessage({ data }));
